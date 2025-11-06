import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3000'; // Backend API URL

class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async setToken(token: string) {
    this.token = token;
    await AsyncStorage.setItem('authToken', token);
  }

  async loadToken() {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      this.token = token;
    }
  }

  async clearToken() {
    this.token = null;
    await AsyncStorage.removeItem('authToken');
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        response: { data: errorData },
        status: response.status,
      };
    }
    return response.json();
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    await this.loadToken();
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: await this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    await this.loadToken();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    await this.loadToken();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: await this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    await this.loadToken();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: await this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }
}

// API Client instance
const apiClient = new APIClient(API_BASE_URL);

// Auth API
export const authAPI = {
  async login(email: string, password: string) {
    return apiClient.post<{ user: any; token: string }>('/auth/login', {
      email,
      password,
    });
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }) {
    return apiClient.post<{ user: any; token: string }>('/auth/register', userData);
  },

  async getProfile() {
    return apiClient.get<{ user: any }>('/auth/me');
  },

  async updateProfile(userId: string, userData: Partial<{
    name: string;
    email: string;
    phone: string;
    photoUrl: string;
  }>) {
    return apiClient.put<{ user: any }>(`/users/${userId}`, userData);
  },

  async getQRCode(userId: string) {
    return apiClient.get<{ qrCode: string }>(`/users/${userId}/qr-code`);
  },
};

// Books API
export const booksAPI = {
  async getBooks(params?: {
    page?: number;
    limit?: number;
    genre?: string;
    available?: boolean;
    location?: 'LIBRARY' | 'BIBLIOBUS';
  }) {
    return apiClient.get<{ books: any[]; total: number; page: number; totalPages: number }>('/books', params);
  },

  async searchBooks(params: {
    query: string;
    genre?: string;
    available?: boolean;
    location?: 'LIBRARY' | 'BIBLIOBUS';
    page?: number;
    limit?: number;
  }) {
    return apiClient.get<{ books: any[]; total: number; page: number; totalPages: number }>('/books/search', params);
  },

  async getBookById(bookId: string) {
    return apiClient.get<{ book: any }>(`/books/${bookId}`);
  },

  async getPopularBooks() {
    return apiClient.get<{ books: any[] }>('/books/popular');
  },

  async getNewBooks() {
    return apiClient.get<{ books: any[] }>('/books/new');
  },
};

// Reservations API
export const reservationsAPI = {
  async getUserReservations(userId: string, active = true) {
    return apiClient.get<{ reservations: any[] }>(`/reservations/user/${userId}`, { active });
  },

  async createReservation(data: {
    bookId: string;
    deliveryLocation: {
      type: 'LIBRARY' | 'BIBLIOBUS';
      busStopId?: string;
    };
  }) {
    return apiClient.post<{ reservation: any }>('/reservations', data);
  },

  async cancelReservation(reservationId: string) {
    return apiClient.delete(`/reservations/${reservationId}`);
  },

  async updateReservationDeliveryLocation(
    reservationId: string,
    deliveryLocation: {
      type: 'LIBRARY' | 'BIBLIOBUS';
      busStopId?: string;
    }
  ) {
    return apiClient.put<{ reservation: any }>(`/reservations/${reservationId}`, {
      deliveryLocation,
    });
  },
};

// Bibliobus API
export const bibliobusAPI = {
  async getBusStops() {
    return apiClient.get<{ busStops: any[] }>('/bus-stops');
  },

  async getBusRoutes() {
    return apiClient.get<{ routes: any[] }>('/bus-routes');
  },

  async getUserDeliveries(userId: string) {
    return apiClient.get<{ deliveries: any[] }>(`/deliveries/user/${userId}`);
  },

  async requestDelivery(data: {
    reservationId: string;
    busStopId: string;
    preferredDate?: string;
  }) {
    return apiClient.post<{ delivery: any }>('/deliveries', data);
  },

  async getDeliveryStatus(deliveryId: string) {
    return apiClient.get<{ delivery: any }>(`/deliveries/${deliveryId}`);
  },
};

// Loans API
export const loansAPI = {
  async getUserLoans(userId: string, active = true) {
    return apiClient.get<{ loans: any[] }>(`/loans/user/${userId}`, { active });
  },

  async getLoanHistory(userId: string) {
    return apiClient.get<{ loans: any[] }>(`/loans/user/${userId}/history`);
  },

  async renewLoan(loanId: string) {
    return apiClient.put<{ loan: any }>(`/loans/${loanId}/renew`);
  },
};

// Notifications API
export const notificationsAPI = {
  async getUserNotifications(userId: string, page = 1, limit = 20) {
    return apiClient.get<{ notifications: any[]; unreadCount: number }>('/notifications', {
      userId,
      page,
      limit,
    });
  },

  async markNotificationAsRead(notificationId: string) {
    return apiClient.put(`/notifications/${notificationId}/read`);
  },

  async markAllNotificationsAsRead(userId: string) {
    return apiClient.put('/notifications/read-all', { userId });
  },
};

// User Stats API
export const statsAPI = {
  async getUserStats(userId: string) {
    return apiClient.get<{
      totalBooksRead: number;
      currentBooksLoaned: number;
      favoriteGenres: any[];
      readingStreak: number;
      memberSince: string;
    }>(`/users/${userId}/stats`);
  },
};

export default apiClient;