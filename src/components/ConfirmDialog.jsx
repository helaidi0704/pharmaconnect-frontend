import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Box,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Help as HelpIcon,
} from '@mui/icons-material';

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirmation',
  message = 'Êtes-vous sûr de vouloir continuer ?',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  severity = 'warning', // 'warning', 'error', 'info', 'question'
  confirmColor = 'primary',
  loading = false,
}) => {
  const icons = {
    warning: <WarningIcon color="warning" sx={{ fontSize: 48 }} />,
    error: <ErrorIcon color="error" sx={{ fontSize: 48 }} />,
    info: <InfoIcon color="info" sx={{ fontSize: 48 }} />,
    question: <HelpIcon color="primary" sx={{ fontSize: 48 }} />,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="confirm-dialog-title">
        <Box display="flex" alignItems="center" gap={2}>
          {icons[severity]}
          {title}
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button onClick={onConfirm} color={confirmColor} variant="contained" disabled={loading} autoFocus>
          {loading ? 'En cours...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
