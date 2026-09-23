import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.css'
// The alternative display face (see displayFont in theme.ts), Latin only.
import '@fontsource/anton/latin.css'
import './index.css'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './theme.ts'
import KitchenSink from './pages/KitchenSink.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <KitchenSink />
    </ThemeProvider>
  </StrictMode>,
)
