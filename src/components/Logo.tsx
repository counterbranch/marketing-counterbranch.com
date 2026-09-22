import Box from '@mui/material/Box'
import logo from '../assets/logo.webp'

interface LogoProps {
  /** Rendered height in px; width follows the image's 2000×406 aspect. */
  size?: number
}

// Same asset for light and dark until a dark-scheme variant is supplied.
export default function Logo({ size = 32 }: LogoProps) {
  return (
    <Box
      component="img"
      src={logo}
      alt="Counterbranch"
      width={Math.round(size * (2000 / 406))}
      height={size}
      sx={{ display: 'block', height: size, width: 'auto', flexShrink: 0 }}
    />
  )
}
