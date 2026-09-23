import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'
import type { ReactNode } from 'react'
import SlotWord from './SlotWord.tsx'
import ReelFrame from './ReelFrame.tsx'
import { REEL_CONTROL_ROOM } from './reelFrameContext.ts'
import { floodActionSx, floodOutlineSx } from './floodButtons.ts'
import { srOnly } from '../a11y.ts'
import { pageColumn, rhythm } from '../rhythm.ts'
import { heroStageSx, motionDuration, motionEasing } from '../motion.ts'
import { links } from '../links.ts'
import { REEL_WORDS } from '../reel.ts'

/**
 * The reel is aria-hidden, so the heading also carries the whole sentence for
 * assistive tech: every destination once, instead of a word that changes
 * every few seconds.
 */
const HEADLINE_FOR_SCREEN_READERS =
  'Catch unintended access changes in your PRs, pipelines, releases, terminal, code reviews, agent workflows, local development and CLI.'


/**
 * Full-screen hero, set flush left on the same wide grid as the header so the
 * headline starts on the logo's edge. A left-aligned block reads as one
 * poster: the headline keeps a straight left edge however it wraps, and the
 * reel window grows to the right from a fixed start instead of re-centring
 * on every roll.
 */
export default function Hero({
  aside,
}: {
  /**
   * Something to show beside the headline from lg, such as a live run. The
   * page as shipped has none; a variant page uses it to put the product in
   * the first screen.
   */
  aside?: ReactNode
} = {}) {
  const theme = useTheme()
  // Cyan with dark ink in the light scheme, near-black with light ink in the
  // dark one. Every colour below is a CSS variable, so the switch is instant.
  const hero = theme.vars.palette.hero
  const headlineTracking = theme.typography.h1.letterSpacing

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        // Small-viewport units keep the hero inside the visible area on
        // phones, where 100vh runs underneath the browser's toolbars.
        minHeight: '100vh',
        '@supports (min-height: 100svh)': { minHeight: '100svh' },
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        bgcolor: hero.background,
        color: hero.ink,
        // Clears the overlaid header above and the scroll cue below.
        pt: { xs: 14, md: 16 },
        pb: { xs: 14, md: 16 },
        '&::selection, & ::selection': {
          backgroundColor: hero.plate,
          color: hero.plateInk,
        },
        // The dark hero shares the page's near-black, so its lower edge is
        // drawn; otherwise the next section would start with no boundary.
        ...theme.applyStyles('dark', {
          borderBottom: '1px solid',
          borderColor: theme.vars.palette.divider,
        }),
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: hero.wash,
        }}
      />
      <Container
        maxWidth={false}
        sx={[
          pageColumn,
          { position: 'relative', zIndex: 1 },
          Boolean(aside) && {
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'repeat(2, minmax(0, 1fr))' },
            columnGap: { lg: 8, xl: 12 },
            rowGap: 8,
            alignItems: 'center',
          },
        ]}
      >
        <Stack spacing={{ xs: 5, md: 6 }} sx={{ alignItems: 'flex-start', minWidth: 0 }}>
          <Stack spacing={rhythm.display} sx={{ alignItems: 'flex-start', alignSelf: 'stretch' }}>
            <ReelFrame sx={heroStageSx(0)}>
              <Typography
                variant="h1"
                sx={{
                  // Grows with the screen to the display cap, where "Access changes
                  // in your" still fits the widest column on one line, so wide
                  // screens get two lines plus the reel instead of stranding "in
                  // your" on its own.
                  fontSize: aside
                    ? 'clamp(2.5rem, 1.2rem + 3.2vw, 4.5rem)'
                    : 'clamp(2.5rem, 1.2rem + 4.8vw, 6rem)',
                }}
              >
                <Box component="span" sx={srOnly}>
                  {HEADLINE_FOR_SCREEN_READERS}
                </Box>
                <Box component="span" aria-hidden sx={{ display: 'block' }}>
                  Catch unintended access changes in your
                  {/* The reel gets its own line so a long word never reflows
                      the sentence above it. On narrow screens the line
                      scales down so the longest word and the pause control
                      still fit: with the tracking in px, the longest word and
                      its full stop reach about 11.8em on the smallest phones. */}
                  <Box
                    component="span"
                    sx={{
                      display: 'flex',
                      mt: '0.16em',
                      fontSize: 'min(1em, 7.5vw)',
                      '@supports (width: 1cqi)': {
                        fontSize: `min(1em, (100cqi - ${REEL_CONTROL_ROOM}px) / 11.8)`,
                      },
                    }}
                  >
                    <SlotWord
                      words={REEL_WORDS}
                      plate={hero.plate}
                      ink={hero.plateInk}
                      suffix="."
                      tracking={
                        typeof headlineTracking === 'number'
                          ? `${headlineTracking}px`
                          : headlineTracking
                      }
                    />
                  </Box>
                </Box>
              </Typography>
            </ReelFrame>
            <Typography
              variant="body1"
              sx={{
                // Roughly 65 to 70 characters a line at every size.
                maxWidth: '40rem',
                fontSize: { xs: '1rem', md: '1.125rem', lg: '1.25rem' },
                color: hero.inkMuted,
                textWrap: 'pretty',
                ...heroStageSx(1),
              }}
            >
              See what your change does to access. Counterbranch runs the same permission checks
              against your before-and-after authorization logic and shows what became allowed or
              denied.
            </Typography>
          </Stack>
          <Stack spacing={2.5} sx={{ alignItems: 'flex-start', width: { xs: '100%', sm: 'auto' } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ width: { xs: '100%', sm: 'auto' }, ...heroStageSx(2) }}
            >
              <Button
                variant="contained"
                color="inherit"
                size="large"
                component="a"
                href={links.getStarted}
                sx={floodActionSx(hero)}
              >
                Get started free
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                component="a"
                href={links.howItWorks}
                sx={floodOutlineSx(hero)}
              >
                See how it works
              </Button>
            </Stack>
            {/* The offer, read as a sentence in the page's body face rather
                than as fine print; the closing band repeats it the same way. */}
            <Typography
              component="p"
              sx={{
                maxWidth: 560,
                fontWeight: 500,
                fontSize: { xs: '0.9375rem', md: '1rem' },
                lineHeight: 1.55,
                textWrap: 'pretty',
                color: hero.ink,
                ...heroStageSx(3),
              }}
            >
              Free alpha release. Runs on your laptop or CI runner, with no account, no telemetry and no AI in the check.
            </Typography>
          </Stack>
        </Stack>
        {aside && <Box sx={{ minWidth: 0, ...heroStageSx(4) }}>{aside}</Box>}
      </Container>

      {/* The hero's lower edge: the scroll cue, centred on the screen. */}
      <Container
        maxWidth={false}
        sx={{
          ...pageColumn,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: { xs: 20, md: 28 },
          zIndex: 1,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          pointerEvents: 'none',
        }}
      >
        {/* A short track with a segment running down it, pointing the way
            to the rest of the page. */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: '50%',
            bottom: 0,
            transform: 'translateX(-50%)',
            width: 2,
            height: 56,
            overflow: 'hidden',
            backgroundColor: hero.line,
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: '0 0 auto',
              height: 20,
              backgroundColor: hero.ink,
              animation: `heroScrollCue ${motionDuration.cue}ms ${motionEasing.inOut} infinite`,
            },
            // The runner fades in at the top, travels the track, rests at
            // the foot, and fades out there, so it points down for most of
            // its pass.
            '@keyframes heroScrollCue': {
              '0%': { transform: 'translateY(-20px)', opacity: 0 },
              '14%': { opacity: 1 },
              '70%': { transform: 'translateY(36px)', opacity: 1 },
              '86%, 100%': { transform: 'translateY(56px)', opacity: 0 },
            },
            // Gone once the visitor has started down: fades over the first
            // 160px of scroll. Browsers without scroll-driven animations
            // keep it. The timeline is set after the shorthand, which
            // would reset it.
            '@supports (animation-timeline: scroll())': {
              animation: 'heroCueOut linear both',
              animationTimeline: 'scroll(root)',
              animationRange: '0px 160px',
            },
            '@keyframes heroCueOut': { to: { opacity: 0 } },
            '@media (prefers-reduced-motion: reduce)': {
              '&::after': { animation: 'none', transform: 'translateY(36px)' },
            },
          }}
        />
      </Container>
    </Box>
  )
}
