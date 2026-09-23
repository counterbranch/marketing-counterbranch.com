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
import { displayFont } from '../theme.ts'
import { floodActionSx } from './floodButtons.ts'

// The drawer mirrors the toolbar nav, so its labels are set the same way the
// buttons are: display face, caps, open tracking.
const drawerLabelSx = {
  fontFamily: displayFont,
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
    // The header overlays the hero and scrolls away with it, so it takes the
    // hero's tokens: dark ink on the cyan flood, light ink on the dark hero.
    <AppBar
      position="absolute"
      color="transparent"
      elevation={0}
      sx={(theme) => ({
        top: 0,
        color: theme.vars.palette.hero.ink,
        backgroundImage: 'none',
        // The theme's focus rings are tuned for the page background; over
        // the hero only its own ink reads. Scoped to the unfilled controls so
        // the filled button keeps its inset ring.
        '& .MuiButton-text, & .MuiIconButton-root': {
          color: theme.vars.palette.hero.ink,
          '&.Mui-focusVisible, &:focus-visible': {
            outline: `2px solid ${theme.vars.palette.hero.ink}`,
            outlineOffset: 2,
          },
        },
        // Icon-only controls get a full 44px touch target.
        '& .MuiIconButton-root': {
          width: 44,
          height: 44,
        },
      })}
    >
      {/* Same grid as the hero, so the logo and the headline share a left
          edge at every width. */}
      <Container maxWidth="lg">
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
            color="inherit"
            component="a"
            href={links.getStarted}
            sx={(theme) => ({
              ...floodActionSx(theme.vars.palette.hero),
              // A step smaller than the hero's own action, which sits under it,
              // but still a full 44px target.
              minHeight: 44,
              width: 'auto',
              ml: { xs: 0, md: 1 },
              display: { xs: 'none', sm: 'inline-flex' },
            })}
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
