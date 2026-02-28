import { useAllPosts, useTags } from '@/hooks/useData'
import SearchLayout from '@/layouts/search'
import Container from '@/components/Container'

export default function SearchPage () {
  const { data: posts } = useAllPosts()
  const { tags } = useTags()

  if (!posts) {
    return (
      <Container>
        <div className="text-gray-500 dark:text-gray-300">Loading...</div>
      </Container>
    )
  }

  return <SearchLayout tags={tags} posts={posts} />
}
