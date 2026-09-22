import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import { alpha, useTheme } from '@mui/material/styles'
import Section from './Section.tsx'
import SlotWord from './SlotWord.tsx'
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

const srOnly = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  margin: '-1px',
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const

export default function Hero() {
  const theme = useTheme()
  // Cyan with dark ink in the light scheme, near-black with light ink in the
  // dark one. Every colour below is a CSS variable, so the switch is instant.
  const hero = theme.vars.palette.hero
  const headlineTracking = theme.typography.h1.letterSpacing
  const screenshotBorderColor = alpha(theme.palette.primary.main, 0.3)
  const screenshotShadow = `0 32px 64px -32px ${alpha(theme.palette.primary.main, 0.35)}`

  return (
    <>
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
          // Clears the overlaid header, and keeps the headline off the very
          // top and bottom edges on short screens.
          pt: { xs: 14, md: 16 },
          pb: { xs: 10, md: 12 },
          '&::selection, & ::selection': {
            backgroundColor: hero.plate,
            color: hero.plateInk,
          },
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
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Stack spacing={5} sx={{ alignItems: 'center', textAlign: 'center' }}>
            <Stack spacing={{ xs: 3, md: 3.5 }} sx={{ alignItems: 'center' }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: 'clamp(2.5rem, 1.5rem + 3.4vw, 4.5rem)',
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
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mt: '0.16em',
                      fontSize: 'min(1em, 7.5vw)',
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
              <Typography
                variant="body1"
                sx={{
                  maxWidth: 600,
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  color: hero.inkMuted,
                  textWrap: 'pretty',
                  ...heroStageSx(1),
                }}
              >
                Run the same permission tests before and after a change, using isolated instances
                of supported apps or your native policy engine. See what became allowed or denied.
              </Typography>
            </Stack>
            <Stack spacing={2.5} sx={{ alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}>
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
                  sx={{
                    width: { xs: '100%', sm: 'auto' },
                    backgroundColor: hero.action,
                    color: hero.actionInk,
                    '&:hover': { backgroundColor: hero.actionHover },
                    '&.Mui-focusVisible, &:focus-visible': {
                      outline: `2px solid ${hero.actionInk}`,
                      outlineOffset: -4,
                      boxShadow: `0 0 0 2px ${hero.ink}`,
                    },
                  }}
                >
                  Get started
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  component="a"
                  href={links.howItWorks}
                  sx={{
                    width: { xs: '100%', sm: 'auto' },
                    color: hero.ink,
                    borderColor: hero.line,
                    backgroundColor: 'transparent',
                    '&:hover': {
                      borderColor: hero.ink,
                      backgroundColor: hero.hover,
                    },
                    '&.Mui-focusVisible, &:focus-visible': {
                      outline: `2px solid ${hero.ink}`,
                      outlineOffset: 2,
                    },
                  }}
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
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            bottom: 28,
            left: '50%',
            zIndex: 1,
            width: '1px',
            height: 56,
            transform: 'translateX(-50%)',
            transformOrigin: 'bottom',
            background: `linear-gradient(180deg, transparent, ${hero.inkSubtle})`,
            animation: `heroScrollCue ${motionDuration.entrance * 4}ms ${motionEasing.decel} infinite`,
            '@keyframes heroScrollCue': {
              '0%, 100%': { opacity: 0.25, transform: 'translateX(-50%) scaleY(0.6)' },
              '50%': { opacity: 1, transform: 'translateX(-50%) scaleY(1)' },
            },
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
              opacity: 0.6,
            },
          }}
        />
      </Box>
      <Section>
        <Container maxWidth="md">
          <Paper
            variant="outlined"
            sx={{
              width: '100%',
              aspectRatio: '16 / 9',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderColor: screenshotBorderColor,
              boxShadow: screenshotShadow,
            }}
          >
            <Stack
              direction="row"
              spacing={0.75}
              sx={{
                px: 2,
                py: 1.25,
                borderBottom: '1px solid',
                borderColor: 'divider',
                flexShrink: 0,
              }}
            >
              {[0, 1, 2].map((dot) => (
                <Box key={dot} sx={{ width: 8, height: 8, bgcolor: 'text.disabled' }} />
              ))}
            </Stack>
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography color="text.secondary">Product screenshot placeholder</Typography>
            </Box>
          </Paper>
        </Container>
      </Section>
    </>
  )
}
