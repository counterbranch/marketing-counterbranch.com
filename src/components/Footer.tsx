import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import Logo from './Logo.tsx'
import { links } from '../links.ts'

const footerLinks = [
  { label: 'Docs', href: links.docs },
  { label: 'Pricing', href: links.pricing },
  { label: 'GitHub', href: links.github, external: true },
  { label: 'Contact', href: links.contact },
]

export default function Footer() {
  return (
    <Box component="footer">
      <Divider />
      <Container maxWidth="md">
        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', py: 6 }}>
          <Logo size={24} />
          <Typography variant="body2" color="text.secondary">
            © 2026 DUVATL, Inc. Counterbranch™ is a trademark of DUVATL, Inc.
          </Typography>
          <Stack direction="row" spacing={3}>
            {footerLinks.map(({ label, href, external }) => (
              <Link
                key={label}
                href={href}
                underline="hover"
                color="text.secondary"
                variant="body2"
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {label}
              </Link>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
