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

    const config: RequestInit = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
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

  async createFeedback(data: FeedbackInput): Promise<FeedbackResponse> {
    return this.request<FeedbackResponse>("/feedback/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
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

    const config: RequestInit = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
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

  async createReport(data: ReportInput): Promise<ReportResponse> {
    return this.request<ReportResponse>("/report/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const reportAPI = new ReportAPI();
