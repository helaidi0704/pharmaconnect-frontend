import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography, Box } from '@mui/material';
import { NavigateNext as NavigateNextIcon, Home as HomeIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Breadcrumbs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbNameMap = {
    '/dashboard': 'Tableau de bord',
    '/claims': 'Réclamations',
    '/claims/new': 'Nouvelle réclamation',
    '/stock': 'Stock',
    '/stock/new': 'Ajouter au stock',
    '/stock/alerts': 'Alertes péremption',
    '/profile': 'Mon profil',
  };

  if (pathnames.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          onClick={() => navigate('/dashboard')}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Accueil
        </Link>

        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const breadcrumbName = breadcrumbNameMap[to] || value;

          return last ? (
            <Typography color="text.primary" key={to}>
              {breadcrumbName}
            </Typography>
          ) : (
            <Link
              underline="hover"
              color="inherit"
              onClick={() => navigate(to)}
              key={to}
              sx={{ cursor: 'pointer' }}
            >
              {breadcrumbName}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;
