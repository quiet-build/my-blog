# TypeScript Migration Plan: Nobelium Blog Template

## Overview

Convert the Nobelium blog (JSX/JS + Notion CMS) into a fully typed TypeScript template.
Tech stack preserved: Vite 6, React 18, TanStack Router, React Query, Tailwind CSS, .env, code splitting.

---

## Phase 1: TypeScript Foundation (Task #2)

### 1.1 Install TypeScript and type packages

```bash
npm install -D typescript @types/react @types/react-dom
```

No other `@types/*` packages are strictly required since most deps ship their own types.
`prop-types` will be removed once components are typed.

### 1.2 Create `tsconfig.json`

```jsonc
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["vite/client"]
  },
  "include": ["src", "blog.config.ts", "vite-env.d.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### 1.3 Create `vite-env.d.ts`

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NOTION_PAGE_ID?: string
  readonly PROD: boolean
  readonly DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 1.4 Rename `vite.config.js` -> `vite.config.ts`

Minimal changes: add `import { fileURLToPath } from 'url'` for `__dirname` equivalent.

### 1.5 Convert `blog.config.js` -> `blog.config.ts`

- Define the `BlogConfig` interface in a new `src/types/blog.ts` (see Phase 2)
- Add `satisfies BlogConfig` to the exported object
- Remove the runtime `isProd` field from the config object (it uses `import.meta.env` which is Vite-only; keep it but typed properly)

### 1.6 Update `index.html`

Change `<script type="module" src="/src/main.jsx">` to `src="/src/main.tsx"`.

---

## Phase 2: Type Definitions (Task #2, completed alongside Phase 1)

Create `src/types/` directory with the following files:

### 2.1 `src/types/blog.ts` - Blog configuration types

```ts
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

export interface CommentConfig {
  provider: '' | 'gitalk' | 'utterances' | 'cusdis'
  gitalkConfig: GitalkConfig
  utterancesConfig: UtterancesConfig
  cusdisConfig: CusdisConfig
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
```

### 2.2 `src/types/post.ts` - Post and Notion data types

```ts
export interface PostProperties {
  id: string
  title: string
  slug: string
  summary?: string
  date: number
  tags?: string[]
  type: string[]
  status: string[]
  fullWidth?: boolean
}

export interface PostData {
  post: PostProperties
  blockMap: RecordMap  // from notion-types or react-notion-x
  emailHash: string
}
```

### 2.3 `src/types/locale.ts` - Locale types

```ts
export interface Locale {
  NAV: {
    INDEX: string
    RSS: string
    SEARCH: string
    ABOUT: string
  }
  PAGINATION: {
    PREV: string
    NEXT: string
  }
  POST: {
    BACK: string
    TOP: string
  }
  PAGE: {
    ERROR_404: {
      MESSAGE: string
    }
  }
}
```

### 2.4 `src/types/index.ts` - Re-export barrel

```ts
export type { BlogConfig, Lang, Appearance, Font } from './blog'
export type { PostProperties, PostData } from './post'
export type { Locale } from './locale'
```

---

## Phase 3: Core Lib Files and Hooks (Task #3)

Convert in dependency order (files with no internal deps first):

### 3.1 `src/consts.js` -> `src/consts.ts`
- Add `as const` to both font arrays. No other changes needed.

### 3.2 `src/queryClient.js` -> `src/queryClient.ts`
- No code changes needed, just rename.

### 3.3 `src/lib/dayjs.js` -> `src/lib/dayjs.ts`
- Type the `prepareDayjs` parameter as `string`.

### 3.4 `src/lib/gtag.js` -> `src/lib/gtag.ts`
- Type function parameters. Add `declare global { interface Window { gtag: (...args: any[]) => void } }`.

### 3.5 `src/lib/cjk.js` -> `src/lib/cjk.ts`
- Change the import to use `useConfig` hook pattern instead of direct config import (or accept `lang` as parameter for purity). Return type: `'SC' | 'TC' | 'JP' | 'KR' | null`.

### 3.6 `src/lib/cusdisLang.js` -> `src/lib/cusdisLang.ts`
- Type `lang` parameter as `string`, return type as `string`.

### 3.7 `src/lib/config.jsx` -> `src/lib/config.tsx`
- Type the context with `BlogConfig | undefined`. Type the provider props with `{ value: BlogConfig; children: React.ReactNode }`.

### 3.8 `src/lib/locale.jsx` -> `src/lib/locale.tsx`
- Type the context with `Locale | undefined`. Type provider props similarly.

### 3.9 `src/lib/theme.jsx` -> `src/lib/theme.tsx`
- Type the context value as `{ dark: boolean | null }`. Type provider props.

### 3.10 `src/lib/blockMap.jsx` -> `src/lib/blockMap.tsx`
- Type using `ExtendedRecordMap` from `notion-types`. Type the augmented value.

### 3.11 `src/assets/i18n/index.js` -> `src/assets/i18n/index.ts`
- Type the return as `Promise<Locale>`. Type the `import.meta.glob` result.

### 3.12 `src/hooks/useData.js` -> `src/hooks/useData.ts`
- Type all hook return values using `PostProperties[]` and `PostData`.
- Type parameters (`slug: string`, `page: number | string`, `tag: string`).
- Remove the direct `BLOG` import; accept `postsPerPage` from `useConfig()` instead.

---

## Phase 4: Components (Task #4)

Convert all components, removing `prop-types` imports and adding TypeScript interfaces. Order by dependency (leaf components first):

### Tier 1 - No internal component dependencies:
1. `src/components/FormattedDate.jsx` -> `.tsx` - Props: `{ date: number | string }`
2. `src/components/TagItem.jsx` -> `.tsx` - Props: `{ tag: string }`
3. `src/components/Scripts.jsx` -> `.tsx` - No props
4. `src/components/Ackee.jsx` -> `.tsx` - Props: `{ ackeeServerUrl: string; ackeeDomainId: string }`
5. `src/components/Gtag.jsx` -> `.tsx` - No props
6. `src/components/Utterances.jsx` -> `.tsx` - Props: `{ issueTerm: string; layout?: string }`
7. `src/components/notion-blocks/Toggle.jsx` -> `.tsx` - Props: typed with Notion block types
8. `src/components/notion-blocks/Mermaid.jsx` -> `.tsx` - Props: typed with Notion block types

### Tier 2 - Depend on Tier 1:
9. `src/components/Tags.jsx` -> `.tsx` - Props: `{ tags: Record<string, number>; currentTag?: string }`
10. `src/components/Pagination.jsx` -> `.tsx` - Props: `{ page: number; showNext: boolean }`
11. `src/components/BlogPost.jsx` -> `.tsx` - Props: `{ post: PostProperties }`
12. `src/components/NotionRenderer.jsx` -> `.tsx` - Props: extends react-notion-x NotionRenderer props
13. `src/components/TableOfContents.jsx` -> `.tsx` - Props with `blockMap`, `className`, `style`

### Tier 3 - Depend on Tier 2:
14. `src/components/Comments.jsx` -> `.tsx` - Props: `{ frontMatter: PostProperties }`
15. `src/components/Post.jsx` -> `.tsx` - Props: `PostProps` interface
16. `src/components/Footer.jsx` -> `.tsx` - Props: `{ fullWidth?: boolean }`
17. `src/components/Header.jsx` -> `.tsx` - Props: `{ navBarTitle?: string | null; fullWidth?: boolean }`

### Tier 4 - Layout component:
18. `src/components/Container.jsx` -> `.tsx` - Props: `ContainerProps` with meta fields
19. `src/layouts/search.jsx` -> `src/layouts/search.tsx` - Props with posts, tags, currentTag

---

## Phase 5: Pages, Router, App (Task #5)

### 5.1 Pages (all simple, can be done in parallel):
- `src/pages/NotFound.jsx` -> `.tsx`
- `src/pages/Home.jsx` -> `.tsx`
- `src/pages/PostPage.jsx` -> `.tsx`
- `src/pages/PaginatedPage.jsx` -> `.tsx`
- `src/pages/SearchPage.jsx` -> `.tsx`
- `src/pages/TagPage.jsx` -> `.tsx`

### 5.2 Router:
- `src/router.jsx` -> `src/router.tsx`
- Add proper TanStack Router type registration if needed

### 5.3 App entry:
- `src/App.jsx` -> `src/App.tsx`
- `src/main.jsx` -> `src/main.tsx`

---

## Phase 6: Build Script and Template Improvements (Task #6)

### 6.1 Build script stays as `.mjs`
The build script runs in Node.js (not Vite), so keep it as `scripts/build-data.mjs`. It does not need TypeScript conversion since it runs independently with `node`. However, we can add JSDoc types for documentation.

### 6.2 Template improvements
- Add `.env.example` with all required env vars documented
- Improve `.gitignore` to exclude `public/data/` (generated files)
- Remove `prop-types` from `package.json` once all components are converted

---

## File Conversion Order Summary (for senior-dev)

**Task #2 - Foundation (do first):**
1. Install TypeScript + @types/react + @types/react-dom
2. Create `tsconfig.json`
3. Create `vite-env.d.ts`
4. Create `src/types/blog.ts`, `src/types/post.ts`, `src/types/locale.ts`, `src/types/index.ts`
5. Rename `vite.config.js` -> `vite.config.ts`
6. Convert `blog.config.js` -> `blog.config.ts`
7. Update `index.html` to reference `main.tsx`

**Task #3 - Core (do second):**
1. `src/consts.js` -> `src/consts.ts`
2. `src/queryClient.js` -> `src/queryClient.ts`
3. `src/lib/dayjs.js` -> `src/lib/dayjs.ts`
4. `src/lib/gtag.js` -> `src/lib/gtag.ts`
5. `src/lib/cjk.js` -> `src/lib/cjk.ts`
6. `src/lib/cusdisLang.js` -> `src/lib/cusdisLang.ts`
7. `src/lib/config.jsx` -> `src/lib/config.tsx`
8. `src/lib/locale.jsx` -> `src/lib/locale.tsx`
9. `src/lib/theme.jsx` -> `src/lib/theme.tsx`
10. `src/lib/blockMap.jsx` -> `src/lib/blockMap.tsx`
11. `src/assets/i18n/index.js` -> `src/assets/i18n/index.ts`
12. `src/hooks/useData.js` -> `src/hooks/useData.ts`

**Task #4 - Components (do third):**
- Convert in tier order (Tier 1 -> 2 -> 3 -> 4) as listed above
- Remove all `import PropTypes` and `.propTypes = ...` assignments
- Add TypeScript interfaces for all props

**Task #5 - Pages/Router/App (do fourth):**
- Convert all 6 pages, router, App, and main entry
- This is the final step before the app is fully TypeScript

**Task #6 - Cleanup (do last):**
- Add `.env.example`
- Remove `prop-types` from package.json
- Verify build works end-to-end

---

## Key Guidelines for the Senior Dev

1. **Rename files using `git mv`** to preserve history (e.g., `git mv src/lib/config.jsx src/lib/config.tsx`)
2. **Do NOT change runtime behavior** - this is a type-only migration
3. **Use `as const` assertions** for constant arrays/objects instead of explicit type annotations where possible
4. **Keep `any` usage minimal** - use `unknown` and narrow, or use specific types from `notion-types` / `react-notion-x`
5. **For third-party libs without types** (e.g., `use-ackee`, `react-tweet-embed`), create minimal `.d.ts` declarations in `src/types/`
6. **Context hooks** (`useConfig`, `useLocale`, `useTheme`) should throw if used outside their providers (add runtime check)
7. **Remove `prop-types`** package entirely after Task #4 is complete
8. **Test after each task** by running `npx tsc --noEmit` and `npm run build`
