import type { CSSProperties, ReactNode } from 'react'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { MUTED } from '../../components/DiffVersusRun.tsx'
import { srOnly } from '../../a11y.ts'
import RepoField from '../../components/RepoField.tsx'
import { benchmark, siteKinds } from '../../alphaResults.ts'
import { barGrow, lineIn, play, type RunPhase } from '../../motion.ts'
import type { LogLine, LogPart, Tone } from './content.ts'
import { LINE_STEP, LOG_PAD, partLength } from './logLayout.ts'

const bleed = {
  mx: 'calc(-1 * var(--log-pad))',
  px: 'var(--log-pad)',
} as const

const strong = { fontWeight: 700 } as const
const muted = { color: MUTED } as const

/** Labels are one column wide in every block, so values line up down the whole log. */
const ROW = {
  display: 'grid',
  gridTemplateColumns: '16ch minmax(0, 1fr)',
  columnGap: '2ch',
} as const

function useToneInk() {
  const palette = useTheme().vars.palette
  const hue: Record<Tone, string> = {
    measured: palette.primary.main,
    unfinished: palette.warning.main,
    confirmed: palette.secondary.main,
  }
  // On the tape's dark ground: cyan and the warning hue read as they are;
  // pink takes its lighter member, as in the site's other terminals.
  const text: Record<Tone, string> = {
    measured: palette.primary.main,
    unfinished: palette.warning.main,
    confirmed: palette.secondary.light,
  }
  return { hue, text }
}

/** One arriving line: `index` sets its place in the block's stagger. */
function arrive(index: number) {
  return { 'data-line': '', style: { '--d': `${index * LINE_STEP}ms` } as CSSProperties }
}

function Comment({ text, index }: { text: string; index: number }) {
  return (
    <Box component="p" {...arrive(index)} sx={{ m: 0, ...muted, whiteSpace: 'pre-wrap' }}>
      {`# ${text}`}
    </Box>
  )
}

function Command({ line, index }: { line: Extract<LogLine, { kind: 'command' }>; index: number }) {
  return (
    <Box component="p" {...arrive(index)} sx={{ m: 0 }}>
      <Box component="span" aria-hidden sx={muted}>
        ${' '}
      </Box>
      <Box component="code" sx={{ font: 'inherit', ...strong }}>
        {line.program}
      </Box>{' '}
      <Box component="code" sx={{ font: 'inherit' }}>
        {line.args}
      </Box>
      {line.note && (
        <Box component="span" sx={muted}>
          {`   # ${line.note}`}
        </Box>
      )}
    </Box>
  )
}

function Field({ line, index }: { line: Extract<LogLine, { kind: 'field' }>; index: number }) {
  const ink = useToneInk()
  const tone = line.tone
  return (
    <Box
      {...arrive(index)}
      sx={(theme) => ({
        ...ROW,
        ...(tone && {
          ...bleed,
          backgroundColor: `color-mix(in srgb, ${ink.hue[tone]} 16%, transparent)`,
          ...theme.applyStyles('dark', {
            backgroundColor: `color-mix(in srgb, ${ink.hue[tone]} 20%, transparent)`,
          }),
        }),
      })}
    >
      <Box component="dt" sx={{ ...muted, ...(line.setAside && { textDecoration: 'line-through' }) }}>
        {line.label}
      </Box>
      <Box component="dd" sx={{ m: 0, minWidth: 0 }}>
        <Box
          component="span"
          sx={{
            ...strong,
            ...(tone && { color: ink.text[tone] }),
            ...(line.setAside && { ...muted, textDecoration: 'line-through' }),
          }}
        >
          {line.value}
        </Box>
        {line.note && (
          <Box component="span" sx={muted}>
            {`   ${line.note}`}
          </Box>
        )}
        {line.marks !== undefined && tone && (
          // One square per item, in the line's tone, as the site draws decisions.
          <Box component="span" aria-hidden sx={{ display: 'flex', flexWrap: 'wrap', gap: '4px', mt: '0.35em', mb: '0.5em' }}>
            {Array.from({ length: line.marks }, (_, i) => (
              <Box key={i} component="span" sx={{ width: '0.75em', height: '0.75em', backgroundColor: ink.hue[tone] }} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}

/** Decisions a square stands for in the kinds figure. */
const PER_SQUARE = 2000
const SQUARE_PITCH = 9
const SQUARE_CELL = 7

/**
 * Mapped decisions by kind: a run of squares per kind, one for about 2,000,
 * in a track every row shares, so the runs are to scale with each other; the
 * count sits in its own column.
 */
function Kinds({ start }: { start: number }) {
  const palette = useTheme().vars.palette
  const runs = siteKinds.map(({ count }) => Math.round(count / PER_SQUARE))
  const longest = Math.max(...runs)
  const trackWidth = longest * SQUARE_PITCH - (SQUARE_PITCH - SQUARE_CELL)
  return (
    <Box component="dl" sx={{ m: 0 }}>
      {siteKinds.map(({ kind, count }, i) => (
        <Box
          key={kind}
          {...arrive(start + i)}
          sx={{
            display: 'grid',
            // On phones the run gets the panel's full width under its label
            // and count, so its squares keep their size; from sm it sits
            // between them.
            gridTemplateColumns: { xs: 'minmax(0, 1fr) auto', sm: '16ch minmax(0, 1fr) 7ch' },
            gridTemplateAreas: { xs: '"kind count" "run run"', sm: '"kind run count"' },
            columnGap: '2ch',
            alignItems: 'center',
            mb: { xs: '0.35em', sm: 0 },
          }}
        >
          <Box component="dt" sx={{ ...muted, gridArea: 'kind' }}>
            {kind.toLowerCase()}
          </Box>
          <Box component="dd" sx={{ m: 0, display: 'contents' }}>
            <Box
              component="svg"
              aria-hidden
              data-bar=""
              viewBox={`0 0 ${trackWidth} ${SQUARE_CELL}`}
              preserveAspectRatio="xMinYMid meet"
              style={{ '--d': `${(start + i) * LINE_STEP + 120}ms` } as CSSProperties}
              sx={{
                gridArea: 'run',
                display: 'block',
                width: '100%',
                height: { xs: '0.8em', sm: '0.7em' },
                transformOrigin: 'left center',
              }}
            >
              {Array.from({ length: runs[i] }, (_, n) => (
                <rect key={n} x={n * SQUARE_PITCH} y={0} width={SQUARE_CELL} height={SQUARE_CELL} fill={palette.primary.main} />
              ))}
            </Box>
            <Box component="span" sx={{ ...strong, gridArea: 'count', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              {`~${count.toLocaleString('en-US')}`}
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  )
}

const thousands = (n: number) => `${Math.round(n / 1000)}k`

/** The timing benchmark as a real table, set in the log's type. */
function Benchmark({ start }: { start: number }) {
  const cell = { p: 0, pr: '2ch', py: '0.1em', textAlign: 'left', fontWeight: 400, whiteSpace: 'nowrap' } as const
  const number = { ...cell, textAlign: 'right' } as const
  return (
    <>
      {/* Scrolls sideways inside the panel rather than clipping, when large
          text makes the table wider than a phone's panel. Focusable, so the
          keyboard can scroll it too. */}
      <Box
        role="region"
        aria-label="Timing benchmark"
        tabIndex={0}
        sx={(theme) => ({
          overflowX: 'auto',
          my: '0.4em',
          '&:focus-visible': { outline: `2px solid ${theme.vars.palette.primary.main}`, outlineOffset: 2 },
        })}
      >
        <Box
          component="table"
          sx={{ borderCollapse: 'collapse', font: 'inherit', fontVariantNumeric: 'tabular-nums' }}
        >
          <Box component="caption" sx={srOnly}>
            Timing benchmark: median discover scan of one checkout of each of nine open-source repositories, by language and size
          </Box>
          <thead>
            <Box component="tr" {...arrive(start)}>
              <Box component="th" scope="col" sx={{ ...cell, ...muted }}>
                language
              </Box>
              <Box component="th" scope="col" sx={{ ...number, ...muted }}>
                lines
              </Box>
              <Box component="th" scope="col" sx={{ ...number, ...muted }}>
                time
              </Box>
              <Box component="th" scope="col" sx={{ ...number, ...muted, pr: 0 }}>
                lines/s
              </Box>
            </Box>
          </thead>
          <tbody>
            {benchmark.map((row, i) => (
              <Box component="tr" key={i} {...arrive(start + 1 + i)}>
                <Box component="th" scope="row" sx={{ ...cell, ...strong }}>
                  {row.language}
                  {'largeOnDisk' in row && (
                    <Box component="span" sx={muted}>
                      *
                    </Box>
                  )}
                </Box>
                <Box component="td" sx={number}>
                  {thousands(row.lines)}
                </Box>
                <Box component="td" sx={number}>
                  {`${row.seconds} s`}
                </Box>
                <Box component="td" sx={{ ...number, pr: 0 }}>
                  {row.perSecond.toLocaleString('en-US')}
                </Box>
              </Box>
            ))}
          </tbody>
        </Box>
      </Box>
      <Comment index={start + 1 + benchmark.length} text="* small in code, large on disk: scan time follows the files walked" />
    </>
  )
}

/** The campaign's field of repositories, drawn on the tape with its legend. */
function FieldFigure({ index }: { index: number }) {
  return (
    <Box {...arrive(index)} sx={{ my: '0.75em' }}>
      <RepoField bare />
    </Box>
  )
}

/** Consecutive fields go into one description list; comments and commands sit between. */
function Lines({ lines, start }: { lines: LogLine[]; start: number }) {
  const out: ReactNode[] = []
  let fields: ReactNode[] = []
  const flush = (key: number) => {
    if (!fields.length) return
    out.push(
      <Box component="dl" key={`dl-${key}`} sx={{ m: 0 }}>
        {fields}
      </Box>,
    )
    fields = []
  }
  lines.forEach((line, i) => {
    const index = start + i
    if (line.kind === 'field') {
      fields.push(<Field key={i} line={line} index={index} />)
      return
    }
    flush(i)
    out.push(
      line.kind === 'comment' ? (
        <Comment key={i} text={line.text} index={index} />
      ) : (
        <Command key={i} line={line} index={index} />
      ),
    )
  })
  flush(lines.length)
  return <>{out}</>
}

/**
 * A block's output in the log. Every line arrives the first time the block
 * comes into view, a line at a time; the bars grow to their counts. The
 * first render is the finished output, so the prerendered page and readers
 * without JavaScript or with reduced motion see it whole.
 */
export default function LogOutput({ parts, phase }: { parts: LogPart[]; phase: RunPhase }) {
  // Where each part's rows start in the block's stagger.
  const starts = parts.map((_, i) => parts.slice(0, i).reduce((n, part) => n + partLength(part), 0))
  const rendered = parts.map((part, i) => {
    const at = starts[i]
    if (part.kind === 'lines') return <Lines key={i} lines={part.lines} start={at} />
    if (part.kind === 'field') return <FieldFigure key={i} index={at} />
    if (part.kind === 'kinds') return <Kinds key={i} start={at} />
    return <Benchmark key={i} start={at} />
  })

  return (
    <Box
      sx={{
        '--log-pad': LOG_PAD,
        ...(phase === 'armed' && { '& [data-line]': { opacity: 0 }, '& [data-bar]': { transform: 'scaleX(0)' } }),
        ...(phase === 'playing' && {
          '& [data-line]': { animation: play(lineIn, 240, 'var(--d)') },
          '& [data-bar]': { animation: play(barGrow, 520, 'var(--d)') },
        }),
        '@media (prefers-reduced-motion: reduce)': {
          '& [data-line], & [data-bar]': { animation: 'none !important', opacity: 1, transform: 'none' },
        },
      }}
    >
      {rendered}
    </Box>
  )
}
