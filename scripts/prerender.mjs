// Writes the prerendered landing page into dist/index.html. Runs after the
// client build and the SSR build of src/entry-server.tsx; see the `build`
// script in package.json. The browser entry hydrates what this writes.
import { readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const ssrDir = `${root}dist-ssr`
const page = `${root}dist/index.html`
const mount = '<div id="root"></div>'

const { render } = await import(pathToFileURL(`${ssrDir}/entry-server.js`).href)
const { html, styles } = render()

const template = await readFile(page, 'utf8')
if (!template.includes(mount)) {
  throw new Error(`prerender: ${mount} was not found in dist/index.html`)
}

// The page's only stylesheet is the @font-face rules and a small reset.
// Inlining it means the prerendered page needs no extra round trip before
// it can paint. Its asset URLs are absolute, so they resolve the same inline.
let inlined = template
for (const [link, href] of template.matchAll(/<link rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/g)) {
  const css = await readFile(`${root}dist${href}`, 'utf8')
  inlined = inlined.replace(link, () => `<style>${css}</style>`)
}

// Function replacers, so `$` sequences in markup or CSS are never read as
// replacement patterns.
const output = inlined
  .replace('</head>', () => `${styles}\n  </head>`)
  .replace(mount, () => `<div id="root">${html}</div>`)

await writeFile(page, output)
await rm(ssrDir, { recursive: true, force: true })

const kb = (text) => (Buffer.byteLength(text) / 1024).toFixed(1)
console.log(`prerender: ${kb(html)} KB markup and ${kb(styles)} KB critical CSS written to dist/index.html`)
