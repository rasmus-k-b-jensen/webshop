import api from './axios';
import { Product, ApiResponse } from '../types';

export const productApi = {
  getAll: async (activeOnly = true) => {
    const response = await api.get<ApiResponse<Product[]>>(`/products?activeOnly=${activeOnly}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },

  create: async (data: Partial<Product>) => {
    const response = await api.post<ApiResponse<Product>>('/products', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Product>) => {
    const response = await api.put<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/products/${id}`);
    return response.data;
  },

  toggleActive: async (id: string) => {
    const response = await api.patch<ApiResponse<Product>>(`/products/${id}/toggle-active`);
    return response.data;
  },
};
