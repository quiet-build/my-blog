# Astro Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Notion-backed Nobelium blog (Vite/React SPA) to a static Astro site styled with `@quietbuildlab/ui`, with content fetched from Notion's official API at build time, lit-talk comments, and deployment to Cloudflare Pages under the `quietbuildlab` org (repo renamed `my-blog`).

**Architecture:** Static Astro site (`output: 'static'`). A prebuild script (`scripts/build-data.mjs`) queries the Notion database via the official `@notionhq/client`, converts each published page to Markdown with `notion-to-md`, and writes `src/content/posts/<slug>.md` files with YAML frontmatter. Astro's content-collection glob loader renders them to static HTML through its native Markdown pipeline (Shiki for code, KaTeX for math). Interactive chrome (theme toggle, mobile nav, search) are small React islands using `@quietbuildlab/ui`. lit-talk comments are a framework-agnostic web-component island.

**Tech Stack:** Astro 5, `@astrojs/react`, `@tailwindcss/vite` (Tailwind v4), `@quietbuildlab/ui` (Manuscript theme), `@notionhq/client`, `notion-to-md@3`, `@astrojs/rss`, `@astrojs/sitemap`, `remark-math` + `rehype-katex`, `lit-talk`.

**Verified against current docs (2026-05-29):**
- Static Astro → Cloudflare Pages needs **no adapter**; build `astro build`, output `dist/`.
- `notion-to-md` stable is v3.1.9: `new NotionToMarkdown({ notionClient })`, `pageToMarkdown(id)`, `toMarkdownString(blocks).parent`.
- Tailwind v4 in Astro uses `@tailwindcss/vite` + `@import "tailwindcss";` (not the old `@astrojs/tailwind`).
- `@quietbuildlab/ui@0.6.0` is published on public npm; install directly.

**Must be verified at execution (do not trust memory):**
- Exact Notion property names in the user's database (Title/Slug/Date/Type/Status/Tags/Summary). Task 4 logs them on first run.
- Whether the installed `@notionhq/client` uses `databases.query` or the newer data-source API. Task 5 step pins the client and verifies the query method against the installed version's docs before relying on it.

**User action items (cannot be automated — flag to user before Task 5):**
1. Create a Notion **internal integration** at https://www.notion.so/my-integrations → copy the secret token.
2. **Share the blog database** with that integration (database → ••• → Connections → add integration).
3. Provide the **database ID** (the 32-char id in the database URL).
4. Fill the lit-talk GitHub OAuth `client_id` (Task 15).

---

## File Structure

**Created:**
- `astro.config.mjs` — Astro config: react + sitemap integrations, tailwind vite plugin, markdown (math) config, `site`.
- `src/styles/global.css` — Tailwind v4 + `@quietbuildlab/ui` Manuscript theme + KaTeX CSS.
- `src/consts.ts` — trimmed site config (ported from `blog.config.ts`).
- `src/content.config.ts` — `posts` collection (glob loader + zod schema).
- `src/lib/notion.mjs` — Notion property extraction helpers (pure, unit-tested).
- `src/lib/notion.test.mjs` — unit tests for the extractor.
- `src/layouts/BaseLayout.astro` — html shell, head, header, footer, theme bootstrap.
- `src/layouts/PostLayout.astro` — post article wrapper + comments.
- `src/components/Header.astro`, `Footer.astro`, `PostCard.astro`, `TagPill.astro`, `Pagination.astro`, `Comments.astro`.
- `src/components/react/ThemeToggle.tsx`, `MobileNav.tsx`, `Search.tsx` — React islands.
- `src/pages/index.astro`, `[...page].astro` (pagination), `posts/[slug].astro`, `tags/index.astro`, `tags/[tag].astro`, `search.astro`, `404.astro`, `rss.xml.ts`.
- `scripts/build-data.mjs` — **rewritten**: official API + notion-to-md → `src/content/posts/*.md`.
- `.env.example` — `NOTION_TOKEN`, `NOTION_DATABASE_ID`.

**Modified:**
- `package.json` — rewrite deps + scripts.
- `tsconfig.json` — extend `astro/tsconfigs/strict`.
- `.gitignore` — add `src/content/posts/` (generated), `dist/`, `.astro/`.

**Deleted (old SPA):**
- `src/App.tsx`, `src/main.tsx`, `src/router.tsx`, `src/queryClient.ts`, `src/hooks/`, `src/pages/*.tsx`, `src/layouts/search.tsx`, `src/components/*.tsx` (old React), `src/lib/blockMap.tsx`, `src/lib/config.tsx`, `src/lib/locale.tsx`, `src/lib/cusdisLang.ts`, `src/lib/cjk.ts`, `src/assets/i18n/`, `index.html`, `vite.config.ts`, `vite-env.d.ts`, `postcss.config.cjs`, `tailwind.config.js`, `.eslintrc.json`, `Dockerfile`.

---

## Task 1: Create feature branch

**Files:** none (git).

- [ ] **Step 1: Create and switch to branch**

```bash
git checkout -b astro-migration
```

- [ ] **Step 2: Verify**

Run: `git branch --show-current`
Expected: `astro-migration`

---

## Task 2: Rewrite package.json and install

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Replace package.json**

```json
{
  "name": "my-blog",
  "version": "2.0.0",
  "type": "module",
  "license": "MIT",
  "author": { "name": "Ming", "email": "matwming114@gmail.com" },
  "scripts": {
    "sync": "node scripts/build-data.mjs",
    "dev": "node scripts/build-data.mjs && astro dev",
    "build": "node scripts/build-data.mjs && astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "node --test src/lib/"
  },
  "dependencies": {
    "@astrojs/react": "^4.2.0",
    "@astrojs/rss": "^4.0.11",
    "@astrojs/sitemap": "^3.2.1",
    "@notionhq/client": "^2.2.15",
    "@quietbuildlab/ui": "^0.6.0",
    "@tailwindcss/vite": "^4.0.0",
    "astro": "^5.2.0",
    "katex": "^0.16.11",
    "notion-to-md": "^3.1.9",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "rehype-katex": "^7.0.1",
    "remark-math": "^6.0.0",
    "tailwindcss": "^4.0.0"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.4",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "dotenv": "^16.4.5",
    "typescript": "^5.9.3"
  }
}
```

> Note: `react` pinned to 18 (UI lib peerDep is `>=18`; 18 avoids React 19 island edge cases). `@notionhq/client` pinned to `^2.2.x` which exposes `databases.query`. If install resolves a newer major that changed the query API, Task 5 verification will catch it.

- [ ] **Step 2: Remove old lockfile and install**

```bash
rm -f pnpm-lock.yaml package-lock.json
npm install
```

- [ ] **Step 3: Verify install**

Run: `npx astro --version && node -e "require('@quietbuildlab/ui/package.json')"`
Expected: prints an Astro version (5.x); no module-not-found error for the UI package.

- [ ] **Step 4: Commit**

```bash
git add package.json && git -c commit.gpgsign=false commit -m "chore: replace deps with Astro stack"
```

---

## Task 3: Scaffold Astro config, tsconfig, styles, env, gitignore

**Files:**
- Create: `astro.config.mjs`, `src/styles/global.css`, `.env.example`
- Modify: `tsconfig.json`, `.gitignore`

- [ ] **Step 1: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

// Update `site` to the real deployed URL after first Cloudflare deploy.
export default defineConfig({
  site: 'https://my-blog.pages.dev',
  output: 'static',
  integrations: [react(), sitemap()],
  vite: { plugins: [tailwindcss()] },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: { theme: 'github-dark' }
  }
})
```

- [ ] **Step 2: Create `src/styles/global.css`**

```css
@import "tailwindcss";
@import "@quietbuildlab/ui/themes/manuscript.css";
@source "../../node_modules/@quietbuildlab/ui/dist";

@import "katex/dist/katex.min.css";

/* base page surface from design-system tokens */
html { background: var(--background); color: var(--foreground); }
```

> The `@source` path is relative to this CSS file (`src/styles/`), so `../../node_modules`. Verify the glob resolves during Task 16 build (UI component styles must appear).

- [ ] **Step 3: Replace `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

- [ ] **Step 4: Create `.env.example`**

```
NOTION_TOKEN=secret_xxx_from_your_notion_integration
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

- [ ] **Step 5: Update `.gitignore`** — append:

```
# Astro
dist/
.astro/
# Generated Notion content
src/content/posts/
```

- [ ] **Step 6: Commit**

```bash
git add astro.config.mjs src/styles/global.css tsconfig.json .env.example .gitignore
git -c commit.gpgsign=false commit -m "chore: scaffold Astro config, Tailwind v4, theme"
```

---

## Task 4: Notion property extractor (TDD)

This is the only piece with real branching logic, so it gets a unit test with a fixture mirroring the official API response shape.

**Files:**
- Create: `src/lib/notion.mjs`
- Test: `src/lib/notion.test.mjs`

- [ ] **Step 1: Write the failing test**

`src/lib/notion.test.mjs`:
```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { extractProps, propByName } from './notion.mjs'

const page = {
  id: 'abc-123',
  properties: {
    Title: { type: 'title', title: [{ plain_text: 'Hello ' }, { plain_text: 'World' }] },
    Slug: { type: 'rich_text', rich_text: [{ plain_text: 'hello-world' }] },
    Date: { type: 'date', date: { start: '2024-01-15' } },
    Type: { type: 'select', select: { name: 'Post' } },
    Status: { type: 'status', status: { name: 'Published' } },
    Tags: { type: 'multi_select', multi_select: [{ name: 'astro' }, { name: 'notion' }] },
    Summary: { type: 'rich_text', rich_text: [{ plain_text: 'A summary.' }] }
  }
}

test('propByName is case-insensitive', () => {
  assert.equal(propByName(page.properties, 'title'), page.properties.Title)
})

test('extractProps maps a published post', () => {
  const p = extractProps(page)
  assert.equal(p.id, 'abc-123')
  assert.equal(p.title, 'Hello World')
  assert.equal(p.slug, 'hello-world')
  assert.equal(p.date, '2024-01-15')
  assert.equal(p.type, 'Post')
  assert.equal(p.status, 'Published')
  assert.deepEqual(p.tags, ['astro', 'notion'])
  assert.equal(p.summary, 'A summary.')
})

test('extractProps tolerates missing optional fields', () => {
  const bare = { id: 'x', properties: { Title: { type: 'title', title: [{ plain_text: 'T' }] }, Slug: { type: 'rich_text', rich_text: [{ plain_text: 's' }] } } }
  const p = extractProps(bare)
  assert.deepEqual(p.tags, [])
  assert.equal(p.summary, '')
  assert.equal(p.status, '')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/lib/notion.test.mjs`
Expected: FAIL — cannot find module `./notion.mjs`.

- [ ] **Step 3: Implement `src/lib/notion.mjs`**

```js
// Pure helpers for reading Notion official-API property objects.

export function propByName(properties, name) {
  const key = Object.keys(properties).find(
    k => k.toLowerCase() === name.toLowerCase()
  )
  return key ? properties[key] : undefined
}

function plain(prop) {
  if (!prop) return ''
  if (prop.type === 'title') return prop.title.map(t => t.plain_text).join('')
  if (prop.type === 'rich_text') return prop.rich_text.map(t => t.plain_text).join('')
  return ''
}

function selectName(prop) {
  if (!prop) return ''
  if (prop.type === 'select') return prop.select?.name ?? ''
  if (prop.type === 'status') return prop.status?.name ?? ''
  return ''
}

function multiNames(prop) {
  if (prop?.type === 'multi_select') return prop.multi_select.map(s => s.name)
  return []
}

function dateStart(prop) {
  if (prop?.type === 'date') return prop.date?.start ?? ''
  return ''
}

// Extract a normalized post record from a Notion page object.
export function extractProps(page) {
  const props = page.properties
  return {
    id: page.id,
    title: plain(propByName(props, 'title')),
    slug: plain(propByName(props, 'slug')),
    date: dateStart(propByName(props, 'date')),
    type: selectName(propByName(props, 'type')),
    status: selectName(propByName(props, 'status')),
    tags: multiNames(propByName(props, 'tags')),
    summary: plain(propByName(props, 'summary'))
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/lib/notion.test.mjs`
Expected: PASS — 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/notion.mjs src/lib/notion.test.mjs
git -c commit.gpgsign=false commit -m "feat: notion property extractor with tests"
```

---

## Task 5: Rewrite build-data.mjs (Notion → Markdown files)

**Prerequisite:** user has provided `NOTION_TOKEN` + `NOTION_DATABASE_ID` in a local `.env`. Confirm before running.

**Files:**
- Replace: `scripts/build-data.mjs`

- [ ] **Step 1: Verify the @notionhq/client query API**

Run: `node -e "const {Client}=require('@notionhq/client'); const c=new Client({auth:'x'}); console.log(typeof c.databases.query, typeof c.dataSources)"`
Expected: `function undefined` (confirms `databases.query` exists on installed version). If `databases.query` is `undefined`, STOP and check the installed client's docs for the data-source query method before proceeding.

- [ ] **Step 2: Replace `scripts/build-data.mjs`**

```js
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import { extractProps } from '../src/lib/notion.mjs'

const NOTION_TOKEN = process.env.NOTION_TOKEN
const DATABASE_ID = process.env.NOTION_DATABASE_ID

const OUT_DIR = path.resolve(process.cwd(), 'src/content/posts')

// Resilient: without creds, ensure an empty collection dir and continue so the
// scaffold still builds. CI/production should always have the env vars set.
if (!NOTION_TOKEN || !DATABASE_ID) {
  console.warn('⚠ NOTION_TOKEN / NOTION_DATABASE_ID not set — skipping Notion sync, building with no posts.')
  fs.mkdirSync(OUT_DIR, { recursive: true })
  process.exit(0)
}

const notion = new Client({ auth: NOTION_TOKEN })
const n2m = new NotionToMarkdown({ notionClient: notion })

function yamlEscape(s) {
  return JSON.stringify(s ?? '')
}

function frontmatter(p) {
  return [
    '---',
    `title: ${yamlEscape(p.title)}`,
    `slug: ${yamlEscape(p.slug)}`,
    `date: ${yamlEscape(p.date)}`,
    `type: ${yamlEscape(p.type)}`,
    `status: ${yamlEscape(p.status)}`,
    `summary: ${yamlEscape(p.summary)}`,
    `notionId: ${yamlEscape(p.id)}`,
    `tags: [${p.tags.map(yamlEscape).join(', ')}]`,
    '---',
    ''
  ].join('\n')
}

async function queryAll() {
  const results = []
  let cursor
  do {
    const res = await notion.databases.query({
      database_id: DATABASE_ID,
      start_cursor: cursor
    })
    results.push(...res.results)
    cursor = res.has_more ? res.next_cursor : undefined
  } while (cursor)
  return results
}

async function main() {
  console.log('Fetching Notion database...')
  const pages = await queryAll()
  console.log(`Fetched ${pages.length} pages.`)

  // One-time diagnostic so the user can confirm property names match.
  if (pages[0]) {
    console.log('Property keys on first page:', Object.keys(pages[0].properties).join(', '))
  }

  fs.rmSync(OUT_DIR, { recursive: true, force: true })
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const published = pages
    .map(extractProps)
    .filter(p => p.status === 'Published' && p.type === 'Post' && p.slug && p.title)

  console.log(`${published.length} published posts.`)

  for (const p of published) {
    process.stdout.write(`  -> ${p.slug}\n`)
    const blocks = await n2m.pageToMarkdown(p.id)
    const body = n2m.toMarkdownString(blocks).parent ?? ''
    fs.writeFileSync(path.join(OUT_DIR, `${p.slug}.md`), frontmatter(p) + body)
  }

  console.log('Wrote markdown to src/content/posts/')
}

main().catch(err => { console.error(err); process.exit(1) })
```

- [ ] **Step 3: Run it against the real database**

Run: `npm run sync`
Expected: logs "Property keys on first page: ..." — **compare these to** `title, slug, date, type, status, summary, tags`. If names differ, update `extractProps` calls in `src/lib/notion.mjs` (e.g., add the real name to a lookup) and re-run. Then it writes `.md` files.

- [ ] **Step 4: Verify output**

Run: `ls src/content/posts/ && head -15 src/content/posts/*.md | head -20`
Expected: one `.md` per published post; each starts with valid frontmatter (title/slug/date/notionId/tags) followed by markdown body.

- [ ] **Step 5: Commit (script only — generated md is gitignored)**

```bash
git add scripts/build-data.mjs
git -c commit.gpgsign=false commit -m "feat: fetch Notion via official API and emit markdown"
```

---

## Task 6: Content collection schema

**Files:**
- Create: `src/content.config.ts`

- [ ] **Step 1: Create `src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.string(),
    type: z.string(),
    status: z.string(),
    summary: z.string().optional().default(''),
    notionId: z.string(),
    tags: z.array(z.string()).default([])
  })
})

export const collections = { posts }
```

- [ ] **Step 2: Verify schema validates generated content**

Run: `npm run sync && npx astro sync && npx astro check`
Expected: `astro sync` generates types; `astro check` reports 0 content-collection schema errors. (Component errors are fine here — pages don't exist yet.)

- [ ] **Step 3: Commit**

```bash
git add src/content.config.ts
git -c commit.gpgsign=false commit -m "feat: posts content collection schema"
```

---

## Task 7: BaseLayout, Header, Footer

**Files:**
- Create: `src/consts.ts`, `src/layouts/BaseLayout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`

- [ ] **Step 1: Create `src/consts.ts`**

```ts
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
```

- [ ] **Step 2: Create `src/layouts/BaseLayout.astro`**

```astro
---
import '../styles/global.css'
import Header from '../components/Header.astro'
import Footer from '../components/Footer.astro'
import { SITE } from '../consts'

interface Props { title?: string; description?: string }
const { title, description = SITE.description } = Astro.props
const pageTitle = title ? `${title} - ${SITE.title}` : SITE.title
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{pageTitle}</title>
    <meta name="description" content={description} />
    <link rel="alternate" type="application/rss+xml" title={SITE.title} href="/rss.xml" />
    <!-- set theme before paint to avoid flash -->
    <script is:inline>
      const t = localStorage.getItem('theme')
      if (t === 'dark' || (!t && matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark')
      }
    </script>
  </head>
  <body class="min-h-screen flex flex-col font-serif">
    <Header />
    <main class="flex-1 w-full max-w-2xl mx-auto px-4 py-8">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 3: Create `src/components/Header.astro`**

```astro
---
import { SITE, NAV } from '../consts'
import ThemeToggle from './react/ThemeToggle.tsx'
import MobileNav from './react/MobileNav.tsx'
---
<header class="border-b border-[var(--border)]">
  <div class="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
    <a href="/" class="font-bold text-lg tracking-tight">{SITE.title}</a>
    <nav class="hidden sm:flex items-center gap-6">
      {NAV.map(item => <a href={item.href} class="text-sm hover:text-[var(--primary)]">{item.name}</a>)}
      <ThemeToggle client:load />
    </nav>
    <div class="sm:hidden flex items-center gap-2">
      <ThemeToggle client:load />
      <MobileNav client:load items={NAV} />
    </div>
  </div>
</header>
```

- [ ] **Step 4: Create `src/components/Footer.astro`**

```astro
---
import { SITE } from '../consts'
const year = new Date().getFullYear()
---
<footer class="border-t border-[var(--border)] py-6 text-center text-sm text-[var(--muted-foreground)]">
  <p>© {SITE.since}–{year} {SITE.author}. <a class="hover:text-[var(--primary)]" href={SITE.socialLink}>Twitter</a> · <a class="hover:text-[var(--primary)]" href="/rss.xml">RSS</a></p>
</footer>
```

- [ ] **Step 5: Commit** (will not build until Task 8 islands exist; that's fine)

```bash
git add src/consts.ts src/layouts/BaseLayout.astro src/components/Header.astro src/components/Footer.astro
git -c commit.gpgsign=false commit -m "feat: base layout, header, footer"
```

---

## Task 8: React islands (ThemeToggle, MobileNav)

**Files:**
- Create: `src/components/react/ThemeToggle.tsx`, `src/components/react/MobileNav.tsx`

- [ ] **Step 1: Create `src/components/react/ThemeToggle.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { Button } from '@quietbuildlab/ui'

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)
  useEffect(() => { setDark(document.documentElement.classList.contains('dark')) }, [])
  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
      {dark ? '☀' : '☾'}
    </Button>
  )
}
```

- [ ] **Step 2: Create `src/components/react/MobileNav.tsx`**

```tsx
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, Button } from '@quietbuildlab/ui'

interface Props { items: ReadonlyArray<{ name: string; href: string }> }

export default function MobileNav({ items }: Props) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu">☰</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader><SheetTitle>Menu</SheetTitle></SheetHeader>
        <nav class="flex flex-col gap-4 mt-6">
          {items.map(i => <a key={i.href} href={i.href} className="text-base">{i.name}</a>)}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
```

> Verify the exact `Sheet`/`Button` export names against `@quietbuildlab/ui` `llms-full.txt` at execution; the llms.txt confirms `Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle` and `Button` are root named exports. Fix `class` vs `className` (JSX uses `className`).

- [ ] **Step 3: Commit**

```bash
git add src/components/react/
git -c commit.gpgsign=false commit -m "feat: theme toggle and mobile nav islands"
```

---

## Task 9: Home page with pagination

**Files:**
- Create: `src/components/PostCard.astro`, `src/components/Pagination.astro`, `src/pages/[...page].astro`
- Delete: any leftover `src/pages/*.tsx`

- [ ] **Step 1: Create `src/components/PostCard.astro`**

```astro
---
import { formatDate } from '../lib/date.mjs'
interface Props { post: { data: { title: string; slug: string; date: string; summary: string; tags: string[] } } }
const { post } = Astro.props
---
<article class="py-6 border-b border-[var(--border)]">
  <a href={`/posts/${post.data.slug}`} class="block group">
    <h2 class="text-2xl font-bold group-hover:text-[var(--primary)]">{post.data.title}</h2>
    <time class="text-sm text-[var(--muted-foreground)]">{formatDate(post.data.date)}</time>
    {post.data.summary && <p class="mt-2 text-[var(--muted-foreground)]">{post.data.summary}</p>}
  </a>
</article>
```

- [ ] **Step 2: Create `src/lib/date.mjs`**

```js
export function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
```

- [ ] **Step 3: Create `src/components/Pagination.astro`**

```astro
---
interface Props { prevUrl?: string; nextUrl?: string; current: number; total: number }
const { prevUrl, nextUrl, current, total } = Astro.props
---
<nav class="flex justify-between items-center py-8 text-sm">
  {prevUrl ? <a href={prevUrl} class="hover:text-[var(--primary)]">← Newer</a> : <span></span>}
  <span class="text-[var(--muted-foreground)]">{current} / {total}</span>
  {nextUrl ? <a href={nextUrl} class="hover:text-[var(--primary)]">Older →</a> : <span></span>}
</nav>
```

- [ ] **Step 4: Create `src/pages/[...page].astro`**

```astro
---
import { getCollection } from 'astro:content'
import BaseLayout from '../layouts/BaseLayout.astro'
import PostCard from '../components/PostCard.astro'
import Pagination from '../components/Pagination.astro'
import { SITE } from '../consts'

export async function getStaticPaths({ paginate }) {
  const posts = (await getCollection('posts')).sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  )
  return paginate(posts, { pageSize: SITE.postsPerPage })
}

const { page } = Astro.props
---
<BaseLayout>
  {page.data.map(post => <PostCard post={post} />)}
  <Pagination
    prevUrl={page.url.prev}
    nextUrl={page.url.next}
    current={page.currentPage}
    total={page.lastPage}
  />
</BaseLayout>
```

> `[...page].astro` serves `/` (page 1) and `/2`, `/3`… via Astro's `paginate()`. No separate `index.astro` needed.

- [ ] **Step 5: Build-verify**

Run: `npm run build`
Expected: build succeeds; `dist/index.html` exists and lists posts. If `react()` complains about `class` in MobileNav, fix to `className`.

- [ ] **Step 6: Commit**

```bash
git add src/components/PostCard.astro src/components/Pagination.astro src/lib/date.mjs src/pages/
git -c commit.gpgsign=false commit -m "feat: paginated home page"
```

---

## Task 10: Post page

**Files:**
- Create: `src/layouts/PostLayout.astro`, `src/pages/posts/[slug].astro`

- [ ] **Step 1: Create `src/layouts/PostLayout.astro`**

```astro
---
import BaseLayout from './BaseLayout.astro'
import Comments from '../components/Comments.astro'
import TagPill from '../components/TagPill.astro'
import { formatDate } from '../lib/date.mjs'
interface Props { title: string; date: string; tags: string[]; notionId: string; summary?: string }
const { title, date, tags, notionId, summary } = Astro.props
---
<BaseLayout title={title} description={summary}>
  <article class="prose-content">
    <h1 class="text-3xl font-bold">{title}</h1>
    <div class="flex items-center gap-3 mt-2 text-sm text-[var(--muted-foreground)]">
      <time>{formatDate(date)}</time>
      <div class="flex gap-2">{tags.map(t => <TagPill tag={t} />)}</div>
    </div>
    <div class="mt-8 leading-relaxed [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_p]:my-4 [&_a]:text-[var(--primary)] [&_a]:underline [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_ul]:list-disc [&_ul]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--border)] [&_blockquote]:pl-4 [&_blockquote]:italic">
      <slot />
    </div>
  </article>
  <Comments notionId={notionId} />
</BaseLayout>
```

- [ ] **Step 2: Create `src/pages/posts/[slug].astro`**

```astro
---
import { getCollection, render } from 'astro:content'
import PostLayout from '../../layouts/PostLayout.astro'

export async function getStaticPaths() {
  const posts = await getCollection('posts')
  return posts.map(post => ({ params: { slug: post.data.slug }, props: { post } }))
}

const { post } = Astro.props
const { Content } = await render(post)
---
<PostLayout
  title={post.data.title}
  date={post.data.date}
  tags={post.data.tags}
  notionId={post.data.notionId}
  summary={post.data.summary}
>
  <Content />
</PostLayout>
```

- [ ] **Step 3: Build-verify (after Tasks 11 & 15 create TagPill + Comments — see note)**

> TagPill is created in Task 11; Comments in Task 15. To keep this task self-contained, create placeholder stubs now and fill them in their tasks. Stub `src/components/TagPill.astro` and `src/components/Comments.astro`:

`src/components/TagPill.astro` (final version — also used by Task 11):
```astro
---
interface Props { tag: string }
const { tag } = Astro.props
---
<a href={`/tags/${tag}`} class="px-2 py-0.5 text-xs rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]">#{tag}</a>
```

`src/components/Comments.astro` (stub — finalized in Task 15):
```astro
---
interface Props { notionId: string }
const { notionId } = Astro.props
---
<div data-comments={notionId} class="mt-12"></div>
```

- [ ] **Step 4: Build-verify**

Run: `npm run build`
Expected: build succeeds; `dist/posts/<slug>/index.html` exists with rendered article HTML, highlighted code, and KaTeX math (if any post uses it).

- [ ] **Step 5: Commit**

```bash
git add src/layouts/PostLayout.astro src/pages/posts/ src/components/TagPill.astro src/components/Comments.astro
git -c commit.gpgsign=false commit -m "feat: post page with markdown rendering"
```

---

## Task 11: Tag index and tag pages

**Files:**
- Create: `src/pages/tags/index.astro`, `src/pages/tags/[tag].astro`
- (TagPill already created in Task 10.)

- [ ] **Step 1: Create `src/pages/tags/index.astro`**

```astro
---
import { getCollection } from 'astro:content'
import BaseLayout from '../../layouts/BaseLayout.astro'
import TagPill from '../../components/TagPill.astro'

const posts = await getCollection('posts')
const counts = new Map()
for (const p of posts) for (const t of p.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1)
const tags = [...counts.entries()].sort((a, b) => b[1] - a[1])
---
<BaseLayout title="Tags">
  <h1 class="text-3xl font-bold mb-6">Tags</h1>
  <div class="flex flex-wrap gap-3">
    {tags.map(([tag, n]) => <span><TagPill tag={tag} /> <span class="text-xs text-[var(--muted-foreground)]">{n}</span></span>)}
  </div>
</BaseLayout>
```

- [ ] **Step 2: Create `src/pages/tags/[tag].astro`**

```astro
---
import { getCollection } from 'astro:content'
import BaseLayout from '../../layouts/BaseLayout.astro'
import PostCard from '../../components/PostCard.astro'

export async function getStaticPaths() {
  const posts = await getCollection('posts')
  const tags = [...new Set(posts.flatMap(p => p.data.tags))]
  return tags.map(tag => ({
    params: { tag },
    props: { posts: posts.filter(p => p.data.tags.includes(tag)).sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()), tag }
  }))
}

const { posts, tag } = Astro.props
---
<BaseLayout title={`#${tag}`}>
  <h1 class="text-3xl font-bold mb-4">#{tag}</h1>
  {posts.map(post => <PostCard post={post} />)}
</BaseLayout>
```

- [ ] **Step 3: Build-verify**

Run: `npm run build`
Expected: `dist/tags/index.html` and `dist/tags/<tag>/index.html` exist.

- [ ] **Step 4: Commit**

```bash
git add src/pages/tags/
git -c commit.gpgsign=false commit -m "feat: tag index and tag pages"
```

---

## Task 12: Search page (React island)

Client-side search over a build-time-generated JSON index of post metadata.

**Files:**
- Create: `src/pages/search.astro`, `src/components/react/Search.tsx`

- [ ] **Step 1: Create `src/components/react/Search.tsx`**

```tsx
import { useMemo, useState } from 'react'
import { Input } from '@quietbuildlab/ui'

interface Item { title: string; slug: string; summary: string; tags: string[] }
interface Props { items: Item[] }

export default function Search({ items }: Props) {
  const [q, setQ] = useState('')
  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return items
    return items.filter(i =>
      i.title.toLowerCase().includes(s) ||
      i.summary.toLowerCase().includes(s) ||
      i.tags.some(t => t.toLowerCase().includes(s))
    )
  }, [q, items])
  return (
    <div>
      <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search posts..." />
      <ul className="mt-6 space-y-4">
        {results.map(i => (
          <li key={i.slug}>
            <a href={`/posts/${i.slug}`} className="text-xl font-semibold hover:underline">{i.title}</a>
            {i.summary && <p className="text-sm text-[var(--muted-foreground)]">{i.summary}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/pages/search.astro`**

```astro
---
import { getCollection } from 'astro:content'
import BaseLayout from '../layouts/BaseLayout.astro'
import Search from '../components/react/Search.tsx'

const posts = await getCollection('posts')
const items = posts.map(p => ({ title: p.data.title, slug: p.data.slug, summary: p.data.summary, tags: p.data.tags }))
---
<BaseLayout title="Search">
  <h1 class="text-3xl font-bold mb-6">Search</h1>
  <Search items={items} client:load />
</BaseLayout>
```

- [ ] **Step 3: Build-verify**

Run: `npm run build`
Expected: `dist/search/index.html` exists; the island hydrates (search input present).

- [ ] **Step 4: Commit**

```bash
git add src/pages/search.astro src/components/react/Search.tsx
git -c commit.gpgsign=false commit -m "feat: client-side search"
```

---

## Task 13: 404 page

**Files:**
- Create: `src/pages/404.astro`

- [ ] **Step 1: Create `src/pages/404.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro'
---
<BaseLayout title="Not Found">
  <div class="text-center py-20">
    <h1 class="text-5xl font-bold">404</h1>
    <p class="mt-4 text-[var(--muted-foreground)]">This page doesn't exist.</p>
    <a href="/" class="inline-block mt-6 text-[var(--primary)] hover:underline">← Back home</a>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Build-verify + commit**

Run: `npm run build` → expect `dist/404.html`.
```bash
git add src/pages/404.astro
git -c commit.gpgsign=false commit -m "feat: 404 page"
```

---

## Task 14: RSS feed

**Files:**
- Create: `src/pages/rss.xml.ts`

- [ ] **Step 1: Create `src/pages/rss.xml.ts`**

```ts
import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import { SITE } from '../consts'
import type { APIContext } from 'astro'

export async function GET(context: APIContext) {
  const posts = await getCollection('posts')
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site!,
    items: posts
      .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime())
      .map(p => ({
        title: p.data.title,
        description: p.data.summary,
        pubDate: new Date(p.data.date),
        link: `/posts/${p.data.slug}/`
      }))
  })
}
```

- [ ] **Step 2: Build-verify + commit**

Run: `npm run build` → expect `dist/rss.xml` with `<item>` entries.
```bash
git add src/pages/rss.xml.ts
git -c commit.gpgsign=false commit -m "feat: RSS feed"
```

---

## Task 15: lit-talk comments island

Ports the existing `<lit-talk>` web component. Config carried from the old `blog.config.ts`: `owner: 'matwming'`, `repo: 'my-nextjs-blog'`, proxy worker URL, `client_id` placeholder. `postUniqueId` = post `notionId`.

**Files:**
- Replace: `src/components/Comments.astro` (was stubbed in Task 10)
- Create: `src/consts.comments.ts`

- [ ] **Step 1: Create `src/consts.comments.ts`**

```ts
// Fill client_id with your GitHub OAuth App client ID before deploying.
export const LIT_TALK = {
  client_id: 'PLACEHOLDER_CLIENT_ID',
  owner: 'matwming',
  repo: 'my-nextjs-blog',
  proxy: 'https://lit-talk-oauth-proxy.matwming.workers.dev'
} as const
```

- [ ] **Step 2: Replace `src/components/Comments.astro`**

```astro
---
import { LIT_TALK } from '../consts.comments'
interface Props { notionId: string }
const { notionId } = Astro.props
const options = JSON.stringify({ ...LIT_TALK, postUniqueId: notionId })
---
<div class="mt-12 max-w-2xl mx-auto">
  <lit-talk github-oauth-options={options}></lit-talk>
</div>
<script>
  import 'lit-talk'
</script>
```

> Add `lit-talk` to dependencies: `npm install lit-talk@^1.0.7`. The `<script>` (module) registers the custom element client-side; Astro bundles it. The element is framework-agnostic so no React needed.

- [ ] **Step 3: Build-verify**

Run: `npm install lit-talk@^1.0.7 && npm run build`
Expected: build succeeds; a post page contains `<lit-talk github-oauth-options="...">` and the lit-talk script chunk.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/components/Comments.astro src/consts.comments.ts
git -c commit.gpgsign=false commit -m "feat: lit-talk comments island"
```

---

## Task 16: Delete old SPA files + full build verification

**Files:**
- Delete: old Vite/React SPA files (see File Structure "Deleted" list).

- [ ] **Step 1: Delete obsolete files**

```bash
git rm -r --ignore-unmatch \
  src/App.tsx src/main.tsx src/router.tsx src/queryClient.ts \
  src/hooks src/layouts/search.tsx \
  src/components/Post.tsx src/components/Scripts.tsx src/components/Pagination.tsx \
  src/components/Utterances.tsx src/components/BlogPost.tsx src/components/Tags.tsx \
  src/components/Footer.tsx src/components/FormattedDate.tsx src/components/TagItem.tsx \
  src/components/Header.tsx src/components/NotionRenderer.tsx src/components/Ackee.tsx \
  src/components/Gtag.tsx src/components/TableOfContents.tsx src/components/Container.tsx \
  src/components/Comments.tsx src/components/notion-blocks \
  src/pages/Home.tsx src/pages/PostPage.tsx src/pages/TagPage.tsx \
  src/pages/SearchPage.tsx src/pages/PaginatedPage.tsx src/pages/NotFound.tsx \
  src/lib/blockMap.tsx src/lib/config.tsx src/lib/locale.tsx src/lib/cusdisLang.ts \
  src/lib/cjk.ts src/lib/theme.tsx src/lib/gtag.ts src/lib/dayjs.ts \
  src/assets src/styles/notion.css \
  src/types/gitalk.d.ts src/types/use-ackee.d.ts src/types/prismjs.d.ts \
  src/types/locale.ts src/types/index.ts src/types/post.ts src/types/blog.ts \
  index.html vite.config.ts vite-env.d.ts postcss.config.cjs \
  tailwind.config.js .eslintrc.json Dockerfile blog.config.ts
```

> Keep `src/styles/globals.css`? No — replaced by `global.css`. Remove if present: `git rm --ignore-unmatch src/styles/globals.css`. Keep `public/` (favicon, images), `README.md`, `LICENSE`.

- [ ] **Step 2: Clean build from scratch**

```bash
rm -rf dist .astro node_modules/.vite && npm run build
```
Expected: build completes with **0 errors**. Verify these exist:
```bash
ls dist/index.html dist/rss.xml dist/sitemap-index.xml dist/404.html && ls dist/posts && ls dist/tags
```

- [ ] **Step 3: Type check**

Run: `npx astro check`
Expected: 0 errors. Fix any (common: `class` → `className` in `.tsx`, missing UI export names — cross-check `@quietbuildlab/ui` llms-full.txt).

- [ ] **Step 4: Local preview smoke test**

Run: `npm run preview` then open the printed URL.
Manually verify: home lists posts, a post renders with formatting, dark-mode toggle works, mobile nav opens, tags page works, search filters, comments box appears.

- [ ] **Step 5: Commit**

```bash
git add -A
git -c commit.gpgsign=false commit -m "chore: remove old Vite/React SPA"
```

---

## Task 17: Push to org (rename to my-blog) + Cloudflare Pages

**Files:** none (git + external dashboards).

- [ ] **Step 1: Rename the GitHub repo to `my-blog`**

Run (requires `gh` auth with repo admin on the org):
```bash
gh repo rename my-blog --repo quietbuildlab/my-nextjs-blog
git remote set-url origin git@github.com:quietbuildlab/my-blog.git
```
Expected: `gh repo view quietbuildlab/my-blog` succeeds.

> If `gh` lacks permission, rename manually in GitHub repo Settings, then run only the `git remote set-url` line.

- [ ] **Step 2: Merge branch and push**

```bash
git checkout main && git merge --no-ff astro-migration -m "Migrate blog to Astro on Cloudflare Pages"
git push origin main
```

> If commit signing blocks the merge commit, prefix with `git -c commit.gpgsign=false`.

- [ ] **Step 3: Cloudflare Pages — connect repo (user, in dashboard)**

In Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → select `quietbuildlab/my-blog`. Build settings:
- Framework preset: **Astro**
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: `NOTION_TOKEN`, `NOTION_DATABASE_ID` (same values as local `.env`).

- [ ] **Step 4: First deploy + update site URL**

After the first deploy, copy the assigned `*.pages.dev` URL into `astro.config.mjs` `site:` (and any custom domain). Commit + push:
```bash
git -c commit.gpgsign=false commit -am "chore: set production site URL" && git push
```
Expected: redeploy succeeds; live site loads; RSS/sitemap use the correct absolute URLs.

- [ ] **Step 5: Fill lit-talk client_id**

Replace `PLACEHOLDER_CLIENT_ID` in `src/consts.comments.ts` with the real GitHub OAuth App client ID, commit, push. Verify comments load on a live post.

---

## Self-Review

**Spec coverage:**
- Astro static migration → Tasks 2–14. ✔
- Notion official API + notion-to-md → markdown → Tasks 4–6. ✔
- `@quietbuildlab/ui` (Manuscript, Tailwind v4) → Tasks 2, 3, 8, 12. ✔
- lit-talk comments → Task 15. ✔
- i18n dropped → no i18n tasks; locale files deleted in Task 16. ✔
- Manual redeploy (no cron) → Task 17 has no deploy hook. ✔
- Cloudflare Pages deploy → Task 17. ✔
- Push to org, rename `my-blog` → Task 17. ✔
- RSS + sitemap → Task 14 + sitemap integration (Task 3). ✔

**Placeholder scan:** `PLACEHOLDER_CLIENT_ID` is intentional (user secret, Task 17 step 5). No TODO/TBD in logic.

**Type consistency:** Post record shape `{ id, title, slug, date, type, status, tags, summary }` from `extractProps` (Task 4) → frontmatter (Task 5) → zod schema adds `notionId` (Task 6) → consumed by pages (Tasks 9–14). `notionId` flows extractor(`id`)→frontmatter(`notionId`)→schema→`Comments` prop. Consistent. `formatDate` defined once (Task 9) and imported in Tasks 9–10.

**Known execution-time checks (flagged inline):** real Notion property names (Task 5 step 3), `databases.query` availability (Task 5 step 1), UI export names + `className` (Tasks 8, 16), `@source` glob path (Task 3/16).
