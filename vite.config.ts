import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/**
 * Preloads the Latin subsets of the two web fonts on every built page.
 *
 * Fontsource's @font-face rules only start a download once the stylesheet has
 * parsed and text needs the face. That was after first paint, so the headline
 * painted in a wide fallback and then reflowed into the condensed display
 * face. Preloading starts both downloads while the HTML is still parsing.
 */
function preloadFonts(files: RegExp[]): Plugin {
  let base = '/'
  return {
    name: 'preload-fonts',
    apply: 'build',
    configResolved(config) {
      base = config.base
    },
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        if (!ctx.bundle) return
        return Object.keys(ctx.bundle)
          .filter((file) => files.some((pattern) => pattern.test(file)))
          .map((file) => ({
            tag: 'link',
            attrs: {
              rel: 'preload',
              as: 'font',
              type: 'font/woff2',
              href: `${base}${file}`,
              crossorigin: '',
            },
            injectTo: 'head' as const,
          }))
      },
    },
  }
}

/**
 * Where the site is served from. The Pages workflow sets BASE_PATH from
 * actions/configure-pages: the repository's subpath on github.io, or `/` once
 * a custom domain serves the site from its root. Local builds use `/`.
 * scripts/prerender.mjs reads the same variable.
 */
const base = process.env.BASE_PATH || '/'

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  base,
  plugins: [
    react(),
    preloadFonts([/oswald-latin-wght-normal-[\w-]+\.woff2$/, /inter-latin-wght-normal-[\w-]+\.woff2$/]),
  ],
  // Only the client build has the HTML pages. The SSR build that feeds
  // scripts/prerender.mjs takes its single entry from the command line and
  // renders every prerendered page from it.
  build: isSsrBuild
    ? {}
    : {
        rollupOptions: {
          // The teaser builds the landing page only. The alpha test results
          // page (alpha-test-results/index.html) and kitchen-sink.html stay
          // in the tree, unbuilt, until they come back.
          input: {
            main: resolve(import.meta.dirname, 'index.html'),
          },
        },
      },
}))
