import { links } from './links.ts'

/**
 * The footer's directory, one group per column. To add a page (a use case,
 * a comparison), add a line to its group; to replace an in-page link with a
 * dedicated page once it exists, change only its `href`. Every entry must
 * point somewhere that exists today: the footer never links to a page that
 * has not been written.
 */
export interface FooterLink {
  label: string
  href: string
  /** Leaves the site: opens in a new tab and says so to assistive tech. */
  external?: boolean
}

export interface FooterGroup {
  heading: string
  links: FooterLink[]
}

export const footerGroups: FooterGroup[] = [
  {
    heading: 'Product',
    links: [
      { label: 'How it works', href: links.howItWorks },
      { label: 'Get started', href: links.getStarted },
      { label: 'FAQ', href: links.faq },
    ],
  },
  {
    // Each opens its stack's example in the review-vs-run exhibit until a
    // dedicated page replaces it.
    heading: 'Use cases',
    links: [
      { label: 'Custom auth', href: '#review-custom-auth' },
      { label: 'OPA and Rego', href: '#review-opa' },
      { label: 'Cedar', href: '#review-cedar' },
      { label: 'OpenFGA', href: '#review-openfga' },
    ],
  },
  {
    heading: 'Compare',
    links: [
      { label: 'vs code review', href: links.moreThanADiff },
      { label: 'vs policy tests', href: '#review-opa' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Setup recipe for agents', href: links.agentsRecipe, external: true },
      { label: 'GitHub', href: links.github, external: true },
    ],
  },
]
