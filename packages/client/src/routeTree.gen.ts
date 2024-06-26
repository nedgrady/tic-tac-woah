/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as QueueImport } from './routes/queue'

// Create Virtual Routes

const PlayLazyImport = createFileRoute('/play')()
const IndexLazyImport = createFileRoute('/')()
const GameGameIdLazyImport = createFileRoute('/game/$gameId')()

// Create/Update Routes

const PlayLazyRoute = PlayLazyImport.update({
  path: '/play',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/play.lazy').then((d) => d.Route))

const QueueRoute = QueueImport.update({
  path: '/queue',
  getParentRoute: () => rootRoute,
} as any)

const IndexLazyRoute = IndexLazyImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

const GameGameIdLazyRoute = GameGameIdLazyImport.update({
  path: '/game/$gameId',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/game/$gameId.lazy').then((d) => d.Route))

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/queue': {
      preLoaderRoute: typeof QueueImport
      parentRoute: typeof rootRoute
    }
    '/play': {
      preLoaderRoute: typeof PlayLazyImport
      parentRoute: typeof rootRoute
    }
    '/game/$gameId': {
      preLoaderRoute: typeof GameGameIdLazyImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  IndexLazyRoute,
  QueueRoute,
  PlayLazyRoute,
  GameGameIdLazyRoute,
])

/* prettier-ignore-end */
