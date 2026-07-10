# Agent guidance

This repo is an Astro blog that syncs published posts from Notion into local
content before building. Keep source changes aligned with the Notion data shape
and the generated Markdown content pipeline.

## Companion docs

- `docs/source-map.md` is the source/config companion for this repo. Update it
  whenever source, scripts, config, or deployment files change responsibility,
  public behavior, verification steps, or maintenance rules.
- Do not document generated content under `src/content/posts/`, dependency
  folders, `.astro/`, `dist/`, or one-off local planning artifacts.

## Project rules

- Notion property parsing belongs in `src/lib/notion.mjs`; sync orchestration
  belongs in `scripts/build-data.mjs`.
- Route/layout/component changes should preserve Astro's static build behavior
  unless the task explicitly changes deployment assumptions.
- Use `pnpm run test` for Notion helper changes and `pnpm run build` for site
  changes when dependencies are installed.
