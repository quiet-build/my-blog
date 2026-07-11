# my-nextjs-blog — Production Release Checklist
> Generated 2026-07-11 from the portfolio review. Portfolio summary: ~/projects/check-list.md
**Status**: Near-release — Ming's personal blog. **Misnamed: it's Astro 6, not Next.js** (remote `quiet-build/my-blog`). Notion content pulled at build time → static HTML on Cloudflare Pages. All page types built; comments wired to the deployed lit-talk Worker. Unproven parts: actual content and the live domain.

## Do yourself (human-only)
- [ ] **Write actual blog posts in Notion** — the gating item; without content the site ships empty.
- [ ] **Set the `NOTION_TOKEN` and `NOTION_DATABASE_ID` GitHub secrets** — without them the build fetches zero posts.
- [ ] **Attach a production custom domain** (currently `my-blog.pages.dev`).
- [ ] Confirm the lit-talk comments repo / OAuth target is the intended production one.

## Decisions needed
- **Folder-rename decision**: the local dir is called `my-nextjs-blog` but the project is Astro — rename the local directory to stop the confusion.
- Whether to cache last-good Notion content so a Notion API outage at deploy time doesn't break the build.

## Delegate to Claude (automatable)
- Add `pnpm check` + `pnpm test` gates to the deploy workflow (no type-check/test gate in the deploy path today).
- Add a custom-domain provisioning step to the workflow.
- Clean up stray untracked docs: `docs/decision-alpha-implementation-plan.html` and `docs/superpowers`.
- Delete the merged/stale `astro-migration` branch.

## Risks to keep in mind
- Folder name confusion (`my-nextjs-blog` for an Astro project) misleads at a glance.
- Build depends on the Notion API at deploy time — no cached fallback for a bad build.
- No type-check or test gate in the deploy path.
