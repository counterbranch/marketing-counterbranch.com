import Box from '@mui/material/Box'
import logoLight from '../assets/logo-light.webp'
import logoDark from '../assets/logo-dark.webp'

// Width-to-height ratios of the two lockups (960×195 and 960×193).
const LIGHT_ASPECT = 960 / 195
const DARK_ASPECT = 960 / 193

interface LogoProps {
  /** Rendered height in px; width follows the active lockup's aspect. */
  size?: number
}

/**
 * The Counterbranch lockup for the active colour scheme: the cyan band on
 * light surfaces, the pink band with the white shield on dark ones.
 *
 * Drawn as a CSS background keyed to the scheme attribute rather than as two
 * <img> elements. The browser only downloads a background that actually
 * applies, so each visit fetches one lockup instead of both; the swap is
 * instant with the toggle; and nothing is lazy-loaded, since the logo sits
 * above the fold.
 */
export default function Logo({ size = 32 }: LogoProps) {
  return (
    <Box
      component="span"
      role="img"
      aria-label="Counterbranch"
      sx={{
        display: 'block',
        flexShrink: 0,
        height: size,
        width: Math.round(size * LIGHT_ASPECT),
        backgroundImage: `url(${logoLight})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'left center',
        backgroundSize: 'contain',
        '[data-mui-color-scheme="dark"] &': {
          width: Math.round(size * DARK_ASPECT),
          backgroundImage: `url(${logoDark})`,
        },
      }}
    />
  )
}
