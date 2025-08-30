import { Box, Grid, Typography } from '@mui/material';
import WishCard from './WishCard';

export default function WishGrid({
  wishes,
  user,
  onUpdate,
  onViewUser,
  onFollowingChange
}) {
  if (!wishes || wishes.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          {user ? 'No wishes yet. Be the first to share!' : 'No public wishes available.'}
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {wishes.map((wish) => (
        <Grid item xs={12} sm={6} lg={4} key={wish.$id}>
          <WishCard
            wish={wish}
            user={user}
            onUpdate={onUpdate}
            onViewUser={onViewUser}
            onFollowingChange={onFollowingChange}
          />
        </Grid>
      ))}
    </Grid>
  );
}
