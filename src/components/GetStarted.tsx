import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode, Ref, RefObject } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import Section from './Section.tsx'
import SlotWord from './SlotWord.tsx'
import ReelFrame from './ReelFrame.tsx'
import { REEL_CONTROL_ROOM } from './reelFrameContext.ts'
import { MacWindow, MONO_FONT, MUTED } from './DiffVersusRun.tsx'
import { srOnly } from '../a11y.ts'
import { links } from '../links.ts'
import { displayFont } from '../theme.ts'
import { lineIn, motionDuration, motionEasing, reelDwellPhrase } from '../motion.ts'
import { pageColumn, rhythm } from '../rhythm.ts'
import { capture } from '../posthog.ts'

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'

/**
 * The everyday chores the reel compares setup with, all shorter than a
 * sentence. Ordered so their widths rise and then fall, with the first (the
 * prerendered one) short, so the plate's edge never jumps more than about a
 * quarter of the window between two chores.
 */
const CHORES = [
  'ordering Chipotle',
  'expensing a $12 app',
  'booking a meeting room',
  'brewing your WFH coffee',
  'finding the unmute button',
  'dressing for a Slack call',
  'picking a reaction emoji',
  'writing your OKRs',
] as const

/** The reel is aria-hidden, so the heading carries the sentence once, with its first chore. */
const HEADING_FOR_SCREEN_READERS = `Less effort than ${CHORES[0]}.`

/** How long "Copied" stays on a copy button, in ms. */
const COPIED_MS = 2000

// One line per step, so it pastes cleanly; the window wraps each step under
// its own number.
const AGENT_PROMPT = `Set up Counterbranch in this repository.

1. Read ${links.agentsRecipe} and follow its setup recipe.
2. Install the Counterbranch CLI for this machine.
3. Find where this app decides access (policy files, middleware, route guards) and draft checks for the roles, actions and resources you find, as the recipe describes. Show me each check's intended access before you save it.
4. Run \`counterbranch setup --repository . --base main --head HEAD\`, then \`counterbranch run\` with the same options, and show me every decision that changed.
5. Add the check to CI so it runs on every pull request.

Ask me before changing application code.`

// The Action compares two commits, so the checkout before it needs history.
const GITHUB_STEPS = `- uses: actions/checkout@v4
  with:
    fetch-depth: 0

- uses: counterbranch/compare-action@v0
  id: counterbranch
  with:
    repository: \${{ github.workspace }}
    base: \${{ github.event.pull_request.base.sha }}
    head: \${{ github.event.pull_request.head.sha }}

# Optional: block the merge unless nothing changed.
- if: steps.counterbranch.outputs.outcome != 'CLEAN'
  run: exit 1`

const GITLAB_INCLUDE = `include:
  - component: gitlab.com/counterbranch/compare/counterbranch@1`

const CLI_COMMANDS = [
  'brew install counterbranch/tap/counterbranch',
  'counterbranch setup --repository . --base main --head HEAD',
  'counterbranch run --repository . --base main --head HEAD',
]

/**
 * What each command printed on a real run: a seven-test OPA repository whose
 * head branch drops a viewer rule's "public only" condition. The report lines
 * are quoted from the run's comparison.md.
 */
const CLI_OUTPUT: readonly (readonly string[])[] = [
  [],
  ['automatic OPA project ready with 7 imported cases'],
  [
    '~/.cache/counterbranch/runs/run-1790165550661410000-73523-0',
    '# comparison.md',
    '# Outcome: NEEDS_OWNER_REVIEW',
    '# Cases: 7 | Unchanged: 6 | Deny to allow: 1 | Allow to deny: 0 | Indeterminate: 0',
  ],
]

/**
 * Copies `text`, and says so on the button for a moment. Where the clipboard
 * is unavailable it selects `fallback`'s contents instead, so the visitor can
 * copy by hand. The live region announces the result.
 */
function useCopy(text: string, fallback: () => HTMLElement | null) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'selected'>('idle')
  useEffect(() => {
    if (status === 'idle') return
    const id = window.setTimeout(() => setStatus('idle'), COPIED_MS)
    return () => window.clearTimeout(id)
  }, [status])
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setStatus('copied')
    } catch {
      const node = fallback()
      if (!node) return
      const range = document.createRange()
      range.selectNodeContents(node)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
      setStatus('selected')
    }
  }
  return { status, copy }
}

/** A window of text to copy: a prompt, a config snippet or shell commands. */
function CodeWindow({
  title,
  label,
  children,
  preRef,
}: {
  title: string
  label: string
  children: ReactNode
  preRef?: Ref<HTMLPreElement>
}) {
  return (
    <MacWindow title={title} label={label}>
      <Box
        ref={preRef}
        component="pre"
        sx={{
          m: 0,
          px: { xs: 2, sm: 3 },
          py: 2.5,
          fontFamily: MONO_FONT,
          fontSize: { xs: '0.8125rem', sm: '0.875rem', xl: '1rem' },
          lineHeight: 1.65,
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
        }}
      >
        {children}
      </Box>
    </MacWindow>
  )
}

/** The panel's main action: copy what the window shows. */
function CopyButton({
  label,
  copied,
  text,
  target,
  installationPath,
}: {
  label: string
  /** What the live region says once it is copied, e.g. "Prompt copied". */
  copied: string
  text: string
  target: () => HTMLElement | null
  installationPath: string
}) {
  const { status, copy } = useCopy(text, target)
  const announcement = {
    idle: '',
    copied,
    selected: 'Copying is blocked here, so the text is selected. Copy it with your keyboard.',
  }[status]
  return (
    <>
      <Button
        variant="contained"
        size="large"
        onClick={() => {
          capture('setup_instructions_copy_requested', { installation_path: installationPath })
          void copy()
        }}
        sx={{ minHeight: 48 }}
      >
        {status === 'copied' ? 'Copied' : status === 'selected' ? 'Selected' : label}
      </Button>
      <Box component="span" role="status" sx={srOnly}>
        {announcement}
      </Box>
    </>
  )
}

interface InstallPath {
  key: string
  label: string
  /** What it takes, in the smallest honest unit. */
  effort: string
  title: string
  body: string
  /** The main action and anything after it. */
  actions: (preRef: RefObject<HTMLPreElement | null>) => ReactNode
  /** What the window beside it shows. */
  window: (preRef: RefObject<HTMLPreElement | null>) => ReactNode
}

/** Ink for the parts of a window that are commentary rather than content. */
const muted = { color: MUTED }

const INSTALL_PATHS: readonly InstallPath[] = [
  {
    key: 'agent',
    label: 'Your agent',
    effort: '1 paste',
    title: 'Hand it to your agent.',
    body: 'Paste this into Claude Code, Cursor, Codex or any coding agent. It follows the recipe in our AGENTS.md: it installs the CLI, drafts the checks for your app for you to approve, and adds the check to CI. Your agent, your key: we never see your code.',
    actions: (preRef) => (
      <>
        <CopyButton
          label="Copy prompt"
          copied="Prompt copied"
          text={AGENT_PROMPT}
          target={() => preRef.current}
          installationPath="agent"
        />
        <Button variant="outlined" size="large" component="a" href={links.agentsRecipe} sx={{ minHeight: 48 }}>
          Read AGENTS.md
        </Button>
      </>
    ),
    window: (preRef) => (
      <CodeWindow title="prompt" label="Setup prompt for a coding agent" preRef={preRef}>
        {AGENT_PROMPT.split('\n').map((line, index) => (
          <Box
            // The prompt is fixed, so its line numbers are stable keys.
            key={index}
            component="span"
            sx={{
              display: 'block',
              // A numbered step wraps under its text, not under its number.
              ...(/^\d\. /.test(line) && { pl: '3ch', textIndent: '-3ch' }),
            }}
          >
            {line || ' '}
          </Box>
        ))}
      </CodeWindow>
    ),
  },
  {
    key: 'github',
    label: 'GitHub',
    effort: '2 steps',
    title: 'Add the GitHub Action.',
    body: 'Paste two steps into a pull request workflow: a checkout with full history, then the Action. It reports the outcome on every pull request and blocks nothing, so you can watch it for a week first. Add the last step when a changed decision should block the merge.',
    actions: (preRef) => (
      <>
        <CopyButton
          label="Copy YAML"
          copied="YAML copied"
          text={GITHUB_STEPS}
          target={() => preRef.current}
          installationPath="github"
        />
        <Button variant="outlined" size="large" component="a" href={links.githubAction} sx={{ minHeight: 48 }}>
          View on Marketplace
        </Button>
      </>
    ),
    window: (preRef) => (
      <CodeWindow title=".github/workflows/access.yml" label="The Action's steps for a pull request workflow" preRef={preRef}>
        {GITHUB_STEPS.split('\n').map((line, index) => (
          <Box
            // The snippet is fixed, so its line numbers are stable keys.
            key={index}
            component="span"
            sx={{ display: 'block', ...(line.trimStart().startsWith('#') && muted) }}
          >
            {line || ' '}
          </Box>
        ))}
      </CodeWindow>
    ),
  },
  {
    key: 'gitlab',
    label: 'GitLab',
    effort: '2 lines',
    title: 'Add the CI/CD component.',
    body: 'Include the Counterbranch component from the GitLab CI/CD Catalog in your .gitlab-ci.yml, and merge requests from branches in your project run the comparison. By default only a complete, clean result passes.',
    actions: (preRef) => (
      <>
        <CopyButton
          label="Copy YAML"
          copied="YAML copied"
          text={GITLAB_INCLUDE}
          target={() => preRef.current}
          installationPath="gitlab"
        />
        <Button variant="outlined" size="large" component="a" href={links.gitlabCatalog} sx={{ minHeight: 48 }}>
          View in the catalog
        </Button>
      </>
    ),
    window: (preRef) => (
      <CodeWindow title=".gitlab-ci.yml" label="The component include for .gitlab-ci.yml" preRef={preRef}>
        {GITLAB_INCLUDE}
      </CodeWindow>
    ),
  },
  {
    key: 'manual',
    label: 'Manually',
    effort: '3 commands',
    title: 'Install the CLI.',
    body: 'One binary for macOS on Apple silicon or Linux x86_64. Point it at your repository and two revisions. On an OPA repository it imports your existing Rego tests, so there is nothing to write. The output shown is from a real run.',
    actions: (preRef) => (
      <>
        <CopyButton
          label="Copy commands"
          copied="Commands copied"
          text={CLI_COMMANDS.join('\n')}
          target={() => preRef.current}
          installationPath="manual"
        />
        <Button variant="outlined" size="large" component="a" href={links.faq} sx={{ minHeight: 48 }}>
          Read the FAQ
        </Button>
      </>
    ),
    window: (preRef) => (
      <CodeWindow
        title="zsh — a seven-test OPA repository"
        label="Commands to install and run the CLI, with the output of a real run"
        preRef={preRef}
      >
        {CLI_COMMANDS.map((command, index) => (
          <Box key={command} component="span" sx={{ display: 'block' }}>
            {/* Prompts and output stay out of a manual copy, so the
                selection fallback copies runnable commands. */}
            <Box component="span" aria-hidden sx={{ ...muted, userSelect: 'none' }}>
              {'$ '}
            </Box>
            {command}
            {CLI_OUTPUT[index].map((line) => (
              <Box
                key={line}
                component="span"
                sx={{ display: 'block', userSelect: 'none', ...(line.startsWith('#') && muted) }}
              >
                {line}
              </Box>
            ))}
          </Box>
        ))}
      </CodeWindow>
    ),
  },
]

/**
 * One way in, shown while its tab is selected: what it is and its main action
 * on the left, the thing that action works on in a window on the right. Its
 * content has buttons to tab to, so the panel itself is not a tab stop.
 */
function InstallPanel({
  path,
  id,
  labelledBy,
  selected,
  arrives,
}: {
  path: InstallPath
  id: string
  labelledBy: string
  selected: boolean
  /** Whether it animates in when shown: only once the visitor has switched tabs. */
  arrives: boolean
}) {
  const palette = useTheme().vars.palette
  const preRef = useRef<HTMLPreElement>(null)
  return (
    <Box
      id={id}
      role="tabpanel"
      aria-labelledby={labelledBy}
      aria-hidden={!selected}
      inert={!selected}
      sx={{
        mt: { xs: 4, md: 5, xl: 6 },
        gridArea: { lg: '1 / 1' },
        display: { xs: selected ? 'grid' : 'none', lg: 'grid' },
        visibility: { lg: selected ? 'visible' : 'hidden' },
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 5fr) minmax(0, 7fr)' },
        columnGap: 8,
        rowGap: 4,
        alignItems: 'start',
        // Adding the animation restarts it, so it plays on each switch.
        animation:
          selected && arrives ? `${lineIn} ${motionDuration.base}ms ${motionEasing.decel} both` : 'none',
        [REDUCED_MOTION]: { animation: 'none' },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h4" component="h3">
          {path.title}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mt: rhythm.heading,
            maxWidth: '46ch',
            fontSize: { xl: '1.125rem' },
            color: palette.text.secondary,
            textWrap: 'pretty',
          }}
        >
          {path.body}
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 2 }}>{path.actions(preRef)}</Box>
      </Box>
      <Box sx={{ minWidth: 0 }}>{path.window(preRef)}</Box>
    </Box>
  )
}

/**
 * The install section: where every "Get started free" button leads. A
 * heading that rolls through everyday chores the setup takes less effort
 * than, then the four ways to add Counterbranch as tabs. Each tab names what
 * it takes (a paste, two clicks) and holds one main action beside the thing
 * it acts on: the prompt, the pull request check, the YAML, the commands.
 *
 * Tabs follow the WAI-ARIA pattern: arrow keys move between them and select
 * as they go, Home and End jump to the ends, and only the selected tab is in
 * the tab order. The first tab is selected in the prerendered page.
 */
export default function GetStarted() {
  const theme = useTheme()
  const palette = theme.vars.palette
  const paths = INSTALL_PATHS
  const [selected, setSelected] = useState(0)
  // The first panel is simply there; later ones arrive when chosen.
  const [switched, setSwitched] = useState(false)
  const choose = (index: number) => {
    if (index !== selected) {
      capture('installation_path_selected', { installation_path: paths[index].key })
    }
    setSelected(index)
    setSwitched(true)
  }
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const baseId = useId()
  const tabId = (index: number) => `${baseId}-tab-${index}`
  const panelId = (index: number) => `${baseId}-panel-${index}`

  const onKeyDown = (event: KeyboardEvent) => {
    const last = paths.length - 1
    const moves: Record<string, number> = {
      ArrowRight: selected === last ? 0 : selected + 1,
      ArrowDown: selected === last ? 0 : selected + 1,
      ArrowLeft: selected === 0 ? last : selected - 1,
      ArrowUp: selected === 0 ? last : selected - 1,
      Home: 0,
      End: last,
    }
    const next = moves[event.key]
    if (next === undefined) return
    event.preventDefault()
    choose(next)
    tabs.current[next]?.focus()
  }

  const headingTracking = theme.typography.h2.letterSpacing

  return (
    <Section id="get-started">
      <Container maxWidth={false} sx={pageColumn}>
        {/* The frame is a size container, so the chore's line scales to its
            width less the pause control's room: the longest chore, full
            stop included, reaches about 16.75em on the smallest phones,
            where the tracking in px counts for most. */}
        <ReelFrame>
          <Typography variant="h2" component="h2">
            <Box component="span" sx={srOnly}>
              {HEADING_FOR_SCREEN_READERS}
            </Box>
            <Box component="span" aria-hidden sx={{ display: 'block' }}>
              Less effort than
              {/* The chore gets its own line so a long one never reflows
                  the words above it. */}
              <Box
                component="span"
                sx={{
                  display: 'flex',
                  mt: '0.16em',
                  fontSize: 'min(1em, 5.2vw)',
                  '@supports (width: 1cqi)': {
                    fontSize: `min(1em, (100cqi - ${REEL_CONTROL_ROOM}px) / 16.75)`,
                  },
                }}
              >
                <SlotWord
                  words={CHORES}
                  plate={palette.hero.plate}
                  ink={palette.hero.plateInk}
                  suffix="."
                  dwell={reelDwellPhrase}
                  windowMs={motionDuration.reelWindowPhrase}
                  tracking={typeof headingTracking === 'number' ? `${headingTracking}px` : headingTracking}
                />
              </Box>
            </Box>
          </Typography>
        </ReelFrame>
        <Box sx={{ mt: rhythm.display }}>
          <Typography
            variant="body1"
            sx={{
              maxWidth: '46ch',
              fontSize: { md: '1.125rem', xl: '1.25rem' },
              color: palette.text.secondary,
              textWrap: 'pretty',
            }}
          >
            Four ways into the workflow you already have, all free during the alpha.
          </Typography>
        </Box>

        <Box
          role="tablist"
          aria-label="Ways to add Counterbranch"
          onKeyDown={onKeyDown}
          sx={{
            mt: rhythm.intro,
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
          }}
        >
          {paths.map((path, index) => {
            const isSelected = index === selected
            return (
              <ButtonBase
                key={path.key}
                ref={(node: HTMLButtonElement | null) => {
                  tabs.current[index] = node
                }}
                id={tabId(index)}
                role="tab"
                aria-selected={isSelected}
                aria-controls={panelId(index)}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => choose(index)}
                sx={{
                  display: 'grid',
                  // ButtonBase centres its content; tabs read from the left edge.
                  justifyContent: 'start',
                  justifyItems: 'start',
                  alignContent: 'center',
                  rowGap: 0.5,
                  textAlign: 'left',
                  px: { xs: 2, sm: 2.5 },
                  py: { xs: 2, sm: 2.5 },
                  // Neighbouring tabs share one hairline rather than doubling it.
                  ml: { xs: index % 2 === 0 ? 0 : '-1px', md: index === 0 ? 0 : '-1px' },
                  mt: { xs: index < 2 ? 0 : '-1px', md: 0 },
                  border: '1px solid',
                  borderColor: isSelected ? palette.hero.plate : palette.divider,
                  backgroundColor: isSelected ? palette.hero.plate : 'transparent',
                  color: isSelected ? palette.hero.plateInk : palette.text.primary,
                  position: 'relative',
                  zIndex: isSelected ? 1 : 0,
                  transition: theme.transitions.create(['background-color', 'border-color', 'color'], {
                    duration: motionDuration.fast,
                    easing: motionEasing.decel,
                  }),
                  '&:hover': isSelected ? {} : { borderColor: palette.text.primary, zIndex: 2 },
                  '&.Mui-focusVisible, &:focus-visible': {
                    outline: `2px solid ${palette.primary.dark}`,
                    outlineOffset: 2,
                    zIndex: 3,
                  },
                  [REDUCED_MOTION]: { transition: 'none' },
                  ...theme.applyStyles('dark', {
                    '&.Mui-focusVisible, &:focus-visible': {
                      outline: `2px solid ${palette.primary.main}`,
                    },
                  }),
                }}
              >
                <Box
                  component="span"
                  sx={{
                    fontFamily: displayFont,
                    fontWeight: 600,
                    fontSize: { xs: '1rem', md: '1.125rem', xl: '1.25rem' },
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  {path.label}
                </Box>
                <Box
                  component="span"
                  sx={{
                    fontSize: { xs: '0.875rem', xl: '0.9375rem' },
                    fontWeight: 500,
                    color: isSelected
                      ? `color-mix(in srgb, ${palette.hero.plateInk} 72%, transparent)`
                      : palette.text.secondary,
                  }}
                >
                  {path.effort}
                </Box>
              </ButtonBase>
            )
          })}
        </Box>

        {/* From lg the panels share one cell, so switching tabs never moves
            the FAQ below; on phones only the chosen one takes space. */}
        <Box sx={{ display: 'grid' }}>
          {paths.map((path, index) => (
            <InstallPanel
              key={path.key}
              path={path}
              id={panelId(index)}
              labelledBy={tabId(index)}
              selected={index === selected}
              arrives={switched}
            />
          ))}
        </Box>
      </Container>
    </Section>
  )
}
