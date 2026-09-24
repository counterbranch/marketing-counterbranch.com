import type { ReactNode } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './theme.ts'

/**
 * The site's theme around a page. `enableColorScheme` sets the CSS
 * `color-scheme` from the active theme, so scrollbars and native controls
 * follow the site's toggle rather than only the operating system's setting.
 */
export default function SiteTheme({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  )
}
