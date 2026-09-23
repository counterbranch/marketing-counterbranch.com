import { useState } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Pagination from '@mui/material/Pagination'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import SpeedDial from '@mui/material/SpeedDial'
import SpeedDialAction from '@mui/material/SpeedDialAction'
import SpeedDialIcon from '@mui/material/SpeedDialIcon'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined'
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import SectionBlock from '../SectionBlock.tsx'
import GroupLabel from '../GroupLabel.tsx'

export default function NavigationSection() {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [page, setPage] = useState(3)
  const [bottomNav, setBottomNav] = useState('home')

  return (
    <SectionBlock id="navigation" title="Navigation" description="Wayfinding components — breadcrumbs, links, menus, pagination and app-level navigation.">
      <Stack spacing={1.5}>
        <GroupLabel>Breadcrumbs</GroupLabel>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="#navigation">
            Home
          </Link>
          <Link underline="hover" color="inherit" href="#navigation">
            Roadmap
          </Link>
          <Typography color="textPrimary">Q3 review</Typography>
        </Breadcrumbs>
      </Stack>

      <Stack spacing={1.5}>
        <GroupLabel>Link variants</GroupLabel>
        <Stack direction="row" spacing={3}>
          <Link href="#navigation" underline="hover">
            Hover underline
          </Link>
          <Link href="#navigation" underline="always">
            Always underline
          </Link>
          <Link href="#navigation" underline="none">
            No underline
          </Link>
          <Link href="#navigation" color="secondary">
            Secondary color
          </Link>
        </Stack>
      </Stack>

      <Stack spacing={1.5}>
        <GroupLabel>Menu & pagination</GroupLabel>
        <Stack direction="row" spacing={4} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Box>
            <Button
              variant="outlined"
              onClick={(event) => setMenuAnchor(event.currentTarget)}
              aria-controls={menuAnchor ? 'kitchen-sink-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={menuAnchor ? 'true' : undefined}
            >
              Open menu
            </Button>
            <Menu id="kitchen-sink-menu" anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
              <MenuItem onClick={() => setMenuAnchor(null)}>
                <EditOutlinedIcon fontSize="small" sx={{ mr: 1.5 }} />
                Rename
              </MenuItem>
              <MenuItem onClick={() => setMenuAnchor(null)}>
                <ContentCopyOutlinedIcon fontSize="small" sx={{ mr: 1.5 }} />
                Duplicate
              </MenuItem>
              <MenuItem onClick={() => setMenuAnchor(null)}>
                <ShareOutlinedIcon fontSize="small" sx={{ mr: 1.5 }} />
                Share
              </MenuItem>
            </Menu>
          </Box>
          <Pagination count={8} page={page} onChange={(_event, value) => setPage(value)} color="primary" />
        </Stack>
      </Stack>

      <Stack spacing={1.5}>
        <GroupLabel>Bottom navigation & speed dial</GroupLabel>
        <Stack direction="row" spacing={4} sx={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <Paper variant="outlined" sx={{ width: 320 }}>
            <BottomNavigation
              showLabels
              value={bottomNav}
              onChange={(_event, value: string) => setBottomNav(value)}
            >
              <BottomNavigationAction label="Home" value="home" icon={<HomeOutlinedIcon />} />
              <BottomNavigationAction label="Recents" value="recents" icon={<RestoreOutlinedIcon />} />
              <BottomNavigationAction label="Favorites" value="favorites" icon={<FavoriteOutlinedIcon />} />
              <BottomNavigationAction label="Profile" value="profile" icon={<PersonOutlinedIcon />} />
            </BottomNavigation>
          </Paper>
          <Box sx={{ position: 'relative', height: 200, width: 200 }}>
            <SpeedDial ariaLabel="Quick actions" sx={{ position: 'absolute', bottom: 16, right: 16 }} icon={<SpeedDialIcon />}>
              <SpeedDialAction icon={<EditOutlinedIcon />} title="Edit" />
              <SpeedDialAction icon={<ShareOutlinedIcon />} title="Share" />
              <SpeedDialAction icon={<ContentCopyOutlinedIcon />} title="Duplicate" />
            </SpeedDial>
          </Box>
        </Stack>
      </Stack>
    </SectionBlock>
  )
}
