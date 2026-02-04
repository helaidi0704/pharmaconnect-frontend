import React, { useState } from 'react';
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  Add as AddIcon,
  Description as ClaimIcon,
  Inventory as StockIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const QuickActions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const actions = [
    {
      icon: <ClaimIcon />,
      name: 'Nouvelle réclamation',
      onClick: () => navigate('/claims/new'),
      roles: ['pharmacy'],
    },
    {
      icon: <StockIcon />,
      name: 'Ajouter au stock',
      onClick: () => navigate('/stock/new'),
      roles: ['pharmacy'],
    },
    {
      icon: <NotificationsIcon />,
      name: 'Voir les alertes',
      onClick: () => navigate('/stock/alerts'),
      roles: ['pharmacy'],
    },
  ];

  const filteredActions = actions.filter(
    (action) => !action.roles || action.roles.includes(user?.role)
  );

  if (filteredActions.length === 0) {
    return null;
  }

  return (
    <SpeedDial
      ariaLabel="Actions rapides"
      sx={{ position: 'fixed', bottom: 24, right: 24 }}
      icon={<SpeedDialIcon openIcon={<AddIcon />} />}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
    >
      {filteredActions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={action.onClick}
        />
      ))}
    </SpeedDial>
  );
};

export default QuickActions;
