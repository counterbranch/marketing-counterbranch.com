import Box from '@mui/material/Box'
import logoLight from '../assets/logo-light.webp'
import logoDark from '../assets/logo-dark.webp'

interface LogoProps {
  /** Rendered height in px; width follows the image's ~2000×420 aspect. */
  size?: number
  /**
   * Pin the mark instead of letting it follow the colour scheme. Needed
   * wherever a surface looks the same in both schemes — the header sits on
   * the cyan hero, so it always wants the light-background mark, whose own
   * cyan band matches the hero exactly.
   */
  variant?: 'auto' | 'light' | 'dark'
}

// Both marks render at all times; CSS toggles which is visible based on the
// `data-mui-color-scheme` attribute the theme manages. This swaps instantly
// with the no-flash init script in index.html, with no JS/hook involved.
export default function Logo({ size = 32, variant = 'auto' }: LogoProps) {
  const width = Math.round(size * (2000 / 406))

  if (variant !== 'auto') {
    return (
      <Box
        component="img"
        src={variant === 'dark' ? logoDark : logoLight}
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
