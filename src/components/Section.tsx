import Box from '@mui/material/Box'
import { alpha } from '@mui/material/styles'
import type { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  id?: string
  /**
   * default: page background.
   * tinted: a faint primary-tinted surface, for sections that should read as
   *   a distinct band without competing with the brand colors.
   * contrast: the brand navy band (light scheme) / paper surface (dark
   *   scheme), with light text — the one place per page that reads "loud".
   */
  tone?: 'default' | 'tinted' | 'contrast'
}

export default function Section({ children, id, tone = 'default' }: SectionProps) {
  return (
    <Box
      component="section"
      id={id}
      sx={[
        {
          py: { xs: 10, md: 16 },
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
              // a small amount of cyan reads as a colour cast.
              backgroundColor: alpha(theme.palette.primary.main, 0.045),
            }),
          })),
        tone === 'contrast' &&
          ((theme) => ({
            backgroundColor: '#14203C',
            color: '#F7F7F8',
            ...theme.applyStyles('dark', {
              backgroundColor: theme.vars.palette.background.paper,
              color: theme.vars.palette.text.primary,
            }),
          })),
      ]}
    >
      {children}
    </Box>
  )
}
