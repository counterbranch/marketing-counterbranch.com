import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import type { Breakpoint } from '@mui/material/styles'
import SectionBlock from '../SectionBlock.tsx'
import GroupLabel from '../GroupLabel.tsx'

const containerSizes: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl']
const stackSpacings = [1, 2, 3, 4] as const

function DemoBlock({ children }: { children: number | string }) {
  return (
    <Paper
      variant="outlined"
      sx={(theme) => ({
        p: 2,
        textAlign: 'center',
        backgroundColor: theme.vars.palette.background.paper,
      })}
    >
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {children}
      </Typography>
    </Paper>
  )
}

export default function LayoutSection() {
  const theme = useTheme()

  return (
    <SectionBlock id="layout" title="Layout" description="The structural primitives every other section is built from.">
      <Stack spacing={1.5}>
        <GroupLabel>Grid — responsive size prop</GroupLabel>
        <Typography variant="caption" color="textSecondary">
          Each tile uses size=&#123;&#123; xs: 6, sm: 4, md: 3, lg: 2 &#125;&#125; — resize the window to see it reflow.
        </Typography>
        <Grid container spacing={1.5}>
          {Array.from({ length: 12 }, (_, index) => (
            <Grid key={index} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
              <DemoBlock>{index + 1}</DemoBlock>
            </Grid>
          ))}
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <GroupLabel>Stack — direction × spacing</GroupLabel>
        <Stack spacing={3}>
          {stackSpacings.map((spacing) => (
            <Box key={`row-${spacing}`}>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                {`direction="row" spacing={${spacing}}`}
              </Typography>
              <Stack direction="row" spacing={spacing}>
                {[1, 2, 3].map((item) => (
                  <DemoBlock key={item}>{item}</DemoBlock>
                ))}
              </Stack>
            </Box>
          ))}
          <Box>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
              direction=&quot;column&quot; spacing=&#123;2&#125;
            </Typography>
            <Stack direction="column" spacing={2} sx={{ maxWidth: 200 }}>
              {[1, 2, 3].map((item) => (
                <DemoBlock key={item}>{item}</DemoBlock>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Stack>

      <Stack spacing={1.5}>
        <GroupLabel>Container — maxWidth visualised</GroupLabel>
        <Stack spacing={2}>
          {containerSizes.map((size) => (
            <Box key={size}>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
                {`maxWidth="${size}" (${theme.breakpoints.values[size]}px breakpoint)`}
              </Typography>
              <Container maxWidth={size} disableGutters>
                <Box
                  sx={{
                    height: 40,
                    border: '1px dashed',
                    borderColor: 'primary.main',
                    borderRadius: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption" color="textSecondary">
                    {size}
                  </Typography>
                </Box>
              </Container>
            </Box>
          ))}
        </Stack>
      </Stack>
    </SectionBlock>
  )
}
