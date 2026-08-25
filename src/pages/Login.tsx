import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import megadraftLogo from '/megadraft-logo.svg';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../auth/AuthContext';

const Login: React.FC = () => {
  const auth = useAuth();

  const handleSuccess = (response: CredentialResponse) => {
    if (response.credential) {
      auth.completeLogin(response.credential);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', boxShadow: 3 }}>
        <CardContent sx={{ textAlign: 'center', pt: 4, pb: 4 }}>
          <Box
            component="img"
            src={megadraftLogo}
            alt="MegaDraft"
            sx={{ width: '100%', maxWidth: 280, height: 'auto', mb: 2 }}
          />
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Create and join fantasy sports drafts
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => console.error('Google sign-in failed')}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
