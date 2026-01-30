import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { claimsAPI } from '../services/api';
import Navbar from '../components/Navbar';

const ClaimForm = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    productId: '507f1f77bcf86cd799439011', // ID temporaire pour demo
    claimType: '',
    priority: 'medium',
    description: '',
    batchNumber: '',
    quantity: '',
    expiryDate: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Préparer les données
      const submitData = {
        ...formData,
        quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
      };

      // Supprimer les champs vides
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '' || submitData[key] === undefined) {
          delete submitData[key];
        }
      });

      await claimsAPI.create(submitData);
      enqueueSnackbar('Réclamation créée avec succès', { variant: 'success' });
      navigate('/claims');
    } catch (error) {
      console.error('Error creating claim:', error);
      enqueueSnackbar(
        error.response?.data?.error?.message || 'Erreur lors de la création',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Nouvelle réclamation
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Créez une nouvelle réclamation pour signaler un problème
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  required
                  fullWidth
                  name="claimType"
                  label="Type de réclamation"
                  value={formData.claimType}
                  onChange={handleChange}
                >
                  <MenuItem value="expired_product">Produit périmé</MenuItem>
                  <MenuItem value="defective_product">Produit défectueux</MenuItem>
                  <MenuItem value="delivery_error">Erreur de livraison</MenuItem>
                  <MenuItem value="incorrect_quantity">Quantité incorrecte</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  name="priority"
                  label="Priorité"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <MenuItem value="low">Basse</MenuItem>
                  <MenuItem value="medium">Moyenne</MenuItem>
                  <MenuItem value="high">Haute</MenuItem>
                  <MenuItem value="urgent">Urgente</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={4}
                  name="description"
                  label="Description"
                  value={formData.description}
                  onChange={handleChange}
                  helperText="Décrivez le problème en détail (minimum 10 caractères)"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="batchNumber"
                  label="Numéro de lot"
                  value={formData.batchNumber}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
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
                onClick={() => navigate('/claims')}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Création...' : 'Créer la réclamation'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default ClaimForm;
