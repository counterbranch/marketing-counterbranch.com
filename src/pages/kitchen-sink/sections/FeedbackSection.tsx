import { useState } from 'react'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import type { AlertColor } from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import LinearProgress from '@mui/material/LinearProgress'
import CircularProgress from '@mui/material/CircularProgress'
import Skeleton from '@mui/material/Skeleton'
import Backdrop from '@mui/material/Backdrop'
import IconButton from '@mui/material/IconButton'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import SectionBlock from '../SectionBlock.tsx'
import GroupLabel from '../GroupLabel.tsx'

const severities: AlertColor[] = ['error', 'warning', 'info', 'success']
const alertVariants = ['standard', 'filled', 'outlined'] as const

export default function FeedbackSection() {
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [backdropOpen, setBackdropOpen] = useState(false)

  return (
    <SectionBlock id="feedback" title="Feedback" description="Alerts, transient messages, and the overlays used to interrupt or block interaction.">
      <Stack spacing={1.5}>
        <GroupLabel>Alert — severity × variant</GroupLabel>
        <Stack spacing={2}>
          {alertVariants.map((variant) => (
            <Stack key={variant} spacing={1.5}>
              {severities.map((severity) => (
                <Alert key={`${variant}-${severity}`} severity={severity} variant={variant}>
                  {`${severity} — ${variant} alert copy goes here.`}
                </Alert>
              ))}
            </Stack>
          ))}
        </Stack>
      </Stack>

      <Stack spacing={1.5}>
        <GroupLabel>Snackbar, dialog, drawer & backdrop</GroupLabel>
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={() => setSnackbarOpen(true)}>
            Trigger snackbar
          </Button>
          <Button variant="outlined" onClick={() => setDialogOpen(true)}>
            Open dialog
          </Button>
          <Button variant="outlined" onClick={() => setDrawerOpen(true)}>
            Open drawer
          </Button>
          <Button variant="outlined" onClick={() => setBackdropOpen(true)}>
            Show backdrop
          </Button>
        </Stack>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          message="Changes saved."
          action={
            <IconButton size="small" color="inherit" onClick={() => setSnackbarOpen(false)} aria-label="Close">
              <CloseOutlinedIcon fontSize="small" />
            </IconButton>
          }
        />

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>Delete this roadmap item?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This removes it from every board it appears on. Linked feedback threads stay intact.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={() => setDialogOpen(false)}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box sx={{ width: 320, p: 3 }} role="presentation">
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Item details
            </Typography>
            <Typography variant="body2" color="textSecondary">
              A drawer is used for secondary context that doesn't need a full page — filters, details panels, quick edits.
            </Typography>
          </Box>
        </Drawer>

        <Backdrop open={backdropOpen} onClick={() => setBackdropOpen(false)} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </Stack>

      <Stack spacing={1.5}>
        <GroupLabel>Tooltip</GroupLabel>
        <Stack direction="row" spacing={3}>
          <Tooltip title="Default placement">
            <Button variant="outlined">Hover me</Button>
          </Tooltip>
          <Tooltip title="Appears above" placement="top">
            <Button variant="outlined">Top</Button>
          </Tooltip>
        </Stack>
      </Stack>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={1.5}>
            <GroupLabel>Progress</GroupLabel>
            <Stack spacing={2}>
              <LinearProgress variant="determinate" value={62} />
              <LinearProgress variant="indeterminate" />
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <CircularProgress variant="determinate" value={62} />
                <CircularProgress />
              </Stack>
            </Stack>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={1.5}>
            <GroupLabel>Skeleton</GroupLabel>
            <Stack spacing={1.5}>
              <Skeleton variant="text" sx={{ fontSize: '1.5rem', width: '60%' }} />
              <Skeleton variant="rectangular" width="100%" height={80} />
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" sx={{ flex: 1 }} />
              </Stack>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </SectionBlock>
  )
}
