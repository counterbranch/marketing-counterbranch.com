import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { TypographyVariant } from '@mui/material/styles'
import SectionBlock from '../SectionBlock.tsx'
import GroupLabel from '../GroupLabel.tsx'

const variants: TypographyVariant[] = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'subtitle1',
  'subtitle2',
  'body1',
  'body2',
  'button',
  'caption',
  'overline',
]

const runningText = [
  `Counterbranch keeps product feedback from getting lost between the tools a
  team already uses. Support tickets, sales calls, and app reviews all land
  in one shared timeline, tagged and linked back to the feature they touch,
  so a roadmap review starts from evidence instead of whoever spoke up
  loudest in the last planning meeting.`,
  `The point isn't to replace a team's process — it's to make the process
  worth trusting. When a request resurfaces for the third time, Counterbranch
  surfaces the earlier conversations automatically, so nothing gets
  re-litigated from scratch and nothing quietly falls off the list.`,
]

export default function TypographySection() {
  return (
    <SectionBlock
      id="typography"
      title="Typography"
      description="Every type variant defined in the theme, plus a paragraph of real running text for judging line-height and measure."
    >
      <Stack spacing={3}>
        {variants.map((variant) => (
          <Box key={variant}>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: 'block', mb: 0.5, fontFamily: 'monospace' }}
            >
              {variant}
            </Typography>
            <Typography variant={variant}>Counterbranch turns scattered feedback into a shared roadmap.</Typography>
          </Box>
        ))}
      </Stack>

      <Stack spacing={2}>
        <GroupLabel>Running text (body1)</GroupLabel>
        <Stack spacing={2} sx={{ maxWidth: 680 }}>
          {runningText.map((paragraph) => (
            <Typography key={paragraph.slice(0, 24)} variant="body1">
              {paragraph}
            </Typography>
          ))}
        </Stack>
      </Stack>
    </SectionBlock>
  )
}
