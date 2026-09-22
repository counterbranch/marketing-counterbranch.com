import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Header from './components/Header.tsx'
import Hero from './components/Hero.tsx'
import Features from './components/Features.tsx'
import Cta from './components/Cta.tsx'
import Footer from './components/Footer.tsx'
import { motionDuration, motionEasing } from './motion.ts'

function App() {
  return (
    <Box sx={{ position: 'relative' }}>
      <Link
        href="#main"
        sx={(theme) => ({
          position: 'fixed',
          top: 8,
          left: 8,
          zIndex: theme.zIndex.tooltip + 1,
          transform: 'translateY(-150%)',
          bgcolor: 'background.paper',
          color: 'text.primary',
          px: 2,
          py: 1,
          boxShadow: theme.shadows[4],
          transition: theme.transitions.create('transform', {
            duration: motionDuration.fast,
            easing: motionEasing.decel,
          }),
          '&:focus-visible': {
            transform: 'translateY(0)',
          },
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
          },
        })}
      >
        Skip to content
      </Link>
      <Header />
      <Box component="main" id="main" tabIndex={-1} sx={{ outline: 'none' }}>
        <Hero />
        <Features />
        <Cta />
      </Box>
      <Footer />
    </Box>
  )
}

export default App
