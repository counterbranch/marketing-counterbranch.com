# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Small and medium engineering teams without a dedicated security engineer. They ship through pull requests and CI, often with a coding agent in the loop, and need to know when a change alters who can access what. They find Counterbranch on this site, decide from it whether the product is real, and install the binary on a laptop or CI runner.

## Product Purpose

Counterbranch runs the same access checks against `main` and a pull request and reports which access decisions changed, what the application returned, and which checks did not finish. Success is a team catching an unintended access change before it merges, with a check it can rerun for free and get the same answer.

## Positioning

An executed, deterministic comparison of access decisions on both revisions, not an opinion on a diff. Discovery comes first: a structural scan with no model in the loop maps where code decides access, for no model-token cost. The team, or its own coding agent, chooses what to guard. The comparison then runs those checks on every change without AI.

## Operating Context

- One binary for macOS on Apple silicon and Linux x86_64, run on a laptop or CI runner. Application checks also need Docker.
- Policy engines: OPA (Rego), Cedar and OpenFGA. Access rules in application code (routes, middleware, sessions) are checked by running both versions of the app in isolated containers.
- Install paths: an AGENTS.md setup recipe for the team's coding agent, a GitHub Action, a GitLab CI/CD component, and the CLI.
- No account, no telemetry, and no network calls from the binary. Reports are JSON and Markdown files on the team's own disk.

## Capabilities and Constraints

- Alpha release, free during the alpha. Commands, options and report formats can still change.
- AI is used only during setup, in the customer's own coding agent, on the customer's own key. The comparison makes no model calls.
- Shipped as a single binary; not open source during the alpha.
- `discover` maps candidate authorization decision sites in nine languages (TypeScript, JavaScript, Java, Python, Go, C#, Kotlin, Ruby, PHP). It reports locations, not verdicts, and never executes the scanned code.
- A check that cannot run is reported as INCOMPLETE, never as a pass.

## Brand Commitments

- Name: Counterbranch, one word, capital C. Legal line: "© 2026 DUVATL, Inc. Counterbranch™ is a trademark of DUVATL, Inc." No ®.
- Voice: plain, factual, short sentences. Every claim matches the shipped product, and limits sit beside the claims they qualify.
- Simple, conventional product-page structure: short, scannable sections in plain language.
- No founder names and no named customers or early users yet. The footer links only to pages that exist.

## Evidence on Hand

Alpha discovery campaign, September 2026. Measured; the site publishes rounded figures only.

- 10,000+ public open-source repositories scanned; 99%+ of scans completed. That is scan reliability, not accuracy.
- 200,000+ authorization decision sites mapped. That is an inventory of places to look, not a count of vulnerabilities. About half of the repositories contain at least one site.
- No model tokens spent on discovery.
- 11 real access-control bugs confirmed by hand in 9 projects. Public copy gives the count only: no project names and no bug descriptions.
- Scan time 14–51 seconds for a large repository in the benchmark and 1–2 seconds for a small one; median throughput around 12,000 lines per second, depending on language. A nine-repository timing benchmark.
- Mapped sites by category: role-based, attribute-based, custom, middleware, ownership, route, feature gate, business rule.

Absent, and never to be fabricated: customer results, testimonials, comparisons with other tools, accuracy or precision rates, timings on customer code, pricing.

## Product Principles

1. Prove, don't claim. Every number is measured, and says what it is not.
2. Deterministic first. AI only where judgment is needed, on the team's own key.
3. Small teams first. Nothing should need a security engineer.
4. Honest about gaps. Incomplete is never a pass.

## Accessibility & Inclusion

WCAG AA contrast in both colour schemes, reduced motion respected, and every figure available to keyboard and screen reader users as text.
