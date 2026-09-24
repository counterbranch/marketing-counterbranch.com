import { renderToString } from 'react-dom/server'
import { CacheProvider } from '@emotion/react'
import createEmotionServer from '@emotion/server/create-instance'
import AppRoot from './AppRoot.tsx'
import AlphaResultsRoot from './AlphaResultsRoot.tsx'
import { createEmotionCache } from './emotionCache.ts'
import { alphaResultsMarkdown, markdownPath } from './pages/alpha-results/content.ts'

/** The pages the build prerenders, by name. scripts/prerender.mjs lists their files. */
const pages = {
  home: AppRoot,
  'alpha-results': AlphaResultsRoot,
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
 * in public/llms.txt: the alpha test results page as Markdown, from the same
 * content as the page.
 */
export function markdownCopies(siteUrl: string) {
  return [{ file: markdownPath, text: alphaResultsMarkdown(siteUrl) }]
}
