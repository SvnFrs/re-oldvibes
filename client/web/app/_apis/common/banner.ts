const API_BASE =
  process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:4000/api";

export interface BannerInput {
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
  startDate?: Date | string;
  endDate?: Date | string;
}

export interface BannerItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: Date | string;
  endDate?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BannerListResponse {
  banners: BannerItem[];
  count: number;
}

export interface BannerDetailResponse {
  banner: BannerItem;
}

class BannerAPI {
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

  // Public endpoint - get active banners
  async getActiveBanners(): Promise<BannerListResponse> {
    return this.request<BannerListResponse>("/banner/public");
  }

  // Admin endpoints
  async getBanners(params?: {
    isActive?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<BannerListResponse> {
    const searchParams = new URLSearchParams();

    if (params?.isActive !== undefined) {
      searchParams.set("isActive", params.isActive.toString());
    }

    if (params?.search) {
      searchParams.set("search", params.search);
    }

    if (typeof params?.limit === "number") {
      searchParams.set("limit", params.limit.toString());
    }

    if (typeof params?.offset === "number") {
      searchParams.set("offset", params.offset.toString());
    }

    const queryString =
      searchParams.toString().length > 0 ? `?${searchParams.toString()}` : "";

    return this.request<BannerListResponse>(`/banner${queryString}`);
  }

  async getBannerById(bannerId: string): Promise<BannerDetailResponse> {
    return this.request<BannerDetailResponse>(`/banner/${bannerId}`);
  }

  async createBanner(data: BannerInput): Promise<{ message: string; banner: { id: string; title: string; createdAt: Date } }> {
    return this.request(`/banner`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateBanner(
    bannerId: string,
    data: Partial<BannerInput>
  ): Promise<{ message: string; banner: BannerItem }> {
    return this.request(`/banner/${bannerId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteBanner(bannerId: string): Promise<{ message: string }> {
    return this.request(`/banner/${bannerId}`, {
      method: "DELETE",
    });
  }
}

export const bannerAPI = new BannerAPI();

