import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { bibliobusAPI } from '../services/api';

interface BusStop {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  zone: 'A' | 'B' | 'C' | 'D';
  active: boolean;
  description?: string;
}

interface BusRoute {
  id: string;
  name: string;
  dayOfWeek: 'MONDAY' | 'WEDNESDAY' | 'FRIDAY';
  stops: BusStop[];
  startTime: string;
  endTime: string;
  driverId?: string;
  active: boolean;
}

interface Delivery {
  id: string;
  reservationId: string;
  reservation: {
    id: string;
    book: {
      id: string;
      title: string;
      author: string;
    };
    user: {
      id: string;
      name: string;
      phone: string;
    };
  };
  status: 'SCHEDULED' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED' | 'RESCHEDULED';
  scheduledDate: string;
  scheduledTime: string;
  actualDeliveryTime?: string;
  busStop: BusStop;
  driverId?: string;
  driverName?: string;
  deliveryNotes?: string;
  confirmationPhoto?: string;
  createdAt: string;
}

interface BibliobusState {
  busStops: BusStop[];
  routes: BusRoute[];
  userDeliveries: Delivery[];
  selectedRoute: BusRoute | null;
  selectedStop: BusStop | null;
  loading: boolean;
  error: string | null;
  requestingDelivery: boolean;
}

const initialState: BibliobusState = {
  busStops: [],
  routes: [],
  userDeliveries: [],
  selectedRoute: null,
  selectedStop: null,
  loading: false,
  error: null,
  requestingDelivery: false,
};

// Async thunks
export const fetchBusStops = createAsyncThunk(
  'bibliobus/fetchBusStops',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bibliobusAPI.getBusStops();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch bus stops');
    }
  }
);

export const fetchBusRoutes = createAsyncThunk(
  'bibliobus/fetchBusRoutes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bibliobusAPI.getBusRoutes();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch bus routes');
    }
  }
);

export const fetchUserDeliveries = createAsyncThunk(
  'bibliobus/fetchUserDeliveries',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await bibliobusAPI.getUserDeliveries(userId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch deliveries');
    }
  }
);

export const requestDelivery = createAsyncThunk(
  'bibliobus/requestDelivery',
  async (data: {
    reservationId: string;
    busStopId: string;
    preferredDate?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await bibliobusAPI.requestDelivery(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to request delivery');
    }
  }
);

export const trackDelivery = createAsyncThunk(
  'bibliobus/trackDelivery',
  async (deliveryId: string, { rejectWithValue }) => {
    try {
      const response = await bibliobusAPI.getDeliveryStatus(deliveryId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to track delivery');
    }
  }
);

const bibliobusSlice = createSlice({
  name: 'bibliobus',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedRoute: (state, action: PayloadAction<BusRoute | null>) => {
      state.selectedRoute = action.payload;
    },
    setSelectedStop: (state, action: PayloadAction<BusStop | null>) => {
      state.selectedStop = action.payload;
    },
    updateDeliveryStatus: (state, action: PayloadAction<{
      deliveryId: string;
      status: Delivery['status'];
      actualDeliveryTime?: string;
    }>) => {
      const { deliveryId, status, actualDeliveryTime } = action.payload;
      const delivery = state.userDeliveries.find(d => d.id === deliveryId);
      if (delivery) {
        delivery.status = status;
        if (actualDeliveryTime) {
          delivery.actualDeliveryTime = actualDeliveryTime;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Bus Stops
      .addCase(fetchBusStops.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusStops.fulfilled, (state, action) => {
        state.loading = false;
        state.busStops = action.payload;
        state.error = null;
      })
      .addCase(fetchBusStops.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Bus Routes
      .addCase(fetchBusRoutes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusRoutes.fulfilled, (state, action) => {
        state.loading = false;
        state.routes = action.payload;
        state.error = null;
      })
      .addCase(fetchBusRoutes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch User Deliveries
      .addCase(fetchUserDeliveries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDeliveries.fulfilled, (state, action) => {
        state.loading = false;
        state.userDeliveries = action.payload;
        state.error = null;
      })
      .addCase(fetchUserDeliveries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Request Delivery
      .addCase(requestDelivery.pending, (state) => {
        state.requestingDelivery = true;
        state.error = null;
      })
      .addCase(requestDelivery.fulfilled, (state, action) => {
        state.requestingDelivery = false;
        state.userDeliveries.unshift(action.payload);
        state.error = null;
      })
      .addCase(requestDelivery.rejected, (state, action) => {
        state.requestingDelivery = false;
        state.error = action.payload as string;
      })
      // Track Delivery
      .addCase(trackDelivery.fulfilled, (state, action) => {
        const updatedDelivery = action.payload;
        const index = state.userDeliveries.findIndex(d => d.id === updatedDelivery.id);
        if (index !== -1) {
          state.userDeliveries[index] = updatedDelivery;
        }
      })
      .addCase(trackDelivery.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedRoute, setSelectedStop, updateDeliveryStatus } = bibliobusSlice.actions;
export default bibliobusSlice.reducer;