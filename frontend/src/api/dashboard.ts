import api from './axios';
import { DashboardStats, ApiResponse } from '../types';

export const dashboardApi = {
  getStats: async () => {
    const response = await api.get<ApiResponse<DashboardStats>>('/dashboard');
    return response.data;
  },
};
