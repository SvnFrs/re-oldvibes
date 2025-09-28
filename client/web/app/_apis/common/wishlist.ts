// Vibes API functions for web client

export interface VibeResponse {
  id: string;
  userId: string;
  user: {
    username: string;
    name: string;
    profilePicture?: string;
    isVerified: boolean;
  };
  itemName: string;
  description: string;
  price: number;
  tags: string[];
  mediaFiles: {
    type: "image" | "video";
    url: string;
    thumbnail?: string;
  }[];
  status: "pending" | "approved" | "rejected" | "sold" | "archived";
  category: string;
  condition: string;
  location?: string;
  likesCount: number;
  commentsCount: number;
  views: number;
  isLiked?: boolean;
  isWishlist?: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface VibesListResponse {
  data: VibeResponse[];
  pagination: PaginationInfo;
}

// Legacy interface for backward compatibility
export interface LegacyVibesListResponse {
  vibes: VibeResponse[];
  count: number;
}

export interface SearchVibesParams {
  q?: string;
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function getVibeByIdWithWishlist(
  vibeId: string,
  userId: string
): Promise<{ vibe: VibeResponse }> {
  const response = await fetch(
    `${API_BASE}/wishlist/vibe/${vibeId}/${userId}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch vibe");
  }

  return response.json();
}

//Get all vibes with wishlist when user are logged in
export async function getVibesWithWishlist(userId: string): Promise<any> {
  const response = await fetch(
    `${API_BASE}/wishlist/all-vibes-with-wishlist/${userId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch vibes");
  }

  return response.json();
}

//Get all vibes wishlist with userId
export async function getWishlistByUserId(userId: string): Promise<any> {
  const response = await fetch(`${API_BASE}/wishlist/all/${userId}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch vibes");
  }

  return response.json();
}

export async function addVibeToWishlist(
  vibeId: string,
  userId: string
): Promise<any> {
  const response = await fetch(`${API_BASE}/wishlist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      userId: userId,
      vibeId: vibeId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to add vibe to wishlist");
  }

  return response.json();
}

export async function removeVibeFromWishlist(
  vibeId: string,
  userId: string
): Promise<any> {
  const url = `${API_BASE}/wishlist/${vibeId}/${userId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  console.log("Remove wishlist response:", response);
  console.log("URL:", url);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Remove wishlist error:", errorText);
    throw new Error(
      `Failed to remove vibe from wishlist: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}
