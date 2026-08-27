import React, { ReactNode } from 'react';
import TopAppBar from './TopAppBar';
import { Box } from '@mui/material';

const AuthenticatedLayout: React.FC<{ children: ReactNode }> = ({ children }) => (
  <Box sx={{ minHeight: '100vh' }}>
    <TopAppBar />
    <Box sx={{ position: 'relative', p: 4 }}>
      {children}
    </Box>
  </Box>
);

export default AuthenticatedLayout;
