import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '@/store';
import { logout } from '@/store/slices/authSlice';

// Base URL - environment variable se aayega, fallback mock ke liye
export const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
});

// Request interceptor - JWT token attach karta hai
// Redux store se token lo (covers both pre-registration and post-registration states)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.getState().auth.token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - 401 pe logout karta hai
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Check for "User not found" error and automatically logout
    if (error.response?.data) {
      const errorData = error.response.data as any;
      const errorMessage = errorData.message || errorData.error || '';

      if (errorMessage === 'User not found' || errorMessage.includes('User not found')) {
        // Dispatch logout action to clear auth state
        store.dispatch(logout());
      }
    }

    // Don't reload page on errors, just reject the promise
    // 401 handling will be done by the calling component/thunk
    return Promise.reject(error);
  },
);

// Join group API endpoint for invite functionality
export const joinGroup = async (joinCode: string) => {
  try {
    const payload = {
      joinCode,
      is_platform: 'web'
    };

    console.log('Join group payload:', payload);
    console.log('Making API call to:', '/groups/groups/join');
    console.log('Full API URL:', `${import.meta.env.VITE_API_BASE_URL}/join`);

    const response = await api.post('/groups/join', payload);


    return response.data;
  } catch (error) {
    console.error('Join group error:', error);
    throw error;
  }
};

export default api;
