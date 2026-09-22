import { createTheme } from '@mui/material/styles'
import { motionDuration, motionEasing } from './motion.ts'

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-mui-color-scheme',
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#4F46E5',
        },
      },
    },
    dark: {
      palette: {
        // Lightened so it keeps enough contrast against the dark background.
        primary: {
          main: '#818CF8',
        },
      },
    },
  },
  typography: {
    fontFamily: "'Inter Variable', sans-serif",
  },
  shape: {
    borderRadius: 8,
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
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: 2,
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
        // Contained buttons are filled with the primary color, so a same-color
        // outline would disappear against it. Pair a white ring flush against
        // the button with a primary ring outside it, so focus reads clearly
        // against both a white page and the indigo button itself.
        contained: ({ theme }) => ({
          '&.Mui-focusVisible, &:focus-visible': {
            outline: `2px solid ${theme.palette.common.white}`,
            outlineOffset: 2,
            boxShadow: `0 0 0 4px ${theme.palette.primary.main}`,
          },
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
            color: theme.palette.primary.main,
          },
          '&.Mui-focusVisible, &:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: 2,
            borderRadius: 2,
          },
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
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: 2,
          },
        }),
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-focusVisible, &:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: -2,
          },
        }),
      },
    },
  },
})

export default theme
