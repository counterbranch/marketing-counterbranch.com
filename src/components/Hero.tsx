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

// The hero is a flood of brand cyan in both colour schemes. Cyan is a very
// light surface, so everything on it is dark ink rather than a scheme token.
const HERO_BACKDROP = '#00E8FC'
const HERO_INK = '#0B1220'

export default function Hero() {
  const theme = useTheme()
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
        {/* A single deeper-cyan wash keeps the flood from reading as flat
            fill, without introducing a second hue. */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            background: `radial-gradient(90% 70% at 50% 120%, ${alpha(HERO_INK, 0.22)} 0%, transparent 60%)`,
          }}
        />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Stack spacing={4} sx={{ alignItems: 'center', textAlign: 'center' }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: 'clamp(2.5rem, 1.6rem + 3.8vw, 5rem)',
                ...heroStageSx(0),
              }}
            >
              One-line value proposition goes here.
            </Typography>
            <Typography
              variant="body1"
              sx={{ maxWidth: 560, color: alpha(HERO_INK, 0.8), ...heroStageSx(1) }}
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
                  backgroundColor: HERO_INK,
                  color: '#FFFFFF',
                  '&:hover': { backgroundColor: '#242424' },
                  '&.Mui-focusVisible, &:focus-visible': {
                    outline: '2px solid #FFFFFF',
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
                  borderColor: alpha(HERO_INK, 0.55),
                  backgroundColor: 'transparent',
                  '&:hover': {
                    borderColor: HERO_INK,
                    backgroundColor: alpha(HERO_INK, 0.08),
                  },
                  '&.Mui-focusVisible, &:focus-visible': {
                    outline: `2px solid ${HERO_INK}`,
                    outlineOffset: 2,
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
            zIndex: 1,
            width: '1px',
            height: 56,
            transform: 'translateX(-50%)',
            transformOrigin: 'bottom',
            background: `linear-gradient(180deg, transparent, ${alpha(HERO_INK, 0.7)})`,
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
