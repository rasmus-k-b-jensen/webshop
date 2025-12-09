import api from './axios';
import { User, ApiResponse } from '../types';

export const userApi = {
  getAllCustomers: async () => {
    const response = await api.get<ApiResponse<User[]>>('/users/customers');
    return response.data;
  },

  getCustomerById: async (id: string) => {
    const response = await api.get<ApiResponse<User>>(`/users/customers/${id}`);
    return response.data;
  },

  getCustomerProfile: async (id: string) => {
    const response = await api.get<ApiResponse<any>>(`/users/customers/${id}/profile`);
    return response.data;
  },
};
