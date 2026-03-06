export interface SeoConfig {
  keywords: string[]
  googleSiteVerification: string
}

export interface AckeeConfig {
  tracker: string
  dataAckeeServer: string
  domainId: string
}

export interface GaConfig {
  measurementId: string
}

export interface AnalyticsConfig {
  provider: '' | 'ga' | 'ackee'
  ackeeConfig: AckeeConfig
  gaConfig: GaConfig
}

export interface GitalkConfig {
  repo: string
  owner: string
  admin: string[]
  clientID: string
  clientSecret: string
  distractionFreeMode: boolean
}

export interface UtterancesConfig {
  repo: string
}

export interface CusdisConfig {
  appId: string
  host: string
  scriptSrc: string
}

export interface LitTalkConfig {
  client_id: string
  owner: string
  repo: string
  proxy: string
}

export interface CommentConfig {
  provider: '' | 'gitalk' | 'utterances' | 'cusdis' | 'lit-talk'
  gitalkConfig: GitalkConfig
  utterancesConfig: UtterancesConfig
  cusdisConfig: CusdisConfig
  litTalkConfig?: LitTalkConfig
}

export type Lang = 'en-US' | 'zh-CN' | 'zh-HK' | 'zh-TW' | 'ja-JP' | 'es-ES'
export type Appearance = 'light' | 'dark' | 'auto'
export type Font = 'sans-serif' | 'serif'

export interface BlogConfig {
  title: string
  author: string
  email: string
  link: string
  description: string
  lang: Lang
  timezone: string
  appearance: Appearance
  font: Font
  lightBackground: string
  darkBackground: string
  path: string
  since: number
  postsPerPage: number
  sortByDate: boolean
  showAbout: boolean
  showArchive: boolean
  autoCollapsedNavBar: boolean
  ogImageGenerateURL: string
  socialLink: string
  seo: SeoConfig
  notionPageId: string
  notionAccessToken: string
  analytics: AnalyticsConfig
  comment: CommentConfig
  isProd: boolean
}
