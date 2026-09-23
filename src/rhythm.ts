/**
 * The page's vertical rhythm, in theme spacing units (8px). Named by the
 * relationship each interval expresses rather than by size, and each level is
 * clearly tighter than the one above it, so whitespace alone says whether the
 * next thing is a new band, the same band continuing, the next item of a
 * list, or a heading's own copy.
 */
export const rhythm = {
  /** A band's padding above and below its content. */
  section: { xs: 12, md: 16 },
  /** Either side of the rule that opens a second part of the same band. */
  subsection: { xs: 8, md: 10 },
  /** From a heading and its line to the content they introduce. */
  intro: { xs: 5, md: 7 },
  /** Above and below each row of a list, inside its rules. */
  row: { xs: 4, md: 5 },
  /** From a heading to its own line of copy. */
  heading: 2.5,
  /**
   * The same, under a display heading at the hero's scale (the hero and the
   * closing band), whose size needs a wider gap to read as one step.
   */
  display: { xs: 3, md: 4 },
} as const
