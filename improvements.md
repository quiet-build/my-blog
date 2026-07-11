# my-nextjs-blog — Improvements (UI / UX / design / workflow)
> Generated 2026-07-11 from the portfolio review. Portfolio summary: ~/projects/improvements.md

1. **Build the search index at build time and lazy-load it, with empty / no-results states.** The client-side search should ship a prebuilt index that loads on demand rather than at page load, and render a clear "no results" state.
2. **Lazy-load comments below the fold.** The lit-talk comment component is heavy and network-dependent; deferring it until scrolled into view protects the post page's LCP.
3. **Add reading-time and a table-of-contents island to `PostLayout`.** Both are standard blog affordances and fit the existing React-islands architecture.
4. **Upgrade `@quietbuildlab/ui` from `^0.6.0` to `0.7.0`** to pick up the collapsible Sidebar, which suits tag/category navigation.
5. **Generate per-post OG images.** Static per-post Open Graph images improve link previews when posts are shared.
6. **Workflow / hygiene:** rename the local `my-nextjs-blog` folder to reflect that it's Astro, clean the untracked `docs/decision-alpha-implementation-plan.html` and `docs/superpowers`, and add `pnpm check` + `pnpm test` gates to the deploy workflow so a broken build can't reach production.
