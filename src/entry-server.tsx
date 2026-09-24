import { renderToString } from 'react-dom/server'
import { CacheProvider } from '@emotion/react'
import createEmotionServer from '@emotion/server/create-instance'
import AppRoot from './AppRoot.tsx'
import { createEmotionCache } from './emotionCache.ts'

/**
 * The pages the build prerenders, by name. scripts/prerender.mjs lists their
 * files. The teaser builds the landing page only; the alpha test results page
 * (AlphaResultsRoot) comes back here with it.
 */
const pages = {
  home: AppRoot,
} as const

export type PageName = keyof typeof pages

/**
 * Renders one page to static HTML at build time, along with the critical CSS
 * emotion generated for it. scripts/prerender.mjs writes both into that
 * page's built HTML, so it paints before any JavaScript arrives.
 */
export function render(page: PageName) {
  const Root = pages[page]
  const cache = createEmotionCache()
  const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(cache)
  const html = renderToString(
    <CacheProvider value={cache}>
      <Root />
    </CacheProvider>,
  )
  const styles = constructStyleTagsFromChunks(extractCriticalToChunks(html))
  return { html, styles }
}

/**
 * Plain-text copies of pages for agents, written beside the HTML and listed
 * in public/llms.txt. None while the teaser is up: the alpha test results
 * page's Markdown copy comes back with the page.
 */
export function markdownCopies(_siteUrl: string): { file: string; text: string }[] {
  return []
}
