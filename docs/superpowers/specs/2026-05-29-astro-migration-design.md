# Design: Nobelium → Astro on Cloudflare Pages

**Date:** 2026-05-29
**Status:** Approved (pending spec review)

## Goal

Migrate the existing Notion-backed blog (currently Vite + React + TanStack Router SPA, formerly Next.js "Nobelium") to a static **Astro** site, styled with the `@quietbuildlab/ui` design system, deployed to **Cloudflare Pages** under the `quietbuildlab` GitHub org.

## Decisions (locked)

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Astro, `output: 'static'` | Fast static blog; no SSR needed |
| Notion rendering | **Purist rewrite**: official Notion API + `notion-to-md` → Markdown → Astro native markdown | User chose clean long-term path over reusing react-notion-x |
| Publish workflow | **Manual redeploy** | User preference; no cron/deploy hook |
| Comments | Port existing **lit-talk** web component as Astro island | User wants to keep current system |
| UI | `@quietbuildlab/ui` (React 18/19 + Radix + Tailwind v4), **Manuscript** theme | Editorial theme purpose-built for a blog |
| Tailwind | Upgrade **v3 → v4** | Required by `@quietbuildlab/ui` |
| i18n | **Dropped** — single-language `en-US` | User publishes single-language |
| Analytics | Port config scaffold, **kept off** (currently disabled) | Currently empty provider |
| Deploy target | Cloudflare Pages, repo `quietbuildlab/my-nextjs-blog` | Org remote already set |

## Architecture Overview

A **static Astro site**. Content is fetched from Notion **at build time** via the official API, converted to Markdown, and rendered through Astro's native Markdown pipeline into static HTML. Deployed to Cloudflare Pages as plain static assets (no SSR adapter). New posts appear after a **manual redeploy**. The `@quietbuildlab/ui` "Manuscript" design system provides the look; its React components are used only as small interactive **islands** (`@astrojs/react`).

## Content Pipeline (the rewrite)

1. **Fetch** — `@notionhq/client` queries the blog database → structured post metadata (title, slug, date, type, status, tags, summary).
2. **Convert** — `notion-to-md` converts each *published* page's blocks → Markdown.
3. **Render** — Markdown is loaded into an Astro **content collection**; pages render as static HTML.
   - Equations: `remark-math` + `rehype-katex` (build-time, zero JS).
   - Code highlighting: Shiki (Astro built-in, build-time, zero JS).
4. **Generated at build** — RSS feed (`feed.xml`/`feed`) + `sitemap.xml`, porting existing logic.

**Prerequisite (new):** the official API requires a Notion **internal integration token** and the blog database **shared with that integration**. The old unofficial `notion-client` needed neither. Setup steps to be documented in the plan.

**Accepted tradeoff:** any Notion block type `notion-to-md` doesn't support is dropped/simplified. Inventory real posts during planning and flag gaps before committing.

**Verification:** the official Notion API + `notion-to-md` surface will be verified against current docs during planning (not cited from memory).

## UI / Design System

- Install `@quietbuildlab/ui` as a package. Adopt Tailwind v4. Use the **Manuscript** theme.
- Static markup (post lists, post body, header, footer, tags) = plain Astro styled with design-system tokens / Tailwind v4.
- React **islands** only where interactivity is required:
  - Dark-mode toggle
  - Search
  - Mobile nav (Sheet)
  - Tag filter
- These use UI-lib components (Button, Sheet, Dialog, Switch, etc.).

## Comments

Port the existing **lit-talk** web component into an Astro island. Framework-agnostic → drops in cleanly. GitHub OAuth `client_id` placeholder must be filled by the user.

## Pages to Migrate

Matching current TanStack-Router routes:

- Home (paginated post list)
- Post page (`/[slug]`)
- Tag page (`/tag/[tag]`)
- Tag index
- Search
- 404
- RSS (`feed.xml`)
- `sitemap.xml`

## Deploy

- Repo: existing `quietbuildlab/my-nextjs-blog`.
- Cloudflare Pages: build command `astro build`, output dir `dist/`.
- Notion token + database/page ID as Cloudflare build env vars; `.env` locally (already gitignored).

## Removed (not carried over)

`react-notion-x`, `notion-client`, `notion-utils` (runtime), TanStack Router/Query, Preact, axios, `react-helmet-async`, gitalk/utterances/cusdis configs, `react-cusdis`, `use-ackee` (unless analytics re-enabled later), i18n locale machinery.

## Open Items for Planning

- Verify Notion official API + `notion-to-md` usage against current docs.
- Inventory actual Notion block types in use; confirm `notion-to-md` coverage.
- Confirm `@quietbuildlab/ui` Tailwind v4 integration steps in Astro (`@source` directive, theme CSS import).
- Map existing `blog.config.ts` fields that remain relevant.
