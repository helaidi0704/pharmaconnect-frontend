import React, { useState , useEffect} from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Box,
 // Breadcrumbs
} from '@mui/material';
import { useNavigate,useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { claimsAPI, partnersAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { FormSkeleton } from '../components/LoadingSkeletons';
import Breadcrumbs from '../components/Breadcrumbs';

const ClaimForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const isEditMode = Boolean(id); 

  const [formData, setFormData] = useState({
    productId: '507f1f77bcf86cd799439011', // ID temporaire pour demo
    claimType: '',
    priority: 'medium',
    description: '',
    batchNumber: '',
    quantity: '',
    expiryDate: '',
    depotId: '',
  });
  const [loading, setLoading] = useState(false);

const [depots, setDepots] = useState([]);
const [laboratories, setLaboratories] = useState([]);

  useEffect(() => {
    fetchPartners(); // Load depot partners on mount
    if (isEditMode) {
      fetchClaimData();
    }
  }, [id]);

  const fetchPartners = async () => {
  try {
    // Charger MES partenaires (dépôts)
    const response = await partnersAPI.getMyPartners();
    setDepots(response.data.data);
  } catch (error) {
    console.error('Error fetching partners:', error);
  }
};
   // ← AJOUTER CETTE FONCTION
  const fetchClaimData = async () => {
    setLoading(true);
    try {
      const response = await claimsAPI.getById(id);
      const claim = response.data.data;
      
      // Pré-remplir le formulaire
      setFormData({
        productId: claim.productId?._id || '',
        claimType: claim.claimType || '',
        priority: claim.priority || '',
        batchNumber: claim.batchNumber || '',
        quantity: claim.quantity || '',
        expiryDate: claim.expiryDate ? claim.expiryDate.split('T')[0] : '',
        description: claim.description || '',
        depotId: claim.depotId?._id || '',
        laboratoryId: claim.laboratoryId?._id || '',
      });
    } catch (error) {
      console.error('Error fetching claim:', error);
      enqueueSnackbar('Erreur lors du chargement de la réclamation', { variant: 'error' });
      navigate('/claims');
    } finally {
      setLoading(false);
    }
  };


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
    // Filter out empty strings and null values
    const cleanedData = Object.entries(formData).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    if (isEditMode) {
      // Mode édition - UPDATE
      await claimsAPI.update(id, cleanedData);
      enqueueSnackbar('Réclamation modifiée avec succès', { variant: 'success' });
    } else {
      // Mode création - CREATE
      await claimsAPI.create(cleanedData);
      enqueueSnackbar('Réclamation créée avec succès', { variant: 'success' });
    }
    navigate('/claims');
  } catch (error) {
    console.error('Error saving claim:', error);
    enqueueSnackbar(
      error.response?.data?.error?.message || 'Erreur lors de l\'enregistrement',
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
          <Typography variant="h4">
            {isEditMode ? 'Modifier la réclamation' : 'Nouvelle réclamation'}
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
                  select
                  fullWidth
                  name="depotId"
                  label="Assigner à un dépôt (Optionnel)"
                  value={formData.depotId}
                  onChange={handleChange}
                  helperText={depots.length === 0 ? "Aucun partenaire dépôt disponible. Ajoutez des partenaires d'abord." : "Sélectionnez un dépôt pour traiter cette réclamation"}
                >
                  <MenuItem value="">-- Aucun dépôt --</MenuItem>
                  {depots.map((depot) => (
                    <MenuItem key={depot._id} value={depot._id}>
                      {depot.companyName}
                    </MenuItem>
                  ))}
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
                {loading
                  ? (isEditMode ? 'Modification...' : 'Création...')
                  : (isEditMode ? 'Modifier la réclamation' : 'Créer la réclamation')
                }
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default ClaimForm;
