import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

// Clubs API
export const clubsAPI = {
  getAllClubs: () => api.get('/clubs'),
  createClub: (clubData) => api.post('/clubs', clubData),
  joinClub: (clubId) => api.post(`/clubs/${clubId}/join`),
  leaveClub: (clubId) => api.post(`/clubs/${clubId}/leave`),
  getClubById: (clubId) => api.get(`/clubs/${clubId}`),
};

// Events API
export const eventsAPI = {
  getAllEvents: () => api.get('/events'),
  createEvent: (eventData) => api.post('/events', eventData),
  rsvpEvent: (eventId, status) => api.post(`/events/${eventId}/rsvp`, { status }),
  getEventsByClub: (clubId) => api.get(`/events/club/${clubId}`),
};

export default api;