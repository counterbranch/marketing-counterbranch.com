// The site during the alpha: the landing page and its sections, the alpha
// test results page, and the install destinations, which are provisional
// until they are published. Every link starts from the site's own root, which
// is a subpath while it is served from github.io (see BASE_PATH in
// vite.config.ts).
const root = import.meta.env.BASE_URL

/**
 * A section of the landing page. Rooted rather than a bare `#id`, so the same
 * link works from every page; on the landing page itself the document does not
 * change, so the browser only scrolls.
 */
export const onHome = (id: string) => `${root}#${id}`

export const links = {
  // Every "Get started free" button leads to the install section.
  getStarted: onHome('get-started'),
  howItWorks: onHome('how-it-works'),
  moreThanADiff: onHome('more-than-a-diff'),
  faq: onHome('faq'),
  alphaResults: `${root}alpha-test-results/`,
  // The teaser's "See how it works": the features section, while the How it
  // works section is not on the page.
  features: onHome('features'),
  github: 'https://github.com/counterbranch',
  home: root,
  // Where each install path starts.
  agentsRecipe: 'https://github.com/counterbranch/counterbranch/blob/main/AGENTS.md',
  githubAction: 'https://github.com/marketplace/actions/counterbranch',
  gitlabCatalog: 'https://gitlab.com/explore/catalog/counterbranch/compare',
} as const
