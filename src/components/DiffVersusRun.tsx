import type { ReactNode, Ref } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import Section from './Section.tsx'
import { AccessGrid } from './AccessGrid.tsx'
import ReviewVersusRun from './ReviewVersusRun.tsx'
import { pageColumn, rhythm } from '../rhythm.ts'
import { motionDuration, motionEasing } from '../motion.ts'

export const MONO_FONT = 'ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'

/**
 * The window's inks are mixed from its own text colour, so they follow the
 * scheme without a mode check: secondary text, and the title bar one step
 * lighter than the body.
 */
export const MUTED = 'color-mix(in srgb, currentColor 60%, transparent)'
const TITLE_BAR = 'color-mix(in srgb, currentColor 8%, transparent)'

/**
 * Close, minimise and zoom. The windows depict real macOS windows, so these
 * keep the system's own colours rather than the theme's.
 */
const TRAFFIC_LIGHTS = ['#FF5F57', '#FEBC2E', '#28C840'] as const

/** Set on each window, so what sits inside can reuse its ground and ink. */
const WINDOW_GROUND = 'var(--mac-window-ground)'
const WINDOW_INK = 'var(--mac-window-ink)'

/**
 * A macOS window: the only rounded shapes on the site, because they depict a
 * real object. Ink with white text in the light scheme, like the hero's reel
 * window; the raised surface inside a divider in the dark one. Both grounds
 * are dark, so the brand cyan and pink read on either. The title bar is
 * decoration; `label` names the window for assistive technology. `fill`
 * makes it take its grid cell's full height, with its content in a column,
 * so windows side by side end on one line. `onDark` is for a window on a
 * dark band, where the ink ground would merge into the band: it takes a
 * light hairline and a black shadow instead, and in the dark scheme sits
 * recessed on the page's near-black. `glow` tints the window's shadow with a
 * colour, easing between colours as it changes.
 */
export function MacWindow({
  title,
  label,
  ref,
  fill = false,
  onDark = false,
  glow,
  children,
}: {
  title: string
  label: string
  ref?: Ref<HTMLElement>
  fill?: boolean
  onDark?: boolean
  glow?: string
  children: ReactNode
}) {
  const glowShadow = glow && `0 30px 70px -34px color-mix(in srgb, ${glow} 80%, transparent)`
  const theme = useTheme()
  const palette = theme.vars.palette
  return (
    <Box
      ref={ref}
      component="figure"
      aria-label={label}
      sx={{
        '--mac-window-ground': palette.hero.plate,
        '--mac-window-ink': palette.hero.plateInk,
        m: 0,
        ...(fill && { height: '100%', display: 'flex', flexDirection: 'column' }),
        // A string: sx multiplies a bare number by the theme's square
        // radius, which would leave the corners at 0.
        borderRadius: '10px',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: WINDOW_GROUND,
        backgroundColor: WINDOW_GROUND,
        color: WINDOW_INK,
        boxShadow: `0 24px 48px -28px color-mix(in srgb, ${palette.hero.plate} 55%, transparent)`,
        ...(onDark && {
          borderColor: palette.bands.navy.line,
          boxShadow: `0 28px 56px -30px color-mix(in srgb, ${palette.common.black} 85%, transparent)`,
        }),
        ...(glowShadow && {
          boxShadow: glowShadow,
          transition: `box-shadow ${motionDuration.base}ms ${motionEasing.decel}`,
        }),
        // One dark-scheme block: applyStyles returns the same selector key each
        // time, so a second spread would replace the first rather than add to it.
        ...theme.applyStyles('dark', {
          '--mac-window-ground': onDark ? palette.background.default : palette.background.paper,
          '--mac-window-ink': palette.text.primary,
          borderColor: palette.divider,
          boxShadow:
            glowShadow ?? `0 24px 48px -28px color-mix(in srgb, ${palette.common.black} 80%, transparent)`,
        }),
      }}
    >
      <Box
        aria-hidden
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          columnGap: 1.5,
          flexShrink: 0,
          height: 38,
          px: '14px',
          backgroundColor: TITLE_BAR,
          ...theme.applyStyles('dark', {
            borderBottom: '1px solid',
            borderColor: palette.divider,
          }),
        }}
      >
        <Box sx={{ display: 'flex', gap: '8px' }}>
          {TRAFFIC_LIGHTS.map((light) => (
            <Box
              key={light}
              sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: light }}
            />
          ))}
        </Box>
        <Box
          component="span"
          sx={{
            fontFamily: MONO_FONT,
            fontSize: '0.75rem',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            color: MUTED,
          }}
        >
          {title}
        </Box>
      </Box>
      {children}
    </Box>
  )
}

/**
 * The navy band after "how it works": the access grid of every check with the
 * one that changed, then the same pull request as a code review tool shows it
 * beside Counterbranch's comment on it (ReviewVersusRun).
 */
export default function DiffVersusRun() {
  const band = useTheme().vars.palette.bands.navy

  return (
    <Section id="more-than-a-diff" tone="navy">
      <Container maxWidth={false} sx={pageColumn}>
        {/* The claim and the figure that draws it, side by side from lg, on
            the same columns as the exhibit below so the grid's left edge is
            the comment's. */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 2fr) minmax(0, 3fr)' },
            columnGap: 4,
            rowGap: rhythm.intro,
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="h2" component="h2">
              More than a diff.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mt: rhythm.heading,
                maxWidth: '46ch',
                fontSize: { md: '1.125rem', xl: '1.25rem' },
                color: band.inkMuted,
                textWrap: 'pretty',
              }}
            >
              A diff shows what changed in the rules. An executed comparison shows what changed in
              access.
            </Typography>
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <AccessGrid />
          </Box>
        </Box>

        <ReviewVersusRun />
      </Container>
    </Section>
  )
}
