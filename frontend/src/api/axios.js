import axios from 'axios';

const defaultBaseURL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://formfixer-api.onrender.com/api';

export const API_BASE_URL = import.meta.env.VITE_API_URL || defaultBaseURL;
export const API_ROOT_URL = API_BASE_URL.replace(/\/api\/?$/, '');

let backendReadyPromise = null;

const API = axios.create({
  baseURL: API_BASE_URL
});

// Attach token to every request automatically
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('docsaathi_user') || '{}');
  if (user.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

export async function ensureBackendReady() {
  if (typeof window === 'undefined') return;
  if (!backendReadyPromise) {
    backendReadyPromise = axios
      .get(`${API_ROOT_URL}/healthz`, { timeout: 45000 })
      .catch((error) => {
        backendReadyPromise = null;
        throw error;
      });
  }

  await backendReadyPromise;
}

export function getApiErrorMessage(error, fallbackMessage) {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === 'ECONNABORTED') {
    return 'Processor is waking up. Please wait a few seconds and try again.';
  }
  if (!error?.response) {
    return 'Could not reach the processor right now. Please retry in a few seconds.';
  }
  return fallbackMessage;
}

export default API;
