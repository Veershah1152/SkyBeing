import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Login thunk
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post('/users/login', credentials);
            return response.data.data; // { user, accessToken, refreshToken }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

// Google Login thunk
export const googleLogin = createAsyncThunk(
    'auth/googleLogin',
    async (token, { rejectWithValue }) => {
        try {
            const response = await api.post('/users/google', { token });
            return response.data.data; // { user, accessToken }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Google Login failed');
        }
    }
);

// Fetch Current User thunk (using HTTP-Only cookie)
export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/users/me');
            return response.data.data; // { _id, name, email, role, etc }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Not authenticated');
        }
    }
);


// Register thunk
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData, { rejectWithValue }) => {
        try {
            // Create FormData if uploading an avatar, else JSON might be OK if configured.
            // Based on standard Node/Express setups handling file uploads.
            const response = await api.post('/users/register', userData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Registration failed');
        }
    }
);

// Logout thunk
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await api.post('/users/logout');
            return true;
        } catch (error) {
            return rejectWithValue('Logout failed');
        }
    }
);

const initialState = {
    user: null,
    isAuthenticated: false,
    status: 'idle',
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.isAuthenticated = true;
                state.user = action.payload.user;
                if (action.payload.accessToken) {
                    localStorage.setItem('accessToken', action.payload.accessToken);
                }
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Register
            .addCase(registerUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Some APIs just login upon register
                if (action.payload && action.payload.user) {
                    state.isAuthenticated = true;
                    state.user = action.payload.user;
                }
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Google Login
            .addCase(googleLogin.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(googleLogin.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.isAuthenticated = true;
                state.user = action.payload.user;
                if (action.payload.accessToken) {
                    localStorage.setItem('accessToken', action.payload.accessToken);
                }
            })
            .addCase(googleLogin.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.status = 'idle';
                localStorage.removeItem('accessToken');
            })
            // Fetch Current User (Persistent Login)
            .addCase(fetchCurrentUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                if (action.payload) {
                    state.isAuthenticated = true;
                    state.user = action.payload; // user payload
                } else {
                    state.isAuthenticated = false;
                    state.user = null;
                }
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.status = 'failed';
                state.isAuthenticated = false;
                state.user = null;
                // Don't show an explicit error on load failure due to 401s
            });
    }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
