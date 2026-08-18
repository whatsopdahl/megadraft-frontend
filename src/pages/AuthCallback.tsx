import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeLogin } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Auth error:', error);
      navigate('/');
      return;
    }

    if (!code) {
      navigate('/');
      return;
    }

    const exchangeCode = async () => {
      try {
        const domain = import.meta.env.VITE_COGNITO_HOSTED_UI_DOMAIN;
        const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
        const redirectUri = import.meta.env.VITE_REDIRECT_URI;

        const response = await fetch(`https://${domain}/oauth2/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `grant_type=authorization_code&client_id=${clientId}&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`,
        });

        if (!response.ok) {
          throw new Error('Token exchange failed');
        }

        const data = await response.json();
        const { id_token, refresh_token } = data;

        completeLogin(id_token, refresh_token);

        navigate('/');
      } catch (error) {
        console.error('Token exchange error:', error);
        navigate('/');
      }
    };

    exchangeCode();
  }, [searchParams, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <CircularProgress />
      <Typography variant="body1" sx={{ mt: 2 }}>
        Signing you in...
      </Typography>
    </Box>
  );
};

export default AuthCallback;
