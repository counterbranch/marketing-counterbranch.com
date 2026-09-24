import SiteTheme from './SiteTheme.tsx'
import AlphaResults from './pages/AlphaResults.tsx'

/**
 * The alpha test results page inside its theme, rendered by both its browser
 * entry and the build-time prerender, like AppRoot for the landing page.
 */
export default function AlphaResultsRoot() {
  return (
    <SiteTheme>
      <AlphaResults />
    </SiteTheme>
  )
}
