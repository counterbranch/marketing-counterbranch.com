import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Logo from './Logo.tsx'

export default function Header() {
  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Container maxWidth="md">
        <Toolbar disableGutters>
          <Logo />
          <Box sx={{ flexGrow: 1 }} />
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', display: { xs: 'none', md: 'flex' } }}
          >
            <Button color="inherit">Docs</Button>
            <Button color="inherit">Pricing</Button>
            <Button color="inherit">Login</Button>
          </Stack>
          <Button variant="contained" sx={{ ml: { xs: 0, md: 2 } }}>
            Get started
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
