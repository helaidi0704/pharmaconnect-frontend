import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Avatar,
  Button,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Store as StoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Navbar from '../components/Navbar';
import Breadcrumbs from '../components/Breadcrumbs';
import { partnersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Partners = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [partners, setPartners] = useState([]);
  const [availablePartners, setAvailablePartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [mapCenter, setMapCenter] = useState([48.8566, 2.3522]); // Default to Paris
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState(null);

  const isPharmacy = user?.role === 'pharmacy';
  const partnerType = isPharmacy ? 'dépôts' : 'pharmacies';
  const partnerRoleFilter = isPharmacy ? 'depot_manager' : 'pharmacy';

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const response = await partnersAPI.getMyPartners();
      const partnersData = response.data.data || [];
      setPartners(partnersData);

      // Set map center to first partner with valid coordinates
      if (partnersData.length > 0) {
        const firstWithLocation = partnersData.find(
          (p) => p.location?.coordinates && p.location.coordinates[0] !== 0
        );
        if (firstWithLocation) {
          setMapCenter([
            firstWithLocation.location.coordinates[1],
            firstWithLocation.location.coordinates[0],
          ]);
        }
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
      enqueueSnackbar('Erreur lors du chargement des partenaires', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePartners = async () => {
    setLoadingAvailable(true);
    try {
      const response = await partnersAPI.getAvailable();
      const available = response.data.data || [];
      setAvailablePartners(available);
    } catch (error) {
      console.error('Error fetching available partners:', error);
      enqueueSnackbar('Erreur lors du chargement des partenaires disponibles', { variant: 'error' });
    } finally {
      setLoadingAvailable(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 1 && availablePartners.length === 0) {
      fetchAvailablePartners();
    }
  };

  const handleAddPartner = async (partnerId) => {
    try {
      await partnersAPI.add(partnerId);
      enqueueSnackbar('Partenaire ajouté avec succès', { variant: 'success' });
      fetchPartners();
      fetchAvailablePartners();
    } catch (error) {
      console.error('Error adding partner:', error);
      enqueueSnackbar(
        error.response?.data?.error?.message || 'Erreur lors de l\'ajout du partenaire',
        { variant: 'error' }
      );
    }
  };

  const handleRemovePartner = async () => {
    if (!partnerToDelete) return;

    try {
      await partnersAPI.remove(partnerToDelete._id);
      enqueueSnackbar('Partenaire retiré avec succès', { variant: 'success' });
      setPartners(partners.filter(p => p._id !== partnerToDelete._id));
      setDeleteDialogOpen(false);
      setPartnerToDelete(null);
    } catch (error) {
      console.error('Error removing partner:', error);
      enqueueSnackbar(
        error.response?.data?.error?.message || 'Erreur lors du retrait du partenaire',
        { variant: 'error' }
      );
    }
  };

  const openDeleteDialog = (partner) => {
    setPartnerToDelete(partner);
    setDeleteDialogOpen(true);
  };

  const getRoleLabel = (role) => {
    const labels = {
      pharmacy: 'Pharmacie',
      depot_manager: 'Dépôt',
      laboratory: 'Laboratoire',
    };
    return labels[role] || role;
  };

  const getInitials = (partner) => {
    if (partner.companyName) {
      return partner.companyName.substring(0, 2).toUpperCase();
    }
    return 'PA';
  };

  const PartnerCard = ({ partner, showAddButton = false, showDeleteButton = false }) => (
    <Card
      elevation={selectedPartner?._id === partner._id ? 8 : 2}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s',
        border: selectedPartner?._id === partner._id ? 2 : 0,
        borderColor: 'primary.main',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 6,
        },
      }}
      onClick={() => {
        setSelectedPartner(partner);
        if (partner.location?.coordinates && partner.location.coordinates[0] !== 0) {
          setMapCenter([
            partner.location.coordinates[1],
            partner.location.coordinates[0],
          ]);
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              mr: 2,
            }}
          >
            {getInitials(partner)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="600">
              {partner.companyName}
            </Typography>
            <Chip
              label={getRoleLabel(partner.role)}
              size="small"
              color="primary"
              sx={{ mt: 0.5 }}
            />
          </Box>
          {showAddButton && (
            <IconButton
              color="success"
              onClick={(e) => {
                e.stopPropagation();
                handleAddPartner(partner._id);
              }}
              sx={{ ml: 1 }}
            >
              <AddIcon />
            </IconButton>
          )}
          {showDeleteButton && (
            <IconButton
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                openDeleteDialog(partner);
              }}
              sx={{ ml: 1 }}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>

        <Box sx={{ ml: 7 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            <EmailIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
            {partner.email}
          </Typography>
          {partner.phone && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              <PhoneIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
              {partner.phone}
            </Typography>
          )}
          {partner.companyAddress && (
            <Typography variant="body2" color="text.secondary">
              <LocationIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
              {partner.companyAddress}
            </Typography>
          )}
          {(!partner.location?.coordinates ||
            partner.location.coordinates[0] === 0) && (
            <Chip
              label="Localisation non définie"
              size="small"
              color="warning"
              sx={{ mt: 1 }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <Container>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          py: 4,
        }}
      >
        <Container maxWidth="xl">
          <Breadcrumbs
            items={[
              { label: 'Tableau de bord', path: '/dashboard' },
              { label: `Mes Partenaires ${isPharmacy ? 'Dépôts' : 'Pharmacies'}` },
            ]}
          />

          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              fontWeight="700"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Mes Partenaires {isPharmacy ? 'Dépôts' : 'Pharmacies'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Liste et localisation de vos {partnerType} partenaires
            </Typography>
          </Box>

          <Paper sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label={`Mes ${partnerType} (${partners.length})`} />
              <Tab
                label={`Ajouter un partenaire`}
                icon={<PersonAddIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Paper>

          {tabValue === 0 && (
            partners.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <StoreIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Aucun partenaire {isPharmacy ? 'dépôt' : 'pharmacie'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Vous n'avez pas encore de partenaires {partnerType}.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setTabValue(1)}
                >
                  Ajouter un partenaire
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {/* Map Section */}
                <Grid item xs={12} lg={8}>
                  <Paper sx={{ p: 2, height: '600px' }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                      Carte des {partnerType}
                    </Typography>
                    <Box sx={{ height: 'calc(100% - 40px)', borderRadius: 2, overflow: 'hidden' }}>
                      <MapContainer
                        center={mapCenter}
                        zoom={12}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {partners
                          .filter(
                            (partner) =>
                              partner.location?.coordinates &&
                              partner.location.coordinates[0] !== 0
                          )
                          .map((partner) => (
                            <Marker
                              key={partner._id}
                              position={[
                                partner.location.coordinates[1],
                                partner.location.coordinates[0],
                              ]}
                              eventHandlers={{
                                click: () => setSelectedPartner(partner),
                              }}
                            >
                              <Popup>
                                <Box sx={{ minWidth: 200 }}>
                                  <Typography variant="subtitle1" fontWeight="600">
                                    {partner.companyName}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    <EmailIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                    {partner.email}
                                  </Typography>
                                  {partner.phone && (
                                    <Typography variant="body2" color="text.secondary">
                                      <PhoneIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                      {partner.phone}
                                    </Typography>
                                  )}
                                  {partner.companyAddress && (
                                    <Typography variant="body2" color="text.secondary">
                                      <LocationIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                      {partner.companyAddress}
                                    </Typography>
                                  )}
                                </Box>
                              </Popup>
                            </Marker>
                          ))}
                      </MapContainer>
                    </Box>
                  </Paper>
                </Grid>

                {/* Partners List Section */}
                <Grid item xs={12} lg={4}>
                  <Paper sx={{ p: 2, height: '600px', overflowY: 'auto' }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                      Liste des {partnerType} ({partners.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {partners.map((partner) => (
                        <PartnerCard
                          key={partner._id}
                          partner={partner}
                          showDeleteButton={true}
                        />
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            )
          )}

          {tabValue === 1 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Partenaires disponibles
              </Typography>
              {loadingAvailable ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                  <CircularProgress />
                </Box>
              ) : availablePartners.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <StoreIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Aucun partenaire disponible
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tous les {partnerType} disponibles sont déjà vos partenaires.
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {availablePartners.map((partner) => (
                    <Grid item xs={12} sm={6} md={4} key={partner._id}>
                      <PartnerCard partner={partner} showAddButton={true} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          )}
        </Container>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Retirer le partenaire</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir retirer <strong>{partnerToDelete?.companyName}</strong> de vos partenaires ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleRemovePartner} color="error" variant="contained">
            Retirer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Partners;
