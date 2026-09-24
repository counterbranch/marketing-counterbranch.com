import PageShell from './components/PageShell.tsx'
import Hero from './components/Hero.tsx'
import CompareTerminal from './components/CompareTerminal.tsx'
import DiffVersusRun from './components/DiffVersusRun.tsx'
import Features from './components/Features.tsx'
import AlphaScan from './components/AlphaScan.tsx'
import FreeToRun from './components/FreeToRun.tsx'
import Cta from './components/Cta.tsx'
import GetStarted from './components/GetStarted.tsx'
import Faq from './components/Faq.tsx'

function App() {
  return (
    <PageShell>
      <Hero />
      <CompareTerminal />
      <DiffVersusRun />
      <Features />
      <AlphaScan />
      <FreeToRun />
      <GetStarted />
      <Faq />
      <Cta />
    </PageShell>
  )
}

export default App
