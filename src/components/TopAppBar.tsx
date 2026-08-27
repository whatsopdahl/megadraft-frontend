import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  Divider,
} from '@mui/material';
import { AccountCircle, Logout } from '@mui/icons-material';
import megadraftLogo from '/megadraft-logo.svg';
import { useAuth } from '../auth/AuthContext';

const TopAppBar: React.FC = () => {
  const { userName, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
  };

  return (
    <AppBar position="static" color="default" elevation={0} sx={{ backdropFilter: 'blur(6px)' }}>
      <Toolbar>
        <Box
          component="img"
          src={megadraftLogo}
          alt="MegaDraft"
          onClick={() => navigate('/')}
          sx={{ height: 60, cursor: 'pointer' }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} color="inherit">
          <AccountCircle sx={{ fontSize: 32 }} />
        </IconButton>
        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)} disableScrollLock>
          {userName && (
            <>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2">Welcome, {userName}</Typography>
              </Box>
              <Divider />
            </>
          )}
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopAppBar;
