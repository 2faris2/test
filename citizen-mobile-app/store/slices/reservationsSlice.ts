import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { reservationsAPI } from '../services/api';

interface Reservation {
  id: string;
  userId: string;
  bookId: string;
  book: {
    id: string;
    title: string;
    author: string;
    coverImage?: string;
  };
  status: 'PENDING' | 'APPROVED' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';
  reservedAt: string;
  validUntil: string;
  deliveryLocation?: {
    type: 'LIBRARY' | 'BIBLIOBUS';
    busStopId?: string;
    busStopName?: string;
  };
  notes?: string;
}

interface ReservationsState {
  activeReservations: Reservation[];
  reservationHistory: Reservation[];
  loading: boolean;
  error: string | null;
  creatingReservation: boolean;
}

const initialState: ReservationsState = {
  activeReservations: [],
  reservationHistory: [],
  loading: false,
  error: null,
  creatingReservation: false,
};

// Async thunks
export const fetchUserReservations = createAsyncThunk(
  'reservations/fetchUserReservations',
  async ({ userId, active = true }: { userId: string; active?: boolean }, { rejectWithValue }) => {
    try {
      const response = await reservationsAPI.getUserReservations(userId, active);
      return { reservations: response.reservations, active };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch reservations');
    }
  }
);

export const createReservation = createAsyncThunk(
  'reservations/createReservation',
  async (data: {
    bookId: string;
    deliveryLocation: {
      type: 'LIBRARY' | 'BIBLIOBUS';
      busStopId?: string;
    };
  }, { rejectWithValue }) => {
    try {
      const response = await reservationsAPI.createReservation(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create reservation');
    }
  }
);

export const cancelReservation = createAsyncThunk(
  'reservations/cancelReservation',
  async (reservationId: string, { rejectWithValue }) => {
    try {
      await reservationsAPI.cancelReservation(reservationId);
      return reservationId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to cancel reservation');
    }
  }
);

export const updateReservationDeliveryLocation = createAsyncThunk(
  'reservations/updateDeliveryLocation',
  async ({
    reservationId,
    deliveryLocation,
  }: {
    reservationId: string;
    deliveryLocation: {
      type: 'LIBRARY' | 'BIBLIOBUS';
      busStopId?: string;
    };
  }, { rejectWithValue }) => {
    try {
      const response = await reservationsAPI.updateReservationDeliveryLocation(
        reservationId,
        deliveryLocation
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update delivery location');
    }
  }
);

const reservationsSlice = createSlice({
  name: 'reservations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    removeReservation: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.activeReservations = state.activeReservations.filter(r => r.id !== id);
      state.reservationHistory = state.reservationHistory.filter(r => r.id !== id);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Reservations
      .addCase(fetchUserReservations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserReservations.fulfilled, (state, action) => {
        state.loading = false;
        const { reservations, active } = action.payload;
        if (active) {
          state.activeReservations = reservations;
        } else {
          state.reservationHistory = reservations;
        }
        state.error = null;
      })
      .addCase(fetchUserReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Reservation
      .addCase(createReservation.pending, (state) => {
        state.creatingReservation = true;
        state.error = null;
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.creatingReservation = false;
        state.activeReservations.unshift(action.payload);
        state.error = null;
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.creatingReservation = false;
        state.error = action.payload as string;
      })
      // Cancel Reservation
      .addCase(cancelReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelReservation.fulfilled, (state, action) => {
        state.loading = false;
        const reservationId = action.payload;
        state.activeReservations = state.activeReservations.filter(r => r.id !== reservationId);
        state.error = null;
      })
      .addCase(cancelReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Delivery Location
      .addCase(updateReservationDeliveryLocation.fulfilled, (state, action) => {
        const updatedReservation = action.payload;
        const index = state.activeReservations.findIndex(r => r.id === updatedReservation.id);
        if (index !== -1) {
          state.activeReservations[index] = updatedReservation;
        }
      })
      .addCase(updateReservationDeliveryLocation.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, removeReservation } = reservationsSlice.actions;
export default reservationsSlice.reducer;