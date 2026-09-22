import Box from '@mui/material/Box'
import logoLight from '../assets/logo-light.webp'
import logoDark from '../assets/logo-dark.webp'

interface LogoProps {
  /** Rendered height in px; width follows the image's ~2000×420 aspect. */
  size?: number
  /**
   * Force the mark drawn for dark backgrounds, for places that are dark in
   * both colour schemes (the header over the video hero). Without this the
   * light-scheme mark's black wordmark would sit on a dark backdrop.
   */
  onDark?: boolean
}

// Both marks render at all times; CSS toggles which is visible based on the
// `data-mui-color-scheme` attribute the theme manages. This swaps instantly
// with the no-flash init script in index.html, with no JS/hook involved.
export default function Logo({ size = 32, onDark = false }: LogoProps) {
  const width = Math.round(size * (2000 / 406))

  if (onDark) {
    return (
      <Box
        component="img"
        src={logoDark}
        alt="Counterbranch"
        width={width}
        height={size}
        sx={{ display: 'block', height: size, width: 'auto', flexShrink: 0 }}
      />
    )
  }

  return (
    <Box sx={{ position: 'relative', display: 'block', height: size, width, flexShrink: 0 }}>
      <Box
        component="img"
        src={logoLight}
        alt="Counterbranch"
        width={width}
        height={size}
        sx={{
          display: 'block',
          height: size,
          width: 'auto',
          '[data-mui-color-scheme="dark"] &': {
            display: 'none',
          },
        }}
      />
      <Box
        component="img"
        src={logoDark}
        alt=""
        width={width}
        height={size}
        aria-hidden
        sx={{
          display: 'none',
          height: size,
          width: 'auto',
          position: 'absolute',
          top: 0,
          left: 0,
          '[data-mui-color-scheme="dark"] &': {
            display: 'block',
          },
        }}
      />
    </Box>
  )
}
