import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { MONO_FONT } from './DiffVersusRun.tsx'
import { displayFont } from '../theme.ts'
import { useArrivalPhase } from '../hooks/useArrivalPhase.ts'
import {
  drawLine,
  motionEasing,
  nodeIn,
  stampIn,
  type RunPhase,
} from '../motion.ts'

/**
 * Branch graphs: the product's name drawn as git history. Square nodes and
 * square-ended strokes, because the site has no rounded shapes outside its
 * macOS windows. Each graph draws itself once, the first time it is on
 * screen: nodes appear, branches draw from where they start, and the plates
 * at their ends stamp in. The first render is the finished graph, so the
 * prerendered page, visitors without JavaScript and reduced motion all see
 * it whole.
 */

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'

/** How long a branch takes to draw, whatever its length. */
const DRAW_MS = 700

/** Share of a graph that must be on screen before it draws. */
const THRESHOLD = 0.45

/** How long a node or plate takes to appear. */
const POP_MS = 240

/** Slack after a graph's last part has arrived before it settles. */
const SETTLE_SLACK = 60

const STROKE = 6
const NODE = 16

/**
 * Label sizes in viewBox units. The fork graph is full width (up to 640)
 * below lg and about 630 wide beside its heading from lg; the merge graph is
 * only shown from md, in a column 330 to 450 wide.
 */
const FORK_LABEL = { xs: 20, sm: 16, lg: 14 }
const MERGE_LABEL = { xs: 20, md: 22, lg: 18 }

/** A stroke that draws from its start. `pathLength` makes every line one unit long. */
function Branch({
  phase,
  d,
  color,
  delay,
  dashed = false,
}: {
  phase: RunPhase
  d: string
  color: string
  delay: number
  dashed?: boolean
}) {
  return (
    <Box
      component="path"
      d={d}
      pathLength={1}
      fill="none"
      stroke={color}
      strokeWidth={dashed ? 2 : STROKE}
      strokeLinejoin="miter"
      sx={{
        // Any scale happens about the line's own centre, not the viewBox's.
        transformBox: 'fill-box',
        transformOrigin: 'center',
        // A dashed line cannot also draw through its dash array, so it
        // arrives in place instead.
        strokeDasharray: dashed ? '0.02 0.02' : 1,
        strokeDashoffset: 0,
        ...(phase === 'armed' && (dashed ? { opacity: 0 } : { strokeDashoffset: 1 })),
        ...(phase === 'playing' && {
          animation: dashed
            ? `${nodeIn} ${POP_MS}ms ${motionEasing.decel} ${delay}ms both`
            : `${drawLine} ${DRAW_MS}ms ${motionEasing.decel} ${delay}ms both`,
        }),
        [REDUCED_MOTION]: { animation: 'none', strokeDashoffset: 0, opacity: 1 },
      }}
    />
  )
}

/** A square commit node, centred on (x, y). */
function Node({
  phase,
  x,
  y,
  fill,
  delay,
}: {
  phase: RunPhase
  x: number
  y: number
  fill: string
  delay: number
}) {
  return (
    <Box
      component="rect"
      x={x - NODE / 2}
      y={y - NODE / 2}
      width={NODE}
      height={NODE}
      fill={fill}
      sx={popSx(phase, delay)}
    />
  )
}

/** Appears in place, scaling from its own centre. */
function popSx(phase: RunPhase, delay: number, frames = nodeIn) {
  return {
    transformBox: 'fill-box',
    transformOrigin: 'center',
    ...(phase === 'armed' && { opacity: 0 }),
    ...(phase === 'playing' && {
      animation: `${frames} ${POP_MS}ms ${motionEasing.decel} ${delay}ms both`,
    }),
    [REDUCED_MOTION]: { animation: 'none', opacity: 1, transform: 'none' },
  }
}

/** A decision or step as a filled plate with its word set in the display face. */
function Plate({
  phase,
  x,
  y,
  width,
  fill,
  ink,
  delay,
  children,
}: {
  phase: RunPhase
  x: number
  y: number
  width: number
  fill: string
  ink: string
  delay: number
  children: string
}) {
  const height = 44
  return (
    <Box component="g" sx={popSx(phase, delay, stampIn)}>
      <rect x={x} y={y} width={width} height={height} fill={fill} />
      <text
        x={x + width / 2}
        y={y + height / 2}
        dy="0.36em"
        textAnchor="middle"
        fill={ink}
        style={{
          fontFamily: displayFont,
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: '0.07em',
        }}
      >
        {children}
      </text>
    </Box>
  )
}

/**
 * A branch or chip label, in the terminal's face. Graphs scale with their
 * width, so each graph gives its labels a size in viewBox units per
 * breakpoint that renders at roughly 11 to 14px wherever it sits.
 */
type LabelSize = { xs: number; sm?: number; md?: number; lg?: number }

function Label({
  x,
  y,
  fill,
  size,
  children,
  anchor = 'start',
}: {
  x: number
  y: number
  fill: string
  size: LabelSize
  children: ReactNode
  anchor?: 'start' | 'middle'
}) {
  return (
    <Box
      component="text"
      x={x}
      y={y}
      textAnchor={anchor}
      fill={fill}
      sx={{ fontFamily: MONO_FONT, fontSize: size }}
    >
      {children}
    </Box>
  )
}

/**
 * The figure that holds a graph and watches for it coming into view.
 * `playMs` is when its last part has arrived.
 */
function GraphFrame({
  label,
  viewBox,
  maxWidth,
  playMs,
  children,
}: {
  label: string
  viewBox: string
  maxWidth: number
  playMs: number
  children: (phase: RunPhase) => ReactNode
}) {
  const { ref, phase } = useArrivalPhase<HTMLElement>(THRESHOLD, playMs)
  return (
    <Box ref={ref} component="figure" sx={{ m: 0, width: '100%', maxWidth }}>
      <Box
        component="svg"
        viewBox={viewBox}
        role="img"
        aria-label={label}
        sx={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible' }}
      >
        {/* The label names the whole graph; its own text is not read again. */}
        <g aria-hidden="true">{children(phase)}</g>
      </Box>
    </Box>
  )
}

/**
 * `main` and `pr-142` leave the same commit. The same check runs on both
 * (the dashed rung between them) and each branch ends in its decision: DENY
 * on main, ALLOW on pr-142. For the navy band, so its inks are the band's.
 */
export function ForkGraph() {
  const palette = useTheme().vars.palette
  const band = palette.bands.navy
  const pink = palette.secondary.main
  const cyan = palette.primary.main
  return (
    <GraphFrame
      label="main and pr-142 branch from the same commit. The same check runs against both: main denies it, pr-142 allows it."
      viewBox="0 0 640 240"
      maxWidth={640}
      // The ALLOW plate is the last to arrive.
      playMs={1100 + POP_MS + SETTLE_SLACK}
    >
      {(phase) => (
        <>
          <Branch phase={phase} d="M 36 56 H 470" color={band.ink} delay={120} />
          <Branch phase={phase} d="M 34 62 L 150 178 H 470" color={pink} delay={120} />
          <Branch phase={phase} d="M 322 72 V 162" color={cyan} delay={640} dashed />
          <Box component="g" sx={popSx(phase, 700)}>
            <rect x={252} y={100} width={140} height={34} fill={cyan} />
            <Label
              x={322}
              y={124}
              fill={palette.primary.contrastText}
              size={FORK_LABEL}
              anchor="middle"
            >
              same check
            </Label>
          </Box>
          <Node phase={phase} x={28} y={56} fill={cyan} delay={0} />
          <Node phase={phase} x={470} y={56} fill={band.ink} delay={820} />
          <Node phase={phase} x={470} y={178} fill={pink} delay={820} />
          <Label x={50} y={40} fill={band.inkMuted} size={FORK_LABEL}>
            main
          </Label>
          <Label x={172} y={208} fill={band.inkMuted} size={FORK_LABEL}>
            pr-142
          </Label>
          <Plate
            phase={phase}
            x={496}
            y={34}
            width={140}
            fill={band.ink}
            ink={band.background}
            delay={900}
          >
            DENY
          </Plate>
          <Plate
            phase={phase}
            x={496}
            y={156}
            width={140}
            fill={pink}
            ink={palette.secondary.contrastText}
            delay={1100}
          >
            ALLOW
          </Plate>
        </>
      )}
    </GraphFrame>
  )
}

/**
 * Where Counterbranch sits: your next PR leaves main, passes through the
 * compare step, and only then merges back. For the cyan flood, drawn in its
 * ink, with the compare step as an ink plate like the hero's reel window.
 */
export function MergeGraph() {
  const flood = useTheme().vars.palette.flood
  return (
    <GraphFrame
      label="Your next PR branches from main and passes through a compare step before it merges back into main."
      viewBox="0 0 560 300"
      maxWidth={520}
      // The merge line is the last to finish drawing, just after its node.
      playMs={1120 + DRAW_MS + SETTLE_SLACK}
    >
      {(phase) => (
        <>
          <Branch phase={phase} d="M 0 250 H 560" color={flood.ink} delay={0} />
          <Branch phase={phase} d="M 66 244 L 156 154 H 300" color={flood.ink} delay={260} />
          <Branch phase={phase} d="M 440 154 L 530 244" color={flood.ink} delay={1120} />
          <Node phase={phase} x={60} y={250} fill={flood.ink} delay={120} />
          <Node phase={phase} x={536} y={250} fill={flood.ink} delay={1560} />
          <Label x={160} y={138} fill={flood.inkMuted} size={MERGE_LABEL}>
            your next PR
          </Label>
          <Label x={8} y={286} fill={flood.inkMuted} size={MERGE_LABEL}>
            main
          </Label>
          <Plate
            phase={phase}
            x={300}
            y={132}
            width={140}
            fill={flood.plate}
            ink={flood.plateInk}
            delay={960}
          >
            COMPARE
          </Plate>
        </>
      )}
    </GraphFrame>
  )
}
