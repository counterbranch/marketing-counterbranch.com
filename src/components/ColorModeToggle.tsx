import IconButton from '@mui/material/IconButton'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import { useColorScheme } from '@mui/material/styles'

/** Toggles between light and dark color schemes, defaulting to the system preference. */
export default function ColorModeToggle() {
  const { mode, systemMode, setMode } = useColorScheme()

  // `mode` is undefined on the server and on the first client render, so the
  // prerendered HTML and hydration agree. Until it settles, hold the button's
  // exact footprint with an inert twin; rendering nothing would let the nav
  // jump sideways when the real button arrives.
  if (!mode) {
    return (
      <IconButton aria-hidden tabIndex={-1} disabled sx={{ visibility: 'hidden' }}>
        <LightModeOutlinedIcon fontSize="small" />
      </IconButton>
    )
  }

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
