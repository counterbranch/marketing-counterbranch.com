import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  cssVariables: true,
  colorSchemes: {
    light: true,
  },
  typography: {
    fontFamily: "'Inter Variable', sans-serif",
  },
  palette: {
    primary: {
      main: '#4F46E5',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
})

export default theme
