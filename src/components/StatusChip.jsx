import React from 'react';
import { Chip } from '@mui/material';
import {
  FiberNew as NewIcon,
  Autorenew as InProgressIcon,
  HourglassEmpty as PendingIcon,
  CheckCircle as ResolvedIcon,
  Cancel as RejectedIcon,
  Lock as ClosedIcon,
} from '@mui/icons-material';

const StatusChip = ({ status, size = 'medium' }) => {
  const statusConfig = {
    created: {
      label: 'Créé',
      color: 'default',
      icon: <NewIcon fontSize="small" />,
      bgcolor: '#e3f2fd',
      textColor: '#1976d2',
    },
    in_progress: {
      label: 'En cours',
      color: 'info',
      icon: <InProgressIcon fontSize="small" />,
      bgcolor: '#e1f5fe',
      textColor: '#0288d1',
    },
    pending: {
      label: 'En attente',
      color: 'warning',
      icon: <PendingIcon fontSize="small" />,
      bgcolor: '#fff3e0',
      textColor: '#ed6c02',
    },
    resolved: {
      label: 'Résolu',
      color: 'success',
      icon: <ResolvedIcon fontSize="small" />,
      bgcolor: '#e8f5e9',
      textColor: '#2e7d32',
    },
    rejected: {
      label: 'Rejeté',
      color: 'error',
      icon: <RejectedIcon fontSize="small" />,
      bgcolor: '#ffebee',
      textColor: '#d32f2f',
    },
    closed: {
      label: 'Fermé',
      color: 'default',
      icon: <ClosedIcon fontSize="small" />,
      bgcolor: '#f5f5f5',
      textColor: '#616161',
    },
  };

  const config = statusConfig[status] || statusConfig.created;

  return (
    <Chip
      label={config.label}
      size={size}
      icon={config.icon}
      sx={{
        bgcolor: config.bgcolor,
        color: config.textColor,
        fontWeight: 600,
        '& .MuiChip-icon': {
          color: config.textColor,
        },
      }}
    />
  );
};

export default StatusChip;
