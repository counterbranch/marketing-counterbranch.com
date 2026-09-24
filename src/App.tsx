import PageShell from './components/PageShell.tsx'
import Hero from './components/Hero.tsx'
import Features from './components/Features.tsx'
import AlphaTeaser from './components/AlphaTeaser.tsx'
import SoftLaunch from './components/SoftLaunch.tsx'

/**
 * The pre-launch teaser: the hero, what the product does (the features
 * section, alone), what the alpha campaign showed, and when the soft launch
 * is. The full landing page's other sections stay in the tree for when it
 * comes back.
 */
function App() {
  return (
    <PageShell>
      <Hero />
      <Features />
      <AlphaTeaser />
      <SoftLaunch />
    </PageShell>
  )
}

export default App
