import { apiClient } from "../_libs/api";

export interface Appeal {
  _id: string;
  userId: {
    _id: string;
    username: string;
    name: string;
    email?: string;
    profilePicture?: string;
    isTempBanned?: boolean;
    badBehaviorCount?: number;
    tempBanReason?: string;
  };
  type: "ban_appeal" | "general_inquiry" | "bug_report" | "other";
  subject: string;
  message: string;
  status: "pending" | "reviewed" | "resolved" | "rejected";
  adminResponse?: string;
  reviewedBy?: {
    _id: string;
    username: string;
    name: string;
  };
  reviewedAt?: string;
  relatedBanId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppealData {
  type: "ban_appeal" | "general_inquiry" | "bug_report" | "other";
  subject: string;
  message: string;
  relatedBanId?: string;
}

export interface UpdateAppealStatusData {
  status: "pending" | "reviewed" | "resolved" | "rejected";
  adminResponse?: string;
}

export interface AppealStats {
  total: number;
  pending: number;
  reviewed: number;
  resolved: number;
  rejected: number;
  banAppeals: number;
}

// User APIs
export const createAppeal = async (data: CreateAppealData): Promise<Appeal> => {
  const response = await apiClient.post("/appeals", data);
  return (response.data as any).appeal;
};

export const getMyAppeals = async (params?: {
  status?: string;
  type?: string;
}): Promise<{ appeals: Appeal[]; count: number }> => {
  const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : "";
  const response = await apiClient.get(`/appeals/my-appeals${queryString}`);
  return response.data as any;
};

export const getAppealById = async (id: string): Promise<Appeal> => {
  const response = await apiClient.get(`/appeals/${id}`);
  return (response.data as any).appeal;
};

// Admin APIs
export const getAllAppeals = async (params?: {
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}): Promise<{
  appeals: Appeal[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : "";
  const response = await apiClient.get(`/admin/appeals${queryString}`);
  return response.data as any;
};

export const updateAppealStatus = async (
  id: string,
  data: UpdateAppealStatusData
): Promise<Appeal> => {
  const response = await apiClient.patch(`/admin/appeals/${id}/status`, data);
  return (response.data as any).appeal;
};

export const deleteAppeal = async (id: string): Promise<void> => {
  await apiClient.delete(`/admin/appeals/${id}`);
};

export const getAppealStats = async (): Promise<AppealStats> => {
  const response = await apiClient.get("/admin/appeals/stats");
  return (response.data as any).stats;
};
