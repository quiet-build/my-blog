import { useQuery } from '@tanstack/react-query'
import BLOG from '../../blog.config'

export function useAllPosts () {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await fetch('/data/posts.json')
      if (!res.ok) throw new Error('Failed to fetch posts')
      return res.json()
    },
  })
}

export function usePost (slug) {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: async () => {
      const res = await fetch(`/data/posts/${slug}.json`)
      if (!res.ok) throw new Error('Failed to fetch post')
      return res.json()
    },
    enabled: !!slug,
  })
}

export function usePaginatedPosts (page) {
  const { data: posts, ...rest } = useAllPosts()
  const currentPage = +page
  const postsPerPage = BLOG.postsPerPage
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

export function useTagPosts (tag) {
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
  const tags = {}
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
