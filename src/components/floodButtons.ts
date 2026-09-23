import type { HeroPalette } from '../theme.ts'

/**
 * The two actions on a flood surface (the hero and the closing band), styled
 * from that surface's tokens, which switch with the scheme through CSS
 * variables: the filled action in the surface's ink, and the outlined one as
 * a hairline in that ink. Both keep a 48px target and go full width on phones.
 */
export function floodActionSx(hero: HeroPalette) {
  return {
    minHeight: 48,
    width: { xs: '100%', sm: 'auto' },
    backgroundColor: hero.action,
    color: hero.actionInk,
    '&:hover': { backgroundColor: hero.actionHover },
    '&.Mui-focusVisible, &:focus-visible': {
      outline: `2px solid ${hero.actionInk}`,
      outlineOffset: -4,
      boxShadow: `0 0 0 2px ${hero.ink}`,
    },
  }
}

export function floodOutlineSx(hero: HeroPalette) {
  return {
    minHeight: 48,
    width: { xs: '100%', sm: 'auto' },
    color: hero.ink,
    borderColor: hero.line,
    backgroundColor: 'transparent',
    '&:hover': {
      borderColor: hero.ink,
      backgroundColor: hero.hover,
    },
    '&.Mui-focusVisible, &:focus-visible': {
      outline: `2px solid ${hero.ink}`,
      outlineOffset: 2,
    },
  }
}
