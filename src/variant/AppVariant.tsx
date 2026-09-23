import PageShell from '../components/PageShell.tsx'
import Hero from '../components/Hero.tsx'
import CompareTerminal from '../components/CompareTerminal.tsx'
import DiffVersusRun from '../components/DiffVersusRun.tsx'
import Features from '../components/Features.tsx'
import Cta from '../components/Cta.tsx'
import GetStarted from '../components/GetStarted.tsx'
import Faq from '../components/Faq.tsx'
import VariantSwitch from './VariantSwitch.tsx'

/**
 * Variant B of the landing page, for comparison with the page as shipped
 * (App.tsx), built from the same components.
 *
 * What changes is the opening arc. The shipped page opens with the hero,
 * then a second band that says nearly the same thing before it shows the
 * run. Here the run is in the first screen, beside the headline: what it is
 * and what it does, at once. The navy band follows as the "so what" (a diff
 * that reads as harmless, and what it actually did to access), then the
 * pink band on how, then the install section and the FAQ as the "now what",
 * and the closing band last.
 */
function AppVariant() {
  return (
    <PageShell overlay={<VariantSwitch />}>
      <Hero aside={<CompareTerminal embedded />} />
      <DiffVersusRun />
      <Features />
      <GetStarted />
      <Faq />
      <Cta />
    </PageShell>
  )
}

export default AppVariant
