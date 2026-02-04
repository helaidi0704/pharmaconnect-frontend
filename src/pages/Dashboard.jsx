import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  ReceiptLong as ClaimsIcon,
  Pending as PendingIcon,
  CheckCircle as ResolvedIcon,
  Cancel as RejectedIcon,
  LocalPharmacy,
  Medication,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { claimsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { DashboardSkeleton } from '../components/LoadingSkeletons';
import Breadcrumbs from '../components/Breadcrumbs';
import QuickActions from '../components/QuickActions';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const StatCard = ({ title, value, icon, color }) => (
  <Card
    elevation={8}
    sx={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
      backdropFilter: 'blur(10px)',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
      }
    }}
  >
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="text.secondary" gutterBottom variant="body2" fontWeight="500">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="700">{value}</Typography>
        </Box>
        <Box
          sx={{
            bgcolor: color,
            borderRadius: '50%',
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: 3,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await claimsAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <DashboardSkeleton />
        </Container>
      </>
    );
  }

  // Préparer les données pour le graphique
  const statusData = stats?.byStatus?.map((item) => ({
    name: getStatusLabel(item._id),
    value: item.count,
  })) || [];

  const typeData = stats?.byType?.map((item) => ({
    name: getTypeLabel(item._id),
    value: item.count,
  })) || [];

  // Calculer les totaux
  const totalClaims = statusData.reduce((sum, item) => sum + item.value, 0);
  const pendingClaims = statusData.find((s) => s.name === 'En attente')?.value || 0;
  const resolvedClaims = statusData.find((s) => s.name === 'Résolu')?.value || 0;
  const rejectedClaims = statusData.find((s) => s.name === 'Rejeté')?.value || 0;

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
          <Box
            sx={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              borderRadius: 3,
              p: 3,
              mb: 4,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative pharmacy icons */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                right: '5%',
                transform: 'translateY(-50%)',
                opacity: 0.15,
              }}
            >
              <LocalPharmacy sx={{ fontSize: 120 }} />
            </Box>
            <Box
              sx={{
                position: 'absolute',
                bottom: '10%',
                right: '15%',
                opacity: 0.1,
              }}
            >
              <Medication sx={{ fontSize: 60 }} />
            </Box>

            <Typography variant="h4" gutterBottom fontWeight="700" sx={{ position: 'relative', zIndex: 1 }}>
              Tableau de bord
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom sx={{ position: 'relative', zIndex: 1 }}>
              Bienvenue, {user?.firstName || user?.companyName || user?.email}
            </Typography>
          </Box>

        {/* Cartes de statistiques */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total réclamations"
              value={totalClaims}
              icon={<ClaimsIcon />}
              color="primary.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="En attente"
              value={pendingClaims}
              icon={<PendingIcon />}
              color="warning.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Résolues"
              value={resolvedClaims}
              icon={<ResolvedIcon />}
              color="success.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Rejetées"
              value={rejectedClaims}
              icon={<RejectedIcon />}
              color="error.main"
            />
          </Grid>
        </Grid>

        {/* Graphiques */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Réclamations par statut
              </Typography>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
                  Aucune donnée disponible
                </Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Réclamations par type
              </Typography>
              {typeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography color="text.secondary" align="center" sx={{ py: 5 }}>
                  Aucune donnée disponible
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
        </Container>
      </Box>
    </>
  );
};

// Fonctions helper
const getStatusLabel = (status) => {
  const labels = {
    created: 'Créé',
    in_progress: 'En cours',
    pending: 'En attente',
    resolved: 'Résolu',
    rejected: 'Rejeté',
    closed: 'Fermé',
  };
  return labels[status] || status;
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

export default Dashboard;
