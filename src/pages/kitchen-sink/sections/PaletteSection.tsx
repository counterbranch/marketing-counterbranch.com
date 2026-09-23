import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import type { PaletteColor } from '@mui/material/styles'
import SectionBlock from '../SectionBlock.tsx'
import GroupLabel from '../GroupLabel.tsx'
import { useResolvedPalette } from '../useResolvedPalette.ts'

const brandColors = ['primary', 'secondary', 'error', 'warning', 'info', 'success'] as const

function ColorRamp({ label, color }: { label: string; color: PaletteColor }) {
  const shades = [
    { name: 'light', hex: color.light },
    { name: 'main', hex: color.main },
    { name: 'dark', hex: color.dark },
  ] as const

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
        {label}
      </Typography>
      <Grid container spacing={1.5}>
        {shades.map((shade) => (
          <Grid key={shade.name} size={{ xs: 12, sm: 4 }}>
            <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
              <Box
                sx={{
                  bgcolor: shade.hex,
                  color: color.contrastText,
                  p: 2,
                  minHeight: 84,
                  display: 'flex',
                  alignItems: 'flex-end',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {shade.name}
                </Typography>
              </Box>
              <Box sx={{ px: 1.5, py: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', display: 'block' }}>
                  {shade.hex}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}

function TokenTile({
  label,
  hex,
  bg,
  fg,
  border,
}: {
  label: string
  hex: string
  bg: string
  fg: string
  border?: boolean
}) {
  return (
    <Paper
      variant={border ? 'outlined' : 'elevation'}
      elevation={border ? 0 : 1}
      sx={{ p: 2, height: '100%', bgcolor: bg, color: fg }}
    >
      <Stack spacing={0.5}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {label}
        </Typography>
        <Typography variant="caption" sx={{ fontFamily: 'monospace', opacity: 0.8 }}>
          {hex}
        </Typography>
      </Stack>
    </Paper>
  )
}

export default function PaletteSection() {
  const palette = useResolvedPalette()

  const alphaTints = [
    { label: 'primary 6% tint', hex: alpha(palette.primary.main, 0.06) },
    { label: 'primary 8% tint', hex: alpha(palette.primary.main, 0.08) },
    { label: 'primary 14% (feature icon chip)', hex: alpha(palette.primary.main, 0.14) },
    { label: 'primary 50% (card hover border)', hex: alpha(palette.primary.main, 0.5) },
    { label: 'divider', hex: palette.divider },
    { label: 'text.secondary tint', hex: palette.text.secondary },
  ]

  return (
    <SectionBlock
      id="palette"
      title="Palette"
      description="Live values for the current color scheme — toggle the mode in the top bar and these hex values update."
    >
      <Grid container spacing={4}>
        {brandColors.map((name) => (
          <Grid key={name} size={{ xs: 12, sm: 6, lg: 4 }}>
            <ColorRamp label={name} color={palette[name]} />
          </Grid>
        ))}
      </Grid>

      <Stack spacing={2}>
        <GroupLabel>Background & text</GroupLabel>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TokenTile label="background.default" hex={palette.background.default} bg="background.default" fg="text.primary" border />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TokenTile label="background.paper" hex={palette.background.paper} bg="background.paper" fg="text.primary" border />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TokenTile label="text.primary" hex={palette.text.primary} bg="background.paper" fg="text.primary" border />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TokenTile label="text.secondary" hex={palette.text.secondary} bg="background.paper" fg="text.secondary" border />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TokenTile label="text.disabled" hex={palette.text.disabled} bg="background.paper" fg="text.disabled" border />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TokenTile label="divider" hex={palette.divider} bg="background.paper" fg="text.primary" border />
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={2}>
        <GroupLabel>Derived alpha tints used across the site</GroupLabel>
        <Grid container spacing={2}>
          {alphaTints.map((tint) => (
            <Grid key={tint.label} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
                <Box sx={{ bgcolor: tint.hex, minHeight: 56 }} />
                <Box sx={{ px: 1.5, py: 1 }}>
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    {tint.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                    {tint.hex}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </SectionBlock>
  )
}
