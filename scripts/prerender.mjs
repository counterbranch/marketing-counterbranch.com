// Writes each prerendered page into its built HTML file. Runs after the client
// build and the SSR build of src/entry-server.tsx; see the `build` script in
// package.json. Each page's browser entry hydrates what this writes.
import { readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
// The base the client build was made with (see vite.config.ts). Asset URLs in
// the built HTML start with it, so it is stripped to find their files in dist.
const base = process.env.BASE_PATH || '/'
const ssrDir = `${root}dist-ssr`
const mount = '<div id="root"></div>'

// Page names match `pages` in src/entry-server.tsx.
const pages = [{ name: 'home', file: 'dist/index.html' }]

const { render, markdownCopies } = await import(pathToFileURL(`${ssrDir}/entry-server.js`).href)
const kb = (text) => (Buffer.byteLength(text) / 1024).toFixed(1)

for (const { name, file } of pages) {
  const page = `${root}${file}`
  const { html, styles } = render(name)

  const template = await readFile(page, 'utf8')
  if (!template.includes(mount)) {
    throw new Error(`prerender: ${mount} was not found in ${file}`)
  }

  // The page's only stylesheet is the @font-face rules and a small reset.
  // Inlining it means the prerendered page needs no extra round trip before
  // it can paint. Its asset URLs are absolute, base included, so they resolve
  // the same inline.
  let inlined = template
  for (const [link, href] of template.matchAll(/<link rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/g)) {
    if (!href.startsWith(base)) {
      throw new Error(`prerender: stylesheet ${href} is outside the base ${base}`)
    }
    const css = await readFile(`${root}dist/${href.slice(base.length)}`, 'utf8')
    inlined = inlined.replace(link, () => `<style>${css}</style>`)
  }

  // Function replacers, so `$` sequences in markup or CSS are never read as
  // replacement patterns.
  const output = inlined
    .replace('</head>', () => `${styles}\n  </head>`)
    .replace(mount, () => `<div id="root">${html}</div>`)

  await writeFile(page, output)
  console.log(`prerender: ${kb(html)} KB markup and ${kb(styles)} KB critical CSS written to ${file}`)
}

// Markdown copies for agents. Their links are absolute: the canonical site,
// wherever this build is served from.
for (const { file, text } of markdownCopies('https://counterbranch.com/')) {
  await writeFile(`${root}dist/${file}`, text)
  console.log(`prerender: ${kb(text)} KB Markdown written to dist/${file}`)
}

await rm(ssrDir, { recursive: true, force: true })
