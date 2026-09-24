---
version: 1
slug: "src-pages-alpharesults-tsx"
primary_target: "src/pages/AlphaResults.tsx"
related_targets: []
---

# Alpha test results page

Scope: `/alpha-test-results/`, linked from the footer (Resources) and the landing page's results band. Visitor mode: Read. Audience: engineers on small teams evaluating Counterbranch, plus search engines and AI agents that index and quote it. Job: understand what the alpha campaign measured, believe it because every number carries its limit, then try it. Content: the rounded, measured figures in `src/alphaResults.ts` only; bug count only, no project names or bug descriptions. Constraints: fully prerendered HTML, question headings, one data source for page, structured data and the Markdown mirror.

## Direction contract

THESIS: The page is the campaign's own discover run, printed as one continuous annotated terminal log. Every block answers a reader's question and carries its claim and its limit. It refuses the category default: a hero of four big numbers over a row of same-size trust cards.

OWN-WORLD: The incumbent Counterbranch world, unchanged: cyan flood header (near-black in dark), one ink terminal tape in the system mono (raised paper in dark) with the only rounded corners, Oswald caps questions, Inter body, cyan tint for measured key lines, the warning hue for unfinished, pink only for confirmed bugs, ink highlighter plates for why it matters, squares as the unit of every figure.

STORY: A reader learns what ran, whether it held up, how much access code exists, how fast and cheap it is, whether it found real bugs, what it means for their team and what it does not show. They trust it because each result states what it is not, then get started free.

FIRST VIEWPORT: Cyan band on the page grid: breadcrumb, H1 at display scale across the left six columns, answer-first dek and date line. From lg the right six columns hold the run's closing status line on an ink plate above the question index. The log's tape overlaps the band's lower edge, so its title bar is in the first screen.

FORM: Annotated scan log, position 3 on the ranked list, fused with reader-question headings and claim-with-limit annotations at the founder's request. Seed aa4ef8ff. Signature interaction: a sticky terminal title bar that names the block being read, each block's output sticky beside its notes from lg, and each block's output arriving once as it enters view. Below lg every block is its own window of the same run.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Whether the footer entry should become its own column.
