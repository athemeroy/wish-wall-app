import { Box, Chip, Typography } from '@mui/material';

const categories = [
  { value: 'all', label: 'All Wishes', emoji: '🌟' },
  { value: 'personal', label: 'Personal', emoji: '👤' },
  { value: 'career', label: 'Career', emoji: '💼' },
  { value: 'health', label: 'Health', emoji: '🏥' },
  { value: 'relationship', label: 'Relationship', emoji: '❤️' },
  { value: 'travel', label: 'Travel', emoji: '✈️' },
  { value: 'education', label: 'Education', emoji: '📚' },
  { value: 'financial', label: 'Financial', emoji: '💰' },
  { value: 'other', label: 'Other', emoji: '🎯' },
];

export default function CategoryFilter({ selectedCategory, onCategoryChange }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Filter by Category
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {categories.map((category) => (
          <Chip
            key={category.value}
            label={`${category.emoji} ${category.label}`}
            onClick={() => onCategoryChange(category.value)}
            variant={selectedCategory === category.value ? 'filled' : 'outlined'}
            color={selectedCategory === category.value ? 'primary' : 'default'}
            sx={{
              '&:hover': {
                backgroundColor: selectedCategory === category.value
                  ? 'primary.dark'
                  : 'action.hover',
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
