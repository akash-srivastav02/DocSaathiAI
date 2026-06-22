import axios from 'axios';

const defaultBaseURL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://formfixer-api.onrender.com/api';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBaseURL
});

// Attach token to every request automatically
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('docsaathi_user') || '{}');
  if (user.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

export default API;
