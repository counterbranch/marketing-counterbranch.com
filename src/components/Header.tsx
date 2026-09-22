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

// The header sits over the full-screen cyan hero, which looks the same in
// both colour schemes, so its controls use fixed dark values rather than
// scheme tokens. It scrolls away with the page and never appears over
// anything else.
const HEADER_INK = '#0B1220'

// The drawer mirrors the toolbar nav, so its labels are set the same way the
// buttons are: display face, caps, open tracking.
const drawerLabelSx = {
  fontFamily: "'Oswald Variable', 'Anton', sans-serif",
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
} as const

const navItems = [
  { label: 'Docs', href: links.docs },
  { label: 'Pricing', href: links.pricing },
  { label: 'Login', href: links.login },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <AppBar
      position="absolute"
      color="transparent"
      elevation={0}
      sx={{
        top: 0,
        color: HEADER_INK,
        backgroundImage: 'none',
        // The theme's focus rings are tuned for the page background; on cyan
        // only a dark ring reads. Scoped to the unfilled controls so the
        // filled button keeps its own inset ring.
        '& .MuiButton-text, & .MuiIconButton-root': {
          color: HEADER_INK,
          '&.Mui-focusVisible, &:focus-visible': {
            outline: `2px solid ${HEADER_INK}`,
            outlineOffset: 2,
          },
        },
      }}
    >
      <Container maxWidth="md">
        <Toolbar disableGutters sx={{ gap: 1 }}>
          <Link
            href={links.home}
            aria-label="Counterbranch home"
            underline="none"
            color="inherit"
            sx={{ display: 'inline-flex' }}
          >
            <Logo variant="light" />
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
            color="inherit"
            component="a"
            href={links.getStarted}
            sx={{
              ml: { xs: 0, md: 1 },
              display: { xs: 'none', sm: 'inline-flex' },
              backgroundColor: HEADER_INK,
              color: '#FFFFFF',
              '&:hover': { backgroundColor: '#242424' },
              '&.Mui-focusVisible, &:focus-visible': {
                outline: '2px solid #FFFFFF',
                outlineOffset: -4,
                boxShadow: `0 0 0 2px ${HEADER_INK}`,
              },
            }}
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
                  <ListItemText primary={item.label} slotProps={{ primary: { sx: drawerLabelSx } }} />
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
                  slotProps={{
                    primary: {
                      sx: [
                        drawerLabelSx,
                        // Brand cyan on the light drawer surface is 1.5:1, so
                        // the accessible shade of the family carries it there.
                        (theme) => ({
                          color: theme.vars.palette.primary.dark,
                          ...theme.applyStyles('dark', {
                            color: theme.vars.palette.primary.main,
                          }),
                        }),
                      ],
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </AppBar>
  )
}
