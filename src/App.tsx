import Box from '@mui/material/Box'
import Header from './components/Header.tsx'
import Hero from './components/Hero.tsx'
import Features from './components/Features.tsx'
import Cta from './components/Cta.tsx'
import Footer from './components/Footer.tsx'

function App() {
  return (
    <Box>
      <Header />
      <Box component="main">
        <Hero />
        <Features />
        <Cta />
      </Box>
      <Footer />
    </Box>
  )
}

export default App
