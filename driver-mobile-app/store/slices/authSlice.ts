import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAPI } from '../services/api';
import * as SecureStore from 'expo-secure-store';

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  vehicleType: string;
  isActive: boolean;
}

interface AuthState {
  driver: Driver | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  driver: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(email, password);
      await SecureStore.setItemAsync('driverToken', response.token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Login failed');
    }
  }
);

export const loadDriver = createAsyncThunk(
  'auth/loadDriver',
  async (_, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync('driverToken');
      if (!token) {
        throw new Error('No token found');
      }
      const response = await authAPI.getProfile();
      return { ...response, token };
    } catch (error: any) {
      await SecureStore.deleteItemAsync('driverToken');
      return rejectWithValue('Session expired');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await SecureStore.deleteItemAsync('driverToken');
    } catch (error) {
      return rejectWithValue('Logout failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.driver = action.payload.driver;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.driver = null;
        state.token = null;
        state.error = action.payload as string;
      })
      // Load Driver
      .addCase(loadDriver.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.driver = action.payload.driver;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loadDriver.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.driver = null;
        state.token = null;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.driver = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;