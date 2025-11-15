const API_BASE =
  process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:4000/api";

export interface FeedbackInput {
  feedbackType: "bug" | "feature" | "suggestion" | "other";
  feedbackDescription: string;
  feedbackImages?: string[];
}

export interface FeedbackResponse {
  message: string;
  feedback: {
    id: string;
    feedbackType: string;
    createdAt: Date;
  };
}

export interface FeedbackItem {
  id: string;
  userId: string;
  feedbackType: FeedbackInput["feedbackType"];
  feedbackDescription: string;
  feedbackImages: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackListResponse {
  feedbacks: FeedbackItem[];
  count: number;
}

export interface FeedbackDetailResponse {
  feedback: FeedbackItem;
}

class FeedbackAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;

    // If body is FormData, don't set Content-Type (browser will set it with boundary)
    const isFormData = options.body instanceof FormData;
    const headers: HeadersInit = isFormData
      ? { ...options.headers }
      : {
          "Content-Type": "application/json",
          ...options.headers,
        };

    const config: RequestInit = {
      credentials: "include",
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "An error occurred");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error. Please check your connection.");
    }
  }

  async createFeedback(
    data: FeedbackInput,
    imageFiles?: File[]
  ): Promise<FeedbackResponse> {
    const formData = new FormData();
    formData.append("feedbackType", data.feedbackType);
    formData.append("feedbackDescription", data.feedbackDescription);

    // Append image files if provided
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });
    }

    return this.request<FeedbackResponse>("/feedback/create", {
      method: "POST",
      body: formData,
    });
  }

  async getMyFeedbacks(params?: {
    limit?: number;
    offset?: number;
  }): Promise<FeedbackListResponse> {
    const searchParams = new URLSearchParams();

    if (typeof params?.limit === "number") {
      searchParams.set("limit", params.limit.toString());
    }

    if (typeof params?.offset === "number") {
      searchParams.set("offset", params.offset.toString());
    }

    const queryString =
      searchParams.toString().length > 0 ? `?${searchParams.toString()}` : "";

    return this.request<FeedbackListResponse>(`/feedback/me${queryString}`);
  }

  async getFeedbacks(params?: {
    userId?: string;
    feedbackType?: FeedbackInput["feedbackType"];
    limit?: number;
    offset?: number;
  }): Promise<FeedbackListResponse> {
    const searchParams = new URLSearchParams();

    const hasUserId = !!params?.userId;

    if (params?.feedbackType) {
      searchParams.set("feedbackType", params.feedbackType);
    }

    if (typeof params?.limit === "number") {
      searchParams.set("limit", params.limit.toString());
    }

    if (typeof params?.offset === "number") {
      searchParams.set("offset", params.offset.toString());
    }

    const queryString =
      searchParams.toString().length > 0 ? `?${searchParams.toString()}` : "";

    // If requesting by userId, use user-scoped endpoint (no staff required)
    if (hasUserId && params?.userId) {
      console.log(`/feedback/user/${params.userId}${queryString}`);
      return this.request<FeedbackListResponse>(
        `/feedback/user/${params.userId}${queryString}`
      );
    }

    // Otherwise, use staff/admin endpoint
    return this.request<FeedbackListResponse>(`/feedback${queryString}`);
  }

  async getFeedbackById(feedbackId: string): Promise<FeedbackDetailResponse> {
    return this.request<FeedbackDetailResponse>(`/feedback/${feedbackId}`);
  }
}

export const feedbackAPI = new FeedbackAPI();

// Report API
export interface ReportInput {
  vibeId: string;
  reportType: "spam" | "inappropriate" | "abusive" | "other";
  reportDescription: string;
  reportImages?: string[];
}

export interface ReportResponse {
  message: string;
  report: {
    id: string;
    vibeId: string;
    reportType: string;
    createdAt: Date;
  };
}

class ReportAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;

    // If body is FormData, don't set Content-Type (browser will set it with boundary)
    const isFormData = options.body instanceof FormData;
    const headers: HeadersInit = isFormData
      ? { ...options.headers }
      : {
          "Content-Type": "application/json",
          ...options.headers,
        };

    const config: RequestInit = {
      credentials: "include",
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "An error occurred");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error. Please check your connection.");
    }
  }

  async createReport(
    data: ReportInput,
    imageFiles?: File[]
  ): Promise<ReportResponse> {
    const formData = new FormData();
    formData.append("vibeId", data.vibeId);
    formData.append("reportType", data.reportType);
    formData.append("reportDescription", data.reportDescription);

    // Append image files if provided
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });
    }

    return this.request<ReportResponse>("/report/create", {
      method: "POST",
      body: formData,
    });
  }

  async getMyReports(params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ reports: ReportItem[]; count: number }> {
    const searchParams = new URLSearchParams();

    if (typeof params?.limit === "number") {
      searchParams.set("limit", params.limit.toString());
    }

    if (typeof params?.offset === "number") {
      searchParams.set("offset", params.offset.toString());
    }

    const queryString =
      searchParams.toString().length > 0 ? `?${searchParams.toString()}` : "";

    return this.request<{ reports: ReportItem[]; count: number }>(
      `/report/me${queryString}`
    );
  }

  async getReports(params?: {
    userId?: string;
    vibeId?: string;
    reportType?: ReportInput["reportType"];
    limit?: number;
    offset?: number;
  }): Promise<{ reports: ReportItem[]; count: number }> {
    const searchParams = new URLSearchParams();

    const hasUserId = !!params?.userId;

    if (params?.vibeId) {
      searchParams.set("vibeId", params.vibeId);
    }

    if (params?.reportType) {
      searchParams.set("reportType", params.reportType);
    }

    if (typeof params?.limit === "number") {
      searchParams.set("limit", params.limit.toString());
    }

    if (typeof params?.offset === "number") {
      searchParams.set("offset", params.offset.toString());
    }

    const queryString =
      searchParams.toString().length > 0 ? `?${searchParams.toString()}` : "";

    // If requesting by userId, use user-scoped endpoint (no staff required)
    if (hasUserId && params?.userId) {
      return this.request<{ reports: ReportItem[]; count: number }>(
        `/report/user/${params.userId}${queryString}`
      );
    }

    // Otherwise, use staff/admin endpoint
    return this.request<{ reports: ReportItem[]; count: number }>(
      `/report${queryString}`
    );
  }

  async getReportById(reportId: string): Promise<{ report: ReportItem }> {
    return this.request<{ report: ReportItem }>(`/report/${reportId}`);
  }
}

export interface ReportItem {
  id: string;
  userId: string;
  vibeId: string;
  reportType: ReportInput["reportType"];
  reportDescription: string;
  reportImages: string[];
  createdAt: string;
  updatedAt: string;
}

export const reportAPI = new ReportAPI();
