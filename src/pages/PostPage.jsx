import { useParams, useNavigate } from '@tanstack/react-router'
import cn from 'classnames'
import { usePost } from '@/hooks/useData'
import { useLocale } from '@/lib/locale'
import { useConfig } from '@/lib/config'
import Container from '@/components/Container'
import Post from '@/components/Post'
import Comments from '@/components/Comments'

export default function PostPage () {
  const { slug } = useParams({ strict: false })
  const navigate = useNavigate()
  const BLOG = useConfig()
  const locale = useLocale()
  const { data, isLoading } = usePost(slug)

  if (isLoading) {
    return (
      <Container>
        <div className="text-gray-500 dark:text-gray-300">Loading...</div>
      </Container>
    )
  }

  if (!data || !data.post) {
    return (
      <Container>
        <h1 className="text-5xl text-black dark:text-white text-center">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 text-center">
          {locale.PAGE.ERROR_404.MESSAGE}
        </p>
      </Container>
    )
  }

  const { post, blockMap, emailHash } = data
  const fullWidth = post.fullWidth ?? false

  return (
    <Container
      layout="blog"
      title={post.title}
      description={post.summary}
      slug={post.slug}
      type="article"
      fullWidth={fullWidth}
    >
      <Post
        post={post}
        blockMap={blockMap}
        emailHash={emailHash}
        fullWidth={fullWidth}
      />

      {/* Back and Top */}
      <div
        className={cn(
          'px-4 flex justify-between font-medium text-gray-500 dark:text-gray-400 my-5',
          fullWidth ? 'md:px-24' : 'mx-auto max-w-2xl'
        )}
      >
        <a>
          <button
            onClick={() => navigate({ to: BLOG.path || '/' })}
            className="mt-2 cursor-pointer hover:text-black dark:hover:text-gray-100"
          >
            &larr; {locale.POST.BACK}
          </button>
        </a>
        <a>
          <button
            onClick={() => window.scrollTo({
              top: 0,
              behavior: 'smooth'
            })}
            className="mt-2 cursor-pointer hover:text-black dark:hover:text-gray-100"
          >
            &uarr; {locale.POST.TOP}
          </button>
        </a>
      </div>

      <Comments frontMatter={post} />
    </Container>
  )
}
