import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getMe: () => api.get('/api/auth/me'),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/api/auth/reset-password', data),
  sendChangeOtp: () => api.post('/api/auth/send-change-otp'),
  verifyChangeOtp: (otp) => api.post('/api/auth/verify-change-otp', { otp }),
};

export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats'),
  downloadReport: (format = 'csv') =>
    api.get('/api/dashboard/report/download', { params: { format }, responseType: 'blob' }),
};

export const scanAPI = {
  // Upload scan — multipart/form-data
  upload: (formData) =>
    api.post('/api/scan/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  // Get scan history list
  getHistory: () => api.get('/api/scan/history'),
  // Get single scan by id
  getById: (id) => api.get(`/api/scan/${id}`),
  // Delete scan
  delete: (id) => api.delete(`/api/scan/${id}`),
};

export const chatAPI = {
  // Send message — backend expects { query }
  ask: (message) => api.post('/api/chat/ask', { query: message }),
  getHistory: () => api.get('/api/chat/history'),
  clearHistory: () => api.delete('/api/chat/history'),
};

export default api;
