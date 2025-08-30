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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Chip,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
} from '@mui/icons-material';
import { databases, DATABASE_ID, FOLLOWS_COLLECTION_ID, ID } from "@/lib/appwrite";
import { Query } from "appwrite";

export default function FollowModal({ user, onClose, onFollowingChange }) {
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingBack, setFollowingBack] = useState(new Set()); // 跟踪正在关注哪些粉丝

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (user) {
      loadFollowData();
    }
  }, [user]);

  const loadFollowData = async () => {
    try {
      setLoading(true);

      // 加载正在关注的人
      const followingResponse = await databases.listDocuments(
        DATABASE_ID,
        FOLLOWS_COLLECTION_ID,
        [Query.equal('follower_id', user.$id)]
      );

      // 加载关注者
      const followersResponse = await databases.listDocuments(
        DATABASE_ID,
        FOLLOWS_COLLECTION_ID,
        [Query.equal('following_id', user.$id)]
      );

      const followingDocs = followingResponse.documents;
      const followersDocs = followersResponse.documents;

      // 计算好友（互相关注）
      const followingIds = followingDocs.map(doc => doc.following_id);
      const followerIds = followersDocs.map(doc => doc.follower_id);

      const friendIds = followingIds.filter(id => followerIds.includes(id));
      const friendsList = followingDocs.filter(doc => friendIds.includes(doc.following_id));

      // 过滤掉好友后的单向关注
      const followingOnly = followingDocs.filter(doc => !friendIds.includes(doc.following_id));

      // 过滤掉好友后的单向关注者
      const followersOnly = followersDocs.filter(doc => !friendIds.includes(doc.follower_id));

      // 初始化followingBack状态：标记已经在关注哪些粉丝
      const followingBackSet = new Set(
        followersOnly
          .map(doc => doc.follower_id)
          .filter(followerId => followingIds.includes(followerId))
      );
      setFollowingBack(followingBackSet);

      setFollowing(followingOnly);
      setFollowers(followersOnly);
      setFriends(friendsList);
    } catch (error) {
      console.error('Error loading follow data:', error);
      setFollowing([]);
      setFollowers([]);
      setFriends([]);
      setFollowingBack(new Set());
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (followingId, isFriend = false) => {
    try {
      // 找到对应的关注关系文档
      const targetList = isFriend ? friends : following;
      const followDoc = targetList.find(f =>
        f.follower_id === user.$id && f.following_id === followingId
      );

      if (followDoc) {
        await databases.deleteDocument(
          DATABASE_ID,
          FOLLOWS_COLLECTION_ID,
          followDoc.$id
        );
        loadFollowData(); // 重新加载数据
        // 通知父组件关注状态已改变
        if (onFollowingChange) {
          onFollowingChange();
        }
      }
    } catch (error) {
      console.error('Error unfollowing:', error);
    }
  };

  const handleFollowBack = async (followerId) => {
    try {
      // 检查是否已经在关注这个粉丝
      const existingFollow = following.find(f => f.following_id === followerId);

      if (existingFollow) {
        // 如果已经在关注，取消关注
        await databases.deleteDocument(
          DATABASE_ID,
          FOLLOWS_COLLECTION_ID,
          existingFollow.$id
        );
        setFollowingBack(prev => {
          const newSet = new Set(prev);
          newSet.delete(followerId);
          return newSet;
        });
      } else {
        // 如果还没关注，添加关注
        await databases.createDocument(
          DATABASE_ID,
          FOLLOWS_COLLECTION_ID,
          ID.unique(),
          {
            follower_id: user.$id,
            following_id: followerId,
            created_at: new Date().toISOString()
          }
        );
        setFollowingBack(prev => new Set([...prev, followerId]));
      }

      loadFollowData(); // 重新加载数据
      // 通知父组件关注状态已改变
      if (onFollowingChange) {
        onFollowingChange();
      }
    } catch (error) {
      console.error('Error following back:', error);
    }
  };

  const handleRemoveFollower = async (followerId) => {
    try {
      // 找到对应的关注关系文档
      const followDoc = followers.find(f =>
        f.follower_id === followerId && f.following_id === user.$id
      );

      if (followDoc) {
        await databases.deleteDocument(
          DATABASE_ID,
          FOLLOWS_COLLECTION_ID,
          followDoc.$id
        );
        loadFollowData(); // 重新加载数据
      }
    } catch (error) {
      console.error('Error removing follower:', error);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="sm"
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
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
            Social Connections
          </Typography>
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
        <Typography variant="body2" color="text.secondary">
          Friends are formed by mutual following
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* 好友（互相关注） */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Friends
              </Typography>
              <Chip
                label={`${friends.length}`}
                size="small"
                color="success"
                variant="outlined"
              />
            </Box>

            {loading ? (
              <Typography color="text.secondary">Loading...</Typography>
            ) : friends.length === 0 ? (
              <Typography color="text.secondary">
                No friends yet. When you both follow each other, you'll become friends automatically!
              </Typography>
            ) : (
              <List>
                {friends.map((friend) => (
                  <ListItem key={friend.$id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        {friend.following_id.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`User ${friend.following_id.substring(0, 8)}`}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label="Friend" size="small" color="success" />
                          <Typography variant="caption" color="text.secondary">
                            Mutual following
                          </Typography>
                        </Box>
                      }
                      secondaryTypographyProps={{
                        component: 'div'
                      }}
                    />
                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                      <IconButton
                        onClick={() => handleUnfollow(friend.following_id, true)}
                        color="error"
                        size="small"
                      >
                        <PersonRemoveIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {/* 正在关注（单向） */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Following
              </Typography>
              <Chip
                label={`${following.length}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>

            {loading ? (
              <Typography color="text.secondary">Loading...</Typography>
            ) : following.length === 0 ? (
              <Typography color="text.secondary">
                You're not following anyone yet. Follow users to see their public wishes first!
              </Typography>
            ) : (
              <List>
                {following.map((follow) => (
                  <ListItem key={follow.$id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {follow.following_id.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`User ${follow.following_id.substring(0, 8)}`}
                      secondary="Following"
                    />
                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                      <IconButton
                        onClick={() => handleUnfollow(follow.following_id)}
                        color="error"
                        size="small"
                      >
                        <PersonRemoveIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {/* 关注者（单向） */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Followers
              </Typography>
              <Chip
                label={`${followers.length}`}
                size="small"
                color="info"
                variant="outlined"
              />
            </Box>

            {loading ? (
              <Typography color="text.secondary">Loading...</Typography>
            ) : followers.length === 0 ? (
              <Typography color="text.secondary">
                No followers yet. Share great wishes to attract followers!
              </Typography>
            ) : (
              <List>
                {followers.map((follower) => (
                  <ListItem key={follower.$id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'info.main' }}>
                        {follower.follower_id.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`User ${follower.follower_id.substring(0, 8)}`}
                      secondary={
                        followingBack.has(follower.follower_id)
                          ? "Following Back"
                          : "Follower"
                      }
                      secondaryTypographyProps={{
                        component: 'span'
                      }}
                    />
                    <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Tooltip title={
                        followingBack.has(follower.follower_id)
                          ? "Unfollow"
                          : "Follow Back"
                      }>
                        <IconButton
                          size="small"
                          onClick={() => handleFollowBack(follower.follower_id)}
                          sx={{
                            color: followingBack.has(follower.follower_id)
                              ? 'primary.main'
                              : 'success.main',
                            '&:hover': {
                              bgcolor: followingBack.has(follower.follower_id)
                                ? 'primary.main'
                                : 'success.main',
                              color: 'white',
                            },
                          }}
                        >
                          {followingBack.has(follower.follower_id)
                            ? <PersonRemoveIcon />
                            : <PersonAddIcon />
                          }
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove Follower">
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveFollower(follower.follower_id)}
                          color="error"
                        >
                          <PersonRemoveIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {/* 使用说明 */}
          <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              How Social Connections Work:
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • <strong>Friends</strong>: When you both follow each other, you become friends automatically
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • <strong>Following</strong>: You can see their public wishes prioritized in your feed
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • <strong>Follow Back</strong>: Quick follow your followers to become friends instantly
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • <strong>Friends</strong> can see each other's "friends-only" wishes
            </Typography>
          </Box>
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
