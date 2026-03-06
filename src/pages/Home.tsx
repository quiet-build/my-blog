import Container from '@/components/Container'
import BlogPost from '@/components/BlogPost'
import Pagination from '@/components/Pagination'
import { usePaginatedPosts } from '@/hooks/useData'
import { useConfig } from '@/lib/config'

export default function Home () {
  const { title, description } = useConfig()
  const { postsToShow, showNext, data } = usePaginatedPosts(1)

  if (!data) {
    return (
      <Container title={title} description={description}>
        <div className="text-gray-500 dark:text-gray-300">Loading...</div>
      </Container>
    )
  }

  return (
    <Container title={title} description={description}>
      {postsToShow.map(post => (
        <BlogPost key={post.id} post={post} />
      ))}
      {showNext && <Pagination page={1} showNext={showNext} />}
    </Container>
  )
}
