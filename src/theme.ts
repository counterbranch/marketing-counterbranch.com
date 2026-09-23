// Enables typings for `theme.vars` (CSS theme variables) throughout the app.
import type {} from '@mui/material/themeCssVarsAugmentation'
import { createTheme, alpha, lighten } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'
import { motionDuration, motionEasing } from './motion.ts'

// Brand
// - primary: cyan #00E8FC, taken from the logo mark. Very light, so it needs
//   an explicit dark contrastText rather than relying on the computed one.
// - secondary: pink #FF0074. As text on the light background it reads only
//   3.7:1, so a darker member of the family carries secondary labels there.
// - navy #14203C: the shield outline in the light logo. Used as light-scheme
//   text.primary. The dark scheme is neutral near-black rather than navy, so
//   the only colour in it comes from the brand itself.
// Everything else (tints, borders, secondary text) is derived from these
// three colors via `alpha()` — no other hues are introduced.
// Heading face. Swap this single constant to change the display type across
// the whole site: 'Oswald Variable' (a weight range) or 'Anton' (one very
// heavy weight). Both are imported in the entry files.
export const displayFont = "'Oswald Variable', 'Anton', sans-serif"
const bodyFont = "'Inter Variable', sans-serif"

const brandNavy = '#14203C'

// Dark-scheme surfaces. Near-black and neutral: `paper` is one subtle step
// above `default` (1.13:1) so raised surfaces separate without a visible
// colour cast. Outlined cards carry their edge with the divider, not this
// step, so the step can stay this quiet.
const darkBase = '#0A0A0C'
const darkSurface = '#1A1A1E'

const heroInk = '#0B1220'
const heroInkDark = '#F7F7F8'

// Secondary pink and the near-black that reads on it (5.1:1). White on this
// pink is only 3.8:1, so it is never the pairing.
const brandPink = '#FF0074'
const brandPinkInk = '#14061A'
// Pink as text on the site's dark grounds (the terminal windows and the
// specimens). Full-strength pink clears 4.5:1 on their plain ground only
// just, and not at all on the tinted rows and footer strips inside them;
// this lighter member of the family reads at 4.9:1 or better on every one
// of those, in both schemes.
const brandPinkOnDark = lighten(brandPink, 0.36)

/**
 * The full-screen hero and the header that overlays it. A flood of brand cyan
 * with dark ink in the light scheme; near-black with light ink in the dark
 * one. Both components read these tokens, so they switch together through CSS
 * variables with no JavaScript mode checks and no flash.
 */
export interface HeroPalette {
  background: string
  /** A gradient layered over the background for depth. */
  wash: string
  ink: string
  /** Supporting copy. */
  inkMuted: string
  /** Footnotes and the scroll cue. */
  inkSubtle: string
  /** Outlined control borders. */
  line: string
  /** Outlined control hover fill. */
  hover: string
  /** The headline reel's window, and text selection inside the hero. */
  plate: string
  plateInk: string
  /** The filled primary action. */
  action: string
  actionInk: string
  actionHover: string
}

/**
 * A band's own surface and inks, for the sections that sit on a brand colour
 * rather than the page background.
 */
export interface BandPalette {
  background: string
  ink: string
  /** Supporting copy; at least 4.5:1 on the background. */
  inkMuted: string
  /** Rules and hairlines inside the band. */
  line: string
}

declare module '@mui/material/styles' {
  interface Palette {
    hero: HeroPalette
    /**
     * The cyan flood in both schemes: the closing band answers the hero with
     * the brand's own colour even where the dark hero is near-black.
     */
    flood: HeroPalette
    bands: { navy: BandPalette; pink: BandPalette }
  }
  interface PaletteOptions {
    hero?: HeroPalette
    flood?: HeroPalette
    bands?: { navy: BandPalette; pink: BandPalette }
  }
}

// Ink contrast on the cyan flood: 12.4:1 for ink, 7.8:1 muted, 6.2:1 subtle,
// 3.7:1 for outlined borders.
const cyanFlood: HeroPalette = {
  background: '#00E8FC',
  // Depth sits low and to the right, balancing the type mass on the left.
  wash: `radial-gradient(85% 75% at 85% 120%, ${alpha(heroInk, 0.22)} 0%, transparent 60%)`,
  ink: heroInk,
  inkMuted: alpha(heroInk, 0.8),
  inkSubtle: alpha(heroInk, 0.72),
  line: alpha(heroInk, 0.55),
  hover: alpha(heroInk, 0.08),
  // The reel window is ink, like the filled action: black with white text
  // here, inverted on the dark hero.
  plate: heroInk,
  plateInk: '#FFFFFF',
  action: heroInk,
  actionInk: '#FFFFFF',
  actionHover: '#242424',
}

// The pink band keeps every line of text in the full-strength ink (5.1:1):
// even a light tint of pink into it drops body copy under 4.5:1, so size and
// weight carry the hierarchy there instead.
const pinkBand: BandPalette = {
  background: brandPink,
  ink: brandPinkInk,
  inkMuted: brandPinkInk,
  line: alpha(brandPinkInk, 0.28),
}

// The navy band is the logo's shield outline as a surface (light scheme) and
// the raised paper surface in the neutral dark scheme; light ink reads 14:1
// and the muted ink 9.5:1 on either.
const navyInk = '#F7F7F8'
const navyBand = (background: string): BandPalette => ({
  background,
  ink: navyInk,
  inkMuted: alpha(navyInk, 0.78),
  line: alpha('#FFFFFF', 0.14),
})

/** An outlined button in one colour family: `light` for the light scheme, `dark` for the dark one. */
function outlinedFamily(theme: Theme, family: { light: string; dark: string }) {
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
}

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-mui-color-scheme',
  },
  // MUI's own transitions (the FAQ's accordions, the mobile menu's drawer)
  // follow the visitor's reduced-motion setting, like the page's motion does.
  motion: {
    reducedMotion: 'system',
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
          main: brandPink,
          // Like brand cyan, full-strength pink is a border/accent colour:
          // it reads 3.7:1 as text on the light background. `dark` is the
          // readable member of the family (5.8:1) used for labels here.
          dark: '#C4005A',
          light: brandPinkOnDark,
          contrastText: brandPinkInk,
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
        hero: cyanFlood,
        flood: cyanFlood,
        bands: { navy: navyBand(brandNavy), pink: pinkBand },
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
          main: brandPink,
          dark: '#C4005A',
          light: brandPinkOnDark,
          contrastText: brandPinkInk,
        },
        background: {
          default: darkBase,
          paper: darkSurface,
        },
        text: {
          primary: '#F7F7F8',
          secondary: alpha('#FFFFFF', 0.72),
        },
        divider: alpha('#FFFFFF', 0.12),
        // The hero goes dark with the rest of the page; the wash is a neutral
        // lift, not a tint.
        hero: {
          background: darkBase,
          // A soft lift behind the headline's corner of the screen.
          wash: `radial-gradient(70% 60% at 25% 0%, ${alpha('#FFFFFF', 0.05)} 0%, transparent 70%)`,
          ink: heroInkDark,
          inkMuted: alpha(heroInkDark, 0.78),
          inkSubtle: alpha(heroInkDark, 0.66),
          line: alpha(heroInkDark, 0.5),
          hover: alpha(heroInkDark, 0.08),
          plate: '#FFFFFF',
          plateInk: '#000000',
          action: '#FFFFFF',
          actionInk: '#000000',
          actionHover: '#DCDCDC',
        },
        flood: cyanFlood,
        bands: { navy: navyBand(darkSurface), pink: pinkBand },
      },
    },
  },
  typography: {
    fontFamily: bodyFont,
    // Headings are a condensed poster gothic set in caps with open tracking:
    // narrow letterforms let a long line stay large, and the wide spacing
    // stops the caps from packing into a solid block. Body copy stays Inter.
    // Balanced wrapping keeps multi-line headings from ending on a stub.
    h1: {
      fontFamily: displayFont,
      fontWeight: 700,
      textTransform: 'uppercase',
      textWrap: 'balance',
      letterSpacing: '0.07em',
      lineHeight: 0.98,
    },
    h2: {
      fontFamily: displayFont,
      fontWeight: 700,
      textTransform: 'uppercase',
      textWrap: 'balance',
      letterSpacing: '0.07em',
      lineHeight: 1,
      // Section heads share this size; only the hero (h1) and the closing
      // band opt up to the display scale inline.
      fontSize: 'clamp(2rem, 1.2rem + 2.8vw, 4.5rem)',
    },
    h3: {
      fontFamily: displayFont,
      fontWeight: 700,
      textTransform: 'uppercase',
      textWrap: 'balance',
      letterSpacing: '0.07em',
      lineHeight: 1,
    },
    h4: {
      fontFamily: displayFont,
      fontWeight: 700,
      textTransform: 'uppercase',
      textWrap: 'balance',
      letterSpacing: '0.07em',
      lineHeight: 1.08,
      // A claim or exhibit heading inside a section, a step under its head.
      fontSize: 'clamp(1.375rem, 1.1rem + 1vw, 2.5rem)',
    },
    h5: {
      fontFamily: displayFont,
      fontWeight: 700,
      textTransform: 'uppercase',
      textWrap: 'balance',
      letterSpacing: '0.06em',
      lineHeight: 1.1,
    },
    h6: {
      fontFamily: displayFont,
      fontWeight: 700,
      textTransform: 'uppercase',
      textWrap: 'balance',
      letterSpacing: '0.08em',
      lineHeight: 1.2,
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
    // Text selection is a browser surface the page still owns: brand cyan
    // with dark ink reads on every background here. The hero overrides it
    // with its own plate colours, since cyan on the cyan flood would vanish.
    MuiCssBaseline: {
      styleOverrides: {
        '::selection': {
          backgroundColor: '#00E8FC',
          color: heroInk,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          // Buttons are set like small headings: the condensed display face,
          // caps, and open tracking. Extra horizontal padding keeps the
          // condensed letterforms from crowding the button's edges.
          fontFamily: displayFont,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          paddingLeft: '1.5em',
          paddingRight: '1.5em',
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
              outline: `2px solid ${theme.vars.palette.primary.main}`,
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
        text: ({ theme }) => ({
          variants: [
            {
              props: { color: 'secondary' },
              style: {
                color: theme.vars.palette.secondary.dark,
                ...theme.applyStyles('dark', {
                  color: theme.vars.palette.secondary.main,
                }),
              },
            },
            {
              props: { color: 'primary' },
              style: {
                color: theme.vars.palette.primary.dark,
                ...theme.applyStyles('dark', {
                  color: theme.vars.palette.primary.main,
                }),
              },
            },
          ],
        }),
        // Secondary actions are outlined and fully transparent: a hairline
        // border and a label, with no fill at rest and only a faint tint on
        // hover so the shape never turns into a second filled button.
        // `inherit` means "this surface styles its own button" — used where
        // the backdrop is dark in both schemes (the video hero, the CTA band),
        // which the scheme-driven colours here cannot know about — so it
        // matches neither variant.
        outlined: ({ theme }) => ({
          variants: [
            {
              props: { color: 'secondary' },
              style: outlinedFamily(theme, { light: '#C4005A', dark: '#FF0074' }),
            },
            // Every other outlined button is the page's one secondary action:
            // ink text on an ink hairline, the same family as the flood
            // buttons. Brand cyan stays for focus rings and link hover.
            {
              props: ({ ownerState }) =>
                ownerState.color !== 'secondary' && ownerState.color !== 'inherit',
              style: {
                backgroundColor: 'transparent',
                color: theme.vars.palette.text.primary,
                // 0.6 keeps the hairline at 3:1 or better on the page and paper.
                borderColor: alpha(brandNavy, 0.6),
                '&:hover': {
                  backgroundColor: alpha(brandNavy, 0.06),
                  borderColor: theme.vars.palette.text.primary,
                },
                ...theme.applyStyles('dark', {
                  backgroundColor: 'transparent',
                  borderColor: alpha('#FFFFFF', 0.45),
                  '&:hover': {
                    backgroundColor: alpha('#FFFFFF', 0.08),
                    borderColor: theme.vars.palette.text.primary,
                  },
                }),
              },
            },
          ],
        }),
        // The filled action is ink, never brand colour: black on light
        // surfaces, inverted to white on dark ones so it stays readable
        // against the near-black background. The focus ring inverts with it.
        contained: ({ theme }) => ({
          variants: [
            {
              props: ({ ownerState }) => ownerState.color !== 'inherit',
              style: {
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
              },
            },
          ],
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
