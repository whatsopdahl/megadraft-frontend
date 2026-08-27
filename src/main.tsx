import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme'
import { GoogleAuthProvider } from './auth/AuthContext'
import { NotificationProvider } from './notifications/NotificationContext'
import NotificationSnackbar from './components/NotificationSnackbar'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <GoogleAuthProvider>
          <App />
        </GoogleAuthProvider>
        <NotificationSnackbar />
      </NotificationProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
