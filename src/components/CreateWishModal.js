"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  People as PeopleIcon,
  Tag as TagIcon,
} from '@mui/icons-material';
import { databases } from "@/lib/appwrite";
import { ID } from "appwrite";

const DATABASE_ID = 'wish_wall_db';
const WISHES_COLLECTION_ID = 'wishes';

export default function CreateWishModal({ user, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "personal",
    visibility: "public",
    tags: "",
  });
  const [error, setError] = useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const categories = [
    { value: "personal", label: "Personal", emoji: "👤", color: "primary" },
    { value: "career", label: "Career", emoji: "💼", color: "secondary" },
    { value: "health", label: "Health", emoji: "🏥", color: "success" },
    { value: "relationship", label: "Relationship", emoji: "❤️", color: "error" },
    { value: "travel", label: "Travel", emoji: "✈️", color: "info" },
    { value: "education", label: "Education", emoji: "📚", color: "warning" },
    { value: "financial", label: "Financial", emoji: "💰", color: "success" },
    { value: "other", label: "Other", emoji: "🎯", color: "default" },
  ];

  const visibilities = [
    {
      value: "public",
      label: "Public",
      description: "Share with the community",
      icon: <PublicIcon sx={{ color: 'success.main' }} />
    },
    {
      value: "private",
      label: "Private",
      description: "Keep it personal",
      icon: <LockIcon sx={{ color: 'text.secondary' }} />
    },
    {
      value: "friends",
      label: "Friends Only",
      description: "Share with friends only",
      icon: <PeopleIcon sx={{ color: 'success.main' }} />
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Please fill in both title and content");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const tags = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await databases.createDocument(
        DATABASE_ID,
        WISHES_COLLECTION_ID,
        ID.unique(),
        {
          user_id: user.$id,
          title: formData.title.trim(),
          content: formData.content.trim(),
          category: formData.category,
          visibility: formData.visibility,
          tags: tags,
          is_completed: false,
          like_count: 0,
          comment_count: 0,
          metadata: "{}",
        }
      );

      onSuccess();
    } catch (error) {
      console.error("Error creating wish:", error);
      setError(error.message || "Failed to create wish. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          m: isMobile ? 0 : 2,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
              Share Your Wish
            </Typography>
          </Box>
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
          Share your dreams and aspirations with the community
        </Typography>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Title */}
            <TextField
              fullWidth
              label="Wish Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What do you wish for?"
              required
              inputProps={{ maxLength: 200 }}
              helperText={`${formData.title.length}/200 characters`}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            {/* Content */}
            <TextField
              fullWidth
              label="Tell us more about your wish"
              name="content"
              value={formData.content}
              onChange={handleChange}
              multiline
              rows={4}
              placeholder="Describe your wish in detail. What makes it special? Why is it important to you?"
              required
              inputProps={{ maxLength: 20000 }}
              helperText={`${formData.content.length}/20,000 characters`}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            {/* Category */}
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                Category
              </FormLabel>
              <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 2 }}>
                {categories.map((category) => (
                  <Paper
                    key={category.value}
                    elevation={formData.category === category.value ? 4 : 1}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: formData.category === category.value ? 'primary.main' : 'divider',
                      bgcolor: formData.category === category.value ? 'primary.50' : 'background.paper',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'primary.50',
                      },
                    }}
                    onClick={() => setFormData({ ...formData, category: category.value })}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6">{category.emoji}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'center' }}>
                        {category.label}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </FormControl>

            {/* Visibility */}
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                Who can see this wish?
              </FormLabel>
              <RadioGroup
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {visibilities.map((visibility) => (
                    <Paper
                      key={visibility.value}
                      elevation={formData.visibility === visibility.value ? 4 : 1}
                      sx={{
                        p: 2,
                        border: '2px solid',
                        borderColor: formData.visibility === visibility.value ? 'primary.main' : 'divider',
                        bgcolor: formData.visibility === visibility.value ? 'primary.50' : 'background.paper',
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <FormControlLabel
                        value={visibility.value}
                        control={<Radio sx={{ color: 'primary.main' }} />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                            {visibility.icon}
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {visibility.label}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {visibility.description}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{
                          width: '100%',
                          m: 0,
                          '& .MuiFormControlLabel-label': { width: '100%' },
                        }}
                      />
                    </Paper>
                  ))}
                </Box>
              </RadioGroup>
            </FormControl>

            {/* Tags */}
            <TextField
              fullWidth
              label="Tags (optional)"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="dream, goal, motivation (separate with commas)"
              InputProps={{
                startAdornment: <TagIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
              helperText="Add tags to help others find wishes like yours"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            {error && (
              <Alert
                severity="error"
                sx={{
                  borderRadius: 2,
                  '& .MuiAlert-message': {
                    width: '100%',
                  },
                }}
              >
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 2 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 4,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {loading ? "Sharing..." : "✨ Share Wish"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
