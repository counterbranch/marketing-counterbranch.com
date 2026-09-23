import Typography from '@mui/material/Typography'

/** Small eyebrow label used to break a section into named variant groups. */
export default function GroupLabel({ children }: { children: string }) {
  return (
    <Typography
      variant="overline"
      color="textSecondary"
      component="p"
      sx={{ fontWeight: 700, letterSpacing: '0.08em', lineHeight: 1.5 }}
    >
      {children}
    </Typography>
  )
}
