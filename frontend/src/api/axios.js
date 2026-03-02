import axios from 'axios';

// In production (Cloudflare), VITE_API_BASE_URL must be set to your Render backend URL
// In local dev, it falls back to '/api/v1' which Vite proxies to localhost:8000
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const api = axios.create({
    baseURL,
    withCredentials: true,
});

// Optionally, add an interceptor for handling 401s or adding Authorization headers if not using cookies
api.interceptors.request.use(
    (config) => {
        // Send token as Authorization header (works cross-domain, unlike cookies)
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Suppress 401 console errors specifically for the initial user fetch
        if (error.response?.status === 401 && error.config?.url === '/users/me') {
            return Promise.reject(error); // Reject so authSlice catches it, but don't console.error
        }

        return Promise.reject(error);
    }
);

export default api;
