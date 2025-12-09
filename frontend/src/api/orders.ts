import api from './axios';
import { Order, ApiResponse } from '../types';

export const orderApi = {
  create: async (data: { productId: string; quantity?: number }) => {
    const response = await api.post<ApiResponse<Order>>('/orders', data);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get<ApiResponse<Order[]>>('/orders/my-orders');
    return response.data;
  },

  getAll: async (status?: string, limit = 50, offset = 0) => {
    let url = `/orders?limit=${limit}&offset=${offset}`;
    if (status) {
      url += `&status=${status}`;
    }
    const response = await api.get<ApiResponse<Order[]>>(url);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data;
  },
};
