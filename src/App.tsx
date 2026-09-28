import PageShell from './components/PageShell.tsx'
import Hero from './components/Hero.tsx'
import Features from './components/Features.tsx'

/**
 * The pre-launch teaser: the hero and what the product does (the features
 * section, alone). The full landing page's other sections, and the teaser's
 * alpha results and soft-launch sections, stay in the tree for when they
 * come back.
 */
function App() {
  return (
    <PageShell>
      <Hero />
      <Features />
    </PageShell>
  )
}

export default App
