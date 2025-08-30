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
  IconButton,
  Chip,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import WishCard from "./WishCard";
import WishStatistics from "./WishStatistics";

const DATABASE_ID = 'wish_wall_db';
const WISHES_COLLECTION_ID = 'wishes';

export default function UserWishesModal({
  targetUserId,
  currentUser,
  onClose,
  onUpdate
}) {
  const [userWishes, setUserWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (targetUserId) {
      loadUserWishes();
      checkFriendship();
    }
  }, [targetUserId, currentUser]);

  const loadUserWishes = async () => {
    try {
      setLoading(true);

      // 确定权限级别
      let permission = 'public';
      if (currentUser && targetUserId === currentUser.$id) {
        permission = 'all'; // 自己的所有愿望
      } else if (currentUser && isFriend) {
        permission = 'friends'; // 好友的公开和朋友可见愿望
      } else {
        permission = 'public'; // 陌生人的公开愿望
      }

      // 获取用户的所有可见愿望
      let queries = [Query.equal('user_id', targetUserId)];

      // 根据权限级别过滤愿望
      if (permission === 'all') {
        // 显示所有愿望（自己的）
        queries.push(Query.orderDesc('$createdAt'));
      } else if (permission === 'friends') {
        // 显示公开和朋友可见的愿望
        queries.push(
          Query.or([
            Query.equal('visibility', 'public'),
            Query.equal('visibility', 'friends')
          ])
        );
        queries.push(Query.orderDesc('$createdAt'));
      } else {
        // 只显示公开愿望
        queries.push(Query.equal('visibility', 'public'));
        queries.push(Query.orderDesc('$createdAt'));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        WISHES_COLLECTION_ID,
        queries
      );

      setUserWishes(response.documents);
    } catch (error) {
      console.error('Error loading user wishes:', error);
      setUserWishes([]);
    } finally {
      setLoading(false);
    }
  };

  const checkFriendship = async () => {
    if (!currentUser || !targetUserId || targetUserId === currentUser.$id) {
      setIsFriend(false);
      return;
    }

    try {
      // 检查是否互相关注（即是否是好友）
      const [followingResponse, followersResponse] = await Promise.all([
        databases.listDocuments(
          DATABASE_ID,
          'follows',
          [
            Query.equal('follower_id', currentUser.$id),
            Query.equal('following_id', targetUserId)
          ]
        ),
        databases.listDocuments(
          DATABASE_ID,
          'follows',
          [
            Query.equal('follower_id', targetUserId),
            Query.equal('following_id', currentUser.$id)
          ]
        )
      ]);

      // 如果双方都关注对方，则是好友
      const isMutualFollow = followingResponse.documents.length > 0 && followersResponse.documents.length > 0;
      setIsFriend(isMutualFollow);
    } catch (error) {
      console.error('Error checking friendship:', error);
      setIsFriend(false);
    }
  };



  const getUserDisplayName = () => {
    if (currentUser && targetUserId === currentUser.$id) {
      return currentUser.name || currentUser.email?.split('@')[0] || 'You';
    }
    // 这里可以扩展为从用户表获取真实姓名
    return `User ${targetUserId.substring(0, 8)}`;
  };

  const getCategories = () => {
    const categories = [...new Set(userWishes.map(wish => wish.category))];
    return categories;
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          m: isMobile ? 0 : 2,
          height: '90vh',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={onClose} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: currentUser && targetUserId === currentUser.$id ? 'primary.main' : 'secondary.main',
                fontSize: '1.25rem',
                fontWeight: 600,
              }}
            >
              {getUserDisplayName().charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                {getUserDisplayName()}'s Wishes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userWishes.length} wishes shared
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          {currentUser && targetUserId !== currentUser.$id && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {isFriend && (
                <Chip
                  label="Friends"
                  color="success"
                  size="small"
                  variant="outlined"
                />
              )}
              {!isFriend && currentUser && targetUserId !== currentUser.$id && (
                <Chip
                  label="Not Friends"
                  color="default"
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          )}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, pb: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {/* User Stats */}
            <Box sx={{ mb: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
              <WishStatistics
                userId={targetUserId}
                currentUser={currentUser}
                showPermissionInfo={true}
                title="Wish Statistics"
              />
            </Box>

            {/* Category Filter */}
            {getCategories().length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Categories
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {getCategories().map(category => (
                    <Chip
                      key={category}
                      label={category.charAt(0).toUpperCase() + category.slice(1)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Wishes Grid */}
            {userWishes.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  {currentUser && targetUserId === currentUser.$id
                    ? "You haven't shared any wishes yet"
                    : "No wishes available with your current permissions"
                  }
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {userWishes.map((wish) => (
                  <Grid item xs={12} sm={6} lg={4} key={wish.$id}>
                    <WishCard
                      wish={wish}
                      user={currentUser}
                      onUpdate={onUpdate}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
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
