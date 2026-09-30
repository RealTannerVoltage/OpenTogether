import { Server, User } from '../types';
import { minecraftAuth } from './minecraftAuth';
import { API_BASE_URL } from '../config/auth';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const getMinecraftToken = async (): Promise<string | null> => {
  const token = minecraftAuth.getMinecraftToken();
  if (!token) {
    const refreshed = await minecraftAuth.refreshTokens();
    if (refreshed) {
      return minecraftAuth.getMinecraftToken();
    }
  }
  return token;
};

const apiClient = {
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const token = await getMinecraftToken();
      
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

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const token = await getMinecraftToken();
      
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
  async getAll(): Promise<ApiResponse<Server[]>> {
    return apiClient.get<Server[]>('/servers');
  },

  async getById(id: string): Promise<ApiResponse<Server>> {
    return apiClient.get<Server>(`/servers/${id}`);
  },

  async create(server: Omit<Server, 'id' | 'createdAt'>): Promise<ApiResponse<Server>> {
    return apiClient.post<Server>('/servers', server);
  },

  async join(serverId: string, user: User): Promise<ApiResponse<Server>> {
    return apiClient.post<Server>(`/servers/${serverId}/join`, { user });
  },
};

// User endpoints
export const UserApi = {
  async linkSwitchAccount(switchFriendCode: string): Promise<ApiResponse<User>> {
    return apiClient.post<User>('/users/link-switch', { switchFriendCode });
  },

  async getProfile(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/users/me');
  },
};

export default apiClient;
