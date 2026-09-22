import Box from '@mui/material/Box'
import type { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
}

export default function Section({ children }: SectionProps) {
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 } }}>
      {children}
    </Box>
  )
}
