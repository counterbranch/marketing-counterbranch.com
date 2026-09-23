import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import { useTheme } from '@mui/material/styles'

/**
 * A small fixed note on the variant page: which version this is, and a link
 * back to the page as shipped, so the two can be compared side by side.
 */
export default function VariantSwitch() {
  const palette = useTheme().vars.palette
  return (
    <Box
      component="aside"
      aria-label="Page variant"
      sx={{
        position: 'fixed',
        left: { xs: 12, md: 20 },
        bottom: { xs: 12, md: 20 },
        zIndex: (theme) => theme.zIndex.snackbar,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.75,
        py: 1,
        backgroundColor: palette.hero.plate,
        color: palette.hero.plateInk,
        border: '1px solid',
        borderColor: palette.bands.navy.line,
        fontSize: { xs: '0.8125rem', md: '0.875rem' },
        boxShadow: `0 12px 24px -12px color-mix(in srgb, ${palette.common.black} 70%, transparent)`,
      }}
    >
      <Box component="span" sx={{ fontWeight: 700 }}>
        Variant B
      </Box>
      <Link
        href={import.meta.env.BASE_URL}
        underline="always"
        sx={{
          color: 'inherit',
          '&:hover': { color: palette.primary.main },
          '&:focus-visible': { outline: `2px solid ${palette.primary.main}`, outlineOffset: 2 },
        }}
      >
        View the original
      </Link>
    </Box>
  )
}
