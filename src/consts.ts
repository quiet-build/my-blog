export const SITE = {
  title: 'MING',
  author: 'Ming',
  description: 'This gonna be an awesome website.',
  since: 2021,
  postsPerPage: 7,
  socialLink: '' // your social profile URL (leave empty to hide)
} as const

export const NAV = [
  { name: 'Home', href: '/' },
  { name: 'Tags', href: '/tags' },
  { name: 'Search', href: '/search' }
] as const
