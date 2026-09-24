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

The build prerenders the landing page into `dist/index.html` (`src/entry-server.tsx` and `scripts/prerender.mjs`), so the hero paints before any JavaScript loads; the browser then hydrates it. The dev server renders client-side as usual.

## Pre-launch teaser

This branch, `feat/soft-launch-teaser`, is the live site until the soft launch: the hero with install switched off, the alpha results band, and a soft-launch note. It builds the landing page only; the alpha test results page and the kitchen sink stay in the tree, unbuilt. The full site carries on in `main`.

It deploys to GitHub Pages on every push to this branch. For that, the `github-pages` environment's deployment branches (Settings > Environments > github-pages) must allow `feat/soft-launch-teaser` and not `main`. Then merges to `main` still build, but their deploy is refused, so they cannot replace the teaser.

To go back to the full site:

1. Allow `main` again in the `github-pages` environment.
2. Remove `feat/soft-launch-teaser` from it, or delete the branch, so a later push here cannot put the teaser back.
3. Start a fresh run on `main`'s head: `gh workflow run deploy.yml --ref main`. Re-running an old run redeploys that run's commit, and its build artifact expires after a day.
