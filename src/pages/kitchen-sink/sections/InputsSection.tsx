import { useState, type SyntheticEvent } from 'react'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import type { SelectChangeEvent } from '@mui/material/Select'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import RadioGroup from '@mui/material/RadioGroup'
import Radio from '@mui/material/Radio'
import Checkbox from '@mui/material/Checkbox'
import Switch from '@mui/material/Switch'
import Slider from '@mui/material/Slider'
import Rating from '@mui/material/Rating'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import SectionBlock from '../SectionBlock.tsx'
import GroupLabel from '../GroupLabel.tsx'

const roles = ['Product', 'Engineering', 'Design', 'Support', 'Sales', 'Marketing']

export default function InputsSection() {
  const [role, setRole] = useState('Product')
  const [teams, setTeams] = useState<string[]>(['Product', 'Design'])
  const [tags, setTags] = useState<string[]>(['Roadmap'])
  const [checked, setChecked] = useState(true)
  const [radioValue, setRadioValue] = useState('weekly')
  const [switchOn, setSwitchOn] = useState(true)
  const [volume, setVolume] = useState(30)
  const [priceRange, setPriceRange] = useState<number[]>([20, 70])
  const [rating, setRating] = useState<number | null>(3)

  return (
    <SectionBlock id="inputs" title="Inputs" description="Text entry, selection and range controls in their normal, error and disabled states.">
      <Stack spacing={1.5}>
        <GroupLabel>Text field — variants</GroupLabel>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Outlined" variant="outlined" defaultValue="Hello" fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Filled" variant="filled" defaultValue="Hello" fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Standard" variant="standard" defaultValue="Hello" fullWidth />
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <GroupLabel>Text field — states</GroupLabel>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField label="With helper text" helperText="We'll never share your email." fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Error"
              defaultValue="not-an-email"
              error
              helperText="Enter a valid email address."
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField label="Disabled" defaultValue="Can't touch this" disabled fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField label="Multiline" multiline minRows={3} defaultValue="Notes span several lines when needed." fullWidth />
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <GroupLabel>Select</GroupLabel>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                label="Role"
                value={role}
                onChange={(event: SelectChangeEvent) => setRole(event.target.value)}
              >
                {roles.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel id="teams-label">Teams</InputLabel>
              <Select<string[]>
                labelId="teams-label"
                label="Teams"
                multiple
                value={teams}
                onChange={(event: SelectChangeEvent<string[]>) => {
                  const { value } = event.target
                  setTeams(typeof value === 'string' ? value.split(',') : value)
                }}
                renderValue={(selected) => selected.join(', ')}
              >
                {roles.map((option) => (
                  <MenuItem key={option} value={option}>
                    <Checkbox checked={teams.includes(option)} size="small" />
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <GroupLabel>Autocomplete</GroupLabel>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              options={roles}
              renderInput={(params) => <TextField {...params} label="Owning team" />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              multiple
              options={roles}
              value={tags}
              onChange={(_event: SyntheticEvent, value: string[]) => setTags(value)}
              renderInput={(params) => <TextField {...params} label="Tags" placeholder="Add a tag" />}
            />
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <GroupLabel>Checkbox, radio & switch</GroupLabel>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} />}
              label="Email me weekly digests"
            />
            <FormControlLabel control={<Checkbox defaultChecked color="secondary" />} label="Secondary" />
            <FormControlLabel control={<Checkbox disabled />} label="Disabled" />
          </FormGroup>
          <FormControl>
            <FormLabel id="cadence-label">Digest cadence</FormLabel>
            <RadioGroup
              aria-labelledby="cadence-label"
              value={radioValue}
              onChange={(event) => setRadioValue(event.target.value)}
            >
              <FormControlLabel value="daily" control={<Radio />} label="Daily" />
              <FormControlLabel value="weekly" control={<Radio />} label="Weekly" />
              <FormControlLabel value="never" control={<Radio />} label="Never" />
            </RadioGroup>
          </FormControl>
          <FormGroup>
            <FormControlLabel
              control={<Switch checked={switchOn} onChange={(event) => setSwitchOn(event.target.checked)} />}
              label="Enabled"
            />
            <FormControlLabel control={<Switch defaultChecked color="secondary" />} label="Secondary" />
            <FormControlLabel control={<Switch disabled />} label="Disabled" />
          </FormGroup>
        </Stack>
      </Stack>

      <Stack spacing={1.5}>
        <GroupLabel>Slider & rating</GroupLabel>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Continuous
            </Typography>
            <Slider value={volume} onChange={(_event, value) => setVolume(value as number)} aria-label="Volume" />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Range with marks
            </Typography>
            <Slider
              value={priceRange}
              onChange={(_event, value) => setPriceRange(value as number[])}
              valueLabelDisplay="auto"
              step={10}
              marks
              aria-label="Price range"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Rating
            </Typography>
            <Rating value={rating} onChange={(_event, value) => setRating(value)} />
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <GroupLabel>Representative form layout</GroupLabel>
        <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, maxWidth: 640 }}>
          <Stack spacing={3} component="form" onSubmit={(event) => event.preventDefault()}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="First name" defaultValue="Jonny" fullWidth />
              <TextField label="Last name" defaultValue="Hawley" fullWidth />
            </Stack>
            <TextField label="Work email" type="email" defaultValue="jonny@counterbranch.com" fullWidth />
            <FormControl fullWidth>
              <InputLabel id="form-role-label">Role</InputLabel>
              <Select labelId="form-role-label" label="Role" defaultValue="Product">
                {roles.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel control={<Checkbox defaultChecked />} label="Subscribe to the product newsletter" />
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
              <Button variant="text">Cancel</Button>
              <Button variant="contained" type="submit">
                Save
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </SectionBlock>
  )
}
