"use client";

import { useState } from "react";
import {
  Box,
  Container,
  CircularProgress,
  Typography,
  Button,
  Alert,
  AlertTitle,
} from '@mui/material';
import { useAuth } from "@/hooks/useAuth";
import { useFollowing } from "@/hooks/useFollowing";
import { useWishes } from "@/hooks/useWishes";
import Header from "@/components/Header";
import WishGrid from "@/components/WishGrid";
import CategoryFilter from "@/components/CategoryFilter";
import ModalManager from "@/components/ModalManager";

export default function Home() {
  // Modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateWishModal, setShowCreateWishModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [showUserWishesModal, setShowUserWishesModal] = useState(false);
  const [targetUserId, setTargetUserId] = useState(null);

  // Custom hooks
  const { user, loading: authLoading, login, logout } = useAuth();
  const { following, friendsCount, refreshFollowing } = useFollowing(user);
  const {
    wishes,
    loading: wishesLoading,
    selectedCategory,
    refreshWishes,
    changeCategory
  } = useWishes(user, following);

  // Event handlers
  const handleWishCreated = () => {
    refreshWishes();
    setShowCreateWishModal(false);
  };

  const handleViewUser = (userId) => {
    setTargetUserId(userId);
    setShowUserWishesModal(true);
  };

  const handleFollowingChange = () => {
    refreshFollowing();
    refreshWishes();
  };




  // Loading and error states
  const isLoading = authLoading || wishesLoading;
  const showLoginPrompt = !user && !authLoading; // Show login prompt for unauthenticated users
  const canShowContent = !isLoading; // Can show content when not loading, regardless of auth status

  // Main render function
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      }}
    >
      {/* Header */}
      <Header
        user={user}
        onLogin={() => setShowAuthModal(true)}
        onLogout={logout}
        onCreateWish={() => setShowCreateWishModal(true)}
        onProfile={() => setShowProfileModal(true)}
        onFollowing={() => setShowFollowModal(true)}
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Loading State */}
        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '200px',
            }}
          >
            <CircularProgress size={40} />
            <Typography variant="h6" sx={{ ml: 2 }}>
              Loading wishes...
            </Typography>
          </Box>
        )}

        {/* Login Prompt for Unauthenticated Users */}
        {showLoginPrompt && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
              textAlign: 'center',
              gap: 2,
              mb: 4,
              p: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'primary.light',
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Welcome to Wish Wall! 🌟
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Sign in to share your own wishes and connect with friends
            </Typography>
            <Button
              variant="contained"
              size="medium"
              onClick={() => setShowAuthModal(true)}
              sx={{ borderRadius: 2 }}
            >
              Sign In
            </Button>
          </Box>
        )}

        {/* Main Content */}
        {canShowContent && (
          <>
            {/* Create Wish Button */}
            {user && (
              <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => setShowCreateWishModal(true)}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                    fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              >
                Share Your Wish
              </Button>
              </Box>
            )}

            {/* Category Filter */}
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={changeCategory}
            />

            {/* Wishes Grid */}
            <WishGrid
              wishes={wishes}
                user={user}
              onUpdate={refreshWishes}
                onViewUser={handleViewUser}
              onFollowingChange={handleFollowingChange}
              />
          </>
        )}
      </Container>

      {/* Modals */}
      <ModalManager
        showAuthModal={showAuthModal}
        showCreateWishModal={showCreateWishModal}
        showProfileModal={showProfileModal}
        showFollowModal={showFollowModal}
        showUserWishesModal={showUserWishesModal}
          user={user}
        friendsCount={friendsCount}
          targetUserId={targetUserId}
        onCloseAuth={() => setShowAuthModal(false)}
        onCloseCreateWish={() => setShowCreateWishModal(false)}
        onSuccessCreateWish={handleWishCreated}
        onCloseProfile={() => setShowProfileModal(false)}
        onCloseFollow={() => setShowFollowModal(false)}
        onFollowingChange={handleFollowingChange}
        onCloseUserWishes={() => {
            setShowUserWishesModal(false);
            setTargetUserId(null);
          }}
        onUpdateWishes={refreshWishes}
        />
    </Box>
  );
}
