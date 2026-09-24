import SiteTheme from './SiteTheme.tsx'
import App from './App.tsx'

/**
 * The landing page inside its theme. The browser entry and the build-time
 * prerender both render exactly this, so the hydrating tree always matches
 * the HTML it takes over.
 */
export default function AppRoot() {
  return (
    <SiteTheme>
      <App />
    </SiteTheme>
  )
}
