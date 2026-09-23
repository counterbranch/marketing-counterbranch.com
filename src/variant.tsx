import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CacheProvider } from '@emotion/react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './fonts.css'
// The alternative display face (see displayFont in theme.ts), Latin only.
import '@fontsource/anton/latin.css'
import './index.css'
import theme from './theme.ts'
import AppVariant from './variant/AppVariant.tsx'
import { createEmotionCache } from './emotionCache.ts'

// Variant B, for comparing openings: rendered in the browser only, since
// the prerender covers the page as shipped.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CacheProvider value={createEmotionCache()}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <AppVariant />
      </ThemeProvider>
    </CacheProvider>
  </StrictMode>,
)
