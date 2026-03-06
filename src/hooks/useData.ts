import { useQuery } from '@tanstack/react-query'
import type { PostProperties, PostData } from '@/types'
import { useConfig } from '@/lib/config'

export function useAllPosts () {
  return useQuery<PostProperties[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await fetch('/data/posts.json')
      if (!res.ok) throw new Error('Failed to fetch posts')
      return res.json()
    },
  })
}

export function usePost (slug: string) {
  return useQuery<PostData>({
    queryKey: ['post', slug],
    queryFn: async () => {
      const res = await fetch(`/data/posts/${slug}.json`)
      if (!res.ok) throw new Error('Failed to fetch post')
      return res.json()
    },
    enabled: !!slug,
  })
}

export function usePaginatedPosts (page: number | string) {
  const { data: posts, ...rest } = useAllPosts()
  const { postsPerPage } = useConfig()
  const currentPage = +page
  const postsToShow = posts
    ? posts.slice(postsPerPage * (currentPage - 1), postsPerPage * currentPage)
    : []
  const totalPosts = posts ? posts.length : 0
  const showNext = currentPage * postsPerPage < totalPosts
  return {
    ...rest,
    data: posts,
    postsToShow,
    showNext,
  }
}

export function useTagPosts (tag: string) {
  const { data: posts, ...rest } = useAllPosts()
  const filteredPosts = posts
    ? posts.filter(post => post && post.tags && post.tags.includes(tag))
    : []
  return {
    ...rest,
    data: posts,
    posts: filteredPosts,
  }
}

export function useTags () {
  const { data: posts, ...rest } = useAllPosts()
  const tags: Record<string, number> = {}
  if (posts) {
    posts.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => {
          tags[tag] = (tags[tag] || 0) + 1
        })
      }
    })
  }
  return {
    ...rest,
    tags,
  }
}
