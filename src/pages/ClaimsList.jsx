import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Box,
  TextField,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  TablePagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { claimsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { useSnackbar } from 'notistack';

const ClaimsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    claimType: '',
    priority: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, claimId: null });

  useEffect(() => {
    fetchClaims();
  }, [page, rowsPerPage, filters]);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...filters,
      };

      // Supprimer les filtres vides
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await claimsAPI.getAll(params);
      setClaims(response.data.data);
      setTotal(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching claims:', error);
      enqueueSnackbar('Erreur lors du chargement des réclamations', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
    setPage(0);
  };

  const handleDelete = async () => {
    try {
      await claimsAPI.delete(deleteDialog.claimId);
      enqueueSnackbar('Réclamation supprimée avec succès', { variant: 'success' });
      fetchClaims();
      setDeleteDialog({ open: false, claimId: null });
    } catch (error) {
      console.error('Error deleting claim:', error);
      enqueueSnackbar('Erreur lors de la suppression', { variant: 'error' });
    }
  };

  const getStatusChip = (status) => {
    const config = {
      created: { label: 'Créé', color: 'default' },
      in_progress: { label: 'En cours', color: 'info' },
      pending: { label: 'En attente', color: 'warning' },
      resolved: { label: 'Résolu', color: 'success' },
      rejected: { label: 'Rejeté', color: 'error' },
      closed: { label: 'Fermé', color: 'default' },
    };

    const { label, color } = config[status] || { label: status, color: 'default' };
    return <Chip label={label} color={color} size="small" />;
  };

  const getPriorityChip = (priority) => {
    const config = {
      low: { label: 'Basse', color: 'success' },
      medium: { label: 'Moyenne', color: 'warning' },
      high: { label: 'Haute', color: 'error' },
      urgent: { label: 'Urgente', color: 'error' },
    };

    const { label, color } = config[priority] || { label: priority, color: 'default' };
    return <Chip label={label} color={color} size="small" variant="outlined" />;
  };

  const getTypeLabel = (type) => {
    const labels = {
      expired_product: 'Produit périmé',
      defective_product: 'Produit défectueux',
      delivery_error: 'Erreur de livraison',
      incorrect_quantity: 'Quantité incorrecte',
    };
    return labels[type] || type;
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Réclamations</Typography>
          <Box>
            <Button
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ mr: 1 }}
            >
              Filtres
            </Button>
            {user?.role === 'pharmacy' && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/claims/new')}
              >
                Nouvelle réclamation
              </Button>
            )}
          </Box>
        </Box>

        {/* Filtres */}
        {showFilters && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Statut"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="created">Créé</MenuItem>
                  <MenuItem value="in_progress">En cours</MenuItem>
                  <MenuItem value="pending">En attente</MenuItem>
                  <MenuItem value="resolved">Résolu</MenuItem>
                  <MenuItem value="rejected">Rejeté</MenuItem>
                  <MenuItem value="closed">Fermé</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Type"
                  value={filters.claimType}
                  onChange={(e) => handleFilterChange('claimType', e.target.value)}
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="expired_product">Produit périmé</MenuItem>
                  <MenuItem value="defective_product">Produit défectueux</MenuItem>
                  <MenuItem value="delivery_error">Erreur de livraison</MenuItem>
                  <MenuItem value="incorrect_quantity">Quantité incorrecte</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Priorité"
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                >
                  <MenuItem value="">Toutes</MenuItem>
                  <MenuItem value="low">Basse</MenuItem>
                  <MenuItem value="medium">Moyenne</MenuItem>
                  <MenuItem value="high">Haute</MenuItem>
                  <MenuItem value="urgent">Urgente</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Table */}
        <TableContainer component={Paper}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : claims.length === 0 ? (
            <Box p={4} textAlign="center">
              <Typography color="text.secondary">
                Aucune réclamation trouvée
              </Typography>
            </Box>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Référence</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Priorité</TableCell>
                    {user?.role !== 'pharmacy' && <TableCell>Pharmacie</TableCell>}
                    <TableCell>Dépôt assigné</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {claims.map((claim) => (
                    <TableRow key={claim._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {claim.reference}
                        </Typography>
                      </TableCell>
                      <TableCell>{getTypeLabel(claim.claimType)}</TableCell>
                      <TableCell>{getStatusChip(claim.status)}</TableCell>
                      <TableCell>{getPriorityChip(claim.priority)}</TableCell>
                      {user?.role !== 'pharmacy' && (
                        <TableCell>{claim.pharmacyId?.companyName || 'N/A'}</TableCell>
                      )}
                      <TableCell>
                        {claim.depotId?.companyName ? (
                          <Chip
                            label={claim.depotId.companyName}
                            size="small"
                            variant="outlined"
                            color="info"
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Non assigné
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(claim.createdAt), 'dd MMM yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/claims/${claim._id}`)}
                          color="primary"
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        {user?.role === 'pharmacy' && claim.status === 'created' && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/claims/${claim._id}/edit`)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => setDeleteDialog({ open: true, claimId: claim._id })}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Lignes par page:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
              />
            </>
          )}
        </TableContainer>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, claimId: null })}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer cette réclamation ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, claimId: null })}>
            Annuler
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClaimsList;
