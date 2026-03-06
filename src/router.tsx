import { createRouter, createRoute, createRootRoute, lazyRouteComponent } from '@tanstack/react-router'
import App from './App'
import NotFound from './pages/NotFound'

const rootRoute = createRootRoute({
  component: App,
  notFoundComponent: NotFound,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: lazyRouteComponent(() => import('./pages/Home')),
})

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  component: lazyRouteComponent(() => import('./pages/SearchPage')),
})

const pageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/page/$page',
  component: lazyRouteComponent(() => import('./pages/PaginatedPage')),
})

const tagRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tag/$tag',
  component: lazyRouteComponent(() => import('./pages/TagPage')),
})

const slugRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$slug',
  component: lazyRouteComponent(() => import('./pages/PostPage')),
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  searchRoute,
  pageRoute,
  tagRoute,
  slugRoute,
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
