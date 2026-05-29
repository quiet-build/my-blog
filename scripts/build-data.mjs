import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import { extractProps } from '../src/lib/notion.mjs'

const NOTION_TOKEN = process.env.NOTION_TOKEN
const DATABASE_ID = process.env.NOTION_DATABASE_ID

const OUT_DIR = path.resolve(process.cwd(), 'src/content/posts')

// Resilient: without creds, ensure an empty collection dir and continue so the
// scaffold still builds. CI/production should always have the env vars set.
if (!NOTION_TOKEN || !DATABASE_ID) {
  console.warn('⚠ NOTION_TOKEN / NOTION_DATABASE_ID not set — skipping Notion sync, building with no posts.')
  fs.mkdirSync(OUT_DIR, { recursive: true })
  process.exit(0)
}

const notion = new Client({ auth: NOTION_TOKEN })
const n2m = new NotionToMarkdown({ notionClient: notion })

function yamlEscape(s) {
  return JSON.stringify(s ?? '')
}

function frontmatter(p) {
  return [
    '---',
    `title: ${yamlEscape(p.title)}`,
    `slug: ${yamlEscape(p.slug)}`,
    `date: ${yamlEscape(p.date)}`,
    `type: ${yamlEscape(p.type)}`,
    `status: ${yamlEscape(p.status)}`,
    `summary: ${yamlEscape(p.summary)}`,
    `notionId: ${yamlEscape(p.id)}`,
    `tags: [${p.tags.map(yamlEscape).join(', ')}]`,
    '---',
    ''
  ].join('\n')
}

async function queryAll() {
  const results = []
  let cursor
  do {
    const res = await notion.databases.query({
      database_id: DATABASE_ID,
      start_cursor: cursor
    })
    results.push(...res.results)
    cursor = res.has_more ? res.next_cursor : undefined
  } while (cursor)
  return results
}

async function main() {
  console.log('Fetching Notion database...')
  const pages = await queryAll()
  console.log(`Fetched ${pages.length} pages.`)

  // One-time diagnostic so the user can confirm property names match.
  if (pages[0]) {
    console.log('Property keys on first page:', Object.keys(pages[0].properties).join(', '))
  }

  fs.rmSync(OUT_DIR, { recursive: true, force: true })
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const published = pages
    .map(extractProps)
    .filter(p => p.status === 'Published' && p.type === 'Post' && p.slug && p.title)

  console.log(`${published.length} published posts.`)

  for (const p of published) {
    process.stdout.write(`  -> ${p.slug}\n`)
    const blocks = await n2m.pageToMarkdown(p.id)
    const body = n2m.toMarkdownString(blocks).parent ?? ''
    fs.writeFileSync(path.join(OUT_DIR, `${p.slug}.md`), frontmatter(p) + body)
  }

  console.log('Wrote markdown to src/content/posts/')
}

main().catch(err => { console.error(err); process.exit(1) })
