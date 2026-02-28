import { useParams } from '@tanstack/react-router'
import { useTagPosts, useTags } from '@/hooks/useData'
import SearchLayout from '@/layouts/search'
import Container from '@/components/Container'

export default function TagPage () {
  const { tag } = useParams({ strict: false })
  const { posts, data } = useTagPosts(tag)
  const { tags } = useTags()

  if (!data) {
    return (
      <Container>
        <div className="text-gray-500 dark:text-gray-300">Loading...</div>
      </Container>
    )
  }

  return <SearchLayout tags={tags} posts={posts} currentTag={tag} />
}
