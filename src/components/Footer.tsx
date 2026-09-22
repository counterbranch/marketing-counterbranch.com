import Divider from '@mui/material/Divider'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import Logo from './Logo.tsx'

const links = ['Docs', 'Pricing', 'GitHub', 'Contact']

export default function Footer() {
  return (
    <>
      <Divider />
      <Container maxWidth="md">
        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', py: 6 }}>
          <Logo size={20} />
          <Typography variant="body2" color="text.secondary">
            © 2026 Counterbranch
          </Typography>
          <Stack direction="row" spacing={3}>
            {links.map((label) => (
              <Link
                key={label}
                href="#"
                underline="hover"
                color="text.secondary"
                variant="body2"
              >
                {label}
              </Link>
            ))}
          </Stack>
        </Stack>
      </Container>
    </>
  )
}
