import api from './axios';

export interface Address {
  id: string;
  userId: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressData {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export const addressApi = {
  getAll: async () => {
    const response = await api.get<{ success: boolean; data: Address[] }>('/addresses');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Address }>(`/addresses/${id}`);
    return response.data;
  },

  create: async (data: CreateAddressData) => {
    const response = await api.post<{ success: boolean; data: Address }>('/addresses', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateAddressData>) => {
    const response = await api.put<{ success: boolean; data: Address }>(`/addresses/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/addresses/${id}`);
    return response.data;
  },

  setDefault: async (id: string) => {
    const response = await api.post<{ success: boolean; data: Address }>(`/addresses/${id}/set-default`);
    return response.data;
  },
};
