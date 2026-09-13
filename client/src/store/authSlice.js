import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/axios';

const userFromStorage = localStorage.getItem('crm360_user')
  ? JSON.parse(localStorage.getItem('crm360_user'))
  : null;

const tokenFromStorage = localStorage.getItem('crm360_token') || null;

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await API.post('/auth/login', credentials);
      const { user, accessToken, refreshToken } = response.data.data;
      localStorage.setItem('crm360_token', accessToken);
      localStorage.setItem('crm360_refreshToken', refreshToken);
      localStorage.setItem('crm360_user', JSON.stringify(user));
      return { user, token: accessToken };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      return rejectWithValue(message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await API.post('/auth/register', userData);
      const { user, accessToken, refreshToken } = response.data.data;
      localStorage.setItem('crm360_token', accessToken);
      localStorage.setItem('crm360_refreshToken', refreshToken);
      localStorage.setItem('crm360_user', JSON.stringify(user));
      return { user, token: accessToken };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      return rejectWithValue(message);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/auth/me');
      const user = response.data.data;
      localStorage.setItem('crm360_user', JSON.stringify(user));
      return user;
    } catch (err) {
      return rejectWithValue('Failed to fetch user profile');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: userFromStorage,
    token: tokenFromStorage,
    isAuthenticated: !!tokenFromStorage,
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('crm360_token');
      localStorage.removeItem('crm360_refreshToken');
      localStorage.removeItem('crm360_user');
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('crm360_user', JSON.stringify(state.user));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout, clearAuthError, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;
