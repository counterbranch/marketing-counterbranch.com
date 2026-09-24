import { benchmark, siteKinds } from '../../alphaResults.ts'
import type { LogPart } from './content.ts'

/**
 * The log and its notes share these columns with the page header, so the
 * tape's edge is the headline's.
 */
export const LOG_COLUMNS = 'minmax(0, 6fr) minmax(0, 6fr)'
export const LOG_GAP = { lg: 8, xl: 12 } as const

/** The output's side padding, which a marked row bleeds through to the tape's edges. */
export const LOG_PAD = { xs: '16px', md: '24px', xl: '28px' } as const

/** Gap between arriving lines of output, in ms. */
export const LINE_STEP = 45

/**
 * How many arriving rows a part has, to stagger the parts after it: the
 * benchmark adds its header row and the comment under it.
 */
export function partLength(part: LogPart) {
  if (part.kind === 'lines') return part.lines.length
  if (part.kind === 'field') return 1
  if (part.kind === 'kinds') return siteKinds.length
  return benchmark.length + 2
}

export const logLength = (parts: LogPart[]) => parts.reduce((n, part) => n + partLength(part), 0)

/** How long a block's arrival lasts, for its last line and bar to land. */
export const logPlayMs = (parts: LogPart[]) => logLength(parts) * LINE_STEP + 700
