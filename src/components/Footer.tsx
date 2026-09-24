import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { pageColumn } from '../rhythm.ts'

/**
 * The teaser's footer: the legal line only. The site directory
 * (footerLinks.ts) comes back with the pages it lists.
 */
export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{ borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}
    >
      <Container maxWidth={false} sx={[pageColumn, { py: { xs: 4, md: 5 } }]}>
        <Typography variant="body2" color="textSecondary">
          © 2026 DUVATL, Inc. Counterbranch™ is a trademark of DUVATL, Inc.
        </Typography>
      </Container>
    </Box>
  )
}
