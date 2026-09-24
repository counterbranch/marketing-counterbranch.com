import { benchmark, campaign, siteKinds, speed } from '../../alphaResults.ts'

/**
 * The alpha test results page as data: its header, then one block of the
 * scan log per reader question. The page, its structured data and its
 * Markdown copy for agents are all built from this, so the three never say
 * different things.
 *
 * Each block answers its question in its first sentence, shows the log
 * output that backs the answer, says why it matters and what it is not.
 */

export const published = { iso: '2026-09-24', label: '24 September 2026' } as const

export const pagePath = 'alpha-test-results/'
export const canonicalUrl = 'https://counterbranch.com/alpha-test-results/'
export const markdownPath = 'alpha-test-results.md'

export const header = {
  title: 'Alpha test results: 10,000 repos, one scan log.',
  /** The title as a search result or a card shows it. */
  shortTitle: 'Alpha test results',
  dek: `In ${campaign.when} we ran Counterbranch’s discovery scan on more than ${campaign.repos} public repositories. More than ${campaign.scansFinished} of scans finished. It mapped over ${campaign.sites} places where code decides access without a single model call, and it led us to ${campaign.bugs} real access-control bugs, each confirmed by hand. Below is the run, block by block, with what each result means and what it doesn’t.`,
  /** The run's closing status line, as the header's plate shows it. */
  status: [
    { value: `${campaign.repos}+`, label: 'repositories' },
    { value: `${campaign.scansFinished}+`, label: 'finished' },
    { value: `${campaign.sites}+`, label: 'decisions mapped' },
    { value: '0', label: 'model tokens' },
    { value: String(campaign.bugs), label: 'bugs confirmed by hand' },
  ],
} as const

/** How a log line is marked: measured, unfinished, or a confirmed bug, as on the rest of the site. */
export type Tone = 'measured' | 'unfinished' | 'confirmed'

export type LogLine =
  | { kind: 'comment'; text: string }
  | { kind: 'command'; program: string; args: string; note?: string }
  | {
      kind: 'field'
      label: string
      value: string
      note?: string
      tone?: Tone
      setAside?: boolean
      /** Squares drawn under the value, one per item, in the line's tone. */
      marks?: number
    }

export type LogPart =
  | { kind: 'lines'; lines: LogLine[] }
  /** The campaign's field of squares, one per repository. */
  | { kind: 'field' }
  | { kind: 'kinds' }
  | { kind: 'benchmark' }

export interface Block {
  /** The section's anchor. */
  id: string
  /** What the terminal's title bar names while this block is read. */
  tab: string
  question: string
  /** The answer, first sentence first. */
  answer: string
  log: LogPart[]
  why: string
  isnt?: string
  /** Ends with the page's actions. */
  actions?: boolean
}

const lines = (...entries: LogLine[]): LogPart => ({ kind: 'lines', lines: entries })

export const blocks: Block[] = [
  {
    id: 'what-we-ran',
    tab: 'the run',
    question: 'What did we run, and on what?',
    answer: `Counterbranch’s discover command, on more than ${campaign.repos} public open-source repositories. Each one was fetched, scanned and deleted, with no setup for any of them and no model in the loop.`,
    log: [
      lines(
        { kind: 'comment', text: `alpha campaign, ${campaign.when}` },
        { kind: 'command', program: 'counterbranch discover', args: '--source ./repo --revision "$SHA" …' },
        { kind: 'field', label: 'repositories', value: `${campaign.repos}+`, note: 'public, open source' },
        { kind: 'field', label: 'reads', value: campaign.languageNames },
        { kind: 'field', label: 'per repository', value: 'fetch, scan, delete', note: 'only the report is kept' },
        { kind: 'field', label: 'setup', value: 'none' },
        { kind: 'field', label: 'model calls', value: '0', tone: 'measured' },
        { kind: 'comment', text: 'one square per repository' },
      ),
      { kind: 'field' },
    ],
    why: 'It ran on real code, not a demo: generated files, vendored libraries and repositories hundreds of thousands of lines long, with nothing tuned per repository.',
    isnt: 'It isn’t your code. These are open-source repositories, and a run on your own repository replaces every number here with yours.',
  },
  {
    id: 'did-the-scans-finish',
    tab: 'completion',
    question: 'Did the scans finish?',
    answer: `More than ${campaign.scansFinished} of them did. Fewer than 1 in 100 repositories didn’t finish a scan.`,
    log: [
      lines(
        { kind: 'field', label: 'attempted', value: '10,100+' },
        { kind: 'field', label: 'finished', value: `${campaign.scansFinished}+`, tone: 'measured' },
        { kind: 'field', label: 'didn’t finish', value: 'under 1%', tone: 'unfinished' },
      ),
    ],
    why: 'A guard that falls over on unusual repositories can’t sit in CI. Discover always writes a report, and an unfinished scan says so rather than looking like a clean one.',
    isnt: 'It isn’t accuracy. 99% is how often a scan ran to the end; a finished scan is a map, not a verdict.',
  },
  {
    id: 'how-much-access-code',
    tab: 'coverage',
    question: 'How much access-control code is out there?',
    answer: `More than ${campaign.sites} access decisions across the repositories we scanned. About half the repositories (51%) had at least one, and those had around 40 each.`,
    log: [
      lines(
        { kind: 'field', label: 'with decisions', value: '51%', note: 'of repositories' },
        { kind: 'field', label: 'per repository', value: '~40', note: 'where present' },
        { kind: 'field', label: 'mapped', value: `${campaign.sites}+`, note: 'access decisions', tone: 'measured' },
        { kind: 'comment', text: 'by the kind of decision, one square for about 2,000' },
      ),
      { kind: 'kinds' },
    ],
    why: 'Access decisions are everywhere, and scattered. Two in five of those mapped are custom logic, middleware, route guards or business rules, written into application code. You can’t guard what you can’t find.',
    isnt: `It isn’t a list of problems. A mapped decision is a place to look: ${campaign.sites} decisions is an inventory, not ${campaign.sites} bugs.`,
  },
  {
    id: 'how-fast-is-it',
    tab: 'timing',
    question: 'How fast is it?',
    answer: 'Fast enough for every pull request. Large repositories took 14 to 51 seconds in our timing benchmark and small ones 1 to 2 seconds, at a median of about 12,000 lines of code a second.',
    log: [
      lines(
        {
          kind: 'command',
          program: 'time counterbranch discover',
          args: '…',
          note: 'median of repeated runs, output thrown away',
        },
        { kind: 'comment', text: 'nine open-source repositories, one checkout each, timing only' },
      ),
      { kind: 'benchmark' },
      lines(
        { kind: 'field', label: 'small repos', value: speed.small },
        {
          kind: 'field',
          label: 'throughput',
          value: speed.throughput,
          note: `median ${speed.medianThroughput}, excluding *`,
          tone: 'measured',
        },
        { kind: 'field', label: 'run to run', value: `within ${speed.runToRun}` },
        { kind: 'field', label: 'start-up', value: `${speed.startup} per scan` },
      ),
    ],
    why: 'A scan that takes seconds can run on every change instead of once a quarter. The fixed start-up cost favours one scan of the whole repository over many small ones.',
    isnt: 'It isn’t your code or your hardware: the benchmark times nine open-source repositories on our machines, for speed only. Go and C# scan fastest, TypeScript, PHP and Ruby slower, and a repository that is large on disk takes longer than its line count suggests.',
  },
  {
    id: 'what-did-it-cost',
    tab: 'cost',
    question: 'What did it cost to run?',
    answer: `Nothing in model tokens. Discovery is a structural scan, so mapping ${campaign.repos}+ repositories made no model calls at all, and the same code gives the same map every time.`,
    log: [
      lines(
        { kind: 'field', label: 'model calls', value: '0' },
        { kind: 'field', label: 'model tokens', value: '0', tone: 'measured' },
        { kind: 'field', label: 'rerun', value: 'same code, same map' },
      ),
    ],
    why: 'Mapping a whole codebase costs no tokens, so the map can be redrawn whenever the code changes. AI is kept for the one step that needs judgment, drafting checks, and that runs in your own agent on your own key.',
    isnt: 'It isn’t free all the way down. Zero is for discovery and the comparison; when your coding agent drafts checks, it uses your model and your tokens.',
  },
  {
    id: 'did-it-find-real-bugs',
    tab: 'bugs',
    question: 'Did it find real bugs?',
    answer: `Yes: ${campaign.bugs} real access-control bugs in ${campaign.bugProjects} open-source projects. Discovery pointed at the code, about ${campaign.leadsTriaged} of the most likely leads were triaged, and each of the ${campaign.bugs} was confirmed by hand.`,
    log: [
      lines(
        { kind: 'field', label: 'mapped', value: `${campaign.sites}+`, note: 'access decisions' },
        { kind: 'field', label: 'triaged', value: `~${campaign.leadsTriaged}`, note: 'most likely leads' },
        { kind: 'field', label: 'set aside', value: 'the rest', note: 'not confirmed', setAside: true },
        {
          kind: 'field',
          label: 'confirmed',
          value: `${campaign.bugs} bugs`,
          note: `in ${campaign.bugProjects} projects, by hand`,
          tone: 'confirmed',
          marks: campaign.bugs,
        },
      ),
    ],
    why: `The map points at real risk. It narrows ${campaign.sites} decisions to a short list worth a person’s time, and a person decides.`,
    isnt: 'It isn’t a detection rate: most of the map was never meant to be read as a list of suspects, and nothing counted until a person confirmed it. We aren’t naming the projects before their maintainers have had the chance to fix them.',
  },
  {
    id: 'what-it-means-for-your-team',
    tab: 'your team',
    question: 'What does this mean for your team?',
    answer: 'You can map where your code decides access without a security engineer or a model bill, choose the decisions worth guarding, and have Counterbranch check them on every pull request.',
    log: [
      lines(
        { kind: 'comment', text: 'map: where your code decides access' },
        { kind: 'command', program: 'counterbranch discover', args: '…' },
        { kind: 'field', label: 'model calls', value: '0', tone: 'measured' },
        { kind: 'comment', text: 'choose: your agent drafts checks from our AGENTS.md recipe; you approve them' },
        { kind: 'field', label: 'model calls', value: 'your agent, your key' },
        { kind: 'comment', text: 'compare: the same checks on main and your change, on every pull request' },
        { kind: 'command', program: 'counterbranch run', args: '--repository . --base main --head your-branch' },
        { kind: 'field', label: 'model calls', value: '0', tone: 'measured' },
      ),
    ],
    why: 'Deterministic where it runs often, AI only where judgment helps, and free during the alpha.',
    isnt: 'It isn’t a replacement for review. Counterbranch compares the decisions your checks cover and reports how many it covered; a path with no check isn’t compared.',
    actions: true,
  },
  {
    id: 'what-this-doesnt-show',
    tab: 'limits',
    question: 'What doesn’t this show yet?',
    answer: 'How it does on your code. These results come from open-source repositories, our machines and the nine languages discovery reads.',
    log: [
      lines(
        { kind: 'comment', text: 'not measured yet' },
        { kind: 'comment', text: '  your repositories, on your hardware' },
        { kind: 'comment', text: '  languages beyond the nine, such as Rust, C, C++ and Swift' },
        { kind: 'comment', text: '  an accuracy or detection rate' },
        { kind: 'comment', text: '  a head-to-head comparison with other tools' },
      ),
    ],
    why: 'Numbers without their limits are marketing. The quickest way past these is a run on your own repository.',
  },
]

// ---------------------------------------------------------------------------
// Plain text of the log, for the Markdown copy and the structured data.

const LABEL_WIDTH = 16

const pad = (text: string, width: number) => text + ' '.repeat(Math.max(1, width - text.length))

const thousands = (n: number) => `${Math.round(n / 1000)}k`

function lineText(line: LogLine) {
  if (line.kind === 'comment') return `# ${line.text}`
  if (line.kind === 'command') return `$ ${line.program} ${line.args}${line.note ? `   # ${line.note}` : ''}`
  const value = `${line.value}${line.note ? `   ${line.note}` : ''}`
  return `  ${pad(line.label, LABEL_WIDTH)}${value}${line.setAside ? '   (set aside)' : ''}`
}

function partText(part: LogPart): string[] {
  if (part.kind === 'lines') return part.lines.map(lineText)
  if (part.kind === 'field') {
    return [
      '  [10,000 squares: about half with access decisions found, under 1% unfinished, 9 with a bug confirmed by hand]',
    ]
  }
  if (part.kind === 'kinds') {
    return siteKinds.map(
      ({ kind, count }) =>
        `  ${pad(kind.toLowerCase(), LABEL_WIDTH)}${'■'.repeat(Math.round(count / 2000))} ~${count.toLocaleString('en-US')}`,
    )
  }
  return [
    `  ${pad('language', 12)}${pad('lines', 7)}${pad('time', 6)}lines/s`,
    ...benchmark.map(
      (row) =>
        `  ${pad(`${row.language}${'largeOnDisk' in row ? '*' : ''}`, 12)}${pad(thousands(row.lines), 7)}${pad(`${row.seconds} s`, 6)}${row.perSecond.toLocaleString('en-US')}`,
    ),
    '# * small in code, large on disk: scan time follows the files walked',
  ]
}

export const blockLogText = (block: Block) => block.log.flatMap(partText).join('\n')

/** The page as Markdown, served beside it for agents and linked from llms.txt. */
export function alphaResultsMarkdown(siteUrl: string) {
  const out = [
    `# ${header.title}`,
    '',
    `Published ${published.label} by Counterbranch. Measured figures, rounded.`,
    '',
    header.dek,
    '',
    '## At a glance',
    '',
    ...header.status.map(({ value, label }) => `- ${value} ${label}`),
    '',
  ]
  for (const block of blocks) {
    out.push(`## ${block.question}`, '', block.answer, '', '```text', blockLogText(block), '```', '')
    if (block.log.some((part) => part.kind === 'benchmark')) {
      out.push(
        '| Language | Lines of code | Median scan | Lines per second |',
        '| --- | --- | --- | --- |',
        ...benchmark.map(
          (row) =>
            `| ${row.language}${'largeOnDisk' in row ? ' (large on disk)' : ''} | ${row.lines.toLocaleString('en-US')} | ${row.seconds} s | ${row.perSecond.toLocaleString('en-US')} |`,
        ),
        '',
        'Timing only, on nine open-source repositories described by language and size.',
        '',
      )
    }
    out.push(`**Why it matters.** ${block.why}`, '')
    if (block.isnt) out.push(`**What it isn’t.** ${block.isnt}`, '')
  }
  out.push(
    '## Try it',
    '',
    `Counterbranch is a free alpha: one binary, no account, no telemetry. Get started at ${siteUrl}#get-started.`,
    '',
  )
  return out.join('\n')
}

/**
 * Structured data for search engines and agents: the article, its questions
 * and answers exactly as the page shows them, and where it sits in the site.
 */
export function alphaResultsJsonLd() {
  const site = 'https://counterbranch.com/'
  const publisher = {
    '@type': 'Organization',
    '@id': `${site}#organization`,
    name: 'Counterbranch',
    legalName: 'DUVATL, Inc.',
    url: site,
    logo: `${site}favicon.png`,
  }
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        '@id': `${canonicalUrl}#article`,
        headline: header.title,
        description: header.dek,
        datePublished: published.iso,
        dateModified: published.iso,
        inLanguage: 'en',
        url: canonicalUrl,
        mainEntityOfPage: canonicalUrl,
        image: `${site}og-image.png`,
        author: publisher,
        publisher,
        about: {
          '@type': 'SoftwareApplication',
          name: 'Counterbranch',
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'macOS, Linux',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Free during the alpha' },
        },
        hasPart: blocks.map((block) => ({
          '@type': 'WebPageElement',
          name: block.question,
          url: `${canonicalUrl}#${block.id}`,
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonicalUrl}#questions`,
        url: canonicalUrl,
        mainEntity: blocks.map((block) => ({
          '@type': 'Question',
          name: block.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: [block.answer, `Why it matters: ${block.why}`, block.isnt ? `What it isn’t: ${block.isnt}` : '']
              .filter(Boolean)
              .join(' '),
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Counterbranch', item: site },
          { '@type': 'ListItem', position: 2, name: header.shortTitle, item: canonicalUrl },
        ],
      },
    ],
  }
}
