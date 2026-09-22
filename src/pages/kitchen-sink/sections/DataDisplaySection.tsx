import { useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Badge from '@mui/material/Badge'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Table from '@mui/material/Table'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableFooter from '@mui/material/TableFooter'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import DraftsOutlinedIcon from '@mui/icons-material/DraftsOutlined'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import FaceOutlinedIcon from '@mui/icons-material/FaceOutlined'
import SectionBlock from '../SectionBlock.tsx'
import GroupLabel from '../GroupLabel.tsx'

const chipColors = ['default', 'primary', 'secondary', 'error', 'warning', 'info', 'success'] as const

const rows = [
  { feature: 'Saved views', status: 'Shipped', votes: 214 },
  { feature: 'Slack digest', status: 'In progress', votes: 168 },
  { feature: 'Bulk tagging', status: 'Planned', votes: 132 },
  { feature: 'Public roadmap', status: 'Shipped', votes: 97 },
]

const stats = [
  { label: 'Open requests', value: '128' },
  { label: 'Shipped this quarter', value: '24' },
  { label: 'Median time to triage', value: '1.4d' },
]

export default function DataDisplaySection() {
  const [dense, setDense] = useState(false)
  const [chipDeleted, setChipDeleted] = useState(false)

  return (
    <SectionBlock id="data-display" title="Data display" description="Identity, status and tabular content components.">
      <Stack spacing={1.5}>
        <GroupLabel>Avatar & badge</GroupLabel>
        <Stack direction="row" spacing={3} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Avatar>JH</Avatar>
          <Avatar sx={{ bgcolor: 'secondary.main' }}>
            <FaceOutlinedIcon fontSize="small" />
          </Avatar>
          <Avatar src="/favicon.png" alt="Counterbranch" />
          <AvatarGroup max={4}>
            <Avatar alt="Jonny">JH</Avatar>
            <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>AB</Avatar>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>CD</Avatar>
            <Avatar>EF</Avatar>
            <Avatar>GH</Avatar>
          </AvatarGroup>
          <Badge badgeContent={4} color="secondary">
            <NotificationsOutlinedIcon />
          </Badge>
          <Badge color="primary" variant="dot">
            <DraftsOutlinedIcon />
          </Badge>
        </Stack>
      </Stack>

      <Stack spacing={1.5}>
        <GroupLabel>Chip</GroupLabel>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {chipColors.map((color) => (
              <Chip key={`filled-${color}`} label={color} color={color} />
            ))}
          </Stack>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {chipColors.map((color) => (
              <Chip key={`outlined-${color}`} label={color} color={color} variant="outlined" />
            ))}
          </Stack>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            {chipDeleted ? (
              <Button size="small" onClick={() => setChipDeleted(false)}>
                Restore chip
              </Button>
            ) : (
              <Chip label="Deletable" onDelete={() => setChipDeleted(true)} />
            )}
            <Chip avatar={<Avatar>JH</Avatar>} label="With avatar" />
            <Chip icon={<FaceOutlinedIcon />} label="With icon" color="primary" variant="outlined" />
            <Chip label="Disabled" disabled />
          </Stack>
        </Stack>
      </Stack>

      <Stack spacing={1.5}>
        <GroupLabel>Divider with text</GroupLabel>
        <Box>
          <Divider>OR</Divider>
        </Box>
      </Stack>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={1.5}>
            <GroupLabel>List — icons, secondary text, dense</GroupLabel>
            <Paper variant="outlined">
              <List dense={dense}>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemIcon>
                      <InboxOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText primary="Inbox" secondary="12 unread items" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemIcon>
                      <DraftsOutlinedIcon />
                    </ListItemIcon>
                    <ListItemText primary="Drafts" secondary="3 saved" />
                  </ListItemButton>
                </ListItem>
                <Divider component="li" />
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 32, height: 32 }}>JH</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Jonny Hawley" secondary="Assigned 4 items" />
                  </ListItemButton>
                </ListItem>
              </List>
            </Paper>
            <FormControlLabel control={<Switch checked={dense} onChange={(event) => setDense(event.target.checked)} />} label="Dense" />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={1.5}>
            <GroupLabel>Stat tiles</GroupLabel>
            <Grid container spacing={2}>
              {stats.map((stat) => (
                <Grid key={stat.label} size={{ xs: 12, sm: 4, md: 12, lg: 4 }}>
                  <Paper variant="outlined" sx={{ p: 2.5 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Grid>
      </Grid>

      <Stack spacing={1.5}>
        <GroupLabel>Table — head, body, footer, hover rows</GroupLabel>
        <TableContainer component={Paper} variant="outlined">
          <Table size={dense ? 'small' : 'medium'}>
            <TableHead>
              <TableRow>
                <TableCell>Feature</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Votes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.feature} hover>
                  <TableCell>{row.feature}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      size="small"
                      color={row.status === 'Shipped' ? 'success' : row.status === 'In progress' ? 'info' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">{row.votes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2}>Total votes</TableCell>
                <TableCell align="right">{rows.reduce((sum, row) => sum + row.votes, 0)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Stack>
    </SectionBlock>
  )
}
