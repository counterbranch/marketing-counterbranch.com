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
          main: '#FF0074',
          // Like brand cyan, full-strength pink is a border/accent colour:
          // it reads 3.7:1 as text on the light background. `dark` is the
          // readable member of the family (5.8:1) used for labels here.
          dark: '#C4005A',
          contrastText: '#FFFFFF',
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
          main: '#FF0074',
          dark: '#C4005A',
          contrastText: '#FFFFFF',
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
    // Squared corners throughout: no rounding on buttons, cards, inputs,
    // drawers or dialogs.
    borderRadius: 0,
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
        // Unfilled variants sit directly on the page background, where brand
        // cyan and pink are both too light to read in the light scheme. Each
        // falls back to the accessible member of its own family there and
        // keeps the full-strength brand colour on dark.
        text: ({ theme, ownerState }) => {
          if (ownerState.color === 'secondary') {
            return {
              color: theme.vars.palette.secondary.dark,
              ...theme.applyStyles('dark', {
                color: theme.vars.palette.secondary.main,
              }),
            }
          }
          if (ownerState.color === 'primary') {
            return {
              color: theme.vars.palette.primary.dark,
              ...theme.applyStyles('dark', {
                color: theme.vars.palette.primary.main,
              }),
            }
          }
          return {}
        },
        // Secondary actions are outlined and fully transparent: a hairline
        // border and a label, with no fill at rest and only a faint tint on
        // hover so the shape never turns into a second filled button.
        outlined: ({ theme, ownerState }) => {
          const family =
            ownerState.color === 'secondary'
              ? { light: '#C4005A', dark: '#FF0074' }
              : { light: '#00707D', dark: '#00E8FC' }
          return {
            backgroundColor: 'transparent',
            color: family.light,
            borderColor: alpha(family.light, 0.45),
            '&:hover': {
              backgroundColor: alpha(family.light, 0.06),
              borderColor: family.light,
            },
            ...theme.applyStyles('dark', {
              backgroundColor: 'transparent',
              color: family.dark,
              borderColor: alpha(family.dark, 0.45),
              '&:hover': {
                backgroundColor: alpha(family.dark, 0.1),
                borderColor: family.dark,
              },
            }),
          }
        },
        // The filled action is ink, never brand colour: black on light
        // surfaces, inverted to white on dark ones so it stays readable
        // against the near-black background. The focus ring inverts with it.
        contained: ({ theme }) => ({
          backgroundColor: '#000000',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#242424',
          },
          '&.Mui-focusVisible, &:focus-visible': {
            outline: '2px solid #FFFFFF',
            outlineOffset: -4,
            boxShadow: `0 0 0 2px ${theme.vars.palette.text.primary}`,
          },
          ...theme.applyStyles('dark', {
            backgroundColor: '#FFFFFF',
            color: '#000000',
            '&:hover': {
              backgroundColor: '#DCDCDC',
            },
            '&.Mui-focusVisible, &:focus-visible': {
              outline: '2px solid #000000',
              boxShadow: `0 0 0 2px ${theme.vars.palette.text.primary}`,
            },
          }),
        }),
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
          },
          ...theme.applyStyles('dark', {
            '&:hover': {
              color: theme.vars.palette.primary.main,
            },
            '&.Mui-focusVisible, &:focus-visible': {
              outline: `2px solid ${theme.vars.palette.primary.main}`,
            },
          }),
        }),
      },
    },
    // ButtonBase resets outline to 0 for every component built on it, so the
    // icon-only controls (dark mode toggle, mobile menu trigger) and the
    // drawer's nav items need the same explicit focus ring as MuiButton.
    // MUI hard-codes a pill or circle on these four rather than reading
    // shape.borderRadius, so they need squaring explicitly. Controls that are
    // circular to be understood at all (radio, switch, progress, rating) keep
    // their own shape.
    MuiChip: {
      styleOverrides: { root: { borderRadius: 0 } },
    },
    MuiAvatar: {
      styleOverrides: { root: { borderRadius: 0 } },
    },
    MuiFab: {
      styleOverrides: { root: { borderRadius: 0 } },
    },
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 0,
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
