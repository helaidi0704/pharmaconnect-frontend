import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Chat from '../components/Chat';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  //StatusChip,
  Button,
  //Breadcrumbs,
  //FormSkeleton,
  Card,
  CardContent,
  Divider,
  //ConfirmDialog,
  //Breadcrumbs ,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';


//import { DetailsSkeleton } from '../components/LoadingSkeletons';  // ✅ CORRECT

import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  LocalShipping as ShippingIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { claimsAPI, messagesAPI, filesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import Navbar from '../components/Navbar';
import FileUpload from '../components/FileUpload';
import { DetailsSkeleton } from '../components/LoadingSkeletons';
import StatusChip from '../components/StatusChip';
import Breadcrumbs from '../components/Breadcrumbs';
import ClaimTimeline from '../components/ClaimTimeline'; 

const ClaimDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);
  const [statusDialog, setStatusDialog] = useState({
    open: false,
    newStatus: '',
    notes: '',
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchClaimDetails();
    fetchMessages();
    fetchFiles();
  }, [id]);

  const fetchClaimDetails = async () => {
    setLoading(true);
    try {
      const response = await claimsAPI.getById(id);
      setClaim(response.data.data);
    } catch (error) {
      console.error('Error fetching claim:', error);
      enqueueSnackbar('Erreur lors du chargement de la réclamation', { variant: 'error' });
      navigate('/claims');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await messagesAPI.getByClaimId(id);
      setMessages(response.data.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await filesAPI.getByClaimId(id);
      setFiles(response.data.data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleStatusChange = async () => {
    setUpdating(true);
    try {
      await claimsAPI.updateStatus(id, {
        status: statusDialog.newStatus,
        notes: statusDialog.notes,
      });
      enqueueSnackbar('Statut mis à jour avec succès', { variant: 'success' });
      setStatusDialog({ open: false, newStatus: '', notes: '' });
      fetchClaimDetails();
    } catch (error) {
      console.error('Error updating status:', error);
      enqueueSnackbar(
        error.response?.data?.error?.message || 'Erreur lors de la mise à jour',
        { variant: 'error' }
      );
    } finally {
      setUpdating(false);
    }
  };



  const getPriorityChip = (priority) => {
    const config = {
      low: { label: 'Basse', color: 'success' },
      medium: { label: 'Moyenne', color: 'warning' },
      high: { label: 'Haute', color: 'error' },
      urgent: { label: 'Urgente', color: 'error' },
    };
    const { label, color } = config[priority] || { label: priority, color: 'default' };
    return <Chip label={label} color={color} variant="outlined" />;
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

  const getStatusLabel = (status) => {
    const labels = {
      created: 'Créée',
      in_progress: 'En cours',
      pending: 'En attente',
      resolved: 'Résolue',
      rejected: 'Rejetée',
      closed: 'Clôturée',
    };
    return labels[status] || status;
  };

  const getStatusDescription = (status) => {
    const descriptions = {
      created: 'Réclamation nouvellement créée',
      in_progress: 'Réclamation en cours de traitement',
      pending: 'En attente d\'informations complémentaires',
      resolved: 'Réclamation résolue avec succès',
      rejected: 'Réclamation rejetée',
      closed: 'Réclamation clôturée définitivement',
    };
    return descriptions[status] || '';
  };

  const getAvailableStatuses = () => {
    if (!claim) return [];

    const transitions = {
      created: ['in_progress', 'rejected'],
      in_progress: ['pending', 'resolved', 'rejected'],
      pending: ['in_progress', 'resolved', 'rejected'],
      resolved: ['closed'],
      rejected: ['closed'],
    };

    return transitions[claim.status] || [];
  };

  const canChangeStatus = () => {
    return user?.role !== 'pharmacy' && claim?.status !== 'closed';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <DetailsSkeleton />
        </Container>
      </>
    );
  }

  if (!claim) {
    return null;
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              startIcon={<BackIcon />}
              onClick={() => navigate('/claims')}
              variant="outlined"
            >
              Retour
            </Button>
            <Typography variant="h4">Réclamation {claim.reference}</Typography>
          </Box>
          {canChangeStatus() && getAvailableStatuses().length > 0 && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setStatusDialog({ ...statusDialog, open: true })}
            >
              Changer le statut
            </Button>
          )}
        </Box>

        {/* Status and Priority */}
        <Box display="flex" gap={2} mb={3}>
          <StatusChip status={claim.status} />
          {getPriorityChip(claim.priority)}
        </Box>

        <Grid container spacing={3}>
          {/* Main Info */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Informations de la réclamation
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body1">{getTypeLabel(claim.claimType)}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date de création
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(claim.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                  </Typography>
                </Grid>

                {claim.batchNumber && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Numéro de lot
                    </Typography>
                    <Typography variant="body1">{claim.batchNumber}</Typography>
                  </Grid>
                )}

                {claim.quantity && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Quantité
                    </Typography>
                    <Typography variant="body1">{claim.quantity}</Typography>
                  </Grid>
                )}

                {claim.expiryDate && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date de péremption
                    </Typography>
                    <Typography variant="body1">
                      {format(new Date(claim.expiryDate), 'dd MMMM yyyy', { locale: fr })}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">{claim.description}</Typography>
                </Grid>

                {claim.resolutionNotes && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      <Typography variant="subtitle2" gutterBottom>
                        Notes de résolution
                      </Typography>
                      <Typography variant="body2">{claim.resolutionNotes}</Typography>
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Timeline */}
            <Box sx={{ mt: 3 }}>
              <ClaimTimeline claim={claim} messages={messages} files={files} />
            </Box>

            {/* Chat */}  {/* ← AJOUTER CETTE SECTION */}
                <Paper sx={{ p: 3, mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Discussion
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Chat claimId={id} />
                </Paper>

   {/* Files */}
            <Box sx={{ mt: 3 }}>
              <FileUpload claimId={id} />
            </Box>

          </Grid>
          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Pharmacy */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <BusinessIcon color="primary" />
                  <Typography variant="h6">Pharmacie</Typography>
                </Box>
                <Typography variant="body1" fontWeight="medium">
                  {claim.pharmacyId?.companyName || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {claim.pharmacyId?.email || ''}
                </Typography>
                {claim.pharmacyId?.phone && (
                  <Typography variant="body2" color="text.secondary">
                    {claim.pharmacyId.phone}
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Depot */}
            {claim.depotId && (
              <Card sx={{ mb: 2, border: '2px solid', borderColor: 'secondary.main' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <ShippingIcon color="secondary" />
                      <Typography variant="h6">Dépôt Assigné</Typography>
                    </Box>
                    <Chip label="Partenaire" size="small" color="secondary" />
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  <Typography
                    variant="body1"
                    fontWeight="medium"
                    gutterBottom
                    sx={{
                      cursor: 'pointer',
                      color: 'primary.main',
                      '&:hover': {
                        textDecoration: 'underline',
                      }
                    }}
                    onClick={() => navigate(`/partners/${claim.depotId._id}`)}
                  >
                    {claim.depotId.companyName}
                  </Typography>

                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" color="text.secondary">
                        📧 {claim.depotId.email}
                      </Typography>
                    </Box>

                    {claim.depotId.phone && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" color="text.secondary">
                          📞 {claim.depotId.phone}
                        </Typography>
                      </Box>
                    )}

                    {claim.depotId.companyAddress && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" color="text.secondary">
                          📍 {claim.depotId.companyAddress}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Laboratory */}
            {claim.laboratoryId && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <ScienceIcon color="info" />
                    <Typography variant="h6">Laboratoire</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {claim.laboratoryId.companyName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {claim.laboratoryId.email}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* Resolved By */}
            {claim.resolvedBy && (
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <PersonIcon color="success" />
                    <Typography variant="h6">Résolu par</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight="medium">
                    {claim.resolvedBy.firstName} {claim.resolvedBy.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {claim.resolvedBy.email}
                  </Typography>
                  {claim.resolvedAt && (
                    <Typography variant="caption" color="text.secondary">
                      Le {format(new Date(claim.resolvedAt), 'dd MMMM yyyy', { locale: fr })}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Status Change Dialog */}
      <Dialog
        open={statusDialog.open}
        onClose={() => setStatusDialog({ open: false, newStatus: '', notes: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Changer le statut de la réclamation</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Nouveau statut</InputLabel>
              <Select
                value={statusDialog.newStatus}
                onChange={(e) => setStatusDialog({ ...statusDialog, newStatus: e.target.value })}
                label="Nouveau statut"
              >
                {getAvailableStatuses().map((status) => (
                  <MenuItem key={status} value={status}>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {getStatusLabel(status)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getStatusDescription(status)}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Statut actuel: <strong>{getStatusLabel(claim?.status)}</strong>
              </FormHelperText>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes (optionnel)"
              value={statusDialog.notes}
              onChange={(e) => setStatusDialog({ ...statusDialog, notes: e.target.value })}
              placeholder="Ajoutez des notes sur ce changement de statut..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setStatusDialog({ open: false, newStatus: '', notes: '' })}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleStatusChange}
            disabled={!statusDialog.newStatus || updating}
          >
            {updating ? 'Mise à jour...' : 'Confirmer'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClaimDetails;
