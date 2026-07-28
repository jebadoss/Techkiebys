import axios from 'axios';

// All requests go to /api/* which vite.config.js proxies to your
// Spring Boot backend (http://localhost:8080) in dev, or set
// VITE_API_BASE_URL for a deployed backend.
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('trackwheel_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('trackwheel_token');
      localStorage.removeItem('trackwheel_attendant');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// --- Endpoint helpers (map these to your Spring controllers) ---
export const authApi = {
  login: (username, password) => client.post('/auth/login', { username, password }),
};

export const vehicleApi = {
  checkIn: (data) => client.post('/vehicles/check-in', data),
  checkOut: (token, paymentMethod) => client.post(`/vehicles/check-out/${token}`, null, { params: { paymentMethod } }),
  search: (query) => client.get('/vehicles/search', { params: { q: query } }),
  active: () => client.get('/vehicles/active'),
  history: (date) => client.get('/vehicles/history', { params: { date } }),
  searchByPhone: (last4) => client.get('/vehicles/search-phone', { params: { last4 } }),
  frequent: (phone) => client.get(`/vehicles/frequent/${phone}`),
  stats: () => client.get('/vehicles/stats'),
  slots: () => client.get('/vehicles/slots'),
};

export const shiftApi = {
  summary: () => client.get('/shift/summary'),
  close: (countedCash) => client.post('/shift/close', { countedCash }),
};

export default client;
