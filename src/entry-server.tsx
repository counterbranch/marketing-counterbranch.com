import { renderToString } from 'react-dom/server'
import { CacheProvider } from '@emotion/react'
import createEmotionServer from '@emotion/server/create-instance'
import AppRoot from './AppRoot.tsx'
import { createEmotionCache } from './emotionCache.ts'

/**
 * Renders the landing page to static HTML at build time, along with the
 * critical CSS emotion generated for it. scripts/prerender.mjs writes both
 * into dist/index.html, so the hero paints before any JavaScript arrives.
 */
export function render() {
  const cache = createEmotionCache()
  const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(cache)
  const html = renderToString(
    <CacheProvider value={cache}>
      <AppRoot />
    </CacheProvider>,
  )
  const styles = constructStyleTagsFromChunks(extractCriticalToChunks(html))
  return { html, styles }
}
