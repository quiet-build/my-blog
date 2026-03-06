import { getPageTableOfContents } from 'notion-utils'
import cn from 'classnames'
import type { Block, ExtendedRecordMap, PageBlock } from 'notion-types'
import type { CSSProperties } from 'react'

interface TableOfContentsProps {
  blockMap: ExtendedRecordMap
  className?: string
  style?: CSSProperties
}

export default function TableOfContents ({ blockMap, className, style }: TableOfContentsProps) {
  const collectionId = Object.keys(blockMap.collection)[0]
  const page = (Object.values(blockMap.block).find(
    entry => (entry.value as Block).parent_id === collectionId
  )!.value as PageBlock)
  const nodes = getPageTableOfContents(page, blockMap)

  if (!nodes.length) return null

  function scrollTo (id: string) {
    id = id.replaceAll('-', '')
    const target = document.querySelector(`.notion-block-${id}`)
    if (!target) return
    // `65` is the height of expanded nav
    // TODO: Remove the magic number
    const top = document.documentElement.scrollTop + target.getBoundingClientRect().top - 65
    document.documentElement.scrollTo({
      top,
      behavior: 'smooth'
    })
  }

  return (
    <aside
      className={cn(className, 'pl-4 text-sm text-zinc-700/70 dark:text-neutral-400')}
      style={style}
    >
      {nodes.map(node => (
        <div key={node.id}>
          <a
            data-target-id={node.id}
            className="block py-1 hover:text-black dark:hover:text-white cursor-pointer transition duration-100"
            style={{ paddingLeft: (node.indentLevel * 24) + 'px' }}
            onClick={() => scrollTo(node.id)}
          >
            {node.text}
          </a>
        </div>
      ))}
    </aside>
  )
}
