"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Grid,
  Paper,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Favorite as FavoriteIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import WishStatistics from "./WishStatistics";

export default function ProfileModal({ user, friendsCount, onClose }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          m: isMobile ? 0 : 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: 'primary.main',
                fontSize: '1.5rem'
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Member since {formatDate(user?.$createdAt)}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* 用户信息 */}
          <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Profile Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
                  <Typography variant="body2" color="text.secondary">Name:</Typography>
                  <Typography variant="body1">{user?.name || 'Not set'}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
                  <Typography variant="body2" color="text.secondary">Email:</Typography>
                  <Typography variant="body1">{user?.email || 'Not set'}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
                  <Typography variant="body2" color="text.secondary">Friends:</Typography>
                  <Chip
                    label={`${friendsCount} friends`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
                  <Typography variant="body2" color="text.secondary">Joined:</Typography>
                  <Typography variant="body1">{formatDate(user?.$createdAt)}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* 愿望统计 */}
          <Paper sx={{ p: 3 }}>
            <WishStatistics
              userId={user?.$id}
              currentUser={user}
              friends={[]}
              showPermissionInfo={false}
              title="Wish Statistics"
            />
          </Paper>

          {/* 互动统计 */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              <FavoriteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Interactions Received
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                    {/* 这里可以扩展为从WishStatistics组件获取数据 */}
                    -
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ❤️ Likes
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                    {/* 这里可以扩展为从WishStatistics组件获取数据 */}
                    -
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    💬 Comments
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          fullWidth={isMobile}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
