export const SITE = {
  title: 'MING',
  author: 'Ming',
  description: 'This gonna be an awesome website.',
  since: 2021,
  postsPerPage: 7,
  socialLink: 'https://twitter.com/craigaryhart'
} as const

export const NAV = [
  { name: 'Home', href: '/' },
  { name: 'Tags', href: '/tags' },
  { name: 'Search', href: '/search' }
] as const
