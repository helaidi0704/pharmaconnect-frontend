import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
//import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';  // ← AJOUTER
import Profile from './pages/Profile';
import { ThemeProvider } from './contexts/ThemeContext'; // Votre contexte
import AIChatbot from './components/AIChatbot';


// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ClaimsList from './pages/ClaimsList';
import ClaimForm from './pages/ClaimForm';  
import ClaimDetails from './pages/ClaimDetails';

import StockList from './pages/StockList';
import StockForm from './pages/StockForm';
import StockAlerts from './pages/StockAlerts';
import theme from './theme'
import Partners from './pages/Partners'; 



// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/claims"
        element={
          <ProtectedRoute>
            <ClaimsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/claims/new"
       // path="/claims:id"
        element={
          <ProtectedRoute>
            <ClaimForm />
          </ProtectedRoute>
        }
      />

        <Route
  path="/partners"
  element={
    <ProtectedRoute>
      <Partners />
    </ProtectedRoute>
    }
    />

      <Route
          path="/claims/:id/edit"  // ← AJOUTER CETTE ROUTE
        element={
        <ProtectedRoute>
          <ClaimForm />
        </ProtectedRoute>
      }
/>

      <Route
        path="/claims/:id"           /* ← :id doit être APRÈS new */
        element={
          <ProtectedRoute>
          <ClaimDetails />
          </ProtectedRoute>
          }
      />

     {/* Stock routes */}
      <Route
        path="/stock"
        element={
          <ProtectedRoute>
            <StockList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stock/new"
        element={
          <ProtectedRoute>
            <StockForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stock/alerts"
        element={
          <ProtectedRoute>
            <StockAlerts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stock/:id/edit"
        element={
          <ProtectedRoute>
            <StockForm />
          </ProtectedRoute>
        }
      />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
             }
        />
      {/* Redirect root to dashboard or login */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    //<ThemeProvider theme={theme}>
  <ThemeProvider>{ }
    <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        //anchorOrigin={{
          //vertical: 'top',
          //horizontal: 'right',
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            autoHideDuration={3000}
           // Components={{
             // success: CustomSuccessSnackbar,
              //error: CustomErrorSnackbar,

        //}}
        //autoHideDuration={3000}
      >
          <BrowserRouter>
          <AuthProvider>
             <SocketProvider>
                <AppRoutes />
                <AIChatbot />
            </SocketProvider>
          </AuthProvider>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
