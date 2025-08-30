"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useState } from 'react';

export default function Header({ user, onLogin, onLogout, onCreateWish, onProfile, onFollowing }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    onLogout();
  };

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        backgroundColor: 'white',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #6366f1 30%, #ec4899 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            ✨ Wish Wall
          </Typography>
          {!isMobile && (
            <Chip
              label="Share your dreams, inspire others"
              size="small"
              variant="outlined"
              sx={{
                color: 'text.secondary',
                borderColor: 'divider',
                '& .MuiChip-label': { fontSize: '0.75rem' },
              }}
            />
          )}
        </Box>

        {/* User Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user ? (
            <>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onCreateWish}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2,
                }}
              >
                Share Wish
              </Button>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ textAlign: 'right', mr: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user.name || user.email?.split('@')[0]}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Welcome back!
                  </Typography>
                </Box>

                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: 'primary.main',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    {(user.name || user.email)?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleProfileMenuClose}
                  PaperProps={{
                    sx: {
                      borderRadius: 2,
                      mt: 1,
                      minWidth: 180,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <MenuItem
                    onClick={handleProfileMenuClose}
                    sx={{ gap: 2, py: 1.5 }}
                  >
                    <AccountCircleIcon fontSize="small" />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {user.name || user.email?.split('@')[0]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleProfileMenuClose();
                      onProfile && onProfile();
                    }}
                    sx={{ gap: 2, py: 1.5 }}
                  >
                    <AccountCircleIcon fontSize="small" />
                    <Typography variant="body2">Profile</Typography>
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      handleProfileMenuClose();
                      onFollowing && onFollowing();
                    }}
                    sx={{ gap: 2, py: 1.5 }}
                  >
                    <PersonAddIcon fontSize="small" />
                    <Typography variant="body2">Following</Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={handleLogout}
                    sx={{ gap: 2, py: 1.5, color: 'error.main' }}
                  >
                    <LogoutIcon fontSize="small" />
                    <Typography variant="body2">Logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<LoginIcon />}
              onClick={onLogin}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
              }}
            >
              Sign In
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
