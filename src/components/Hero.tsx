import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import SlotWord from './SlotWord.tsx'
import HeroShield from './HeroShield.tsx'
import ReelFrame from './ReelFrame.tsx'
import { REEL_CONTROL_ROOM } from './reelFrameContext.ts'
import { floodActionSx, floodOutlineSx } from './floodButtons.ts'
import { srOnly } from '../a11y.ts'
import { pageColumn, rhythm } from '../rhythm.ts'
import { heroSequence, heroStageSx, motionDuration, motionEasing } from '../motion.ts'
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
export default function Hero() {
  const theme = useTheme()
  // Cyan with dark ink in the light scheme, near-black with light ink in the
  // dark one. Every colour below is a CSS variable, so the switch is instant.
  const hero = theme.vars.palette.hero
  const headlineTracking = theme.typography.h1.letterSpacing
  // The shield shows from lg. On the server and the first client render
  // this is false, so the reel keeps its own timing until the media query
  // answers, long before its first roll is due.
  const withShield = useMediaQuery(theme.breakpoints.up('lg'))

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
          // From lg the shield on the left and the poster beside it.
          {
            display: { lg: 'grid' },
            // The poster's column is sized so "Access changes in your" holds
            // one line at the headline's lg size (see the h1 below).
            gridTemplateColumns: { lg: 'minmax(0, 9fr) minmax(0, 15fr)' },
            columnGap: { lg: 8, xl: 12 },
            alignItems: 'center',
          },
        ]}
      >
        <Stack
          spacing={rhythm.display}
          sx={{ alignItems: 'flex-start', minWidth: 0, gridColumn: { lg: 2 }, gridRow: { lg: 1 } }}
        >
          <ReelFrame sx={heroStageSx(0)}>
            <Typography
              variant="h1"
              sx={{
                // Grows with the screen to the display cap. From lg the poster
                // shares the screen with the shield, so it takes its size from
                // its own column: "Access changes in your" is 12.37em wide in
                // the display face, and must hold one line.
                fontSize: { xs: 'clamp(2.5rem, 1.2rem + 4.8vw, 6rem)', lg: 'clamp(3rem, 0.8rem + 3.4vw, 5rem)' },
                '@supports (width: 1cqi)': {
                  [theme.breakpoints.up('lg')]: { fontSize: 'min(5rem, 100cqi / 12.6)' },
                },
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
                    // With the shield beside it, the reel waits for the
                    // shield's entrance and a moment's hold before rolling.
                    firstRollAt={withShield ? heroSequence.reel : undefined}
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
          <Stack spacing={{ xs: 5, md: 6 }} sx={{ alignItems: 'flex-start', minWidth: 0 }}>
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
              <Box component="strong" sx={{ display: 'block', mb: 0.5, fontWeight: 700, color: hero.ink }}>
                Better to meet us in code review than in a post-mortem.
              </Box>
              Counterbranch runs in your existing workflows to compare authorization behavior. Runs
              across custom authorization logic, OPA, Cedar, and OpenFGA.
            </Typography>
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
          </Stack>
        </Stack>
        {/* The figure: to the left of the copy from lg, and first in the eye
            there, but after the headline in the document. */}
        <Box
          sx={{
            display: { xs: 'none', lg: 'block' },
            gridColumn: 1,
            gridRow: 1,
            minWidth: 0,
            width: '100%',
            maxWidth: 620,
            justifySelf: 'start',
          }}
        >
          <HeroShield />
        </Box>
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
              // Only once the entrance is over and the reel has rolled, so it
              // never competes with either; hidden until then.
              animation: `heroScrollCue ${motionDuration.cue}ms ${motionEasing.inOut} ${heroSequence.cue}ms infinite both`,
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
