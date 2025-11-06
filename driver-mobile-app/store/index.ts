import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import deliveriesSlice from './slices/deliveriesSlice';
import routesSlice from './slices/routesSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    deliveries: deliveriesSlice,
    routes: routesSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;