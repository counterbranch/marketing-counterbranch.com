import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { MONO_FONT } from '../../components/DiffVersusRun.tsx'
import { links } from '../../links.ts'
import { heroStageSx } from '../../motion.ts'
import { pageColumn } from '../../rhythm.ts'
import { displayFont } from '../../theme.ts'
import { LOG_COLUMNS, LOG_GAP } from './logLayout.ts'
import { blocks, header, published } from './content.ts'

/**
 * The page's opening, on the hero's surface so the site header reads over it:
 * cyan with dark ink in the light scheme, near-black in the dark one. The
 * headline, the answer in one paragraph, the date, and the run's closing
 * status line; from lg the log's questions as an index beside them, on the
 * same columns as the log below.
 */
export default function ResultsHeader() {
  const theme = useTheme()
  const hero = theme.vars.palette.hero

  return (
    <Box
      component="header"
      sx={{
        position: 'relative',
        bgcolor: hero.background,
        backgroundImage: hero.wash,
        color: hero.ink,
        // Clears the site header, which overlays this band.
        pt: { xs: 14, md: 16 },
        // From lg the log's tape overlaps the last 48px (ScanLog).
        pb: { xs: 8, md: 12, lg: 14 },
        '&::selection, & ::selection': { backgroundColor: hero.plate, color: hero.plateInk },
        ...theme.applyStyles('dark', { borderBottom: '1px solid', borderColor: theme.vars.palette.divider }),
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          ...pageColumn,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: LOG_COLUMNS },
          columnGap: LOG_GAP,
          rowGap: { xs: 7, md: 9 },
          alignItems: 'end',
          // Links here are the hero's ink, underlined, with its own focus ring.
          '& a:not(.MuiButton-root)': {
            color: 'inherit',
            textUnderlineOffset: '0.2em',
            '&:hover': { color: 'inherit', textDecorationThickness: 2 },
            '&:focus-visible': { outline: `2px solid ${hero.ink}`, outlineOffset: 2 },
          },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Box component="nav" aria-label="Breadcrumb" sx={heroStageSx(0)}>
            <Box
              component="ol"
              sx={{
                listStyle: 'none',
                m: 0,
                p: 0,
                display: 'flex',
                flexWrap: 'wrap',
                columnGap: 1,
                fontFamily: MONO_FONT,
                fontSize: '0.875rem',
                color: hero.inkMuted,
              }}
            >
              <li>
                <Link href={links.home} underline="always">
                  counterbranch
                </Link>
              </li>
              <Box component="li" aria-hidden>
                /
              </Box>
              <Box component="li" aria-current="page">
                alpha-test-results
              </Box>
            </Box>
          </Box>

          <Typography
            variant="h1"
            sx={{
              mt: { xs: 3, md: 4 },
              fontSize: 'clamp(2.5rem, 1.2rem + 4.2vw, 5.75rem)',
              ...heroStageSx(0),
            }}
          >
            {header.title}
          </Typography>

          <Typography
            sx={{
              mt: { xs: 3, md: 4 },
              maxWidth: '60ch',
              fontSize: { xs: '1.0625rem', md: '1.1875rem', xl: '1.3125rem' },
              lineHeight: 1.55,
              color: hero.inkMuted,
              textWrap: 'pretty',
              ...heroStageSx(1),
            }}
          >
            {header.dek}
          </Typography>

          <Typography
            sx={{ mt: 3, fontFamily: MONO_FONT, fontSize: '0.875rem', color: hero.inkMuted, ...heroStageSx(1) }}
          >
            published <Box component="time" dateTime={published.iso}>{published.label}</Box> · measured,
            rounded
          </Typography>
        </Box>

        {/* From lg the right-hand column: the run's status line, then the
            questions the log answers, so the left column is only the
            headline and its answer and the log's tape starts in the first
            screen. */}
        <Box sx={{ minWidth: 0 }}>
          {/* The run's closing status line, on the plate the hero's reel
              uses: every headline figure, as one line of output. */}
          <Box
            component="ul"
            role="list"
            aria-label="At a glance"
            sx={{
              listStyle: 'none',
              m: 0,
              // The grid's row gap already separates it from the date line
              // above; the index below gets the same step.
              mt: 0,
              mb: { xs: 5, md: 6 },
              px: { xs: 2, md: 2.5 },
              py: { xs: 1.5, md: 1.75 },
              display: 'flex',
              flexWrap: 'wrap',
              columnGap: { xs: 2.5, md: 3.5 },
              rowGap: 0.75,
              // The log's own ground: ink in the light scheme, the raised
              // surface in the dark one, rather than the hero's white plate.
              backgroundColor: hero.plate,
              color: hero.plateInk,
              ...theme.applyStyles('dark', {
                backgroundColor: theme.vars.palette.background.paper,
                color: theme.vars.palette.text.primary,
              }),
              fontFamily: MONO_FONT,
              fontSize: { xs: '0.8125rem', md: '0.9375rem' },
              lineHeight: 1.5,
              ...heroStageSx(2),
            }}
          >
            <Box component="li" aria-hidden sx={{ opacity: 0.7 }}>
              discover · done
            </Box>
            {header.status.map(({ value, label }) => (
              <li key={label}>
                <Box component="strong" sx={{ fontWeight: 700 }}>
                  {value}
                </Box>{' '}
                <Box component="span" sx={{ opacity: 0.78 }}>
                  {label}
                </Box>
              </li>
            ))}
          </Box>

          {/* The questions the log answers, in order. */}
          <Box component="nav" aria-labelledby="in-this-log" sx={{ minWidth: 0, ...heroStageSx(3) }}>
            <Typography
              id="in-this-log"
              component="h2"
              sx={{
                fontFamily: displayFont,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontSize: '0.9375rem',
              }}
            >
              In this log
            </Typography>
            <Box
              component="ol"
              sx={{
                listStyle: 'none',
                m: 0,
                mt: 2,
                p: 0,
                borderTop: '1px solid',
                borderColor: hero.line,
              }}
            >
              {blocks.map((block) => (
                <Box
                  component="li"
                  key={block.id}
                  sx={{ borderBottom: '1px solid', borderColor: hero.line }}
                >
                  <Link
                    href={`#${block.id}`}
                    underline="none"
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'auto minmax(0, 1fr)',
                      columnGap: 1.5,
                      alignItems: 'baseline',
                      py: 1.25,
                      fontSize: { xs: '1rem', xl: '1.0625rem' },
                      fontWeight: 500,
                      // A square mark, as the page draws decisions: open at
                      // rest, filled on hover.
                      '&::before': {
                        content: '""',
                        width: 9,
                        height: 9,
                        border: '1.5px solid currentColor',
                        transform: 'translateY(-1px)',
                      },
                      '&:hover::before': { backgroundColor: 'currentColor' },
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {block.question}
                  </Link>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
