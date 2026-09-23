/**
 * Visually hidden but still read out: for text that only assistive
 * technology needs, and for native controls drawn by their labels instead.
 */
export const srOnly = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  margin: '-1px',
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const
