import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import { SITE } from '../consts'
import type { APIContext } from 'astro'

export async function GET(context: APIContext) {
  const posts = await getCollection('posts')
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site!,
    items: posts
      .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime())
      .map(p => ({
        title: p.data.title,
        description: p.data.summary,
        pubDate: new Date(p.data.date),
        link: `/posts/${p.data.slug}/`
      }))
  })
}
