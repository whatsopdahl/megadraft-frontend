import React from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { useAuth } from '../auth/AuthContext';

const Login: React.FC = () => {
  const auth = useAuth();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', boxShadow: 3 }}>
        <CardContent sx={{ textAlign: 'center', pt: 4, pb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
            Fantasy Draft
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Create and join fantasy sports drafts
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            onClick={auth.login}
            sx={{ mt: 2 }}
          >
            Sign In
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
