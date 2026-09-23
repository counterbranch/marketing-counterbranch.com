import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import Logo from './Logo.tsx'
import { srOnly } from '../a11y.ts'
import { links } from '../links.ts'

const footerLinks = [
  { label: 'How it works', href: links.howItWorks },
  { label: 'Install', href: links.getStarted },
  { label: 'FAQ', href: links.faq },
  { label: 'GitHub', href: links.github, external: true },
]

export default function Footer() {
  return (
    <Box component="footer">
      <Divider />
      <Container maxWidth="md">
        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', py: { xs: 6, md: 8 } }}>
          <Logo size={24} />
          <Typography variant="body2" color="textSecondary">
            © 2026 DUVATL, Inc. Counterbranch™ is a trademark of DUVATL, Inc.
          </Typography>
          <Stack component="nav" aria-label="Footer" direction="row" spacing={3}>
            {footerLinks.map(({ label, href, external }) => (
              <Link
                key={label}
                href={href}
                underline="hover"
                color="textSecondary"
                variant="body2"
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {label}
                {external && (
                  <Box component="span" sx={srOnly}>
                    {' (opens in a new tab)'}
                  </Box>
                )}
              </Link>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
