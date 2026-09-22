import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined'

interface LogoProps {
  size?: number
}

export default function Logo({ size = 28 }: LogoProps) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: 1,
          bgcolor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <AccountTreeOutlinedIcon
          sx={{ color: 'primary.contrastText', fontSize: size * 0.6 }}
        />
      </Box>
      <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
        Counterbranch
      </Typography>
    </Stack>
  )
}
