import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import { kitchenSinkSections } from './sections.ts'

/**
 * Sticky sidebar navigation to every section, shown from md up. Below that
 * breakpoint the page uses `SectionChips` instead, which is rendered above
 * the content row rather than beside it.
 */
export default function TableOfContents() {
  return (
    <Box
      component="nav"
      aria-label="Kitchen sink sections"
      sx={{
        display: { xs: 'none', md: 'block' },
        width: 232,
        flexShrink: 0,
        alignSelf: 'flex-start',
        position: 'sticky',
        top: 56,
        maxHeight: 'calc(100vh - 56px)',
        overflowY: 'auto',
        py: 3,
        pr: 1,
        borderRight: '1px solid',
        borderColor: 'divider',
      }}
    >
      <List dense disablePadding>
        {kitchenSinkSections.map((section) => (
          <ListItemButton key={section.id} component="a" href={`#${section.id}`}>
            <ListItemText primary={section.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  )
}

/**
 * Small-screen section navigation: a horizontally scrolling chip strip. It is
 * deliberately not a sibling of the main column, because as a flex item it
 * would consume width in that row and squeeze the content.
 */
export function SectionChips() {
  return (
    <Box
      component="nav"
      aria-label="Kitchen sink sections"
      sx={{
        display: { xs: 'block', md: 'none' },
        position: 'sticky',
        top: 56,
        zIndex: 1,
        bgcolor: 'background.default',
        borderBottom: '1px solid',
        borderColor: 'divider',
        overflowX: 'auto',
        py: 1.5,
        px: 2,
      }}
    >
      <Stack direction="row" spacing={1} sx={{ width: 'max-content' }}>
        {kitchenSinkSections.map((section) => (
          <Chip
            key={section.id}
            label={section.label}
            component="a"
            href={`#${section.id}`}
            clickable
            size="small"
          />
        ))}
      </Stack>
    </Box>
  )
}
