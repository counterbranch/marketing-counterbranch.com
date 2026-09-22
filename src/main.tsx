import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource-variable/oswald'
import '@fontsource/anton'
import './index.css'
import AppRoot from './AppRoot.tsx'

const container = document.getElementById('root')!
const app = (
  <StrictMode>
    <AppRoot />
  </StrictMode>
)

// The production build prerenders the page into #root (scripts/prerender.mjs),
// so it is hydrated. The dev server serves an empty root and renders fresh.
if (container.hasChildNodes()) {
  hydrateRoot(container, app)
} else {
  createRoot(container).render(app)
}
