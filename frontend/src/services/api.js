import axios from 'axios';

const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim().replace(/\/+$/, '');
const API_BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  response => response,
  error => {
    let message = 'An unexpected error occurred. Please try again.';
    if (error.response && error.response.data) {
      if (error.response.data.error) {
        message = error.response.data.error;
      } else if (error.response.data.message) {
        message = error.response.data.message;
      }
      if (error.response.data.details) {
        const details = error.response.data.details;
        if (typeof details === 'object' && !Array.isArray(details)) {
          const detailStrings = Object.entries(details).map(([k, v]) => `${k}: ${v}`);
          message += ' (' + detailStrings.join(', ') + ')';
        } else if (Array.isArray(details)) {
          message += ' (' + details.join(', ') + ')';
        }
      }
    } else if (error.request) {
      message = 'Unable to reach the server. Please check your internet connection or try again later.';
    }
    return Promise.reject(new Error(message));
  }
);

// Public API Endpoints
export const getHealth = () => api.get('/health');
export const getResources = (params) => api.get('/resources', { params });
export const getResourceById = (id) => api.get(`/resources/${id}`);
export const getFilters = () => api.get('/filters');
export const getSubjects = (params) => api.get('/subjects', { params });
export const submitReport = (data) => api.post('/reports', data);

// Admin Authentication Endpoints
export const adminLogin = (credentials) => api.post('/admin/login', credentials);
export const adminLogout = () => api.post('/admin/logout');
export const adminGetMe = () => api.get('/admin/me');

// Admin Resource Endpoints
export const adminGetStats = () => api.get('/admin/stats');
export const adminGetResources = (params) => api.get('/admin/resources', { params });
export const adminGetResourceById = (id) => api.get(`/admin/resources/${id}`);
export const adminCreateResource = (data) => api.post('/admin/resources', data);
export const adminUpdateResource = (id, data) => api.patch(`/admin/resources/${id}`, data);
export const adminDeleteResource = (id) => api.delete(`/admin/resources/${id}`);
export const adminTogglePublish = (id, isPublished) => api.patch(`/admin/resources/${id}/publish`, { isPublished });
export const adminUploadPdf = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/admin/upload', formData, {
    headers: {
      'Content-Type': undefined
    }
  });
};

// Admin Report Endpoints
export const adminGetReports = (params) => api.get('/admin/reports', { params });
export const adminUpdateReport = (id, status) => api.patch(`/admin/reports/${id}`, { status });

export default api;
