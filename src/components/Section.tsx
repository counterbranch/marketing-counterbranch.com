import Box from '@mui/material/Box'
import type { ReactNode } from 'react'
import type { BandPalette } from '../theme.ts'
import { rhythm } from '../rhythm.ts'

type Tone = 'default' | 'flood' | 'navy' | 'pink'

interface SectionProps {
  children: ReactNode
  id?: string
  /**
   * default: page background.
   * flood: the brand cyan flood with dark ink in both schemes, for the band
   *   that closes the page, so it answers the hero.
   * navy: the logo's navy as a surface (the raised paper surface in the
   *   neutral dark scheme), with light ink.
   * pink: the brand pink with its dark ink, in both schemes. Pink is the
   *   site's colour for a decision that changed, so the band that is about
   *   what changed wears it.
   */
  tone?: Tone
}

/** The band tokens a tone paints with, or none for the page background. */
function bandFor(tone: Tone, bands: { navy: BandPalette; pink: BandPalette }) {
  if (tone === 'navy') return bands.navy
  if (tone === 'pink') return bands.pink
  return null
}

export default function Section({ children, id, tone = 'default' }: SectionProps) {
  return (
    <Box
      component="section"
      id={id}
      data-tone={tone}
      sx={[
        {
          py: rhythm.section,
          ...(id ? { scrollMarginTop: 24 } : {}),
        },
        tone === 'default' && {
          bgcolor: 'background.default',
        },
        tone === 'flood' &&
          ((theme) => ({
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: theme.vars.palette.flood.background,
            backgroundImage: theme.vars.palette.flood.wash,
            color: theme.vars.palette.flood.ink,
            '&::selection, & ::selection': {
              backgroundColor: theme.vars.palette.flood.plate,
              color: theme.vars.palette.flood.plateInk,
            },
          })),
        (tone === 'navy' || tone === 'pink') &&
          ((theme) => {
            const band = bandFor(tone, theme.vars.palette.bands)!
            return {
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: band.background,
              color: band.ink,
              // Cyan selection reads on both bands; on pink the ink stays
              // the band's own, on navy it is the hero's dark ink.
              '&::selection, & ::selection': {
                backgroundColor: theme.vars.palette.primary.main,
                color: theme.vars.palette.primary.contrastText,
              },
            }
          }),
      ]}
    >
      {children}
    </Box>
  )
}
