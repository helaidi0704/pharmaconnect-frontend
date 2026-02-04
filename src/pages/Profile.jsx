import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Avatar,
  Divider,
  Alert,
  Tab,
  Tabs,
  //Breadcrumbs ,
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { useSnackbar } from 'notistack';
import Navbar from '../components/Navbar';
import Breadcrumbs from '../components/Breadcrumbs';
import ConfirmDialog from '../components/ConfirmDialog';


const Profile = () => {
  const { user, updateUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  // Formulaire profil
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    phone: '',
    companyAddress: '',
    latitude: '',
    longitude: '',
  });

  // Formulaire mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        companyName: user.companyName || '',
        phone: user.phone || '',
        companyAddress: user.companyAddress || '',
        latitude: user.location?.coordinates?.[1] || '',
        longitude: user.location?.coordinates?.[0] || '',
      });
    }
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { email, latitude, longitude, ...updates } = profileData; // Email non modifiable

      // Ajouter les coordonnées si fournies
      if (latitude && longitude) {
        updates.location = {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
          address: updates.companyAddress || '',
        };
      }

      const response = await authAPI.updateProfile(updates);
      updateUser(response.data.data);
      enqueueSnackbar('Profil mis à jour avec succès', { variant: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      enqueueSnackbar(
        error.response?.data?.error?.message || 'Erreur lors de la mise à jour',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      enqueueSnackbar('Les mots de passe ne correspondent pas', { variant: 'error' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      enqueueSnackbar('Le mot de passe doit contenir au moins 8 caractères', {
        variant: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      enqueueSnackbar('Mot de passe modifié avec succès', { variant: 'success' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      enqueueSnackbar(
        error.response?.data?.error?.message || 'Erreur lors du changement de mot de passe',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    if (user?.companyName) {
      return user.companyName.substring(0, 2).toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  const getRoleLabel = (role) => {
    const labels = {
      pharmacy: 'Pharmacie',
      depot_manager: 'Gestionnaire de Dépôt',
      laboratory: 'Laboratoire',
    };
    return labels[role] || role;
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          {/* Header avec avatar */}
          <Box display="flex" alignItems="center" mb={4}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: '2rem',
                mr: 3,
              }}
            >
              {getInitials()}
            </Avatar>
            <Box>
              <Typography variant="h4">Mon Profil</Typography>
              <Typography variant="body2" color="text.secondary">
                {getRoleLabel(user?.role)}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Tabs */}
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab icon={<PersonIcon />} label="Informations" iconPosition="start" />
            <Tab icon={<LockIcon />} label="Mot de passe" iconPosition="start" />
          </Tabs>

          {/* Tab Panel 1 - Informations */}
          {tabValue === 0 && (
            <Box component="form" onSubmit={handleProfileSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    L'adresse email ne peut pas être modifiée
                  </Alert>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Prénom"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={profileData.email}
                    disabled
                    helperText="L'email ne peut pas être modifié"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nom de l'entreprise"
                    name="companyName"
                    value={profileData.companyName}
                    onChange={handleProfileChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Téléphone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Localisation (pour la carte)
                    </Typography>
                  </Divider>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Adresse complète"
                    name="companyAddress"
                    value={profileData.companyAddress}
                    onChange={handleProfileChange}
                    helperText="Adresse complète de votre établissement"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    name="latitude"
                    type="number"
                    inputProps={{ step: 'any' }}
                    value={profileData.latitude}
                    onChange={handleProfileChange}
                    helperText="Ex: 48.8566 (Paris)"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    name="longitude"
                    type="number"
                    inputProps={{ step: 'any' }}
                    value={profileData.longitude}
                    onChange={handleProfileChange}
                    helperText="Ex: 2.3522 (Paris)"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Alert severity="info">
                    Pour trouver vos coordonnées: Ouvrez Google Maps, faites un clic droit sur votre
                    emplacement, et copiez les coordonnées (latitude, longitude).
                  </Alert>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
              </Box>
            </Box>
          )}

          {/* Tab Panel 2 - Mot de passe */}
          {tabValue === 1 && (
            <Box component="form" onSubmit={handlePasswordSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Alert severity="warning">
                    Choisissez un mot de passe fort avec au moins 8 caractères
                  </Alert>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Mot de passe actuel"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Nouveau mot de passe"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    helperText="Minimum 8 caractères"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirmer le nouveau mot de passe"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  startIcon={<LockIcon />}
                  disabled={loading}
                >
                  {loading ? 'Modification...' : 'Changer le mot de passe'}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default Profile;
