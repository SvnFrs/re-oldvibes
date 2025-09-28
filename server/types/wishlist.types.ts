import type { IWishlist } from "../schema/wishlist.schema";

export interface CreateWishlistInput {
  userId: string;
  vibeId: string;
}

export interface UpdateWishlistInput {
  userId: string;
  vibeId: string;
}

export interface WishlistFilters {
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  tags?: string[];
  status?: "pending" | "approved" | "rejected" | "sold" | "archived";
  userId?: string;
  page?: number;
  limit?: number;
}

export interface WishlistResponse {
  id: string;
  userId: string;
  vibeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface UserWishlistGroup {
  userId: string;
  wishlist_vibes: {
    id: string;
    vibeId: any;
    createdAt: Date;
    updatedAt: Date;
  }[];
}
