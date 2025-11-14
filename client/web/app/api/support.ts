import { apiClient } from "../_libs/api";

export interface SupportQuestion {
  _id: string;
  question: string;
  answer: string;
  tags: string[];
  category?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SupportListResponse = {
  items: SupportQuestion[];
  total: number;
  page: number;
  limit: number;
};

export const getPublicSupport = async (params?: {
  q?: string;
  tags?: string; // comma-separated
  category?: string;
  page?: number;
  limit?: number;
}): Promise<SupportListResponse> => {
  const res = await apiClient.get<SupportListResponse>("/support", params as any);
  return res as any;
};

export const getAdminSupport = async (params?: {
  q?: string;
  tags?: string; // comma-separated
  category?: string;
  isPublished?: boolean;
  page?: number;
  limit?: number;
}): Promise<SupportListResponse> => {
  const res = await apiClient.get<SupportListResponse>("/admin/support", params as any);
  return res as any;
};

export const createSupport = async (data: {
  question: string;
  answer: string;
  tags?: string[];
  category?: string;
  isPublished?: boolean;
}): Promise<SupportQuestion> => {
  const res = await apiClient.post<{ item: SupportQuestion }>("/admin/support", data);
  return (res as any).item;
};

export const updateSupport = async (
  id: string,
  data: Partial<{ question: string; answer: string; tags: string[]; category: string; isPublished: boolean }>
): Promise<SupportQuestion> => {
  const res = await apiClient.patch<{ item: SupportQuestion }>(`/admin/support/${id}`, data);
  return (res as any).item;
};

export const deleteSupport = async (id: string): Promise<void> => {
  await apiClient.delete(`/admin/support/${id}`);
};
