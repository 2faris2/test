import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import booksSlice from './slices/booksSlice';
import reservationsSlice from './slices/reservationsSlice';
import bibliobusSlice from './slices/bibliobusSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    books: booksSlice,
    reservations: reservationsSlice,
    bibliobus: bibliobusSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;