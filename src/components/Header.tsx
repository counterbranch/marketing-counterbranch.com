import { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Container from '@mui/material/Container'
import Link from '@mui/material/Link'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined'
import Logo from './Logo.tsx'
import ColorModeToggle from './ColorModeToggle.tsx'
import { links } from '../links.ts'

const navItems = [
  { label: 'Docs', href: links.docs },
  { label: 'Pricing', href: links.pricing },
  { label: 'Login', href: links.login },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Container maxWidth="md">
        <Toolbar disableGutters sx={{ gap: 1 }}>
          <Link
            href={links.home}
            aria-label="Counterbranch home"
            underline="none"
            color="inherit"
            sx={{ display: 'inline-flex' }}
          >
            <Logo />
          </Link>
          <Box sx={{ flexGrow: 1 }} />
          <Box component="nav" aria-label="Primary" sx={{ display: { xs: 'none', md: 'block' } }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              {navItems.map((item) => (
                <Button key={item.label} color="inherit" component="a" href={item.href}>
                  {item.label}
                </Button>
              ))}
            </Stack>
          </Box>
          <ColorModeToggle />
          <Button
            variant="contained"
            component="a"
            href={links.getStarted}
            sx={{ ml: { xs: 0, md: 1 }, display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Get started
          </Button>
          <IconButton
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen(true)}
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          >
            <MenuOutlinedIcon aria-hidden />
          </IconButton>
        </Toolbar>
      </Container>
      <Drawer
        id="mobile-nav"
        anchor="top"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      >
        <Box component="nav" aria-label="Mobile" sx={{ pt: 1 }}>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton component="a" href={item.href} onClick={() => setMenuOpen(false)}>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
            <Divider component="li" sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton
                component="a"
                href={links.getStarted}
                onClick={() => setMenuOpen(false)}
              >
                <ListItemText
                  primary="Get started"
                  slotProps={{ primary: { sx: { fontWeight: 700, color: 'primary.main' } } }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </AppBar>
  )
}
