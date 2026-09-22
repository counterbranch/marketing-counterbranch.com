import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import ButtonGroup from '@mui/material/ButtonGroup'
import Fab from '@mui/material/Fab'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined'
import FormatBoldOutlinedIcon from '@mui/icons-material/FormatBoldOutlined'
import FormatItalicOutlinedIcon from '@mui/icons-material/FormatItalicOutlined'
import FormatUnderlinedOutlinedIcon from '@mui/icons-material/FormatUnderlinedOutlined'
import SectionBlock from '../SectionBlock.tsx'
import GroupLabel from '../GroupLabel.tsx'

const variants = ['contained', 'outlined', 'text'] as const
const colors = ['primary', 'secondary', 'inherit'] as const
const sizes = ['small', 'medium', 'large'] as const

export default function ButtonsSection() {
  const [loading, setLoading] = useState(false)
  const [formats, setFormats] = useState<string[]>(['bold'])

  return (
    <SectionBlock id="buttons" title="Buttons" description="Every button variant, color, size and state, plus the related press controls.">
      {variants.map((variant) => (
        <Stack key={variant} spacing={1.5}>
          <GroupLabel>{`${variant} × color`}</GroupLabel>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
            {colors.map((color) => (
              <Button key={color} variant={variant} color={color}>
                {color}
              </Button>
            ))}
            <Button variant={variant} color="primary" disabled>
              Disabled
            </Button>
          </Stack>
        </Stack>
      ))}

      <Stack spacing={1.5}>
        <GroupLabel>Sizes</GroupLabel>
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
          {sizes.map((size) => (
            <Button key={size} variant="contained" size={size}>
              {size}
            </Button>
          ))}
        </Stack>
      </Stack>

      <Stack spacing={1.5}>
        <GroupLabel>Icons & loading</GroupLabel>
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="contained" startIcon={<AddOutlinedIcon />}>
            Start icon
          </Button>
          <Button variant="outlined" endIcon={<ArrowForwardOutlinedIcon />}>
            End icon
          </Button>
          <Button
            variant="contained"
            color="secondary"
            loading={loading}
            loadingPosition="start"
            startIcon={<FavoriteBorderOutlinedIcon />}
            onClick={() => {
              setLoading(true)
              setTimeout(() => setLoading(false), 1800)
            }}
          >
            {loading ? 'Saving…' : 'Click to load'}
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={1.5}>
        <GroupLabel>Icon buttons</GroupLabel>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          {sizes.map((size) => (
            <IconButton key={size} size={size} color="primary" aria-label="Favorite">
              <FavoriteBorderOutlinedIcon fontSize={size === 'medium' ? undefined : size} />
            </IconButton>
          ))}
          <IconButton color="secondary" aria-label="Delete">
            <DeleteOutlinedIcon />
          </IconButton>
          <IconButton disabled aria-label="Disabled">
            <DeleteOutlinedIcon />
          </IconButton>
        </Stack>
      </Stack>

      <Stack spacing={1.5}>
        <GroupLabel>Button group & toggle button group</GroupLabel>
        <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <ButtonGroup variant="outlined" aria-label="Alignment">
            <Button>Left</Button>
            <Button>Center</Button>
            <Button>Right</Button>
          </ButtonGroup>
          <ToggleButtonGroup
            value={formats}
            onChange={(_event, next: string[]) => setFormats(next)}
            aria-label="Text formatting"
            size="small"
            color="primary"
          >
            <ToggleButton value="bold" aria-label="Bold">
              <FormatBoldOutlinedIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="italic" aria-label="Italic">
              <FormatItalicOutlinedIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="underline" aria-label="Underline">
              <FormatUnderlinedOutlinedIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      <Stack spacing={1.5}>
        <GroupLabel>Fab</GroupLabel>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Fab size="small" color="primary" aria-label="Add">
            <AddOutlinedIcon />
          </Fab>
          <Fab color="secondary" aria-label="Add">
            <AddOutlinedIcon />
          </Fab>
          <Fab variant="extended" color="primary">
            <AddOutlinedIcon sx={{ mr: 1 }} />
            Extended
          </Fab>
        </Stack>
      </Stack>
    </SectionBlock>
  )
}
