"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Info as InfoIcon,
} from '@mui/icons-material';
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";

const DATABASE_ID = 'wish_wall_db';
const WISHES_COLLECTION_ID = 'wishes';

export default function WishStatistics({
  userId,
  currentUser,
  showPermissionInfo = true,
  title = "Wish Statistics"
}) {
  const [stats, setStats] = useState({
    totalWishes: 0,
    publicWishes: 0,
    privateWishes: 0,
    friendsWishes: 0,
    totalLikes: 0,
    totalComments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [permissionLevel, setPermissionLevel] = useState('public');
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    if (userId) {
      loadUserStats();
    }
  }, [userId, currentUser]);

  const checkFriendship = async () => {
    if (!currentUser || !userId || userId === currentUser.$id) {
      return false;
    }

    try {
      // 检查是否互相关注（即是否是好友）
      const [followingResponse, followersResponse] = await Promise.all([
        databases.listDocuments(
          DATABASE_ID,
          'follows',
          [
            Query.equal('follower_id', currentUser.$id),
            Query.equal('following_id', userId)
          ]
        ),
        databases.listDocuments(
          DATABASE_ID,
          'follows',
          [
            Query.equal('follower_id', userId),
            Query.equal('following_id', currentUser.$id)
          ]
        )
      ]);

      // 如果双方都关注对方，则是好友
      return followingResponse.documents.length > 0 && followersResponse.documents.length > 0;
    } catch (error) {
      console.error('Error checking friendship:', error);
      return false;
    }
  };

  const loadUserStats = async () => {
    try {
      setLoading(true);

      // 确定权限级别
      let permission = 'public';
      let isUserFriend = false;

      if (currentUser && userId === currentUser.$id) {
        permission = 'all'; // 自己的所有愿望
        isUserFriend = true; // 自己当然是自己的好友
      } else if (currentUser) {
        isUserFriend = await checkFriendship();
        if (isUserFriend) {
          permission = 'friends'; // 好友的公开和朋友可见愿望
        } else {
          permission = 'public'; // 陌生人的公开愿望
        }
      }

      setPermissionLevel(permission);
      setIsFriend(isUserFriend);

      // 构建查询条件
      let queries = [Query.equal('user_id', userId)];

      if (permission === 'all') {
        // 获取所有愿望（自己的）
        queries.push(Query.orderDesc('$createdAt'));
      } else if (permission === 'friends') {
        // 获取公开和朋友可见的愿望
        queries.push(
          Query.or([
            Query.equal('visibility', 'public'),
            Query.equal('visibility', 'friends')
          ])
        );
        queries.push(Query.orderDesc('$createdAt'));
      } else {
        // 只获取公开愿望
        queries.push(Query.equal('visibility', 'public'));
        queries.push(Query.orderDesc('$createdAt'));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        WISHES_COLLECTION_ID,
        queries
      );

      const visibleWishes = response.documents;

      // 计算基于权限的统计
      const publicWishes = visibleWishes.filter(w => w.visibility === 'public').length;
      const privateWishes = visibleWishes.filter(w => w.visibility === 'private').length;
      const friendsWishes = visibleWishes.filter(w => w.visibility === 'friends').length;
      const totalLikes = visibleWishes.reduce((sum, w) => sum + (w.like_count || 0), 0);
      const totalComments = visibleWishes.reduce((sum, w) => sum + (w.comment_count || 0), 0);

      setStats({
        totalWishes: visibleWishes.length,
        publicWishes,
        privateWishes,
        friendsWishes,
        totalLikes,
        totalComments,
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPermissionMessage = () => {
    if (!currentUser) {
      return "You need to sign in to see more wishes from this user.";
    }

    if (userId === currentUser.$id) {
      return "This shows your complete wish statistics including private and friends-only wishes.";
    }

    if (isFriend) {
      return "As a friend, you can see public and friends-only wishes from this user.";
    }

    return "You can only see public wishes from this user. Follow each other to become friends and see more!";
  };

  const getPermissionIcon = () => {
    switch (permissionLevel) {
      case 'all':
        return '🔓';
      case 'friends':
        return '👥';
      case 'public':
        return '🌍';
      default:
        return '🌍';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* 权限信息提示 */}
      {showPermissionInfo && (
        <Alert 
          severity="info" 
          icon={<InfoIcon />}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          <Typography variant="body2">
            {getPermissionIcon()} {getPermissionMessage()}
          </Typography>
        </Alert>
      )}

      {/* 统计标题 */}
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        {title}
        {permissionLevel !== 'all' && (
          <Chip
            label={`${permissionLevel === 'friends' ? 'Friends' : 'Public'} View`}
            size="small"
            color="info"
            variant="outlined"
            sx={{ ml: 2, fontSize: '0.7rem' }}
          />
        )}
        {permissionLevel === 'all' && (
          <Chip
            label="Complete View"
            size="small"
            color="success"
            variant="outlined"
            sx={{ ml: 2, fontSize: '0.7rem' }}
          />
        )}
      </Typography>

      {/* 统计网格 - 根据权限级别显示不同字段 */}
      <Grid container spacing={3}>
        {/* 总愿望数 - 在所有视图中显示 */}
        {(permissionLevel === 'all' || permissionLevel === 'friends') && (
          <Grid item xs={6} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {stats.totalWishes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Wishes
              </Typography>
            </Box>
          </Grid>
        )}

        {/* 公开愿望 - 在所有视图中显示 */}
        <Grid item xs={6} sm={permissionLevel === 'public' ? 12 : (permissionLevel === 'all' ? 4 : 4)}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
              {stats.publicWishes}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Public
            </Typography>
          </Box>
        </Grid>

        {/* 私有愿望 - 只在完整视图中显示 */}
        {permissionLevel === 'all' && (
          <Grid item xs={6} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                {stats.privateWishes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Private
              </Typography>
            </Box>
          </Grid>
        )}

        {/* 朋友可见愿望 - 只在完整视图和朋友视图中显示 */}
        {(permissionLevel === 'all' || permissionLevel === 'friends') && (
          <Grid item xs={6} sm={permissionLevel === 'all' ? 4 : 4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {stats.friendsWishes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Friends Only
              </Typography>
            </Box>
          </Grid>
        )}

        {/* 权限提示 - 在非完整视图中显示 */}
        {permissionLevel !== 'all' && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                {permissionLevel === 'friends'
                  ? 'Private wishes are not visible to friends'
                  : 'Only public wishes are visible'
                }
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
