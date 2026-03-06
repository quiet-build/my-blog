import { createElement as h, lazy, Suspense, type ComponentProps } from 'react'
import { NotionRenderer as Renderer } from 'react-notion-x'
import { getTextContent } from 'notion-utils'
import type { Block } from 'notion-types'
import { FONTS_SANS, FONTS_SERIF } from '@/consts'
import { useConfig } from '@/lib/config'
import Toggle from '@/components/notion-blocks/Toggle'

// Lazy-load some heavy components & override the renderers of some block types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Code = lazy(async () => {
  return {
    default: function CodeSwitch (props: { block: any }) {
      switch (getTextContent(props.block.properties.language)) {
        case 'Mermaid':
          return h(
            lazy(() => import('@/components/notion-blocks/Mermaid')),
            props
          )
        default:
          return h(
            lazy(() =>
              import('react-notion-x/build/third-party/code').then(async module => {
                // Additional prismjs syntax
                await Promise.all([
                  import('prismjs/components/prism-markup-templating'),
                  import('prismjs/components/prism-markup'),
                  import('prismjs/components/prism-bash'),
                  import('prismjs/components/prism-c'),
                  import('prismjs/components/prism-cpp'),
                  import('prismjs/components/prism-csharp'),
                  import('prismjs/components/prism-docker'),
                  import('prismjs/components/prism-java'),
                  import('prismjs/components/prism-js-templates'),
                  import('prismjs/components/prism-coffeescript'),
                  import('prismjs/components/prism-diff'),
                  import('prismjs/components/prism-git'),
                  import('prismjs/components/prism-go'),
                  import('prismjs/components/prism-graphql'),
                  import('prismjs/components/prism-handlebars'),
                  import('prismjs/components/prism-less'),
                  import('prismjs/components/prism-makefile'),
                  import('prismjs/components/prism-markdown'),
                  import('prismjs/components/prism-objectivec'),
                  import('prismjs/components/prism-ocaml'),
                  import('prismjs/components/prism-python'),
                  import('prismjs/components/prism-reason'),
                  import('prismjs/components/prism-rust'),
                  import('prismjs/components/prism-sass'),
                  import('prismjs/components/prism-scss'),
                  import('prismjs/components/prism-solidity'),
                  import('prismjs/components/prism-sql'),
                  import('prismjs/components/prism-stylus'),
                  import('prismjs/components/prism-swift'),
                  import('prismjs/components/prism-wasm'),
                  import('prismjs/components/prism-yaml')
                ])
                return { default: module.Code }
              })
            ),
            props
          )
      }
    }
  }
})

const Collection = lazy(() =>
  import('react-notion-x/build/third-party/collection').then(module => ({ default: module.Collection }))
)

const Equation = lazy(() =>
  import('react-notion-x/build/third-party/equation').then(module => ({ default: module.Equation }))
)

const Pdf = lazy(() =>
  import('react-notion-x/build/third-party/pdf').then(module => ({ default: module.Pdf }))
)

const Tweet = lazy(() =>
  import('react-tweet-embed').then(module => {
    const { default: TweetEmbed } = module
    return {
      default: function Tweet ({ id }: { id: string }) {
        return <TweetEmbed tweetId={id} options={{ theme: 'dark' }} />
      }
    }
  })
)

/* eslint-disable @typescript-eslint/no-explicit-any */
const components: Record<string, React.ComponentType<any>> = {
  Code: (props: any) => <Suspense fallback={null}><Code {...props} /></Suspense>,
  Collection: (props: any) => <Suspense fallback={null}><Collection {...props} /></Suspense>,
  Equation: (props: any) => <Suspense fallback={null}><Equation {...props} /></Suspense>,
  Pdf: (props: any) => <Suspense fallback={null}><Pdf {...props} /></Suspense>,
  Tweet: (props: any) => <Suspense fallback={null}><Tweet {...props} /></Suspense>,
  toggle_nobelium: ({ block, children }: { block: Block; children?: React.ReactNode }) => (
    <Toggle block={block}>{children}</Toggle>
  )
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const mapPageUrl = (id: string) => `https://www.notion.so/${id.replace(/-/g, '')}`

type NotionRendererProps = ComponentProps<typeof Renderer>

/**
 * Notion page renderer
 *
 * A wrapper of react-notion-x/NotionRenderer with predefined `components` and `mapPageUrl`
 */
export default function NotionRenderer (props: NotionRendererProps) {
  const config = useConfig()

  const font = {
    'sans-serif': FONTS_SANS,
    'serif': FONTS_SERIF
  }[config.font]

  // Mark block types to be custom rendered by appending a suffix
  if (props.recordMap) {
    for (const entry of Object.values(props.recordMap.block)) {
      const block = (entry.value as Block)
      switch (block?.type) {
        case 'toggle':
          block.type += '_nobelium'
          break
      }
    }
  }

  return (
    <>
      <style>
        {`
        .notion {
          --notion-font: ${font};
        }
        `}
      </style>
      <Renderer
        components={components}
        mapPageUrl={mapPageUrl}
        {...props}
      />
    </>
  )
}
