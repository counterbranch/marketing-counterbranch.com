import { useEffect, useId, useState } from 'react'
import type { ReactNode } from 'react'
import { flushSync } from 'react-dom'
import Box from '@mui/material/Box'
import GlobalStyles from '@mui/material/GlobalStyles'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import CheckIcon from '@mui/icons-material/Check'
import { useTheme } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'
import logoDark from '../assets/logo-dark.webp'
import { MONO_FONT, MUTED } from './DiffVersusRun.tsx'
import { displayFont } from '../theme.ts'
import { srOnly } from '../a11y.ts'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.ts'
import { motionDuration, motionEasing } from '../motion.ts'
import { rhythm } from '../rhythm.ts'

/**
 * The second exhibit in the navy band: one pull request as its timeline
 * shows it. The change sits on top, full width; under it, on one row, the
 * two things that answered it: a reviewer's approval, which cannot say
 * anything about access, and Counterbranch's comment, which ran both
 * versions and says exactly what changed. A switcher runs the example
 * through each kind of authorization, and a line under the row says why the
 * difference matters for that one.
 *
 * Switching morphs the change, the two answers and the line with the View
 * Transitions API; browsers without it, and visitors who prefer reduced
 * motion, get an instant swap.
 */

type Access = 'DENY' | 'ALLOW'

interface DiffLine {
  kind: ' ' | '-' | '+'
  text: string
}

interface Example {
  key: string
  /** Opens this example from a link: #review-<slug>. */
  slug: string
  tab: string
  file: string
  lines: DiffLine[]
  /** The policy engine behind the app, if it has one; its decision changed too. */
  engine?: string
  /** What the reviewer said when approving: the change reads as harmless. */
  review: string
  /** Why running it matters for this kind of authorization. */
  why: string
}

/**
 * One pull request per kind of authorization, each letting a viewer read a
 * private document, custom auth first. The Rego and Cedar hunks are checked
 * with the real engines (the base denies, the head allows), and the Cedar
 * head still validates against its schema.
 */
const EXAMPLES: Example[] = [
  {
    key: 'custom',
    slug: 'custom-auth',
    tab: 'Custom auth',
    file: 'src/auth/can-read.ts',
    lines: [
      { kind: ' ', text: 'export function canRead(user: User, doc: Doc) {' },
      { kind: ' ', text: "  if (user.role === 'admin' || user.role === 'editor') return true" },
      { kind: '-', text: "  return user.role === 'viewer' && doc.visibility === 'public'" },
      { kind: '+', text: "  return user.role === 'viewer'" },
      { kind: ' ', text: '}' },
    ],
    review: 'Looks good. Simpler viewer check.',
    why: 'With custom auth, the rules live in your app’s code and there is no policy to test on its own. Running the app is the only way to see who can read what.',
  },
  {
    key: 'opa',
    slug: 'opa',
    tab: 'OPA',
    file: 'policy/authz.rego',
    lines: [
      { kind: ' ', text: 'allow if {' },
      { kind: ' ', text: '    input.user.role == "viewer"' },
      { kind: ' ', text: '    input.action == "read"' },
      { kind: '-', text: '    input.resource.visibility == "public"' },
      { kind: ' ', text: '}' },
    ],
    engine: 'OPA',
    review: 'LGTM. The visibility rule looked redundant.',
    why: 'With OPA, a policy test only asks Rego. Counterbranch asks OPA and the app, so a change that reads as tidying up is checked against what the app actually returns.',
  },
  {
    key: 'cedar',
    slug: 'cedar',
    tab: 'Cedar',
    file: 'policies/documents.cedar',
    lines: [
      { kind: ' ', text: 'permit (' },
      { kind: ' ', text: '  principal in Role::"viewer",' },
      { kind: ' ', text: '  action == Action::"read",' },
      { kind: ' ', text: '  resource is Document' },
      { kind: '-', text: ') when { resource.visibility == "public" };' },
      { kind: '+', text: ');' },
    ],
    engine: 'Cedar',
    review: 'Looks good. Cleaner permit.',
    why: 'With Cedar, this change still validates against the schema. Only running the same requests on both versions shows who it now lets through.',
  },
  {
    key: 'openfga',
    slug: 'openfga',
    tab: 'OpenFGA',
    file: 'authz/model.fga',
    lines: [
      { kind: ' ', text: '  relations' },
      { kind: ' ', text: '    define owner: [user]' },
      { kind: ' ', text: '    define editor: [user] or owner' },
      { kind: ' ', text: '    define viewer: [user] or editor' },
      { kind: '-', text: '    define can_read: editor' },
      { kind: '+', text: '    define can_read: viewer' },
    ],
    engine: 'OpenFGA',
    review: 'LGTM. Viewers should be able to read.',
    why: 'With OpenFGA, one relation swap reaches everyone the model counts as a viewer, private documents included. Running the same checks on both versions shows who can now read what.',
  },
]

/** The tested commits the comment names, as the real comment does. */
const COMMITS = { base: '3f061f3', candidate: 'a91c2e7' }

/** The parts that morph between examples, each with its own snapshot. */
const MORPH = {
  diff: 'cb-review-diff',
  review: 'cb-review-approval',
  run: 'cb-review-run',
  why: 'cb-review-why',
} as const

/** A card's hairlines and tint, mixed from its own ink so they follow the scheme. */
const CARD_RULE = '1px solid color-mix(in srgb, currentColor 14%, transparent)'
const CARD_TINT = 'color-mix(in srgb, currentColor 6%, transparent)'

/**
 * The dark ground the page's windows use: ink in the light scheme, the page's
 * near-black in the dark one, so the access colours read on it in both.
 */
function darkGround(theme: Theme) {
  const palette = theme.vars.palette
  return {
    backgroundColor: palette.hero.plate,
    color: palette.hero.plateInk,
    ...theme.applyStyles('dark', {
      backgroundColor: palette.background.default,
      color: palette.text.primary,
    }),
  }
}

/** The View Transitions API, where the browser has it. */
type TransitionDocument = Document & { startViewTransition?: (update: () => void) => unknown }

/** Old snapshots lift away; new ones settle in, the change first and the answers after. */
function MorphStyles() {
  const names = Object.values(MORPH)
  const out = `${motionDuration.fast}ms cubic-bezier(0.4, 0, 1, 1) both cbReviewOut`
  const inn = (delay: number) =>
    `${motionDuration.entrance}ms ${motionEasing.decel} ${delay}ms both cbReviewIn`
  return (
    <GlobalStyles
      styles={{
        '@keyframes cbReviewOut': { to: { opacity: 0, transform: 'translateY(-8px)' } },
        '@keyframes cbReviewIn': { from: { opacity: 0, transform: 'translateY(12px)' } },
        [names.map((name) => `::view-transition-old(${name})`).join(', ')]: { animation: out },
        [`::view-transition-new(${MORPH.diff})`]: { animation: inn(0) },
        [`::view-transition-new(${MORPH.review}), ::view-transition-new(${MORPH.run})`]: {
          animation: inn(motionDuration.fast / 2),
        },
        [`::view-transition-new(${MORPH.why})`]: { animation: inn(motionDuration.fast) },
        [names.map((name) => `::view-transition-group(${name})`).join(', ')]: {
          animationDuration: `${motionDuration.entrance}ms`,
          animationTimingFunction: motionEasing.decel,
        },
      }}
    />
  )
}

/** The change, as the pull request's "Files changed" view shows it. */
function Change({ example }: { example: Example }) {
  const theme = useTheme()
  const palette = theme.vars.palette
  const added = example.lines.filter((line) => line.kind === '+').length
  const removed = example.lines.filter((line) => line.kind === '-').length
  return (
    <Box
      component="figure"
      aria-label={`The change to ${example.file}`}
      sx={{
        m: 0,
        border: '1px solid',
        borderColor: palette.bands.navy.line,
        ...darkGround(theme),
        viewTransitionName: MORPH.diff,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          minHeight: 44,
          px: { xs: 2, md: 3 },
          borderBottom: CARD_RULE,
          backgroundColor: CARD_TINT,
          fontFamily: MONO_FONT,
          fontSize: '0.8125rem',
        }}
      >
        <Box component="span" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
          {example.file}
        </Box>
        <Box component="span" sx={{ ml: 'auto', flexShrink: 0, color: MUTED }}>
          {`+${added} −${removed}`}
        </Box>
      </Box>
      <Box
        component="pre"
        sx={{
          m: 0,
          py: { xs: 1.5, md: 2 },
          fontFamily: MONO_FONT,
          fontSize: { xs: '0.8125rem', md: '0.9375rem', xl: '1.0625rem' },
          lineHeight: 1.75,
        }}
      >
        {example.lines.map((line, index) => (
          <Box
            // The hunk is fixed, so line positions are stable keys.
            key={index}
            component="span"
            sx={{
              display: 'grid',
              gridTemplateColumns: '2.5ch minmax(0, 1fr)',
              px: { xs: 2, md: 3 },
              // Monochrome, as review tools draw it: context and removed lines
              // recede, the added line lifts. The access colours belong to
              // the run.
              ...(line.kind === ' ' && { color: MUTED }),
              ...(line.kind === '-' && {
                color: MUTED,
                backgroundColor: CARD_TINT,
                '& > :last-of-type': {
                  textDecoration: 'line-through',
                  textDecorationColor: 'color-mix(in srgb, currentColor 50%, transparent)',
                },
              }),
              ...(line.kind === '+' && {
                fontWeight: 700,
                backgroundColor: 'color-mix(in srgb, currentColor 12%, transparent)',
              }),
            }}
          >
            <Box component="span" sx={{ color: MUTED }}>
              {line.kind === ' ' ? '' : line.kind}
            </Box>
            <Box component="span" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
              {line.text}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

/**
 * One entry in the pull request's timeline under the change. A rail rises
 * from its top to the change above, so both entries read as answers to it.
 */
function Entry({
  loud,
  morph,
  avatar,
  who,
  label,
  children,
}: {
  loud: boolean
  morph: string
  avatar: ReactNode
  who: string
  label: string
  children: ReactNode
}) {
  const theme = useTheme()
  const palette = theme.vars.palette
  const band = palette.bands.navy
  const edge = loud ? palette.secondary.main : band.line
  return (
    <Box
      component="figure"
      aria-label={label}
      sx={{
        m: 0,
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: edge,
        viewTransitionName: morph,
        // The rail to the change above, across the gap between them.
        '&::before': {
          content: '""',
          position: 'absolute',
          left: { xs: 23, md: 31 },
          bottom: '100%',
          width: '1px',
          height: theme.spacing(4),
          backgroundColor: edge,
        },
        ...(loud ? darkGround(theme) : { color: band.ink }),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          minHeight: 48,
          px: { xs: 1.5, md: 2.5 },
          borderBottom: loud ? CARD_RULE : `1px solid ${band.line}`,
          fontSize: { xs: '0.875rem', xl: '0.9375rem' },
        }}
      >
        {avatar}
        <Box component="span" sx={{ fontWeight: 700 }}>
          {who}
        </Box>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          px: { xs: 2, md: 3 },
          py: { xs: 2.5, md: 3 },
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

/** One decision that changed: where it was asked, and what it was before and after. */
function Decision({ where, base, candidate }: { where: string; base: Access; candidate: Access }) {
  const palette = useTheme().vars.palette
  return (
    <Box
      component="p"
      sx={{
        m: 0,
        display: 'grid',
        gridTemplateColumns: 'minmax(4.5rem, auto) auto',
        justifyContent: 'start',
        columnGap: 3,
        alignItems: 'baseline',
        py: 1,
        borderBottom: CARD_RULE,
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <Box component="span" sx={{ fontFamily: MONO_FONT, fontSize: '0.875rem', color: MUTED }}>
        {where}
      </Box>
      <Box
        component="span"
        sx={{
          fontFamily: displayFont,
          fontWeight: 700,
          fontSize: { xs: '1.375rem', md: '1.625rem', xl: '1.875rem' },
          letterSpacing: '0.07em',
          lineHeight: 1.2,
        }}
      >
        {base}
        <Box component="span" aria-hidden sx={{ mx: '0.4em', color: MUTED }}>
          →
        </Box>
        <Box component="span" sx={srOnly}>
          {' became '}
        </Box>
        {/* Pink reads on the card's dark ground only in its lighter member. */}
        <Box component="span" sx={{ color: palette.secondary.light }}>
          {candidate}
        </Box>
      </Box>
    </Box>
  )
}


export default function ReviewVersusRun() {
  const theme = useTheme()
  const palette = theme.vars.palette
  const band = palette.bands.navy
  const prefersReducedMotion = usePrefersReducedMotion()
  const [selected, setSelected] = useState(0)

  // A link to #review-<slug> (the footer's use cases) lands on that slug's
  // anchor below, and this opens its example, on arrival and on later hash
  // changes. The browser does the scrolling, except on arrival when the
  // anchor is not there yet: the dev server renders the page fresh in the
  // browser, while a production build's prerendered HTML already has it.
  useEffect(() => {
    const open = (arriving: boolean) => {
      const match = /^#review-([a-z-]+)$/.exec(window.location.hash)
      const index = match ? EXAMPLES.findIndex((item) => item.slug === match[1]) : -1
      if (index < 0) return
      setSelected(index)
      if (arriving) document.getElementById(`review-${EXAMPLES[index].slug}`)?.scrollIntoView()
    }
    open(true)
    const onHashChange = () => open(false)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  const baseId = useId()
  const example = EXAMPLES[selected]

  const choose = (_event: unknown, next: number) => {
    if (next === selected) return
    const doc = document as TransitionDocument
    if (prefersReducedMotion || typeof doc.startViewTransition !== 'function') {
      setSelected(next)
      return
    }
    doc.startViewTransition(() => flushSync(() => setSelected(next)))
  }

  return (
    <Box sx={{ mt: rhythm.exhibit, position: 'relative' }}>
      {EXAMPLES.map((item) => (
        <Box
          key={item.slug}
          component="span"
          id={`review-${item.slug}`}
          aria-hidden
          sx={{ position: 'absolute', top: 0, scrollMarginTop: 24 }}
        />
      ))}
      <MorphStyles />
      <Typography variant="h4" component="h3">
        Review reads it. Counterbranch runs it.
      </Typography>
      <Typography
        variant="body1"
        sx={{
          mt: rhythm.heading,
          maxWidth: '62ch',
          fontSize: { md: '1.0625rem', xl: '1.125rem' },
          color: band.inkMuted,
          textWrap: 'pretty',
        }}
      >
        Counterbranch starts the old and new app in locked-down containers and sends the same
        requests as the same test users. It asks your policy engine too, when there is one.
      </Typography>

      <Tabs
        value={selected}
        onChange={choose}
        aria-label="The example pull request, by kind of authorization"
        variant="scrollable"
        allowScrollButtonsMobile
        textColor="inherit"
        sx={{
          mt: { xs: 4, md: 5 },
          mb: { xs: 4, md: 5 },
          minHeight: 48,
          borderBottom: '1px solid',
          borderColor: band.line,
          '& .MuiTabs-indicator': { height: 3, backgroundColor: palette.primary.main },
          // The four fit from md, so the arrows are for phones only.
          '& .MuiTabs-scrollButtons': { color: band.ink, display: { md: 'none' } },
        }}
      >
        {EXAMPLES.map((item, index) => (
          <Tab
            key={item.key}
            id={`${baseId}-tab-${index}`}
            aria-controls={`${baseId}-panel`}
            label={item.tab}
            disableRipple
            sx={{
              minHeight: 48,
              px: { xs: 2, md: 3 },
              fontFamily: displayFont,
              fontWeight: 600,
              fontSize: { xs: '0.875rem', xl: '1rem' },
              letterSpacing: '0.12em',
              color: band.inkMuted,
              opacity: 1,
              '&.Mui-selected': { color: band.ink },
              '&.Mui-focusVisible': { outline: `2px solid ${palette.primary.main}`, outlineOffset: -2 },
            }}
          />
        ))}
      </Tabs>

      <Box
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${selected}`}
        // Nothing inside is focusable, so the panel itself is the next stop.
        tabIndex={0}
        sx={{
          outline: 'none',
          '&:focus-visible': { outline: `2px solid ${palette.primary.main}`, outlineOffset: 8 },
        }}
      >
        <Change example={example} />

        {/* The two answers to the change, on one row under it. */}
        <Box
          sx={{
            mt: 4,
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
            columnGap: { md: 4, xl: 6 },
            rowGap: 4,
            alignItems: 'stretch',
          }}
        >
          <Entry
            loud={false}
            morph={MORPH.review}
            label="The reviewer's approval"
            who="reviewer approved these changes"
            avatar={
              <Box
                aria-hidden
                sx={{
                  flexShrink: 0,
                  width: 24,
                  height: 24,
                  display: 'grid',
                  placeItems: 'center',
                  border: `1px solid ${band.line}`,
                }}
              >
                <CheckIcon sx={{ fontSize: 16 }} />
              </Box>
            }
          >
            <Typography
              component="p"
              sx={{
                fontSize: { xs: '1.0625rem', md: '1.1875rem', xl: '1.3125rem' },
                lineHeight: 1.45,
                color: band.ink,
                textWrap: 'pretty',
              }}
            >
              “{example.review}”
            </Typography>
            <Box
              component="p"
              sx={{
                m: 0,
                mt: 'auto',
                pt: 3,
                fontFamily: MONO_FONT,
                fontSize: '0.875rem',
                color: band.inkMuted,
              }}
            >
              Access impact: not shown
            </Box>
          </Entry>

          <Entry
            loud
            morph={MORPH.run}
            label="Counterbranch's comment on the pull request"
            who="Counterbranch comparison"
            avatar={
              <Box
                aria-hidden
                sx={{
                  flexShrink: 0,
                  width: 24,
                  height: 24,
                  // The lockup's shield, cropped square.
                  backgroundImage: `url(${logoDark})`,
                  backgroundSize: 'auto 100%',
                  backgroundPosition: 'left center',
                  backgroundRepeat: 'no-repeat',
                }}
              />
            }
          >
            <Box
              sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 2, rowGap: 1 }}
            >
              <Box
                component="span"
                sx={{
                  px: 1,
                  py: 0.25,
                  backgroundColor: palette.secondary.main,
                  color: palette.secondary.contrastText,
                  fontFamily: displayFont,
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  letterSpacing: '0.12em',
                }}
              >
                VIOLATION
              </Box>
              <Box
                component="span"
                sx={{ fontFamily: MONO_FONT, fontSize: { xs: '0.875rem', xl: '0.9375rem' } }}
              >
                viewer → read private-document
              </Box>
            </Box>
            <Box sx={{ mt: 2 }}>
              {example.engine && <Decision where={example.engine} base="DENY" candidate="ALLOW" />}
              <Decision where="app" base="DENY" candidate="ALLOW" />
            </Box>
            <Box
              component="p"
              sx={{ m: 0, mt: 'auto', pt: 3, fontFamily: MONO_FONT, fontSize: '0.8125rem', color: MUTED }}
            >
              {`Tested base ${COMMITS.base}, candidate ${COMMITS.candidate}`}
            </Box>
          </Entry>
        </Box>

        {/* Why the difference matters for this kind of authorization. */}
        <Typography
          component="p"
          sx={{
            mt: { xs: 4, md: 5 },
            maxWidth: '64ch',
            fontSize: { xs: '1.0625rem', md: '1.1875rem', xl: '1.3125rem' },
            lineHeight: 1.5,
            fontWeight: 500,
            color: band.ink,
            textWrap: 'pretty',
            viewTransitionName: MORPH.why,
          }}
        >
          {example.why}
        </Typography>
      </Box>
    </Box>
  )
}
