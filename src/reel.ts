/**
 * The word reel the hero and the closing band share: where access changes
 * happen. Kept in one place so the two headlines always roll the same words.
 */

/** Where the access changes happen. The first is what rests on screen. */
export const REEL_WORDS = [
  'PRs',
  'pipelines',
  'releases',
  'terminal',
  'code reviews',
  'agent workflows',
  'local development',
  'CLI',
] as const

/** A reel's sentence for assistive tech: every word once, joined as prose. */
export function reelSentence(lead: string) {
  const words = [...REEL_WORDS]
  const last = words.pop()
  return `${lead} ${words.join(', ')} and ${last}.`
}
