import axios from 'axios';

// Configuration de base axios
const api = axios.create({
  //baseURL: 'http://localhost:8082/api',
    baseURL: 'https://pharmaconnect-backend-5mbdpobdya-ew.a.run.app',
  
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si le token a expiré, essayer de le rafraîchir
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('http://localhost:8082/api/auth/refresh', {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Si le refresh échoue, déconnecter l'utilisateur
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  getProfile: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.patch('/api/auth/me', data),
  changePassword: (data) => api.post('/api/auth/change-password', data),
};

// Claims API
export const claimsAPI = {
  getAll: (params) => api.get('/api/claims', { params }),
  getById: (id) => api.get(`/api/claims/${id}`),
  create: (data) => api.post('/api/claims', data),
  update: (id, data) => api.patch(`/api/claims/${id}`, data),
  updateStatus: (id, data) => api.patch(`/api/claims/${id}/status`, data),
  delete: (id) => api.delete(`/api/claims/${id}`),
  getStats: () => api.get('/api/claims/stats'),
};

// Stock API
export const stockAPI = {
  getAll: (params) => api.get('/api/stock', { params }),
  getById: (id) => api.get(`/api/stock/${id}`),
  create: (data) => api.post('/api/stock', data),
  update: (id, data) => api.patch(`/api/stock/${id}`, data),
  delete: (id) => api.delete(`/api/stock/${id}`),
  getAlerts: () => api.get('/api/stock/alerts'),
  getStats: () => api.get('/api/stock/stats'),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/api/products', { params }),
  getById: (id) => api.get(`/api/products/${id}`),
};

// Partners API
export const partnersAPI = {
  getMyPartners: () => api.get('/api/partners'),
  getAvailable: () => api.get('/api/partners/available'),
  add: (partnerId) => api.post(`/api/partners/${partnerId}`),
  remove: (partnerId) => api.delete(`/api/partners/${partnerId}`),
};

// Files API
export const filesAPI = {
  upload: (formData) =>
    api.post('/api/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getByClaimId: (claimId) => api.get(`/api/files/claim/${claimId}`),
  delete: (id) => api.delete(`/api/files/${id}`),
};

// Messages API
export const messagesAPI = {
  getByClaimId: (claimId) => api.get(`/api/messages/claim/${claimId}`),
  send: (data) => api.post('/api/messages', data),
};

export default api;
