import api from './axios';
import { AuthResponse, ApiResponse } from '../types';

export const authApi = {
  register: async (data: { email: string; name: string; password: string; role?: string }) => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data;
  },

  me: async () => {
    const response = await api.get<ApiResponse<any>>('/auth/me');
    return response.data;
  },
};
