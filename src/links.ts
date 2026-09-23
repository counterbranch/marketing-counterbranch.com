// The page is the whole site during the alpha: sections of it, plus the
// install destinations, which are provisional until they are published. The
// home link starts from the site's own root, which is a subpath while it is
// served from github.io (see BASE_PATH in vite.config.ts).
const root = import.meta.env.BASE_URL

export const links = {
  // Every "Get started free" button leads to the install section.
  getStarted: '#get-started',
  howItWorks: '#how-it-works',
  faq: '#faq',
  github: 'https://github.com/counterbranch',
  home: root,
  // Where each install path starts.
  agentsRecipe: 'https://github.com/counterbranch/counterbranch/blob/main/AGENTS.md',
  githubAction: 'https://github.com/marketplace/actions/counterbranch',
  gitlabCatalog: 'https://gitlab.com/explore/catalog/counterbranch/compare',
} as const
