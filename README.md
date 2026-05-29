# my-blog

A static blog built with [Astro](https://astro.build), content sourced from Notion at build time, styled with [`@quietbuildlab/ui`](https://www.npmjs.com/package/@quietbuildlab/ui), and deployed to Cloudflare Pages.

## How it works

- `scripts/build-data.mjs` queries a Notion database via the official API (`@notionhq/client`) and converts each published post to Markdown with `notion-to-md`, writing `src/content/posts/<slug>.md`.
- Astro renders those Markdown files through its native pipeline (Shiki for code, KaTeX for math) into static HTML.
- Comments use the [lit-talk](https://www.npmjs.com/package/lit-talk) web component.

## Develop

```bash
cp .env.example .env   # fill NOTION_TOKEN and NOTION_DATABASE_ID
pnpm install
pnpm dev               # syncs Notion, then starts the dev server
```

Without Notion credentials the site still builds with zero posts.

## Scripts

| Command       | Action                                          |
| ------------- | ----------------------------------------------- |
| `pnpm sync`   | Fetch Notion content into `src/content/posts/`  |
| `pnpm dev`    | Sync, then start the dev server                 |
| `pnpm build`  | Sync, then build the static site to `dist/`     |
| `pnpm check`  | Type-check with `astro check`                   |
| `pnpm test`   | Run unit tests                                  |

## Deploy

Cloudflare Pages — build command `pnpm build`, output directory `dist`, with `NOTION_TOKEN` and `NOTION_DATABASE_ID` set as environment variables.
