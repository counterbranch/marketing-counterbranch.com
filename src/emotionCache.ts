import createCache from '@emotion/cache'

/**
 * The emotion cache for both entries. The build-time prerender and the
 * browser must use the same key, so the browser adopts the prerendered style
 * tags on load instead of inserting duplicates.
 */
export function createEmotionCache() {
  return createCache({ key: 'css' })
}
