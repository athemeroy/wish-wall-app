import { useState, useEffect } from 'react';
import { databases, DATABASE_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { buildWishQueries, sortWishesByFollowing } from '@/utils/wishQueries';

const WISHES_COLLECTION_ID = 'wishes';

export function useWishes(user, following) {
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Load wishes when user or following changes
  useEffect(() => {
    if (user !== undefined) { // Allow null user (not logged in)
      loadWishes(selectedCategory);
    }
  }, [user, following, selectedCategory]);

  const loadWishes = async (category = 'all') => {
    try {
      setLoading(true);

      // If user data hasn't loaded yet, wait
      if (user === undefined) {
        console.log('⏳ Waiting for user authentication...');
        setWishes([]);
        return;
      }

      console.log('📝 Loading wishes for category:', category);

      // Use utility functions to build queries and sort wishes
      const queries = buildWishQueries(user, following, category);

      console.log('🔍 Wish queries:', queries.map(q => JSON.stringify(q)).join('\n'));

      const response = await databases.listDocuments(
        DATABASE_ID,
        WISHES_COLLECTION_ID,
        queries
      );

      // Sort wishes to prioritize followed users' content
      const sortedWishes = sortWishesByFollowing(response.documents, user, following);

      setWishes(sortedWishes);
      console.log(`✅ Loaded ${sortedWishes.length} wishes`);
    } catch (error) {
      console.error('Error loading wishes:', error);
      setWishes([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshWishes = () => {
    return loadWishes(selectedCategory);
  };

  const changeCategory = (category) => {
    setSelectedCategory(category);
  };

  return {
    wishes,
    loading,
    selectedCategory,
    loadWishes,
    refreshWishes,
    changeCategory
  };
}
