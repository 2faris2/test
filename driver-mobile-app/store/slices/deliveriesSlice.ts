import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { deliveriesAPI } from '../services/api';

interface Delivery {
  id: string;
  reservationId: string;
  reservation: {
    id: string;
    book: {
      id: string;
      title: string;
      author: string;
      isbn: string;
    };
    user: {
      id: string;
      name: string;
      phone: string;
      address: string;
    };
  };
  status: 'SCHEDULED' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED' | 'RESCHEDULED';
  scheduledDate: string;
  scheduledTime: string;
  actualDeliveryTime?: string;
  busStop: {
    id: string;
    name: string;
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  routeId: string;
  driverId: string;
  deliveryNotes?: string;
  confirmationPhoto?: string;
  customerNotes?: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

interface DeliveriesState {
  todayDeliveries: Delivery[];
  allDeliveries: Delivery[];
  selectedDelivery: Delivery | null;
  loading: boolean;
  error: string | null;
  updatingStatus: boolean;
  scanningQR: boolean;
}

const initialState: DeliveriesState = {
  todayDeliveries: [],
  allDeliveries: [],
  selectedDelivery: null,
  loading: false,
  error: null,
  updatingStatus: false,
  scanningQR: false,
};

// Async thunks
export const fetchTodayDeliveries = createAsyncThunk(
  'deliveries/fetchTodayDeliveries',
  async (driverId: string, { rejectWithValue }) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await deliveriesAPI.getDriverDeliveries(driverId, today);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch deliveries');
    }
  }
);

export const fetchAllDeliveries = createAsyncThunk(
  'deliveries/fetchAllDeliveries',
  async ({ driverId, date }: { driverId: string; date?: string }, { rejectWithValue }) => {
    try {
      const response = await deliveriesAPI.getDriverDeliveries(driverId, date);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch deliveries');
    }
  }
);

export const updateDeliveryStatus = createAsyncThunk(
  'deliveries/updateDeliveryStatus',
  async ({
    deliveryId,
    status,
    notes,
    photo,
  }: {
    deliveryId: string;
    status: Delivery['status'];
    notes?: string;
    photo?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await deliveriesAPI.updateDeliveryStatus(deliveryId, {
        status,
        notes,
        photo,
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update delivery status');
    }
  }
);

export const confirmDelivery = createAsyncThunk(
  'deliveries/confirmDelivery',
  async ({
    deliveryId,
    qrCodeData,
    photo,
    notes,
  }: {
    deliveryId: string;
    qrCodeData: any;
    photo?: string;
    notes?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await deliveriesAPI.confirmDelivery(deliveryId, {
        qrCodeData,
        photo,
        notes,
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to confirm delivery');
    }
  }
);

export const reportDeliveryIssue = createAsyncThunk(
  'deliveries/reportDeliveryIssue',
  async ({
    deliveryId,
    issueType,
    description,
    photo,
  }: {
    deliveryId: string;
    issueType: 'customer_not_available' | 'wrong_address' | 'damaged_package' | 'other';
    description: string;
    photo?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await deliveriesAPI.reportIssue(deliveryId, {
        issueType,
        description,
        photo,
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to report issue');
    }
  }
);

const deliveriesSlice = createSlice({
  name: 'deliveries',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedDelivery: (state, action: PayloadAction<Delivery | null>) => {
      state.selectedDelivery = action.payload;
    },
    setScanningQR: (state, action: PayloadAction<boolean>) => {
      state.scanningQR = action.payload;
    },
    updateLocalDeliveryStatus: (state, action: PayloadAction<{
      deliveryId: string;
      status: Delivery['status'];
      actualDeliveryTime?: string;
    }>) => {
      const { deliveryId, status, actualDeliveryTime } = action.payload;

      const updateDeliveryInArray = (deliveries: Delivery[]) => {
        const index = deliveries.findIndex(d => d.id === deliveryId);
        if (index !== -1) {
          deliveries[index] = {
            ...deliveries[index],
            status,
            actualDeliveryTime: actualDeliveryTime || deliveries[index].actualDeliveryTime,
          };
        }
      };

      updateDeliveryInArray(state.todayDeliveries);
      updateDeliveryInArray(state.allDeliveries);

      if (state.selectedDelivery?.id === deliveryId) {
        state.selectedDelivery = {
          ...state.selectedDelivery,
          status,
          actualDeliveryTime: actualDeliveryTime || state.selectedDelivery.actualDeliveryTime,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Today's Deliveries
      .addCase(fetchTodayDeliveries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodayDeliveries.fulfilled, (state, action) => {
        state.loading = false;
        state.todayDeliveries = action.payload;
        state.error = null;
      })
      .addCase(fetchTodayDeliveries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch All Deliveries
      .addCase(fetchAllDeliveries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDeliveries.fulfilled, (state, action) => {
        state.loading = false;
        state.allDeliveries = action.payload;
        state.error = null;
      })
      .addCase(fetchAllDeliveries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Delivery Status
      .addCase(updateDeliveryStatus.pending, (state) => {
        state.updatingStatus = true;
        state.error = null;
      })
      .addCase(updateDeliveryStatus.fulfilled, (state, action) => {
        state.updatingStatus = false;
        const updatedDelivery = action.payload;

        const updateInArray = (deliveries: Delivery[]) => {
          const index = deliveries.findIndex(d => d.id === updatedDelivery.id);
          if (index !== -1) {
            deliveries[index] = updatedDelivery;
          }
        };

        updateInArray(state.todayDeliveries);
        updateInArray(state.allDeliveries);

        if (state.selectedDelivery?.id === updatedDelivery.id) {
          state.selectedDelivery = updatedDelivery;
        }

        state.error = null;
      })
      .addCase(updateDeliveryStatus.rejected, (state, action) => {
        state.updatingStatus = false;
        state.error = action.payload as string;
      })
      // Confirm Delivery
      .addCase(confirmDelivery.pending, (state) => {
        state.updatingStatus = true;
        state.error = null;
      })
      .addCase(confirmDelivery.fulfilled, (state, action) => {
        state.updatingStatus = false;
        const updatedDelivery = action.payload;

        const updateInArray = (deliveries: Delivery[]) => {
          const index = deliveries.findIndex(d => d.id === updatedDelivery.id);
          if (index !== -1) {
            deliveries[index] = updatedDelivery;
          }
        };

        updateInArray(state.todayDeliveries);
        updateInArray(state.allDeliveries);

        if (state.selectedDelivery?.id === updatedDelivery.id) {
          state.selectedDelivery = updatedDelivery;
        }

        state.error = null;
      })
      .addCase(confirmDelivery.rejected, (state, action) => {
        state.updatingStatus = false;
        state.error = action.payload as string;
      })
      // Report Issue
      .addCase(reportDeliveryIssue.pending, (state) => {
        state.updatingStatus = true;
        state.error = null;
      })
      .addCase(reportDeliveryIssue.fulfilled, (state, action) => {
        state.updatingStatus = false;
        const updatedDelivery = action.payload;

        const updateInArray = (deliveries: Delivery[]) => {
          const index = deliveries.findIndex(d => d.id === updatedDelivery.id);
          if (index !== -1) {
            deliveries[index] = updatedDelivery;
          }
        };

        updateInArray(state.todayDeliveries);
        updateInArray(state.allDeliveries);

        if (state.selectedDelivery?.id === updatedDelivery.id) {
          state.selectedDelivery = updatedDelivery;
        }

        state.error = null;
      })
      .addCase(reportDeliveryIssue.rejected, (state, action) => {
        state.updatingStatus = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedDelivery, setScanningQR, updateLocalDeliveryStatus } = deliveriesSlice.actions;
export default deliveriesSlice.reducer;