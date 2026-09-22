import { useTheme, useColorScheme } from '@mui/material/styles'

/**
 * Returns the literal (non-CSS-variable) palette for whichever color scheme
 * is currently active. `theme.palette` is frozen to the default scheme once
 * `cssVariables` is enabled, but `theme.colorSchemes.<scheme>.palette` still
 * holds the fully-resolved literal values for each scheme — exactly what we
 * want to print as hex text next to swatches that visually update via CSS
 * variables.
 */
export function useResolvedPalette() {
  const theme = useTheme()
  const { mode, systemMode } = useColorScheme()
  const resolved = (mode === 'system' ? systemMode : mode) ?? 'light'
  const scheme = resolved === 'dark' ? 'dark' : 'light'
  return theme.colorSchemes[scheme]?.palette ?? theme.palette
}
