import 'dotenv/config'
import { NotionAPI } from 'notion-client'
import { idToUuid, getTextContent, getDateValue } from 'notion-utils'
import { Feed } from 'feed'
import { createHash } from 'crypto'
import fs from 'fs'
import path from 'path'
import BLOG from '../blog.config.ts'

const NOTION_ACCESS_TOKEN = process.env.NOTION_ACCESS_TOKEN
const NOTION_PAGE_ID = process.env.NOTION_PAGE_ID || BLOG.notionPageId

if (!NOTION_PAGE_ID) {
  console.error('NOTION_PAGE_ID is not set.')
  console.error('process.env.NOTION_PAGE_ID:', JSON.stringify(process.env.NOTION_PAGE_ID))
  console.error('BLOG.notionPageId:', JSON.stringify(BLOG.notionPageId))
  console.error('Available env vars with NOTION:', Object.keys(process.env).filter(k => k.includes('NOTION')))
  process.exit(1)
}

const api = new NotionAPI({ authToken: NOTION_ACCESS_TOKEN })

// --- Notion data fetching logic (ported from lib/notion/) ---

// notion-client may nest block data as block[id].value or block[id].value.value
function getBlockValue(block, id) {
  const raw = block?.[id]?.value
  return raw?.type ? raw : raw?.value
}

function getAllPageIds(collectionQuery) {
  const views = Object.values(collectionQuery)[0]
  const pageSet = new Set()
  Object.values(views).forEach(view => {
    view?.collection_group_results?.blockIds?.forEach(id => pageSet.add(id))
  })
  return [...pageSet]
}

async function getPageProperties(id, block, schema) {
  const blockValue = getBlockValue(block, id)
  const rawProperties = Object.entries(blockValue?.properties || [])
  const excludeProperties = ['date', 'select', 'multi_select', 'person']
  const properties = {}
  for (let i = 0; i < rawProperties.length; i++) {
    const [key, val] = rawProperties[i]
    properties.id = id
    if (schema[key]?.type && !excludeProperties.includes(schema[key].type)) {
      properties[schema[key].name] = getTextContent(val)
    } else {
      switch (schema[key]?.type) {
        case 'date': {
          const dateProperty = getDateValue(val)
          delete dateProperty.type
          properties[schema[key].name] = dateProperty
          break
        }
        case 'select':
        case 'multi_select': {
          const selects = getTextContent(val)
          if (selects[0]?.length) {
            properties[schema[key].name] = selects.split(',')
          }
          break
        }
        case 'person': {
          const rawUsers = val.flat()
          const users = []
          for (let i = 0; i < rawUsers.length; i++) {
            if (rawUsers[i][0][1]) {
              const userId = rawUsers[i][0]
              const res = await api.getUsers(userId)
              const resValue =
                res?.recordMapWithRoles?.notion_user?.[userId[1]]?.value
              const user = {
                id: resValue?.id,
                first_name: resValue?.given_name,
                last_name: resValue?.family_name,
                profile_photo: resValue?.profile_photo
              }
              users.push(user)
            }
          }
          properties[schema[key].name] = users
          break
        }
        default:
          break
      }
    }
  }
  return properties
}

function filterPublishedPosts(posts, includePages) {
  if (!posts || !posts.length) return []
  return posts
    .filter(post =>
      includePages
        ? post?.type?.[0] === 'Post' || post?.type?.[0] === 'Page'
        : post?.type?.[0] === 'Post'
    )
    .filter(post =>
      post.title &&
      post.slug &&
      post?.status?.[0] === 'Published' &&
      post.date <= Date.now()
    )
}

async function getAllPosts({ includePages = false } = {}) {
  const id = idToUuid(NOTION_PAGE_ID)
  console.log(`Fetching Notion page: ${id}`)

  const response = await api.getPage(id)

  const rawCollection = Object.values(response.collection)[0]?.value
  // Handle double-nested value like blocks
  const collection = rawCollection?.schema ? rawCollection : rawCollection?.value
  const collectionQuery = response.collection_query
  const block = response.block
  const schema = collection?.schema

  const rawMetadata = getBlockValue(block, id)

  if (
    rawMetadata?.type !== 'collection_view_page' &&
    rawMetadata?.type !== 'collection_view'
  ) {
    console.error(`pageId "${id}" is not a database`)
    return []
  }

  const pageIds = getAllPageIds(collectionQuery)
  console.log(`Found ${pageIds.length} pages in database`)

  const data = []
  for (let i = 0; i < pageIds.length; i++) {
    const pageId = pageIds[i]
    const properties = (await getPageProperties(pageId, block, schema)) || null
    if (!properties) continue

    const pageBlock = getBlockValue(block, pageId)
    properties.fullWidth = pageBlock?.format?.page_full_width ?? false
    properties.date = (
      properties.date?.start_date
        ? new Date(properties.date.start_date).getTime()
        : pageBlock?.created_time
    ) || Date.now()

    data.push(properties)
  }

  const posts = filterPublishedPosts(data, includePages)

  if (BLOG.sortByDate) {
    posts.sort((a, b) => b.date - a.date)
  }

  return posts
}

async function getPostBlocks(id) {
  return await api.getPage(id)
}

// --- Generate email hash ---

function getEmailHash() {
  return createHash('md5')
    .update(BLOG.email)
    .digest('hex')
    .trim()
    .toLowerCase()
}

// --- Generate RSS feed ---

function generateRssFeed(posts) {
  const year = new Date().getFullYear()
  const feed = new Feed({
    title: BLOG.title,
    description: BLOG.description,
    id: `${BLOG.link}/${BLOG.path}`,
    link: `${BLOG.link}/${BLOG.path}`,
    language: BLOG.lang,
    favicon: `${BLOG.link}/favicon.png`,
    copyright: `All rights reserved ${year}, ${BLOG.author}`,
    author: {
      name: BLOG.author,
      email: BLOG.email,
      link: BLOG.link
    }
  })

  for (const post of posts) {
    feed.addItem({
      title: post.title,
      id: `${BLOG.link}/${post.slug}`,
      link: `${BLOG.link}/${post.slug}`,
      description: post.summary || '',
      date: new Date(post.date)
    })
  }

  return feed.atom1()
}

// --- Generate sitemap ---

function generateSitemap(posts) {
  const baseUrl = `${BLOG.link}/${BLOG.path}`.replace(/\/+$/, '')
  const urls = [
    `  <url><loc>${baseUrl}/</loc></url>`,
    ...posts.map(post => `  <url><loc>${baseUrl}/${post.slug}</loc></url>`)
  ]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`
}

// --- Main ---

async function main() {
  console.log('Building static data from Notion...')

  const rootDir = path.resolve(process.cwd())
  const dataDir = path.join(rootDir, 'public', 'data')
  const postsDir = path.join(dataDir, 'posts')

  // Create directories
  fs.mkdirSync(postsDir, { recursive: true })

  // Fetch all posts (including pages for slug data)
  const allPosts = await getAllPosts({ includePages: true })
  // Posts only (for listing)
  const postsOnly = allPosts.filter(p => p?.type?.[0] === 'Post')

  console.log(`Found ${allPosts.length} published items (${postsOnly.length} posts)`)

  // Write posts.json
  fs.writeFileSync(
    path.join(dataDir, 'posts.json'),
    JSON.stringify(allPosts, null, 2)
  )
  console.log('Wrote public/data/posts.json')

  // Generate email hash
  const emailHash = getEmailHash()

  // Fetch and write individual post block maps
  for (let i = 0; i < allPosts.length; i++) {
    const post = allPosts[i]
    console.log(`Fetching blocks for: ${post.title} (${i + 1}/${allPosts.length})`)
    try {
      const blockMap = await getPostBlocks(post.id)
      fs.writeFileSync(
        path.join(postsDir, `${post.slug}.json`),
        JSON.stringify({ post, blockMap, emailHash })
      )
    } catch (err) {
      console.error(`Failed to fetch blocks for "${post.title}":`, err.message)
    }
  }
  console.log('Wrote individual post data files')

  // Generate RSS feed (posts only)
  const rssFeed = generateRssFeed(postsOnly)
  fs.writeFileSync(path.join(rootDir, 'public', 'feed.xml'), rssFeed)
  // Also write as /feed for the link in index.html
  fs.writeFileSync(path.join(rootDir, 'public', 'feed'), rssFeed)
  console.log('Wrote public/feed.xml and public/feed')

  // Generate sitemap
  const sitemap = generateSitemap(allPosts)
  fs.writeFileSync(path.join(rootDir, 'public', 'sitemap.xml'), sitemap)
  console.log('Wrote public/sitemap.xml')

  console.log('Build data complete!')
}

main().catch(err => {
  console.error('Build data failed:', err)
  process.exit(1)
})
