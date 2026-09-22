import Box from '@mui/material/Box'
import type { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  id?: string
}

export default function Section({ children, id }: SectionProps) {
  return (
    <Box
      component="section"
      id={id}
      sx={{ py: { xs: 8, md: 12 }, ...(id ? { scrollMarginTop: 24 } : {}) }}
    >
      {children}
    </Box>
  )
}
