import { useId } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import Logo from './Logo.tsx'
import { srOnly } from '../a11y.ts'
import { footerGroups } from '../footerLinks.ts'
import { pageColumn } from '../rhythm.ts'

/**
 * The footer: a directory of the site. The brand and one line on what it
 * does, then a column per group of links (footerLinks.ts), then the legal
 * line. Quiet on purpose: small type on the page's own ground, sentence-case
 * group names, links that underline on hover.
 */
export default function Footer() {
  const palette = useTheme().vars.palette
  const baseId = useId()

  return (
    <Box
      component="footer"
      sx={{ borderTop: '1px solid', borderColor: palette.divider, bgcolor: 'background.default' }}
    >
      <Container maxWidth={false} sx={[pageColumn, { pt: { xs: 8, md: 10 }, pb: { xs: 5, md: 6 } }]}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 2fr)' },
            columnGap: 5,
            rowGap: { xs: 5, md: 6 },
          }}
        >
          <Box sx={{ maxWidth: '32ch' }}>
            <Logo size={24} />
            <Typography
              variant="body2"
              sx={{ mt: 2.5, color: palette.text.secondary, textWrap: 'pretty' }}
            >
              See what a change does to access before it merges: the same checks, run on both
              versions.
            </Typography>
          </Box>

          {/* One landmark for the directory, a column per group. */}
          <Box
            component="nav"
            aria-label="Footer"
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' },
              columnGap: { xs: 3, md: 5 },
              rowGap: 5,
            }}
          >
            {footerGroups.map((group, index) => {
              const headingId = `${baseId}-group-${index}`
              return (
                <Box key={group.heading} sx={{ minWidth: 0 }}>
                  <Typography
                    id={headingId}
                    component="h2"
                    sx={{ fontWeight: 600, fontSize: '0.875rem', color: palette.text.primary }}
                  >
                    {group.heading}
                  </Typography>
                  <Box
                    component="ul"
                    // Safari drops a list's role once its markers are removed.
                    role="list"
                    aria-labelledby={headingId}
                    sx={{ listStyle: 'none', m: 0, mt: 2, p: 0, display: 'grid', rowGap: 1.25 }}
                  >
                    {group.links.map(({ label, href, external }) => (
                      <Box component="li" key={label}>
                        <Link
                          href={href}
                          underline="hover"
                          color="textSecondary"
                          variant="body2"
                          sx={{ display: 'inline-block', py: 0.25 }}
                          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        >
                          {label}
                          {external && (
                            <Box component="span" sx={srOnly}>
                              {' (opens in a new tab)'}
                            </Box>
                          )}
                        </Link>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Box>

        <Box
          sx={{
            mt: { xs: 6, md: 8 },
            pt: 3,
            borderTop: '1px solid',
            borderColor: palette.divider,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            columnGap: 3,
            rowGap: 1,
          }}
        >
          <Typography variant="body2" color="textSecondary">
            © 2026 DUVATL, Inc. Counterbranch™ is a trademark of DUVATL, Inc.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Alpha release. Free to use.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
