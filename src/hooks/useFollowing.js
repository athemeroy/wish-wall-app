import { useState, useEffect } from 'react';
import { databases, DATABASE_ID, FOLLOWS_COLLECTION_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';

export function useFollowing(user) {
  const [following, setFollowing] = useState([]);
  const [friendsCount, setFriendsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load following data when user changes
  useEffect(() => {
    if (user) {
      loadFollowingData();
    } else {
      setFollowing([]);
      setFriendsCount(0);
    }
  }, [user]);

  const loadFollowingData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load following list
      const followingIds = await loadFollowing(user.$id);

      // Calculate friends (mutual following)
      const friends = await calculateFriends(user.$id, followingIds);

      setFollowing(followingIds);
      setFriendsCount(friends.length);

      console.log(`📊 Following: ${followingIds.length}, Friends: ${friends.length}`);
    } catch (error) {
      console.error('Error loading following data:', error);
      setFollowing([]);
      setFriendsCount(0);
    } finally {
      setLoading(false);
    }
  };

  const loadFollowing = async (userId) => {
    try {
      console.log('Loading following for user:', userId);

      const response = await databases.listDocuments(
        DATABASE_ID,
        FOLLOWS_COLLECTION_ID,
        [Query.equal('follower_id', userId)]
      );

      const followingIds = response.documents.map(doc => doc.following_id);
      console.log(`✅ Loaded ${followingIds.length} following:`, followingIds);
      return followingIds;
    } catch (error) {
      console.error('Error loading following:', error);
      return [];
    }
  };

  const calculateFriends = async (userId, followingIds) => {
    try {
      if (!userId || followingIds.length === 0) return [];

      // Query who is following the current user
      const followersResponse = await databases.listDocuments(
        DATABASE_ID,
        FOLLOWS_COLLECTION_ID,
        [Query.equal('following_id', userId)]
      );

      const followerIds = followersResponse.documents.map(doc => doc.follower_id);

      // Calculate mutual following (friends)
      const friendIds = followingIds.filter(id => followerIds.includes(id));

      console.log(`✅ Calculated ${friendIds.length} friends from mutual following:`, friendIds);
      return friendIds;
    } catch (error) {
      console.error('Error calculating friends:', error);
      return [];
    }
  };

  const refreshFollowing = () => {
    return loadFollowingData();
  };

  return {
    following,
    friendsCount,
    loading,
    refreshFollowing
  };
}
