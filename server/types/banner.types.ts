export interface BannerInput {
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface BannerResponse {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BannerFilters {
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

