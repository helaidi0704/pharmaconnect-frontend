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
  //Dialog,
  //ConfirmDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  TablePagination,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as GoodIcon,
  Error as ExpiredIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { stockAPI } from '../services/api';
import { useSnackbar } from 'notistack';
import Navbar from '../components/Navbar';
import { TableSkeleton } from '../components/LoadingSkeletons';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import Breadcrumbs from '../components/Breadcrumbs';


const StockList = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, stockId: null });

  useEffect(() => {
    fetchStock();
  }, [page, rowsPerPage, filters]);

  const fetchStock = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...filters,
      };

      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await stockAPI.getAll(params);
      setStock(response.data.data);
      setTotal(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching stock:', error);
      enqueueSnackbar('Erreur lors du chargement du stock', { variant: 'error' });
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
      await stockAPI.delete(deleteDialog.stockId);
      enqueueSnackbar('Produit supprimé du stock', { variant: 'success' });
      fetchStock();
      setDeleteDialog({ open: false, stockId: null });
    } catch (error) {
      console.error('Error deleting stock:', error);
      enqueueSnackbar('Erreur lors de la suppression', { variant: 'error' });
    }
  };

  const getStatusChip = (status, daysUntilExpiry) => {
    const config = {
      good: { label: 'Bon', color: 'success', icon: <GoodIcon fontSize="small" /> },
      warning: { label: `Expire dans ${daysUntilExpiry}j`, color: 'warning', icon: <WarningIcon fontSize="small" /> },
      expired: { label: 'Périmé', color: 'error', icon: <ExpiredIcon fontSize="small" /> },
    };

    const { label, color, icon } = config[status] || { label: status, color: 'default', icon: null };
    return <Chip label={label} color={color} size="small" icon={icon} />;
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Gestion du stock</Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              onClick={() => navigate('/stock/alerts')}
              color="warning"
              startIcon={<WarningIcon />}
            >
              Alertes
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/stock/new')}
            >
              Ajouter au stock
            </Button>
          </Box>
        </Box>

        {/* Filters */}
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
                <MenuItem value="good">Bon</MenuItem>
                <MenuItem value="warning">Alerte péremption</MenuItem>
                <MenuItem value="expired">Périmé</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {/* Table */}
        <TableContainer component={Paper}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <TableSkeleton />
            </Box>
          ) : stock.length === 0 ? (
            <Box p={4} textAlign="center">
              <Typography color="text.secondary">
                EmptyState
              </Typography>
              <Button
                sx={{ mt: 2 }}
                variant="contained"
                onClick={() => navigate('/stock/new')}
              >
                Ajouter des produits
              </Button>
            </Box>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Produit</TableCell>
                    <TableCell>N° Lot</TableCell>
                    <TableCell align="right">Quantité</TableCell>
                    <TableCell>Date de péremption</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stock.map((item) => {
                    const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
                    return (
                      <TableRow key={item._id} hover>
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
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            color={item.quantity < 10 ? 'error' : 'inherit'}
                          >
                            {item.quantity}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {format(new Date(item.expiryDate), 'dd MMM yyyy', { locale: fr })}
                        </TableCell>
                        <TableCell>{getStatusChip(item.status, daysUntilExpiry)}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/stock/${item._id}/edit`)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => setDeleteDialog({ open: true, stockId: item._id })}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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

<ConfirmDialog
  open={deleteDialog.open}
  onClose={() => setDeleteDialog({ open: false, stockId: null })}
  onConfirm={handleDelete}
  title="Supprimer cet article"
  message="Êtes-vous sûr de vouloir supprimer cet article du stock ? Cette action est irréversible."
  confirmText="Supprimer"
  confirmColor="error"
  severity="error"
/>
    </>
  );
};

export default StockList;
