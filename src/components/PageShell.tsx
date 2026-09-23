import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Header from './Header.tsx'
import Footer from './Footer.tsx'
import { motionDuration, motionEasing } from '../motion.ts'

/**
 * The frame every page shares: the skip link, the header, the main landmark
 * (the skip link's target) and the footer.
 */
export default function PageShell({ children }: { children: ReactNode }) {
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
        {children}
      </Box>
      <Footer />
    </Box>
  )
}
