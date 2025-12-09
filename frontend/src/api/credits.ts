import api from './axios';
import { CreditTransaction, ApiResponse } from '../types';

export const creditApi = {
  adjustCredits: async (data: {
    customerId: string;
    amount: number;
    type: 'REWARD' | 'ADJUSTMENT';
    reason: string;
  }) => {
    const response = await api.post<ApiResponse>('/credits/adjust', data);
    return response.data;
  },

  getMyHistory: async () => {
    const response = await api.get<ApiResponse<CreditTransaction[]>>('/credits/my-history');
    return response.data;
  },

  getCustomerHistory: async (customerId: string) => {
    const response = await api.get<ApiResponse<CreditTransaction[]>>(
      `/credits/customer/${customerId}/history`
    );
    return response.data;
  },

  getTransactions: async (params?: {
    customerId?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    const response = await api.get<ApiResponse<CreditTransaction[]>>(
      `/credits/transactions?${queryParams}`
    );
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get<ApiResponse<any>>('/credits/statistics');
    return response.data;
  },
};
