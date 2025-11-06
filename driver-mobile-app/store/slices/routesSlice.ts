import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { routesAPI } from '../services/api';

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
  estimatedArrival?: string;
}

interface BusRoute {
  id: string;
  name: string;
  dayOfWeek: 'MONDAY' | 'WEDNESDAY' | 'FRIDAY';
  stops: BusStop[];
  startTime: string;
  endTime: string;
  driverId?: string;
  driverName?: string;
  active: boolean;
  totalDistance?: number;
  estimatedDuration?: number;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  nextStopIndex?: number;
  progress?: number; // percentage of route completed
}

interface RoutesState {
  routes: BusRoute[];
  currentRoute: BusRoute | null;
  stops: BusStop[];
  loading: boolean;
  error: string | null;
  tracking: boolean;
  nextStop: BusStop | null;
  estimatedArrival: string | null;
}

const initialState: RoutesState = {
  routes: [],
  currentRoute: null,
  stops: [],
  loading: false,
  error: null,
  tracking: false,
  nextStop: null,
  estimatedArrival: null,
};

// Async thunks
export const fetchDriverRoutes = createAsyncThunk(
  'routes/fetchDriverRoutes',
  async (driverId: string, { rejectWithValue }) => {
    try {
      const response = await routesAPI.getDriverRoutes(driverId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch routes');
    }
  }
);

export const getRouteDetails = createAsyncThunk(
  'routes/getRouteDetails',
  async (routeId: string, { rejectWithValue }) => {
    try {
      const response = await routesAPI.getRouteById(routeId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch route details');
    }
  }
);

export const startRoute = createAsyncThunk(
  'routes/startRoute',
  async (routeId: string, { rejectWithValue }) => {
    try {
      const response = await routesAPI.startRoute(routeId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to start route');
    }
  }
);

export const completeRoute = createAsyncThunk(
  'routes/completeRoute',
  async (routeId: string, { rejectWithValue }) => {
    try {
      const response = await routesAPI.completeRoute(routeId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to complete route');
    }
  }
);

export const updateLocation = createAsyncThunk(
  'routes/updateLocation',
  async ({
    routeId,
    location,
    nextStopIndex,
  }: {
    routeId: string;
    location: { latitude: number; longitude: number };
    nextStopIndex: number;
  }, { rejectWithValue }) => {
    try {
      const response = await routesAPI.updateLocation(routeId, {
        location,
        nextStopIndex,
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update location');
    }
  }
);

export const markStopVisited = createAsyncThunk(
  'routes/markStopVisited',
  async ({
    routeId,
    stopId,
    actualArrivalTime,
    notes,
  }: {
    routeId: string;
    stopId: string;
    actualArrivalTime: string;
    notes?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await routesAPI.markStopVisited(routeId, {
        stopId,
        actualArrivalTime,
        notes,
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to mark stop as visited');
    }
  }
);

const routesSlice = createSlice({
  name: 'routes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentRoute: (state, action: PayloadAction<BusRoute | null>) => {
      state.currentRoute = action.payload;
    },
    setTracking: (state, action: PayloadAction<boolean>) => {
      state.tracking = action.payload;
    },
    setNextStop: (state, action: PayloadAction<BusStop | null>) => {
      state.nextStop = action.payload;
    },
    setEstimatedArrival: (state, action: PayloadAction<string | null>) => {
      state.estimatedArrival = action.payload;
    },
    updateRouteProgress: (state, action: PayloadAction<{
      routeId: string;
      progress: number;
      nextStopIndex: number;
      currentLocation: { latitude: number; longitude: number };
    }>) => {
      const { routeId, progress, nextStopIndex, currentLocation } = action.payload;

      if (state.currentRoute?.id === routeId) {
        state.currentRoute = {
          ...state.currentRoute,
          progress,
          nextStopIndex,
          currentLocation,
        };
      }

      // Update in routes array as well
      const routeIndex = state.routes.findIndex(r => r.id === routeId);
      if (routeIndex !== -1) {
        state.routes[routeIndex] = {
          ...state.routes[routeIndex],
          progress,
          nextStopIndex,
          currentLocation,
        };
      }

      // Update next stop
      if (state.currentRoute && nextStopIndex < state.currentRoute.stops.length) {
        state.nextStop = state.currentRoute.stops[nextStopIndex];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Driver Routes
      .addCase(fetchDriverRoutes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriverRoutes.fulfilled, (state, action) => {
        state.loading = false;
        state.routes = action.payload;
        state.error = null;
      })
      .addCase(fetchDriverRoutes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Route Details
      .addCase(getRouteDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRouteDetails.fulfilled, (state, action) => {
        state.loading = false;
        const route = action.payload;
        state.currentRoute = route;
        state.stops = route.stops;
        state.error = null;
      })
      .addCase(getRouteDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Start Route
      .addCase(startRoute.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startRoute.fulfilled, (state, action) => {
        state.loading = false;
        state.tracking = true;
        const updatedRoute = action.payload;

        if (state.currentRoute?.id === updatedRoute.id) {
          state.currentRoute = updatedRoute;
        }

        // Update in routes array
        const routeIndex = state.routes.findIndex(r => r.id === updatedRoute.id);
        if (routeIndex !== -1) {
          state.routes[routeIndex] = updatedRoute;
        }

        state.error = null;
      })
      .addCase(startRoute.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Complete Route
      .addCase(completeRoute.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeRoute.fulfilled, (state, action) => {
        state.loading = false;
        state.tracking = false;
        const updatedRoute = action.payload;

        if (state.currentRoute?.id === updatedRoute.id) {
          state.currentRoute = updatedRoute;
        }

        // Update in routes array
        const routeIndex = state.routes.findIndex(r => r.id === updatedRoute.id);
        if (routeIndex !== -1) {
          state.routes[routeIndex] = updatedRoute;
        }

        state.error = null;
      })
      .addCase(completeRoute.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Location
      .addCase(updateLocation.fulfilled, (state, action) => {
        const { routeId, progress, nextStopIndex, currentLocation } = action.payload;

        // Update current route
        if (state.currentRoute?.id === routeId) {
          state.currentRoute = {
            ...state.currentRoute,
            progress,
            nextStopIndex,
            currentLocation,
          };

          // Update next stop
          if (nextStopIndex < state.currentRoute.stops.length) {
            state.nextStop = state.currentRoute.stops[nextStopIndex];
          }
        }

        // Update in routes array
        const routeIndex = state.routes.findIndex(r => r.id === routeId);
        if (routeIndex !== -1) {
          state.routes[routeIndex] = {
            ...state.routes[routeIndex],
            progress,
            nextStopIndex,
            currentLocation,
          };
        }
      })
      // Mark Stop Visited
      .addCase(markStopVisited.fulfilled, (state, action) => {
        const { routeId, stopId, actualArrivalTime } = action.payload;

        // Update stop in current route
        if (state.currentRoute?.id === routeId) {
          const updatedStops = state.currentRoute.stops.map(stop =>
            stop.id === stopId
              ? { ...stop, estimatedArrival: actualArrivalTime }
              : stop
          );
          state.currentRoute = { ...state.currentRoute, stops: updatedStops };
        }

        // Update in routes array
        const routeIndex = state.routes.findIndex(r => r.id === routeId);
        if (routeIndex !== -1) {
          const updatedStops = state.routes[routeIndex].stops.map(stop =>
            stop.id === stopId
              ? { ...stop, estimatedArrival: actualArrivalTime }
              : stop
          );
          state.routes[routeIndex] = { ...state.routes[routeIndex], stops: updatedStops };
        }

        // Update next stop if needed
        if (state.currentRoute && state.currentRoute.nextStopIndex !== undefined) {
          const nextIndex = state.currentRoute.nextStopIndex + 1;
          if (nextIndex < state.currentRoute.stops.length) {
            state.nextStop = state.currentRoute.stops[nextIndex];
          } else {
            state.nextStop = null;
          }
        }
      });
  },
});

export const {
  clearError,
  setCurrentRoute,
  setTracking,
  setNextStop,
  setEstimatedArrival,
  updateRouteProgress,
} = routesSlice.actions;

export default routesSlice.reducer;