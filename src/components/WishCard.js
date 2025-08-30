"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Box,
  TextField,
  Button,
  Avatar,
  Collapse,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  PersonRemove as PersonRemoveIcon,
} from '@mui/icons-material';
import { databases, DATABASE_ID, FOLLOWS_COLLECTION_ID } from "@/lib/appwrite";
import { Query, ID } from "appwrite";

const INTERACTIONS_COLLECTION_ID = 'wish_interactions';

export default function WishCard({ wish, user, onUpdate, onViewUser, onFollowingChange }) {
  const [interactions, setInteractions] = useState([]);
  const [userInteraction, setUserInteraction] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // 检查是否是自己的愿望
  const isOwnWish = user && wish.user_id === user.$id;



  // 获取发布者显示名称
  const getAuthorDisplayName = () => {
    if (isOwnWish) {
      return user?.name || user?.email?.split('@')[0] || 'You';
    }
    // 这里可以根据需要扩展为从用户表获取真实姓名
    return `User ${wish.user_id.substring(0, 8)}`;
  };



  const handleViewUser = () => {
    if (onViewUser && !isOwnWish) {
      onViewUser(wish.user_id);
    }
  };

  useEffect(() => {
    loadInteractions();
    checkFollowStatus();
  }, [wish.$id, user]);

  const loadInteractions = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        INTERACTIONS_COLLECTION_ID,
        [Query.equal('wish_id', wish.$id)]
      );

      setInteractions(response.documents);

      // Check if current user has interacted
      if (user) {
        const userLike = response.documents.find(
          interaction => interaction.user_id === user.$id && interaction.type === 'like'
        );
        setUserInteraction(userLike);
      }
    } catch (error) {
      console.error('Error loading interactions:', error);
    }
  };

  const checkFollowStatus = async () => {
    if (!user || isOwnWish) return;

    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        FOLLOWS_COLLECTION_ID,
        [
          Query.equal('follower_id', user.$id),
          Query.equal('following_id', wish.user_id)
        ]
      );
      setIsFollowing(response.documents.length > 0);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!user || isOwnWish) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        // 取消关注
        const response = await databases.listDocuments(
          DATABASE_ID,
          FOLLOWS_COLLECTION_ID,
          [
            Query.equal('follower_id', user.$id),
            Query.equal('following_id', wish.user_id)
          ]
        );

        if (response.documents.length > 0) {
          await databases.deleteDocument(
            DATABASE_ID,
            FOLLOWS_COLLECTION_ID,
            response.documents[0].$id
          );
        }
        setIsFollowing(false);
        // 通知父组件关注状态已改变
        if (onFollowingChange) {
          onFollowingChange();
        }
      } else {
        // 关注
        await databases.createDocument(
          DATABASE_ID,
          FOLLOWS_COLLECTION_ID,
          ID.unique(),
          {
            follower_id: user.$id,
            following_id: wish.user_id,
            created_at: new Date().toISOString()
          }
        );
        setIsFollowing(true);
        // 通知父组件关注状态已改变
        if (onFollowingChange) {
          onFollowingChange();
        }
      }
    } catch (error) {
      console.error('Error handling follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) return;

    try {
      setLoading(true);
      if (userInteraction) {
        // Unlike
        await databases.deleteDocument(
          DATABASE_ID,
          INTERACTIONS_COLLECTION_ID,
          userInteraction.$id
        );
        await databases.updateDocument(
          DATABASE_ID,
          'wishes',
          wish.$id,
          { like_count: Math.max(0, wish.like_count - 1) }
        );
      } else {
        // Like
        await databases.createDocument(
          DATABASE_ID,
          INTERACTIONS_COLLECTION_ID,
          ID.unique(),
          {
            wish_id: wish.$id,
            user_id: user.$id,
            type: 'like',
            content: '',
            metadata: '{}'
          }
        );
        await databases.updateDocument(
          DATABASE_ID,
          'wishes',
          wish.$id,
          { like_count: wish.like_count + 1 }
        );
      }
      loadInteractions();
      onUpdate();
    } catch (error) {
      console.error('Error handling like:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;

    try {
      setLoading(true);
      await databases.createDocument(
        DATABASE_ID,
        INTERACTIONS_COLLECTION_ID,
        ID.unique(),
        {
          wish_id: wish.$id,
          user_id: user.$id,
          type: 'comment',
          content: commentText.trim(),
          metadata: '{}'
        }
      );
      await databases.updateDocument(
        DATABASE_ID,
        'wishes',
        wish.$id,
        { comment_count: wish.comment_count + 1 }
      );

      setCommentText("");
      loadInteractions();
      onUpdate();
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      personal: '👤',
      career: '💼',
      health: '🏥',
      relationship: '❤️',
      travel: '✈️',
      education: '📚',
      financial: '💰',
      other: '🎯'
    };
    return emojis[category] || '✨';
  };

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case 'public':
        return <PublicIcon fontSize="small" />;
      case 'private':
        return <LockIcon fontSize="small" />;
      case 'friends':
        return <PeopleIcon fontSize="small" />;
      default:
        return <PublicIcon fontSize="small" />;
    }
  };

  const getVisibilityText = (visibility) => {
    const texts = {
      public: 'Public',
      private: 'Private',
      friends: 'Friends Only'
    };
    return texts[visibility] || visibility;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const likeCount = interactions.filter(i => i.type === 'like').length;
  const commentCount = interactions.filter(i => i.type === 'comment').length;
  const comments = interactions.filter(i => i.type === 'comment');

  return (
    <Card
      sx={{
        height: 'fit-content',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 2 }}>
        {/* Author Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: isOwnWish ? 'primary.main' : 'secondary.main',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {getAuthorDisplayName().charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {getAuthorDisplayName()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(wish.$createdAt)}
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          {!isOwnWish && user && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="View user's wishes">
                <IconButton
                  size="small"
                  onClick={handleViewUser}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>

        {/* Wish Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontSize: '1.25rem' }}>
              {getCategoryEmoji(wish.category)}
            </Typography>
            <Chip
              label={wish.category.charAt(0).toUpperCase() + wish.category.slice(1)}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
          </Box>
          <Tooltip title={getVisibilityText(wish.visibility)}>
            <Chip
              icon={getVisibilityIcon(wish.visibility)}
              label={getVisibilityText(wish.visibility)}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          </Tooltip>
        </Box>

        {/* Wish Title */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            mb: 2,
            fontWeight: 600,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {wish.title}
        </Typography>

        {/* Wish Content */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {wish.content}
        </Typography>

        {/* Tags */}
        {wish.tags && wish.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {wish.tags.map((tag, index) => (
              <Chip
                key={index}
                label={`#${tag}`}
                size="small"
                variant="outlined"
                sx={{
                  height: 24,
                  fontSize: '0.7rem',
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            ))}
          </Box>
        )}

        {/* Completion Status */}
        {wish.is_completed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: '1.1rem' }} />
            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 500 }}>
              Completed {wish.completed_at ? formatDate(wish.completed_at) : 'recently'}
            </Typography>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
          <Tooltip title={user ? (userInteraction ? 'Unlike' : 'Like') : 'Sign in to like'}>
            <span>
              <IconButton
                onClick={handleLike}
                disabled={!user || loading}
                sx={{
                  color: userInteraction ? 'error.main' : 'text.secondary',
                  '&:hover': {
                    color: userInteraction ? 'error.dark' : 'error.main',
                  },
                }}
              >
                {userInteraction ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </span>
          </Tooltip>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: '20px' }}>
            {likeCount}
          </Typography>

          <Tooltip title="Comments">
            <IconButton
              onClick={() => setShowComments(!showComments)}
              sx={{
                color: showComments ? 'primary.main' : 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              <CommentIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: '20px' }}>
            {commentCount}
          </Typography>

          {/* 关注按钮 - 仅在非自己的愿望且已登录时显示 */}
          {user && !isOwnWish && (
            <>
              <Tooltip title={isFollowing ? 'Unfollow' : 'Follow'}>
                <span>
                  <IconButton
                    onClick={handleFollow}
                    disabled={followLoading}
                    sx={{
                      color: isFollowing ? 'primary.main' : 'text.secondary',
                      '&:hover': {
                        color: isFollowing ? 'primary.dark' : 'primary.main',
                      },
                    }}
                  >
                    {isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                  </IconButton>
                </span>
              </Tooltip>
            </>
          )}
        </Box>

        <Typography variant="caption" color="text.secondary">
          {formatDate(wish.$createdAt)}
        </Typography>
      </CardActions>

      {/* Comments Section */}
      <Collapse in={showComments}>
        <Divider />
        <Box sx={{ p: 2 }}>
          {user && (
            <Box component="form" onSubmit={handleComment} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!commentText.trim() || loading}
                  sx={{
                    borderRadius: 3,
                    minWidth: 'auto',
                    px: 2,
                  }}
                >
                  <SendIcon fontSize="small" />
                </Button>
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {comments.map((comment) => (
              <Box
                key={comment.$id}
                sx={{
                  p: 2,
                  bgcolor: 'grey.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {comment.content}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(comment.$createdAt)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Collapse>
    </Card>
  );
}
