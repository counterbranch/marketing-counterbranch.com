// Enables typings for `theme.vars` (CSS theme variables) throughout the app.
import type {} from '@mui/material/themeCssVarsAugmentation'
import { createTheme, alpha } from '@mui/material/styles'
import { motionDuration, motionEasing } from './motion.ts'

// Brand
// - primary: cyan #00E8FC, taken from the logo mark. Very light, so it needs
//   an explicit dark contrastText rather than relying on the computed one.
// - secondary: pink #FC3C98, taken from the dark-scheme logo mark. White text
//   on it is only ~3.2:1, so contrastText is set explicitly to a near-black
//   that clears 4.5:1 (verified ~5.8:1).
// - navy #14203C: the shield outline in the light logo. Used as light-scheme
//   text.primary and as the dark-scheme paper surface.
// Everything else (tints, borders, secondary text) is derived from these
// three colors via `alpha()` — no other hues are introduced.
const brandNavy = '#14203C'

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-mui-color-scheme',
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#00E8FC',
          // Brand cyan is a fill color, not a text color: on the light
          // background it lands at 1.4:1. `dark` is the accessible member of
          // the same family (5.6:1 on background.default) and is what text
          // buttons, links and focus rings use in this scheme.
          dark: '#00707D',
          contrastText: '#0B1220',
        },
        secondary: {
          main: '#FC3C98',
          contrastText: '#14061A',
        },
        background: {
          default: '#F6FAFB',
          paper: '#FFFFFF',
        },
        text: {
          primary: brandNavy,
          secondary: alpha(brandNavy, 0.7),
        },
        divider: alpha(brandNavy, 0.12),
      },
    },
    dark: {
      palette: {
        // Cyan reads fine on the dark background as-is, so `dark` here is
        // only the hover fill for contained buttons.
        primary: {
          main: '#00E8FC',
          dark: '#00AEC2',
          contrastText: '#0B1220',
        },
        secondary: {
          main: '#FC3C98',
          contrastText: '#14061A',
        },
        background: {
          default: '#0B1220',
          paper: brandNavy,
        },
        text: {
          primary: '#F5F9FA',
          secondary: alpha('#FFFFFF', 0.72),
        },
        divider: alpha('#FFFFFF', 0.12),
      },
    },
  },
  typography: {
    fontFamily: "'Inter Variable', sans-serif",
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
      lineHeight: 1.05,
    },
    h2: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
      lineHeight: 1.08,
    },
    h3: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
      lineHeight: 1.1,
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
      lineHeight: 1.15,
    },
    body1: {
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  transitions: {
    duration: {
      shortest: motionDuration.fast,
      shorter: motionDuration.fast,
      short: motionDuration.fast,
      standard: motionDuration.base,
      complex: motionDuration.base,
      enteringScreen: motionDuration.base,
      leavingScreen: motionDuration.fast,
    },
    easing: {
      easeInOut: motionEasing.decel,
      easeOut: motionEasing.decel,
      easeIn: motionEasing.decel,
      sharp: motionEasing.decel,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: 'none',
          transition: theme.transitions.create(['transform', 'background-color'], {
            duration: motionDuration.fast,
            easing: motionEasing.decel,
          }),
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
          '&.Mui-focusVisible, &:focus-visible': {
            outline: `2px solid ${theme.vars.palette.primary.dark}`,
            outlineOffset: 2,
            ...theme.applyStyles('dark', {
              outline: `2px solid ${theme.vars.palette.primary.dark}`,
            ...theme.applyStyles('dark', {
              outline: `2px solid ${theme.vars.palette.primary.main}`,
            }),
            }),
          },
          '@media (prefers-reduced-motion: reduce)': {
            transition: theme.transitions.create('background-color', {
              duration: motionDuration.fast,
              easing: motionEasing.decel,
            }),
            '&:hover': {
              transform: 'none',
            },
            '&:active': {
              transform: 'none',
            },
          },
        }),
        // Contained buttons are filled with primary (cyan) or secondary
        // (pink), so a same-color outline would disappear against them. Pick
        // the inner ring color per-color so it stays visible against both:
        // navy against cyan (light fill), white against pink (mid fill).
        // The outer ring always matches the button's own color, read against
        // the page background.
        // The unfilled variants put primary on the page background, where
        // brand cyan is unreadable in the light scheme. Both fall back to the
        // accessible shade there and keep full-brightness cyan on dark.
        text: ({ theme, ownerState }) =>
          ownerState.color === 'primary'
            ? {
                color: theme.vars.palette.primary.dark,
                ...theme.applyStyles('dark', {
                  color: theme.vars.palette.primary.main,
                }),
              }
            : {},
        outlined: ({ theme, ownerState }) =>
          ownerState.color === 'primary'
            ? {
                color: theme.vars.palette.primary.dark,
                borderColor: alpha('#00707D', 0.5),
                ...theme.applyStyles('dark', {
                  color: theme.vars.palette.primary.main,
                  borderColor: alpha('#00E8FC', 0.5),
                }),
              }
            : {},
        contained: ({ theme, ownerState }) => {
          const isSecondary = ownerState.color === 'secondary'
          const ringColor = isSecondary
            ? theme.vars.palette.secondary.main
            : theme.vars.palette.primary.main
          const innerRing = isSecondary
            ? theme.vars.palette.common.white
            : theme.vars.palette.primary.contrastText
          return {
            ...(ownerState.color === 'primary' && {
              '&:hover': {
                backgroundColor: theme.vars.palette.primary.dark,
              },
            }),
            '&.Mui-focusVisible, &:focus-visible': {
              outline: `2px solid ${innerRing}`,
              outlineOffset: 2,
              boxShadow: `0 0 0 4px ${ringColor}`,
            },
          }
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: ({ theme }) => ({
          transition: theme.transitions.create('color', {
            duration: motionDuration.fast,
            easing: motionEasing.decel,
          }),
          '&:hover': {
            color: theme.vars.palette.primary.dark,
          },
          '&.Mui-focusVisible, &:focus-visible': {
            outline: `2px solid ${theme.vars.palette.primary.dark}`,
            outlineOffset: 2,
            borderRadius: 2,
          },
          ...theme.applyStyles('dark', {
            '&:hover': {
              color: theme.vars.palette.primary.main,
            },
            '&.Mui-focusVisible, &:focus-visible': {
              outline: `2px solid ${theme.vars.palette.primary.dark}`,
            ...theme.applyStyles('dark', {
              outline: `2px solid ${theme.vars.palette.primary.main}`,
            }),
            },
          }),
        }),
      },
    },
    // ButtonBase resets outline to 0 for every component built on it, so the
    // icon-only controls (dark mode toggle, mobile menu trigger) and the
    // drawer's nav items need the same explicit focus ring as MuiButton.
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-focusVisible, &:focus-visible': {
            outline: `2px solid ${theme.vars.palette.primary.dark}`,
            ...theme.applyStyles('dark', {
              outline: `2px solid ${theme.vars.palette.primary.main}`,
            }),
            outlineOffset: 2,
          },
        }),
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-focusVisible, &:focus-visible': {
            outline: `2px solid ${theme.vars.palette.primary.dark}`,
            ...theme.applyStyles('dark', {
              outline: `2px solid ${theme.vars.palette.primary.main}`,
            }),
            outlineOffset: -2,
          },
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        outlined: ({ theme }) => ({
          borderColor: theme.vars.palette.divider,
        }),
      },
    },
  },
})

export default theme
