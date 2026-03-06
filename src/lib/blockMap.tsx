import { createContext, useContext, type ReactNode } from 'react'
import type { Block, ExtendedRecordMap } from 'notion-types'

interface BlockMapContextValue extends ExtendedRecordMap {
  pageId: string
}

const BlockMapContext = createContext<BlockMapContextValue | null>(null)

export function BlockMapProvider ({ blockMap, children }: { blockMap: ExtendedRecordMap; children: ReactNode }) {
  const collectionId = Object.keys(blockMap.collection)[0]
  const entry = Object.values(blockMap.block)
    .find(entry => {
      const block = entry.value as Block
      return block.type === 'page' && block.parent_id === collectionId
    })!
  const pageId = (entry.value as Block).id

  const blockMapAltered: BlockMapContextValue = {
    ...blockMap,
    pageId,
  }

  return (
    <BlockMapContext.Provider value={blockMapAltered}>
      {children}
    </BlockMapContext.Provider>
  )
}

export default function useBlockMap (): BlockMapContextValue {
  const blockMap = useContext(BlockMapContext)
  if (!blockMap) {
    throw new Error('useBlockMap must be used within a BlockMapProvider')
  }
  return blockMap
}
