# Source companion

This companion maps the Astro blog source and config files. Keep it updated when
responsibilities, public behavior, or verification rules change.

## Content pipeline

- `scripts/build-data.mjs` syncs published Notion posts into
  `src/content/posts/`. It resolves the database's first data source, queries
  all pages, filters to published posts, converts blocks to Markdown, and writes
  frontmatter. Without Notion credentials it creates an empty content directory
  and exits successfully so local builds still work.
- `src/lib/notion.mjs` contains pure helpers for reading Notion property objects
  and normalizing page metadata.
- `src/lib/notion.test.mjs` tests the Notion property extraction helpers.
- `src/content.config.ts` defines Astro content collection shape and validation.

## Routes and layouts

- `src/pages/[...page].astro` renders paginated post listings.
- `src/pages/posts/[slug].astro` renders individual posts.
- `src/pages/search.astro` renders search UI.
- `src/pages/tags/index.astro` and `src/pages/tags/[tag].astro` render tag
  indexes and tag-filtered listings.
- `src/pages/rss.xml.ts` emits the RSS feed.
- `src/pages/404.astro` renders the not-found page.
- `src/layouts/BaseLayout.astro` owns shared document chrome.
- `src/layouts/PostLayout.astro` owns post page structure.

## Components and styling

- `src/components/Header.astro`, `Footer.astro`, `PostCard.astro`,
  `Pagination.astro`, `TagPill.astro`, and `Comments.astro` compose the Astro
  UI.
- `src/components/react/ThemeToggle.tsx`, `MobileNav.tsx`, and `Search.tsx`
  provide client-side interactivity.
- `src/styles/global.css` defines Tailwind imports, theme tokens, and global
  typography/layout rules.
- `src/consts.ts` and `src/consts.comments.ts` hold site and comment constants.
- `src/lib/date.mjs` contains date formatting helpers.

## Config

- `astro.config.mjs` configures Astro integrations and build behavior.
- `package.json` exposes sync, dev, build, preview, check, and test scripts.
- `tsconfig.json` carries Astro TypeScript settings.
- `public/_headers` and `public/_redirects` are deployed as static hosting
  hints.
