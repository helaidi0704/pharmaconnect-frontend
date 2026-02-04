import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { stockAPI } from '../services/api';
import { useSnackbar } from 'notistack';
import Navbar from '../components/Navbar';
import EmptyState from '../components/EmptyState';
import Breadcrumbs from '../components/Breadcrumbs';
import StatusChip from '../components/StatusChip';

const StockAlerts = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ warning: 0, expired: 0 });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await stockAPI.getAlerts();
      const alertsData = response.data.data;
      setAlerts(alertsData);

      // Calculate stats
      const warningCount = alertsData.filter(item => item.status === 'warning').length;
      const expiredCount = alertsData.filter(item => item.status === 'expired').length;
      setStats({ warning: warningCount, expired: expiredCount });
    } catch (error) {
      console.error('Error fetching alerts:', error);
      enqueueSnackbar('Erreur lors du chargement des alertes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusChip = (status, daysUntilExpiry) => {
    if (status === 'expired') {
      return (
        <Chip
          label="Périmé"
          color="error"
          size="small"
          icon={<ErrorIcon fontSize="small" />}
        />
      );
    }
    return (
      <Chip
        label={`${daysUntilExpiry} jour${daysUntilExpiry > 1 ? 's' : ''} restant${daysUntilExpiry > 1 ? 's' : ''}`}
        color="warning"
        size="small"
        icon={<WarningIcon fontSize="small" />}
      />
    );
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/stock')}
            variant="outlined"
          >
            Retour au stock
          </Button>
          <Typography variant="h4">Alertes de péremption</Typography>
        </Box>

        {/* Summary */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          {stats.warning > 0 && (
            <Alert severity="warning" sx={{ flex: 1 }}>
              <AlertTitle>
                <strong>{stats.warning}</strong> produit{stats.warning > 1 ? 's' : ''} arrive{stats.warning > 1 ? 'nt' : ''} à péremption
              </AlertTitle>
              Vérifiez ces produits dans les 90 prochains jours
            </Alert>
          )}
          {stats.expired > 0 && (
            <Alert severity="error" sx={{ flex: 1 }}>
              <AlertTitle>
                <strong>{stats.expired}</strong> produit{stats.expired > 1 ? 's périmés' : ' périmé'}
              </AlertTitle>
              Retirer ces produits du stock immédiatement
            </Alert>
          )}
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : alerts.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="success.main" gutterBottom>
              EmptyState success
            </Typography>
            <Typography color="text.secondary">
              Tous vos produits sont en bon état. Aucun produit n'arrive à péremption dans les 90 prochains jours.
            </Typography>
            <Button
              sx={{ mt: 2 }}
              variant="outlined"
              onClick={() => navigate('/stock')}
            >
              Retour au stock
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Produit</TableCell>
                  <TableCell>N° Lot</TableCell>
                  <TableCell align="right">Quantité</TableCell>
                  <TableCell>Date de péremption</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Action recommandée</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alerts.map((item) => {
                  const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
                  return (
                    <TableRow
                      key={item._id}
                      sx={{
                        backgroundColor: item.status === 'expired' ? 'error.lighter' : 'warning.lighter',
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {item.productId?.name || 'N/A'}
                        </Typography>
                        {item.productId?.sku && (
                          <Typography variant="caption" color="text.secondary">
                            SKU: {item.productId.sku}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{item.batchNumber || '-'}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {item.quantity}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {format(new Date(item.expiryDate), 'dd MMMM yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell>{getStatusChip(item.status, daysUntilExpiry)}</TableCell>
                      <TableCell>
                        {item.status === 'expired' ? (
                          <Typography variant="body2" color="error">
                            Retirer du stock
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="warning.dark">
                            Créer une réclamation
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </>
  );
};

export default StockAlerts;
