/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NOTION_PAGE_ID?: string
  readonly PROD: boolean
  readonly DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
