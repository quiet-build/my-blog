import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.string(),
    type: z.string(),
    status: z.string(),
    summary: z.string().optional().default(''),
    notionId: z.string(),
    tags: z.array(z.string()).default([])
  })
})

export const collections = { posts }
