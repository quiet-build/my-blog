import type { ExtendedRecordMap } from 'notion-types'

export interface PostProperties {
  id: string
  title: string
  slug: string
  summary?: string
  date: number
  tags?: string[]
  type: string[]
  status: string[]
  fullWidth?: boolean
}

export interface PostData {
  post: PostProperties
  blockMap: ExtendedRecordMap
  emailHash: string
}
