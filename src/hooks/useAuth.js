import { useState, useEffect } from 'react';
import { account } from '@/lib/appwrite';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      setLoading(true);
      console.log('🔐 Checking user authentication...');
      const userData = await account.get();
      console.log('✅ User authenticated:', userData.$id);
      setUser(userData);
    } catch (error) {
      console.log('❌ User not authenticated or error occurred');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    // This will be handled by the AuthModal component
    // Just refresh user data after successful login
    await checkUser();
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      console.log('👋 User logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    refreshUser: checkUser
  };
}
