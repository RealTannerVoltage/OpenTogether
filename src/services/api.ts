import { Server, User } from '../types';
import { API_BASE_URL } from '../config/auth';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const apiClient = {
  async get<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Request failed',
        };
      }

      return {
        success: true,
        data: result.data || result,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error',
      };
    }
  },

  async post<T>(endpoint: string, body: any, token?: string): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Request failed',
        };
      }

      return {
        success: true,
        data: result.data || result,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error',
      };
    }
  },
};

// Server endpoints
export const ServerApi = {
  async getAll(token?: string): Promise<ApiResponse<Server[]>> {
    return apiClient.get<Server[]>('/servers', token);
  },

  async getById(id: string, token?: string): Promise<ApiResponse<Server>> {
    return apiClient.get<Server>(`/servers/${id}`, token);
  },

  async create(server: Omit<Server, 'id' | 'createdAt'>, token: string): Promise<ApiResponse<Server>> {
    return apiClient.post<Server>('/servers', server, token);
  },

  async join(serverId: string, user: User, token: string): Promise<ApiResponse<Server>> {
    return apiClient.post<Server>(`/servers/${serverId}/join`, { user }, token);
  },
};

// User endpoints
export const UserApi = {
  async linkSwitchAccount(switchFriendCode: string, token: string): Promise<ApiResponse<User>> {
    return apiClient.post<User>('/users/link-switch', { switchFriendCode }, token);
  },

  async getProfile(token: string): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/users/me', token);
  },
};

export default apiClient;
