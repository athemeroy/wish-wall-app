import AuthModal from './AuthModal';
import CreateWishModal from './CreateWishModal';
import ProfileModal from './ProfileModal';
import FollowModal from './FollowModal';
import UserWishesModal from './UserWishesModal';

export default function ModalManager({
  // Modal states
  showAuthModal,
  showCreateWishModal,
  showProfileModal,
  showFollowModal,
  showUserWishesModal,

  // Data
  user,
  friendsCount,
  targetUserId,

  // Callbacks
  onCloseAuth,
  onCloseCreateWish,
  onSuccessCreateWish,
  onCloseProfile,
  onCloseFollow,
  onFollowingChange,
  onCloseUserWishes,
  onUpdateWishes,
}) {
  return (
    <>
      {/* Authentication Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={onCloseAuth}
          onSuccess={() => {
            onCloseAuth();
            // Refresh data after login
            window.location.reload();
          }}
        />
      )}

      {/* Create Wish Modal */}
      {showCreateWishModal && user && (
        <CreateWishModal
          user={user}
          onClose={onCloseCreateWish}
          onSuccess={onSuccessCreateWish}
        />
      )}

      {/* Profile Modal */}
      {showProfileModal && user && (
        <ProfileModal
          user={user}
          friendsCount={friendsCount}
          onClose={onCloseProfile}
        />
      )}

      {/* Follow Modal */}
      {showFollowModal && user && (
        <FollowModal
          user={user}
          onClose={onCloseFollow}
          onFollowingChange={onFollowingChange}
        />
      )}

      {/* User Wishes Modal */}
      {showUserWishesModal && targetUserId && (
        <UserWishesModal
          targetUserId={targetUserId}
          currentUser={user}
          onClose={() => {
            onCloseUserWishes();
          }}
          onUpdate={onUpdateWishes}
        />
      )}
    </>
  );
}
