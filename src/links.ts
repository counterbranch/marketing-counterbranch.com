// Provisional destinations — confirm real routes/URLs before launch. Site
// paths start from the site's own root, which is a subpath while it is served
// from github.io (see BASE_PATH in vite.config.ts).
const root = import.meta.env.BASE_URL

export const links = {
  docs: `${root}docs`,
  pricing: `${root}pricing`,
  login: `${root}login`,
  getStarted: `${root}signup`,
  howItWorks: '#how-it-works',
  github: 'https://github.com/counterbranch',
  contact: 'mailto:hello@counterbranch.com',
  home: root,
} as const
