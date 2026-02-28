import { useParams } from '@tanstack/react-router'
import Container from '@/components/Container'
import BlogPost from '@/components/BlogPost'
import Pagination from '@/components/Pagination'
import { usePaginatedPosts } from '@/hooks/useData'

export default function PaginatedPage () {
  const { page } = useParams({ strict: false })
  const pageNum = parseInt(page, 10)
  const { postsToShow, showNext, data } = usePaginatedPosts(pageNum)

  if (!data) {
    return (
      <Container>
        <div className="text-gray-500 dark:text-gray-300">Loading...</div>
      </Container>
    )
  }

  return (
    <Container>
      {postsToShow &&
        postsToShow.map(post => <BlogPost key={post.id} post={post} />)}
      <Pagination page={pageNum} showNext={showNext} />
    </Container>
  )
}
