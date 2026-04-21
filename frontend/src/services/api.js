import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

export const accountService = {
  getAccounts: () => api.get('/accounts'),
  getAccountById: (id) => api.get(`/accounts/${id}`),
};

export const transactionService = {
  getTransactions: (accountId) => api.get(`/transactions/${accountId}`),
  getAllTransactions: () => api.get('/transactions/admin/all'),
  createTransaction: (data) => api.post('/transactions', data),
};

export const adminService = {
  listUsers: () => api.get('/admin/users'),
  createUser: (userData) => api.post('/admin/users', userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export default api;
