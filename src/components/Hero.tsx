import { useState } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import PauseOutlinedIcon from '@mui/icons-material/PauseOutlined'
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined'
import { useTheme } from '@mui/material/styles'
import SlotWord from './SlotWord.tsx'
import { floodActionSx, floodOutlineSx } from './floodButtons.ts'
import { srOnly } from '../a11y.ts'
import { pageColumn, rhythm } from '../rhythm.ts'
import { heroStageSx, motionDuration, motionEasing } from '../motion.ts'
import { links } from '../links.ts'
import { displayFont } from '../theme.ts'

/** Where the access changes happen. The first is what rests on screen. */
const REEL_WORDS = [
  'PRs',
  'pipelines',
  'releases',
  'terminal',
  'code reviews',
  'agent workflows',
  'local development',
  'CLI',
] as const

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
  const [reelPaused, setReelPaused] = useState(false)

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
        // Clears the overlaid header above, and the scroll cue and pause
        // control below.
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
      <Container maxWidth={false} sx={[pageColumn, { position: 'relative', zIndex: 1 }]}>
        <Stack spacing={{ xs: 5, md: 6 }} sx={{ alignItems: 'flex-start' }}>
          <Stack spacing={rhythm.display} sx={{ alignItems: 'flex-start', alignSelf: 'stretch' }}>
            <Typography
              variant="h1"
              sx={{
                // Grows with the screen to the display cap, where "Access changes
                // in your" still fits the widest column on one line, so wide
                // screens get two lines plus the reel instead of stranding "in
                // your" on its own.
                fontSize: 'clamp(2.5rem, 1.2rem + 4.8vw, 6rem)',
                ...heroStageSx(0),
              }}
            >
              <Box component="span" sx={srOnly}>
                {HEADLINE_FOR_SCREEN_READERS}
              </Box>
              <Box component="span" aria-hidden sx={{ display: 'block' }}>
                Catch unintended access changes in your
                {/* The reel gets its own line so a long word never reflows
                    the sentence above it. On narrow screens the line
                    scales down so the longest word still fits. */}
                <Box
                  component="span"
                  sx={{ display: 'flex', mt: '0.16em', fontSize: 'min(1em, 7.5vw)' }}
                >
                  <SlotWord
                    words={REEL_WORDS}
                    plate={hero.plate}
                    ink={hero.plateInk}
                    suffix="."
                    paused={reelPaused}
                    tracking={
                      typeof headlineTracking === 'number'
                        ? `${headlineTracking}px`
                        : headlineTracking
                    }
                  />
                </Box>
              </Box>
            </Typography>
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
                Get started
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
            <Typography
              component="p"
              sx={{
                maxWidth: 560,
                fontFamily: displayFont,
                fontWeight: 600,
                fontSize: '0.8125rem',
                lineHeight: 1.7,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                textWrap: 'balance',
                color: hero.inkSubtle,
                ...heroStageSx(3),
              }}
            >
              Free core. Runs in your existing workflow. No AI token charges for routine checks.
            </Typography>
          </Stack>
        </Stack>
      </Container>

      {/* The hero's lower edge, on the same grid: the scroll cue sits on the
          text's left edge and the reel's pause control opposite it, where
          motion controls conventionally live. */}
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
          justifyContent: 'space-between',
          pointerEvents: 'none',
        }}
      >
        <Box
          aria-hidden
          sx={{
            width: '1px',
            height: 56,
            transformOrigin: 'bottom',
            background: `linear-gradient(180deg, transparent, ${hero.inkSubtle})`,
            animation: `heroScrollCue ${motionDuration.entrance * 4}ms ${motionEasing.decel} infinite`,
            '@keyframes heroScrollCue': {
              '0%, 100%': { opacity: 0.25, transform: 'scaleY(0.6)' },
              '50%': { opacity: 1, transform: 'scaleY(1)' },
            },
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
              opacity: 0.6,
            },
          }}
        />
        {/* The rotating word updates indefinitely, so it needs a way to
            stop it (WCAG 2.2.2). Hover already pauses it for a pointer;
            this covers touch and keyboard. Hidden when the visitor prefers
            reduced motion, since the reel does not move at all then. */}
        <IconButton
          onClick={() => setReelPaused((paused) => !paused)}
          aria-label={reelPaused ? 'Play the rotating headline' : 'Pause the rotating headline'}
          sx={{
            pointerEvents: 'auto',
            width: 44,
            height: 44,
            color: hero.inkSubtle,
            border: '1px solid',
            borderColor: hero.line,
            '&:hover': {
              color: hero.ink,
              borderColor: hero.ink,
              backgroundColor: hero.hover,
            },
            '&.Mui-focusVisible, &:focus-visible': {
              outline: `2px solid ${hero.ink}`,
              outlineOffset: 2,
            },
            '@media (prefers-reduced-motion: reduce)': { display: 'none' },
          }}
        >
          {reelPaused ? (
            <PlayArrowOutlinedIcon aria-hidden fontSize="small" />
          ) : (
            <PauseOutlinedIcon aria-hidden fontSize="small" />
          )}
        </IconButton>
      </Container>
    </Box>
  )
}
