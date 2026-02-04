import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  MenuItem,
  Autocomplete,
  CircularProgress
 // FormSkeleton
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { stockAPI, productsAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { FormSkeleton } from '../components/LoadingSkeletons';
import Breadcrumbs from '../components/Breadcrumbs';

const StockForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    productId: null,
    batchNumber: '',
    quantity: '',
    expiryDate: '',
  });
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    if (isEdit) {
      fetchStockItem();
    }
  }, [id]);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll({ limit: 500 });
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      enqueueSnackbar('Erreur lors du chargement des produits', { variant: 'error' });
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchStockItem = async () => {
    try {
      const response = await stockAPI.getById(id);
      const stock = response.data.data;
      setFormData({
        productId: stock.productId,
        batchNumber: stock.batchNumber || '',
        quantity: stock.quantity,
        expiryDate: stock.expiryDate ? stock.expiryDate.split('T')[0] : '',
      });
    } catch (error) {
      console.error('Error fetching stock item:', error);
      enqueueSnackbar('Erreur lors du chargement', { variant: 'error' });
      navigate('/stock');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProductChange = (event, newValue) => {
    setFormData({
      ...formData,
      productId: newValue,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        productId: formData.productId?._id,
        quantity: parseInt(formData.quantity),
      };

      if (isEdit) {
        // Ne pas envoyer productId lors de l'édition
        delete submitData.productId;
        await stockAPI.update(id, submitData);
        enqueueSnackbar('Stock mis à jour avec succès', { variant: 'success' });
      } else {
        await stockAPI.create(submitData);
        enqueueSnackbar('Produit ajouté au stock', { variant: 'success' });
      }
      
      navigate('/stock');
    } catch (error) {
      console.error('Error saving stock:', error);
      enqueueSnackbar(
        error.response?.data?.error?.message || 'Erreur lors de la sauvegarde',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingProducts && !isEdit) {
    return (
      <>
        <Navbar />
        <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            {isEdit ? 'Modifier le stock' : 'Ajouter au stock'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {isEdit 
              ? 'Modifiez les informations du produit en stock' 
              : 'Ajoutez un nouveau produit à votre stock'}
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Autocomplete
                  options={products}
                  getOptionLabel={(option) => `${option.name}${option.sku ? ` (${option.sku})` : ''}`}
                  value={formData.productId}
                  onChange={handleProductChange}
                  disabled={isEdit}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Produit"
                      required
                      helperText={isEdit ? "Le produit ne peut pas être modifié" : "Sélectionnez un produit"}
                    />
                  )}
                  noOptionsText="Aucun produit trouvé"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="batchNumber"
                  label="Numéro de lot"
                  value={formData.batchNumber}
                  onChange={handleChange}
                  helperText="Optionnel"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  name="quantity"
                  label="Quantité"
                  value={formData.quantity}
                  onChange={handleChange}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="date"
                  name="expiryDate"
                  label="Date de péremption"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/stock')}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Ajouter au stock'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default StockForm;
