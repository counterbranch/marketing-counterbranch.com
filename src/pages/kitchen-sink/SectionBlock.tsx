import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import type { ReactNode } from 'react'

interface SectionBlockProps {
  id: string
  title: string
  description?: string
  children: ReactNode
}

/** Labelled, anchorable block used for every top-level section of the kitchen sink. */
export default function SectionBlock({ id, title, description, children }: SectionBlockProps) {
  return (
    <Box component="section" id={id} sx={{ py: { xs: 6, md: 9 }, scrollMarginTop: 88 }}>
      <Container maxWidth="lg">
        <Stack spacing={{ xs: 4, md: 5 }}>
          <Stack spacing={1.5}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 800 }}>
              {title}
            </Typography>
            {description ? (
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720 }}>
                {description}
              </Typography>
            ) : null}
            <Divider sx={{ mt: 1 }} />
          </Stack>
          {children}
        </Stack>
      </Container>
    </Box>
  )
}
