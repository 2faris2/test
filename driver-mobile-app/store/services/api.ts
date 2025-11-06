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
    await AsyncStorage.setItem('driverToken', token);
  }

  async loadToken() {
    const token = await AsyncStorage.getItem('driverToken');
    if (token) {
      this.token = token;
    }
  }

  async clearToken() {
    this.token = null;
    await AsyncStorage.removeItem('driverToken');
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
    return apiClient.post<{ driver: any; token: string }>('/auth/login', {
      email,
      password,
      role: 'DRIVER', // Specify driver role
    });
  },

  async getProfile() {
    return apiClient.get<{ driver: any }>('/auth/me');
  },

  async updateProfile(driverId: string, userData: Partial<{
    name: string;
    email: string;
    phone: string;
    licenseNumber: string;
    vehicleType: string;
  }>) {
    return apiClient.put<{ driver: any }>(`/drivers/${driverId}`, userData);
  },
};

// Routes API
export const routesAPI = {
  async getDriverRoutes(driverId: string) {
    return apiClient.get<{ routes: any[] }>('/routes', { driverId });
  },

  async getRouteById(routeId: string) {
    return apiClient.get<{ route: any }>(`/routes/${routeId}`);
  },

  async startRoute(routeId: string) {
    return apiClient.post<{ route: any }>(`/routes/${routeId}/start`);
  },

  async completeRoute(routeId: string) {
    return apiClient.post<{ route: any }>(`/routes/${routeId}/complete`);
  },

  async updateLocation(routeId: string, locationData: {
    location: { latitude: number; longitude: number };
    nextStopIndex: number;
  }) {
    return apiClient.put<{ route: any }>(`/routes/${routeId}/location`, locationData);
  },

  async markStopVisited(routeId: string, stopData: {
    stopId: string;
    actualArrivalTime: string;
    notes?: string;
  }) {
    return apiClient.post<{ route: any }>(`/routes/${routeId}/stops/visited`, stopData);
  },

  async getRouteHistory(driverId: string, params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    return apiClient.get<{ routes: any[]; total: number }>('/routes/history', {
      driverId,
      ...params,
    });
  },
};

// Deliveries API
export const deliveriesAPI = {
  async getDriverDeliveries(driverId: string, date?: string) {
    return apiClient.get<{ deliveries: any[] }>('/deliveries', {
      driverId,
      date,
    });
  },

  async getDeliveryById(deliveryId: string) {
    return apiClient.get<{ delivery: any }>(`/deliveries/${deliveryId}`);
  },

  async updateDeliveryStatus(deliveryId: string, statusData: {
    status: string;
    notes?: string;
    photo?: string;
  }) {
    return apiClient.put<{ delivery: any }>(`/deliveries/${deliveryId}`, statusData);
  },

  async confirmDelivery(deliveryId: string, confirmationData: {
    qrCodeData: any;
    photo?: string;
    notes?: string;
  }) {
    return apiClient.post<{ delivery: any }>(`/deliveries/${deliveryId}/confirm`, confirmationData);
  },

  async reportIssue(deliveryId: string, issueData: {
    issueType: string;
    description: string;
    photo?: string;
  }) {
    return apiClient.post<{ delivery: any }>(`/deliveries/${deliveryId}/issue`, issueData);
  },

  async uploadDeliveryPhoto(deliveryId: string, photoUri: string) {
    // In a real app, this would upload the photo to a file storage service
    // For now, we'll just return a mock URL
    return { photoUrl: `mock://delivery-photo/${deliveryId}/${Date.now()}` };
  },
};

// QR Code API
export const qrAPI = {
  async scanQRCode(qrData: string) {
    return apiClient.post<{ valid: boolean; data?: any; error?: string }>('/scan/verify', {
      qrData,
    });
  },

  async processDeliveryWithQR(deliveryId: string, qrData: string, photo?: string) {
    return apiClient.post<{ delivery: any; success: boolean }>(`/deliveries/${deliveryId}/qr-process`, {
      qrData,
      photo,
    });
  },
};

// Notifications API
export const notificationsAPI = {
  async getDriverNotifications(driverId: string) {
    return apiClient.get<{ notifications: any[] }>('/notifications', { driverId });
  },

  async markNotificationAsRead(notificationId: string) {
    return apiClient.put(`/notifications/${notificationId}/read`);
  },

  async sendNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
  }) {
    return apiClient.post<{ notification: any }>('/notifications', data);
  },
};

// Emergency API
export const emergencyAPI = {
  async reportEmergency(emergencyData: {
    driverId: string;
    routeId?: string;
    location: { latitude: number; longitude: number };
    type: 'breakdown' | 'accident' | 'medical' | 'other';
    description: string;
    needsAssistance: boolean;
  }) {
    return apiClient.post<{ emergency: any }>('/emergency', emergencyData);
  },

  async getEmergencyContacts() {
    return apiClient.get<{ contacts: any[] }>('/emergency/contacts');
  },
};

export default apiClient;