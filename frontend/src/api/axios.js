import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
    withCredentials: true, // Necessary if the backend is using cookies for JWT, etc.
});

// Optionally, add an interceptor for handling 401s or adding Authorization headers if not using cookies
api.interceptors.request.use(
    (config) => {
        // If you store token in localStorage instead of a secure cookie:
        // const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers['Authorization'] = `Bearer ${token}`;
        // }
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
