import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import TopBar from './kitchen-sink/TopBar.tsx'
import TableOfContents, { SectionChips } from './kitchen-sink/TableOfContents.tsx'
import TypographySection from './kitchen-sink/sections/TypographySection.tsx'
import PaletteSection from './kitchen-sink/sections/PaletteSection.tsx'
import ButtonsSection from './kitchen-sink/sections/ButtonsSection.tsx'
import InputsSection from './kitchen-sink/sections/InputsSection.tsx'
import FeedbackSection from './kitchen-sink/sections/FeedbackSection.tsx'
import SurfacesSection from './kitchen-sink/sections/SurfacesSection.tsx'
import DataDisplaySection from './kitchen-sink/sections/DataDisplaySection.tsx'
import NavigationSection from './kitchen-sink/sections/NavigationSection.tsx'
import LayoutSection from './kitchen-sink/sections/LayoutSection.tsx'

/**
 * Internal-only component showcase for reviewing/restyling every commonly
 * used MUI component against the brand theme. Reachable at /kitchen-sink.html,
 * not linked from the public site. See src/pages/kitchen-sink/ for the
 * section registry, shared layout pieces and each section's content.
 */
export default function KitchenSink() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <TopBar />
      <SectionChips />
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <TableOfContents />
        <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
          <TypographySection />
          <Divider />
          <PaletteSection />
          <Divider />
          <ButtonsSection />
          <Divider />
          <InputsSection />
          <Divider />
          <FeedbackSection />
          <Divider />
          <SurfacesSection />
          <Divider />
          <DataDisplaySection />
          <Divider />
          <NavigationSection />
          <Divider />
          <LayoutSection />
        </Box>
      </Box>
    </Box>
  )
}
