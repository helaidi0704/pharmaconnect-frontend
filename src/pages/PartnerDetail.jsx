import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Divider,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Navbar from '../components/Navbar';
import Breadcrumbs from '../components/Breadcrumbs';
import { partnersAPI } from '../services/api';
import { useSnackbar } from 'notistack';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const PartnerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartnerDetails();
  }, [id]);

  const fetchPartnerDetails = async () => {
    setLoading(true);
    try {
      const response = await partnersAPI.getById(id);
      setPartner(response.data.data);
    } catch (error) {
      console.error('Error fetching partner details:', error);
      enqueueSnackbar('Erreur lors du chargement des informations du partenaire', { variant: 'error' });
      navigate(-1);
    } finally {
      setLoading(false);
    }
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
    if (partner?.companyName) {
      return partner.companyName.substring(0, 2).toUpperCase();
    }
    return 'PA';
  };

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

  if (!partner) {
    return null;
  }

  const hasLocation =
    partner.location?.coordinates &&
    partner.location.coordinates[0] !== 0 &&
    partner.location.coordinates[1] !== 0;

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
        <Container maxWidth="lg">
          <Breadcrumbs
            items={[
              { label: 'Tableau de bord', path: '/dashboard' },
              { label: 'Partenaires', path: '/partners' },
              { label: partner.companyName || 'Détails' },
            ]}
          />

          <Box sx={{ mb: 3 }}>
            <Button
              startIcon={<BackIcon />}
              onClick={() => navigate(-1)}
              sx={{ mb: 2 }}
            >
              Retour
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Partner Info Card */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: 'primary.main',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontSize: '2rem',
                    margin: '0 auto 16px',
                  }}
                >
                  {getInitials(partner)}
                </Avatar>

                <Typography variant="h5" gutterBottom fontWeight="bold">
                  {partner.companyName}
                </Typography>

                <Chip
                  label={getRoleLabel(partner.role)}
                  color="primary"
                  sx={{ mb: 2 }}
                />

                <Divider sx={{ my: 2 }} />

                <Box sx={{ textAlign: 'left' }}>
                  {partner.email && (
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <EmailIcon color="action" fontSize="small" />
                      <Typography variant="body2">{partner.email}</Typography>
                    </Box>
                  )}

                  {partner.phone && (
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <PhoneIcon color="action" fontSize="small" />
                      <Typography variant="body2">{partner.phone}</Typography>
                    </Box>
                  )}

                  {(partner.street || partner.city) && (
                    <Box display="flex" alignItems="start" gap={1} mb={2}>
                      <LocationIcon color="action" fontSize="small" />
                      <Box>
                        {partner.street && (
                          <Typography variant="body2">{partner.street}</Typography>
                        )}
                        {(partner.postalCode || partner.city) && (
                          <Typography variant="body2">
                            {partner.postalCode} {partner.city}
                          </Typography>
                        )}
                        {partner.country && (
                          <Typography variant="body2">{partner.country}</Typography>
                        )}
                      </Box>
                    </Box>
                  )}

                  {partner.companyAddress && !partner.street && (
                    <Box display="flex" alignItems="start" gap={1} mb={2}>
                      <LocationIcon color="action" fontSize="small" />
                      <Typography variant="body2">{partner.companyAddress}</Typography>
                    </Box>
                  )}
                </Box>
              </Paper>

              {partner.firstName && partner.lastName && (
                <Paper sx={{ p: 3, mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Contact
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2">
                    {partner.firstName} {partner.lastName}
                  </Typography>
                </Paper>
              )}
            </Grid>

            {/* Map */}
            <Grid item xs={12} md={8}>
              {hasLocation ? (
                <Paper sx={{ p: 2, height: '500px' }}>
                  <Typography variant="h6" gutterBottom>
                    Localisation
                  </Typography>
                  <Box sx={{ height: 'calc(100% - 40px)', borderRadius: 2, overflow: 'hidden' }}>
                    <MapContainer
                      center={[
                        partner.location.coordinates[1],
                        partner.location.coordinates[0],
                      ]}
                      zoom={15}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker
                        position={[
                          partner.location.coordinates[1],
                          partner.location.coordinates[0],
                        ]}
                      >
                        <Popup>
                          <Box sx={{ minWidth: 200 }}>
                            <Typography variant="subtitle1" fontWeight="600">
                              {partner.companyName}
                            </Typography>
                            {partner.companyAddress && (
                              <Typography variant="body2" color="text.secondary">
                                {partner.companyAddress}
                              </Typography>
                            )}
                          </Box>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </Box>
                </Paper>
              ) : (
                <Paper sx={{ p: 4, textAlign: 'center', height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box>
                    <LocationIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Localisation non disponible
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ce partenaire n'a pas encore renseigné son adresse
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default PartnerDetail;
