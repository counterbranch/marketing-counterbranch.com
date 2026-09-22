import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './theme.ts'
import App from './App.tsx'

/**
 * The landing page inside its theme. The browser entry and the build-time
 * prerender both render exactly this, so the hydrating tree always matches
 * the HTML it takes over.
 *
 * `enableColorScheme` sets the CSS `color-scheme` from the active theme, so
 * scrollbars and native controls follow the site's toggle rather than only
 * the operating system's setting.
 */
export default function AppRoot() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <App />
    </ThemeProvider>
  )
}
