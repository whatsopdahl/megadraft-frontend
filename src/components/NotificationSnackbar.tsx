import React, { useEffect, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useNotification, Notification } from '../notifications/NotificationContext';

const NotificationSnackbar: React.FC = () => {
  const { notification, clearNotification } = useNotification();
  const [displayed, setDisplayed] = useState<Notification | null>(null);

  // Keep rendering the last notification's content while the Snackbar plays
  // its close transition - Snackbar falls back to its own default content
  // (which crashes against this theme's gradient background) whenever its
  // children go falsy, so `displayed` must not clear until a new one arrives.
  useEffect(() => {
    if (notification) {
      setDisplayed(notification);
    }
  }, [notification]);

  return (
    <Snackbar
      open={!!notification}
      autoHideDuration={5000}
      onClose={clearNotification}
      sx={{ mt: 8 }}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      {displayed ? (
        <Alert onClose={clearNotification} severity={displayed.severity} sx={{ width: '100%' }}>
          {displayed.message}
        </Alert>
      ) : undefined}
    </Snackbar>
  );
};

export default NotificationSnackbar;
