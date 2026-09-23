import Box from '@mui/material/Box'
import { alpha } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { rhythm } from '../rhythm.ts'

interface SectionProps {
  children: ReactNode
  id?: string
  /**
   * default: page background.
   * tinted: a faint primary-tinted surface, for sections that should read as
   *   a distinct band without competing with the brand colors.
   * flood: the hero's own surface and inks (the cyan flood in the light
   *   scheme), raised one step in the dark scheme so it still reads as a band
   *   there. For the band that closes the page, so it answers the hero.
   */
  tone?: 'default' | 'tinted' | 'flood'
}

export default function Section({ children, id, tone = 'default' }: SectionProps) {
  return (
    <Box
      component="section"
      id={id}
      sx={[
        {
          py: rhythm.section,
          ...(id ? { scrollMarginTop: 24 } : {}),
        },
        tone === 'default' && {
          bgcolor: 'background.default',
        },
        tone === 'tinted' &&
          ((theme) => ({
            backgroundColor: alpha(theme.palette.primary.main, 0.06),
            ...theme.applyStyles('dark', {
              // Kept quieter than the light scheme's tint: on near-black even
              // a small amount of cyan reads as a colour cast. The band's
              // edges are drawn instead, so it still separates.
              backgroundColor: alpha(theme.palette.primary.main, 0.045),
              borderBlock: '1px solid',
              borderColor: theme.vars.palette.divider,
            }),
          })),
        tone === 'flood' &&
          ((theme) => ({
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: theme.vars.palette.hero.background,
            backgroundImage: theme.vars.palette.hero.wash,
            color: theme.vars.palette.hero.ink,
            '&::selection, & ::selection': {
              backgroundColor: theme.vars.palette.hero.plate,
              color: theme.vars.palette.hero.plateInk,
            },
            ...theme.applyStyles('dark', {
              backgroundColor: theme.vars.palette.background.paper,
            }),
          })),
      ]}
    >
      {children}
    </Box>
  )
}
