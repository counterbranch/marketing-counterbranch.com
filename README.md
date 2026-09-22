# Counterbranch marketing site

Static marketing landing page for Counterbranch, built with Vite, React 19, TypeScript, and MUI.

## Development

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

The build prerenders the landing page into `dist/index.html` (`src/entry-server.tsx` and `scripts/prerender.mjs`), so the hero paints before any JavaScript loads; the browser then hydrates it. The dev server renders client-side as usual. `/kitchen-sink.html` is not prerendered.

Deploys automatically to GitHub Pages via GitHub Actions on every push to `main`.
