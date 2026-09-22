import IconButton from '@mui/material/IconButton'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import { useColorScheme } from '@mui/material/styles'

/** Toggles between light and dark color schemes, defaulting to the system preference. */
export default function ColorModeToggle() {
  const { mode, systemMode, setMode } = useColorScheme()

  // `mode` is briefly undefined before the provider mounts; render nothing until it settles.
  if (!mode) return null

  const resolvedMode = mode === 'system' ? systemMode : mode
  const isDark = resolvedMode === 'dark'

  return (
    <IconButton
      color="inherit"
      onClick={() => setMode(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <LightModeOutlinedIcon aria-hidden fontSize="small" />
      ) : (
        <DarkModeOutlinedIcon aria-hidden fontSize="small" />
      )}
    </IconButton>
  )
}
