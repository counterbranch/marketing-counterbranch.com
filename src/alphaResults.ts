/**
 * The alpha discovery campaign, as the site reports it: the landing page's
 * results band and the alpha test results page both read from here, so a
 * number is changed in one place.
 *
 * Every figure is measured, and published rounded. Each one is worded for what
 * it is, and the pages say what it is not:
 * - scans finished is reliability (the scan ran to the end), not accuracy;
 * - decision sites mapped is an inventory of places to look, not a count of
 *   problems;
 * - the bug count is people confirming what the map pointed at, not a
 *   detection rate. It is a count only: the projects are not named.
 */
export const campaign = {
  when: 'September 2026',
  repos: '10,000',
  languages: 9,
  languageNames: 'TypeScript, JavaScript, Python, Go, Java, Kotlin, C#, Ruby and PHP',
  scansFinished: '99%',
  sites: '200,000',
  bugs: 11,
  bugProjects: 9,
  /** Leads triaged, approximately. */
  leadsTriaged: 70,
} as const

/**
 * The field on the landing page: one square per repository, 10,000 in all.
 * The shares are the campaign's; where each square sits is illustrative.
 * Repositories with a confirmed bug are among those with decision sites.
 */
export const field = {
  columns: 100,
  rows: 100,
  /** 51% of scanned repositories had at least one decision site. */
  withSites: 0.51,
  /** Under 1% of scans did not finish. */
  unfinished: 0.005,
  /** Projects with a bug confirmed by hand. */
  confirmed: 9,
} as const

/**
 * Mapped sites by the kind of decision the scanner recognised, rounded to the
 * nearest thousand. Together they make up the 200,000+.
 */
export const siteKinds = [
  { kind: 'Role checks', count: 53_000 },
  { kind: 'Attribute checks', count: 52_000 },
  { kind: 'Custom logic', count: 47_000 },
  { kind: 'Middleware', count: 23_000 },
  { kind: 'Ownership', count: 12_000 },
  { kind: 'Route guards', count: 10_000 },
  { kind: 'Feature gates', count: 9_000 },
  { kind: 'Business rules', count: 7_000 },
] as const

/**
 * A timing-only benchmark: the median of repeated structural scans of one
 * recent checkout of each of nine open-source repositories, with the output
 * thrown away. The repositories are described by language and size only, so
 * the table cannot be read against the unnamed projects where bugs were
 * found. Lines are lines of code, rounded to the nearest thousand; seconds to
 * the nearest second; lines per second as measured, rounded to the nearest
 * hundred.
 */
export const benchmark = [
  { language: 'Go', lines: 329_000, seconds: 14, perSecond: 23_100 },
  { language: 'C#', lines: 358_000, seconds: 16, perSecond: 22_500 },
  { language: 'Python', lines: 212_000, seconds: 17, perSecond: 12_500 },
  { language: 'Go', lines: 535_000, seconds: 27, perSecond: 19_700 },
  { language: 'Java', lines: 359_000, seconds: 28, perSecond: 13_000 },
  { language: 'Ruby', lines: 224_000, seconds: 29, perSecond: 7_600 },
  { language: 'TypeScript', lines: 105_000, seconds: 33, perSecond: 3_200 },
  // Scan time follows the files walked, not only the code: this one is small
  // in code and large on disk.
  { language: 'Java', lines: 30_000, seconds: 40, perSecond: 800, largeOnDisk: true },
  { language: 'PHP', lines: 455_000, seconds: 51, perSecond: 8_900 },
] as const

/** Speed beyond the benchmark table. */
export const speed = {
  large: '14–51 s',
  small: '1–2 s',
  /** Every row but the one that is large on disk. */
  throughput: '3,000–23,000 lines/s',
  medianThroughput: '~12,000 lines/s',
  runToRun: '±3%',
  startup: '~1 s',
} as const
