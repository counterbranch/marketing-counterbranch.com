import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import { alpha, useTheme } from '@mui/material/styles'
import Section from './Section.tsx'
import { heroStageSx } from '../motion.ts'
import { links } from '../links.ts'

export default function Hero() {
  const theme = useTheme()
  const screenshotBorderColor = alpha(theme.palette.primary.main, 0.3)
  const screenshotShadow = `0 32px 64px -32px ${alpha(theme.palette.primary.main, 0.35)}`

  return (
    <Section>
      <Box
        sx={(theme) => ({
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            background: `radial-gradient(60% 55% at 50% 0%, ${alpha(theme.palette.primary.main, 0.18)} 0%, transparent 70%)`,
            ...theme.applyStyles('dark', {
              background: `radial-gradient(60% 55% at 50% 0%, ${alpha(theme.palette.primary.main, 0.12)} 0%, transparent 70%)`,
            }),
          },
        })}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Stack spacing={4} sx={{ alignItems: 'center', textAlign: 'center' }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: 'clamp(2.5rem, 1.7rem + 3.2vw, 4.5rem)',
                ...heroStageSx(0),
              }}
            >
              One-line value proposition goes here.
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 560, ...heroStageSx(1) }}
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
                size="large"
                component="a"
                href={links.getStarted}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Get started
              </Button>
              <Button
                variant="text"
                size="large"
                component="a"
                href={links.howItWorks}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                See how it works
              </Button>
            </Stack>
            <Paper
              variant="outlined"
              sx={{
                width: '100%',
                aspectRatio: '16 / 9',
                mt: 6,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderColor: screenshotBorderColor,
                boxShadow: screenshotShadow,
                ...heroStageSx(3),
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
                  <Box
                    key={dot}
                    sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'text.disabled' }}
                  />
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
          </Stack>
        </Container>
      </Box>
    </Section>
  )
}
