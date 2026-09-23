import { useState } from 'react'
import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Button from '@mui/material/Button'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import SectionBlock from '../SectionBlock.tsx'
import GroupLabel from '../GroupLabel.tsx'

const elevations = [0, 1, 3, 8, 16] as const
const steps = ['Account details', 'Team setup', 'Confirm & invite']

function TabPanel({ index, value, children }: { index: number; value: number; children: ReactNode }) {
  if (index !== value) return null
  return (
    <Box sx={{ py: 2 }} role="tabpanel">
      {children}
    </Box>
  )
}

export default function SurfacesSection() {
  const [tab, setTab] = useState(0)
  const [scrollableTab, setScrollableTab] = useState(0)
  const [activeStep, setActiveStep] = useState(1)

  return (
    <SectionBlock id="surfaces" title="Surfaces" description="Containers and the chrome around content — elevation, cards, expandable panels, tabs and step flows.">
      <Stack spacing={1.5}>
        <GroupLabel>Paper — elevation & outlined</GroupLabel>
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
          {elevations.map((elevation) => (
            <Paper key={elevation} elevation={elevation} sx={{ p: 2, width: 120, textAlign: 'center' }}>
              <Typography variant="body2">{elevation}</Typography>
            </Paper>
          ))}
          <Paper variant="outlined" sx={{ p: 2, width: 120, textAlign: 'center' }}>
            <Typography variant="body2">outlined</Typography>
          </Paper>
        </Stack>
      </Stack>

      <Stack spacing={1.5}>
        <GroupLabel>Card</GroupLabel>
        <Card variant="outlined" sx={{ maxWidth: 320 }}>
          <CardMedia
            component="div"
            sx={(theme) => ({
              height: 140,
              background: `linear-gradient(135deg, ${theme.vars.palette.primary.main}, ${theme.vars.palette.secondary.main})`,
            })}
          />
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Q3 roadmap review
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Three feature requests are trending — see what customers have been asking for this quarter.
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small">Share</Button>
            <Button size="small" color="primary">
              Open
            </Button>
          </CardActions>
        </Card>
      </Stack>

      <Stack spacing={1.5}>
        <GroupLabel>Accordion</GroupLabel>
        <Box sx={{ maxWidth: 640 }}>
          {['Billing', 'Notifications', 'Integrations'].map((title, index) => (
            <Accordion key={title} defaultExpanded={index === 0}>
              <AccordionSummary expandIcon={<ExpandMoreOutlinedIcon />}>
                <Typography sx={{ fontWeight: 600 }}>{title}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="textSecondary">
                  Placeholder settings content for the {title.toLowerCase()} panel.
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Stack>

      <Stack spacing={1.5}>
        <GroupLabel>AppBar (static, dense) & Tabs</GroupLabel>
        <Paper variant="outlined">
          <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
            <Toolbar variant="dense">
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Inline app bar
              </Typography>
            </Toolbar>
          </AppBar>
          <Tabs value={tab} onChange={(_event, value: number) => setTab(value)} sx={{ px: 2 }}>
            <Tab label="Overview" />
            <Tab label="Feedback" />
            <Tab label="Settings" />
          </Tabs>
          <Box sx={{ px: 2, pb: 2 }}>
            <TabPanel value={tab} index={0}>
              <Typography variant="body2" color="textSecondary">
                Overview panel content.
              </Typography>
            </TabPanel>
            <TabPanel value={tab} index={1}>
              <Typography variant="body2" color="textSecondary">
                Feedback panel content.
              </Typography>
            </TabPanel>
            <TabPanel value={tab} index={2}>
              <Typography variant="body2" color="textSecondary">
                Settings panel content.
              </Typography>
            </TabPanel>
          </Box>
        </Paper>

        <Tabs
          value={scrollableTab}
          onChange={(_event, value: number) => setScrollableTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Scrollable tabs"
        >
          {Array.from({ length: 8 }, (_, index) => (
            <Tab key={index} label={`Segment ${index + 1}`} />
          ))}
        </Tabs>
      </Stack>

      <Stack spacing={1.5}>
        <GroupLabel>Stepper</GroupLabel>
        <Stack spacing={2} sx={{ maxWidth: 560 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Stack direction="row" spacing={2}>
            <Button disabled={activeStep === 0} onClick={() => setActiveStep((step) => step - 1)}>
              Back
            </Button>
            <Button
              variant="contained"
              disabled={activeStep === steps.length - 1}
              onClick={() => setActiveStep((step) => step + 1)}
            >
              Next
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </SectionBlock>
  )
}
