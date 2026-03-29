import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const authData = localStorage.getItem('auth-storage');
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          const token = parsed?.state?.token;
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch {
          // Invalid JSON in storage
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage');
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/admin')) {
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// API helper functions
export const productApi = {
  getAll: (params?: Record<string, string | number>) => api.get('/products', { params }),
  getOne: (id: string) => api.get(`/products/${id}`),
  create: (data: FormData) => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) => api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/products/${id}`),
};

export const templateApi = {
  getAll: (params?: Record<string, string>) => api.get('/templates', { params }),
  getOne: (id: string) => api.get(`/templates/${id}`),
  create: (data: FormData) => api.post('/templates', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/templates/${id}`),
};

export const presetVideoApi = {
  getAll: (params?: Record<string, string>) => api.get('/preset-videos', { params }),
  create: (data: FormData) => api.post('/preset-videos', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/preset-videos/${id}`),
};

export const orderApi = {
  create: (data: FormData) => api.post('/orders', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (params?: Record<string, string | number>) => api.get('/orders', { params }),
  getOne: (orderId: string, email?: string) => api.get(`/orders/${orderId}`, { params: email ? { email } : {} }),
  updateStatus: (orderId: string, data: object) => api.put(`/orders/${orderId}/status`, data),
  getFiles: (orderId: string) => api.get(`/orders/${orderId}/files`),
  getStats: () => api.get('/orders/stats'),
};

export const paymentApi = {
  createRazorpayOrder: (orderId: string) => api.post('/payments/create-order', { orderId }),
  verifyPayment: (data: object) => api.post('/payments/verify', data),
  confirmCOD: (orderId: string) => api.post('/payments/cod', { orderId }),
  markAsPaid: (orderId: string) => api.post(`/payments/${orderId}/mark-paid`, {}),
};

export const authApi = {
  register: (data: object) => api.post('/auth/register', data),
  login: (data: object) => api.post('/auth/login', data),
  adminLogin: (data: object) => api.post('/auth/admin/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: object) => api.put('/auth/profile', data),
};

export const arApi = {
  getTarget: (orderId: string) => api.get(`/ar/target/${orderId}`),
  createTarget: (data: object) => api.post('/ar/target', data),
};
