import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { CacheProvider } from '@emotion/react'
import './fonts.css'
// The alternative display face (see displayFont in theme.ts), Latin only.
import '@fontsource/anton/latin.css'
import './index.css'
import AlphaResultsRoot from './AlphaResultsRoot.tsx'
import { createEmotionCache } from './emotionCache.ts'
import { startAnalytics } from './posthog.ts'

const container = document.getElementById('root')!
const app = (
  <StrictMode>
    <CacheProvider value={createEmotionCache()}>
      <AlphaResultsRoot />
    </CacheProvider>
  </StrictMode>
)

// Prerendered in the production build, like the landing page (see main.tsx).
if (container.hasChildNodes()) {
  hydrateRoot(container, app)
} else {
  createRoot(container).render(app)
}

startAnalytics()
