import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import { alpha, useTheme } from '@mui/material/styles'
import Section from './Section.tsx'
import { heroStageSx, motionDuration, motionEasing } from '../motion.ts'
import { links } from '../links.ts'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.ts'

// The hero is a dark surface in both colour schemes, because the video behind
// it is dark. Its text and controls are therefore fixed light values rather
// than scheme tokens.
const HERO_INK = '#FFFFFF'
const HERO_BACKDROP = '#0B1220'

/**
 * Scrim over the video. The lightest point is 0.62 alpha, which still puts
 * white text at ~6:1 even if that frame of the video is pure white, so the
 * headline is readable whatever is playing underneath. It deepens at the top
 * behind the header and at the bottom so the hero blends into the next band.
 */
const SCRIM = `linear-gradient(180deg, ${alpha(HERO_BACKDROP, 0.88)} 0%, ${alpha(
  HERO_BACKDROP,
  0.62,
)} 38%, ${alpha(HERO_BACKDROP, 0.74)} 72%, ${HERO_BACKDROP} 100%)`

export default function Hero() {
  const theme = useTheme()
  const prefersReducedMotion = usePrefersReducedMotion()
  const screenshotBorderColor = alpha(theme.palette.primary.main, 0.3)
  const screenshotShadow = `0 32px 64px -32px ${alpha(theme.palette.primary.main, 0.35)}`

  return (
    <>
      <Box
        component="section"
        sx={{
          position: 'relative',
          minHeight: ['100vh', '100svh'],
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          bgcolor: HERO_BACKDROP,
          color: HERO_INK,
          // Clears the overlaid header, and keeps the headline off the very
          // top and bottom edges on short screens.
          pt: { xs: 14, md: 16 },
          pb: { xs: 10, md: 12 },
        }}
      >
        <Box
          component="video"
          // Decorative: the headline carries the meaning, so it is hidden from
          // assistive tech and needs no captions.
          aria-hidden
          src="/vice-city-bg.mp4"
          // Autoplay only works muted and inline, and is suppressed entirely
          // when the visitor asks for reduced motion — they get the first
          // frame under the same scrim instead.
          autoPlay={!prefersReducedMotion}
          loop={!prefersReducedMotion}
          muted
          playsInline
          preload="metadata"
          tabIndex={-1}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
            bgcolor: HERO_BACKDROP,
            pointerEvents: 'none',
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none',
            background: SCRIM,
          }}
        />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
          <Stack spacing={4} sx={{ alignItems: 'center', textAlign: 'center' }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: 'clamp(2.5rem, 1.6rem + 3.8vw, 5rem)',
                textShadow: `0 2px 32px ${alpha(HERO_BACKDROP, 0.6)}`,
                ...heroStageSx(0),
              }}
            >
              One-line value proposition goes here.
            </Typography>
            <Typography
              variant="body1"
              sx={{ maxWidth: 560, color: alpha(HERO_INK, 0.82), ...heroStageSx(1) }}
            >
              Short supporting sentence about the product goes here as placeholder copy.
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
                sx={{
                  width: { xs: '100%', sm: 'auto' },
                  // The hero is dark in both schemes, so the ink button is
                  // always the inverted one.
                  backgroundColor: HERO_INK,
                  color: '#000000',
                  '&:hover': { backgroundColor: '#DCDCDC' },
                  '&.Mui-focusVisible, &:focus-visible': {
                    outline: '2px solid #000000',
                    outlineOffset: -4,
                    boxShadow: `0 0 0 2px ${HERO_INK}`,
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
                  color: HERO_INK,
                  borderColor: alpha(theme.palette.secondary.main, 0.85),
                  backgroundColor: alpha(HERO_BACKDROP, 0.35),
                  '&:hover': {
                    borderColor: theme.palette.secondary.main,
                    backgroundColor: alpha(theme.palette.secondary.main, 0.22),
                  },
                }}
              >
                See how it works
              </Button>
            </Stack>
          </Stack>
        </Container>
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            bottom: 28,
            left: '50%',
            zIndex: 2,
            width: '1px',
            height: 56,
            transform: 'translateX(-50%)',
            background: `linear-gradient(180deg, transparent, ${alpha(HERO_INK, 0.7)})`,
            animation: `heroScrollCue ${motionDuration.entrance * 4}ms ${motionEasing.decel} infinite`,
            '@keyframes heroScrollCue': {
              '0%, 100%': { opacity: 0.25, transform: 'translateX(-50%) scaleY(0.6)' },
              '50%': { opacity: 1, transform: 'translateX(-50%) scaleY(1)' },
            },
            transformOrigin: 'bottom',
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
