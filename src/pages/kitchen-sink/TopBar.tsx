import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Logo from '../../components/Logo.tsx'
import ColorModeToggle from '../../components/ColorModeToggle.tsx'

/** Slim sticky top bar for the kitchen sink — deliberately not the site Header. */
export default function TopBar() {
  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        top: 0,
        borderBottom: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(8px)',
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
        <Toolbar disableGutters sx={{ gap: 1.5, minHeight: 56 }}>
          <Logo size={24} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Kitchen Sink
          </Typography>
          <Chip
            label="Internal"
            size="small"
            variant="outlined"
            color="secondary"
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          />
          <Box sx={{ flexGrow: 1 }} />
          <ColorModeToggle />
        </Toolbar>
      </Container>
    </AppBar>
  )
}
