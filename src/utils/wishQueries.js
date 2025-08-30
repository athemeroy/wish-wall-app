import { Query } from 'appwrite';

/**
 * Build queries for loading wishes based on user permissions and category
 * @param {Object} user - Current user object
 * @param {Array} following - Array of user IDs that current user is following
 * @param {string} category - Category filter ('all' or specific category)
 * @returns {Array} Array of query objects
 */
export function buildWishQueries(user, following, category = 'all') {
  // Ensure following is always an array
  const safeFollowing = Array.isArray(following) ? following : [];

  if (category === 'all') {
    return buildAllWishesQueries(user, safeFollowing);
  } else {
    return buildCategoryWishesQueries(user, safeFollowing, category);
  }
}

/**
 * Build queries for all wishes
 */
function buildAllWishesQueries(user, safeFollowing) {
  if (user) {
    let visibilityConditions = [
      Query.equal('user_id', user.$id),        // User's own wishes
      Query.equal('visibility', 'public')      // Public wishes from others
    ];

    // Add friends' wishes if user is following anyone
    if (safeFollowing && safeFollowing.length > 0) {
      const friendConditions = safeFollowing.map(followingId =>
        Query.and([
          Query.equal('visibility', 'friends'),  // Friends-only wishes
          Query.equal('user_id', followingId)     // From followed users
        ])
      );

      if (friendConditions.length === 1) {
        visibilityConditions.push(friendConditions[0]);
      } else if (friendConditions.length > 1) {
        visibilityConditions.push(Query.or(friendConditions));
      }
    }

    return [
      Query.or(visibilityConditions),
      Query.orderDesc('$createdAt')
    ];
  } else {
    // Not logged in: only public wishes
    return [
      Query.equal('visibility', 'public'),
      Query.orderDesc('$createdAt')
    ];
  }
}

/**
 * Build queries for specific category wishes
 */
function buildCategoryWishesQueries(user, safeFollowing, category) {
  if (user) {
    let categoryConditions = [
      Query.and([
        Query.equal('user_id', user.$id),        // User's own category wishes
        Query.equal('category', category)
      ]),
      Query.and([
        Query.equal('visibility', 'public'),    // Public category wishes
        Query.equal('category', category)
      ])
    ];

    // Add friends' category wishes
    if (safeFollowing && safeFollowing.length > 0) {
      const friendCategoryConditions = safeFollowing.map(followingId =>
        Query.and([
          Query.equal('visibility', 'friends'),  // Friends-only wishes
          Query.equal('user_id', followingId),    // From followed users
          Query.equal('category', category)
        ])
      );

      if (friendCategoryConditions.length === 1) {
        categoryConditions.push(friendCategoryConditions[0]);
      } else if (friendCategoryConditions.length > 1) {
        categoryConditions.push(Query.or(friendCategoryConditions));
      }
    }

    return [
      Query.or(categoryConditions),
      Query.orderDesc('$createdAt')
    ];
  } else {
    // Not logged in: only public category wishes
    return [
      Query.and([
        Query.equal('visibility', 'public'),
        Query.equal('category', category)
      ]),
      Query.orderDesc('$createdAt')
    ];
  }
}

/**
 * Sort wishes to prioritize content from followed users
 * @param {Array} wishes - Array of wish objects
 * @param {Object} user - Current user object
 * @param {Array} following - Array of followed user IDs
 * @returns {Array} Sorted wishes array
 */
export function sortWishesByFollowing(wishes, user, following) {
  // Ensure following is always an array
  const safeFollowing = Array.isArray(following) ? following : [];

  if (!user || !safeFollowing || safeFollowing.length === 0) {
    return wishes;
  }

  return wishes.sort((a, b) => {
    // User's own wishes always first
    if (a.user_id === user.$id) return -1;
    if (b.user_id === user.$id) return 1;

    // Followed users' public wishes next
    const aIsFollowing = safeFollowing.includes(a.user_id) && a.visibility === 'public';
    const bIsFollowing = safeFollowing.includes(b.user_id) && b.visibility === 'public';

    if (aIsFollowing && !bIsFollowing) return -1;
    if (!aIsFollowing && bIsFollowing) return 1;

    // Otherwise sort by creation time (most recent first)
    return new Date(b.$createdAt) - new Date(a.$createdAt);
  });
}
