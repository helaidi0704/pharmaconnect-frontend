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
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Navbar from '../components/Navbar';
import Breadcrumbs from '../components/Breadcrumbs';
import { partnersAPI } from '../services/api';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([48.8566, 2.3522]); // Default to Paris
  const [selectedPartner, setSelectedPartner] = useState(null);

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
    if (partner.companyName) {
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
              { label: 'Mes Partenaires Pharmacies' },
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
              Mes Partenaires Pharmacies
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Liste et localisation de vos pharmacies partenaires
            </Typography>
          </Box>

          {partners.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <StoreIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Aucun partenaire pharmacie
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vous n'avez pas encore de partenaires pharmacies.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {/* Map Section */}
              <Grid item xs={12} lg={8}>
                <Paper sx={{ p: 2, height: '600px' }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Carte des pharmacies
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
                    Liste des pharmacies ({partners.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {partners.map((partner) => (
                      <Card
                        key={partner._id}
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
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Container>
      </Box>
    </>
  );
};

export default Partners;
