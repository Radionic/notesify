/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as ViewerIndexRouteImport } from './routes/viewer/index'
import { Route as LibraryIndexRouteImport } from './routes/library/index'

const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const ViewerIndexRoute = ViewerIndexRouteImport.update({
  id: '/viewer/',
  path: '/viewer/',
  getParentRoute: () => rootRouteImport,
} as any)
const LibraryIndexRoute = LibraryIndexRouteImport.update({
  id: '/library/',
  path: '/library/',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/library': typeof LibraryIndexRoute
  '/viewer': typeof ViewerIndexRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/library': typeof LibraryIndexRoute
  '/viewer': typeof ViewerIndexRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/library/': typeof LibraryIndexRoute
  '/viewer/': typeof ViewerIndexRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/library' | '/viewer'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/library' | '/viewer'
  id: '__root__' | '/' | '/library/' | '/viewer/'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  LibraryIndexRoute: typeof LibraryIndexRoute
  ViewerIndexRoute: typeof ViewerIndexRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/viewer/': {
      id: '/viewer/'
      path: '/viewer'
      fullPath: '/viewer'
      preLoaderRoute: typeof ViewerIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/library/': {
      id: '/library/'
      path: '/library'
      fullPath: '/library'
      preLoaderRoute: typeof LibraryIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  LibraryIndexRoute: LibraryIndexRoute,
  ViewerIndexRoute: ViewerIndexRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
