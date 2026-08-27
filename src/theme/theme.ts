import { createTheme } from '@mui/material/styles';

// palette.background.default must stay a real color - MUI internals (Avatar,
// Snackbar, TableCell, etc.) run color math like emphasize()/alpha() on it and
// crash on a gradient string. The gradient itself is applied separately, only
// to the page body, via MuiCssBaseline below.
const APP_BACKGROUND_GRADIENT = 'linear-gradient(135deg, #6C5CE7, #00B894)';

const theme = createTheme({
  palette: {
    background: {
      default: '#6C5CE7',
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
      styleOverrides: {
        // backgroundColor can't hold a gradient - CssBaseline sets that by
        // default, which silently drops a gradient value here.
        body: {
          background: APP_BACKGROUND_GRADIENT,
          minHeight: '100vh',
        },
      },
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
