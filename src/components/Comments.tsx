import 'gitalk/dist/gitalk.css'
import 'lit-talk'
import { useLocation } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import cn from 'classnames'
import { fetchCusdisLang } from '@/lib/cusdisLang'
import { useConfig } from '@/lib/config'
import type { PostProperties } from '@/types'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'lit-talk': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'github-oauth-options'?: string
      }, HTMLElement>
    }
  }
}

const GitalkComponent = lazy(() => import('gitalk/dist/gitalk-component'))
const UtterancesComponent = lazy(() => import('@/components/Utterances'))
const CusdisComponent = lazy(() =>
  import('react-cusdis').then(m => ({ default: m.ReactCusdis }))
)

interface CommentsProps {
  frontMatter: PostProperties
}

const Comments = ({ frontMatter }: CommentsProps) => {
  const location = useLocation()
  const BLOG = useConfig()

  const fullWidth = frontMatter.fullWidth ?? false

  return (
    <div
      className={cn(
        'px-4 font-medium text-gray-500 dark:text-gray-400 my-5',
        fullWidth ? 'md:px-24' : 'mx-auto max-w-2xl',
      )}
    >
      <Suspense fallback={null}>
        {BLOG.comment && BLOG.comment.provider === 'gitalk' && (
          <GitalkComponent
            options={{
              id: frontMatter.id,
              title: frontMatter.title,
              clientID: BLOG.comment.gitalkConfig.clientID,
              clientSecret: BLOG.comment.gitalkConfig.clientSecret,
              repo: BLOG.comment.gitalkConfig.repo,
              owner: BLOG.comment.gitalkConfig.owner,
              admin: BLOG.comment.gitalkConfig.admin,
              distractionFreeMode: BLOG.comment.gitalkConfig.distractionFreeMode
            }}
          />
        )}
        {BLOG.comment && BLOG.comment.provider === 'utterances' && (
          <UtterancesComponent issueTerm={frontMatter.id} />
        )}
        {BLOG.comment && BLOG.comment.provider === 'cusdis' && (
          <CusdisComponent
            lang={fetchCusdisLang(BLOG.lang)}
            attrs={{
              host: BLOG.comment.cusdisConfig.host,
              appId: BLOG.comment.cusdisConfig.appId,
              pageId: frontMatter.id,
              pageTitle: frontMatter.title,
              pageUrl: BLOG.link + location.pathname,
              theme: BLOG.appearance
            }}
          />
        )}
        {BLOG.comment && BLOG.comment.provider === 'lit-talk' && BLOG.comment.litTalkConfig && (
          <lit-talk
            github-oauth-options={JSON.stringify({
              client_id: BLOG.comment.litTalkConfig.client_id,
              owner: BLOG.comment.litTalkConfig.owner,
              repo: BLOG.comment.litTalkConfig.repo,
              proxy: BLOG.comment.litTalkConfig.proxy,
              postUniqueId: frontMatter.id,
            })}
          />
        )}
      </Suspense>
    </div>
  )
}

export default Comments
