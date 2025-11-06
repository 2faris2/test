import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    await apiClient.post('/auth/logout');
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

// Books API
export const booksAPI = {
  getBooks: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    genre?: string;
    available?: boolean;
  }) => {
    const response = await apiClient.get('/books', { params });
    return response.data;
  },

  getBookById: async (id: string) => {
    const response = await apiClient.get(`/books/${id}`);
    return response.data;
  },

  createBook: async (bookData: any) => {
    const response = await apiClient.post('/books', bookData);
    return response.data;
  },

  updateBook: async (id: string, bookData: any) => {
    const response = await apiClient.put(`/books/${id}`, bookData);
    return response.data;
  },

  deleteBook: async (id: string) => {
    const response = await apiClient.delete(`/books/${id}`);
    return response.data;
  },

  bulkImportBooks: async (booksData: any[]) => {
    const response = await apiClient.post('/books/bulk-import', { books: booksData });
    return response.data;
  },

  getGenres: async () => {
    const response = await apiClient.get('/books/genres');
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }) => {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, userData: any) => {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  approveRegistration: async (userId: string) => {
    const response = await apiClient.post(`/users/${userId}/approve`);
    return response.data;
  },

  blockUser: async (userId: string) => {
    const response = await apiClient.post(`/users/${userId}/block`);
    return response.data;
  },

  unblockUser: async (userId: string) => {
    const response = await apiClient.post(`/users/${userId}/unblock`);
    return response.data;
  },

  getUserStats: async (userId: string) => {
    const response = await apiClient.get(`/users/${userId}/stats`);
    return response.data;
  },

  exportUsers: async (format: 'csv' | 'pdf' | 'excel') => {
    const response = await apiClient.get(`/users/export?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Reservations API
export const reservationsAPI = {
  getReservations: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
  }) => {
    const response = await apiClient.get('/reservations', { params });
    return response.data;
  },

  getReservationById: async (id: string) => {
    const response = await apiClient.get(`/reservations/${id}`);
    return response.data;
  },

  updateReservation: async (id: string, reservationData: any) => {
    const response = await apiClient.put(`/reservations/${id}`, reservationData);
    return response.data;
  },

  cancelReservation: async (id: string) => {
    const response = await apiClient.delete(`/reservations/${id}`);
    return response.data;
  },

  approveReservation: async (id: string) => {
    const response = await apiClient.post(`/reservations/${id}/approve`);
    return response.data;
  },
};

// Loans API
export const loansAPI = {
  getLoans: async (params?: {
    page?: number;
    limit?: number;
    active?: boolean;
    overdue?: boolean;
    userId?: string;
  }) => {
    const response = await apiClient.get('/loans', { params });
    return response.data;
  },

  getLoanById: async (id: string) => {
    const response = await apiClient.get(`/loans/${id}`);
    return response.data;
  },

  createLoan: async (loanData: any) => {
    const response = await apiClient.post('/loans', loanData);
    return response.data;
  },

  updateLoan: async (id: string, loanData: any) => {
    const response = await apiClient.put(`/loans/${id}`, loanData);
    return response.data;
  },

  returnLoan: async (id: string) => {
    const response = await apiClient.post(`/loans/${id}/return`);
    return response.data;
  },

  renewLoan: async (id: string) => {
    const response = await apiClient.post(`/loans/${id}/renew`);
    return response.data;
  },
};

// Bibliobus API
export const bibliobusAPI = {
  getBusRoutes: async () => {
    const response = await apiClient.get('/bus-routes');
    return response.data;
  },

  createBusRoute: async (routeData: any) => {
    const response = await apiClient.post('/bus-routes', routeData);
    return response.data;
  },

  updateBusRoute: async (id: string, routeData: any) => {
    const response = await apiClient.put(`/bus-routes/${id}`, routeData);
    return response.data;
  },

  deleteBusRoute: async (id: string) => {
    const response = await apiClient.delete(`/bus-routes/${id}`);
    return response.data;
  },

  getBusStops: async () => {
    const response = await apiClient.get('/bus-stops');
    return response.data;
  },

  createBusStop: async (stopData: any) => {
    const response = await apiClient.post('/bus-stops', stopData);
    return response.data;
  },

  updateBusStop: async (id: string, stopData: any) => {
    const response = await apiClient.put(`/bus-stops/${id}`, stopData);
    return response.data;
  },

  deleteBusStop: async (id: string) => {
    const response = await apiClient.delete(`/bus-stops/${id}`);
    return response.data;
  },

  getDeliveries: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    routeId?: string;
    date?: string;
  }) => {
    const response = await apiClient.get('/deliveries', { params });
    return response.data;
  },

  getDeliveryById: async (id: string) => {
    const response = await apiClient.get(`/deliveries/${id}`);
    return response.data;
  },

  updateDelivery: async (id: string, deliveryData: any) => {
    const response = await apiClient.put(`/deliveries/${id}`, deliveryData);
    return response.data;
  },

  assignDriver: async (deliveryId: string, driverId: string) => {
    const response = await apiClient.post(`/deliveries/${deliveryId}/assign`, { driverId });
    return response.data;
  },

  generateDriverManifest: async (routeId: string, date: string) => {
    const response = await apiClient.get(`/deliveries/manifest?routeId=${routeId}&date=${date}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: async () => {
    const response = await apiClient.get('/analytics/dashboard');
    return response.data;
  },

  getBooksStats: async (params?: {
    period?: 'week' | 'month' | 'quarter' | 'year';
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get('/analytics/books', { params });
    return response.data;
  },

  getUsersStats: async (params?: {
    period?: 'week' | 'month' | 'quarter' | 'year';
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get('/analytics/users', { params });
    return response.data;
  },

  getDeliveriesStats: async (params?: {
    period?: 'week' | 'month' | 'quarter' | 'year';
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get('/analytics/deliveries', { params });
    return response.data;
  },

  getFinancialStats: async (params?: {
    period?: 'week' | 'month' | 'quarter' | 'year';
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get('/analytics/financial', { params });
    return response.data;
  },

  generateReport: async (type: string, params?: any) => {
    const response = await apiClient.post(`/reports/${type}`, params, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default apiClient;