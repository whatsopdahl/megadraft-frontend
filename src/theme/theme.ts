import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    background: {
      default: "linear-gradient(135deg, #6C5CE7, #00B894)"
    },
    primary: {
      main: '#6C5CE7',
      light: '#A29BFE'
    },
    secondary: {
      main: '#00B894',
    },
    text: {
      secondary: '#888899',
      primary: '#1A1A2E'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        // backgroundColor can't hold a gradient - CssBaseline sets that by
        // default, which silently drops palette.background.default here.
        body: {
          background: theme.palette.background.default,
        },
      }),
    },
    MuiCardHeader: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderBottom: '2px solid',
          borderColor: theme.palette.primary.main
        })
      }
    },
    MuiFab: {
      styleOverrides: {
        root: ({theme}) => ({
          backgroundColor: theme.palette.background.paper 
        })
      }
    }
  },
});

export default theme;
