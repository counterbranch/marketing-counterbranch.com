import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Link from '@mui/material/Link'
import Logo from './Logo.tsx'
import ColorModeToggle from './ColorModeToggle.tsx'
import { links } from '../links.ts'
import { pageColumn } from '../rhythm.ts'
import { displayFont } from '../theme.ts'

/**
 * The teaser's header: the name, its release status and the colour-mode
 * toggle. The nav and the install button come back with the sections they
 * point to.
 */
export default function Header() {
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
        // the hero only its own ink reads.
        '& .MuiIconButton-root': {
          color: theme.vars.palette.hero.ink,
          // Icon-only controls get a full 44px touch target.
          width: 44,
          height: 44,
          '&.Mui-focusVisible, &:focus-visible': {
            outline: `2px solid ${theme.vars.palette.hero.ink}`,
            outlineOffset: 2,
          },
        },
      })}
    >
      {/* Same grid as the hero, so the logo and the headline share a left
          edge at every width. */}
      <Container maxWidth={false} sx={pageColumn}>
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
          {/* The release status, beside the name it qualifies. Left out on
              the narrowest phones. */}
          <Box
            component="span"
            sx={(theme) => ({
              '@media (max-width: 359.95px)': { display: 'none' },
              ml: 1.5,
              px: 0.75,
              py: 0.25,
              border: '1px solid',
              borderColor: theme.vars.palette.hero.line,
              fontFamily: displayFont,
              fontWeight: 600,
              fontSize: '0.75rem',
              lineHeight: 1.4,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            })}
          >
            Alpha
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <ColorModeToggle />
        </Toolbar>
      </Container>
    </AppBar>
  )
}
