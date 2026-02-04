import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import {
  Inbox as InboxIcon,
  SearchOff as SearchOffIcon,
  ErrorOutline as ErrorIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const EmptyState = ({
  icon: CustomIcon,
  title = 'Aucune donnée',
  message = 'Il n\'y a aucune donnée à afficher pour le moment',
  actionText,
  onAction,
  type = 'empty', // 'empty', 'search', 'error'
}) => {
  const icons = {
    empty: InboxIcon,
    search: SearchOffIcon,
    error: ErrorIcon,
  };

  const Icon = CustomIcon || icons[type];

  return (
    <Paper
      sx={{
        p: 6,
        textAlign: 'center',
        bgcolor: 'background.default',
        border: '2px dashed',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Icon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.3 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
          {message}
        </Typography>
        {actionText && onAction && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAction}
            sx={{ mt: 2 }}
          >
            {actionText}
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default EmptyState;
