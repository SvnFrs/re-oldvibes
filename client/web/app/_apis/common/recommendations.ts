// API Base URL
const API_BASE = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:4000/api";

// Types
export interface RecommendationFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minScore?: number;
  limit?: number;
  offset?: number;
}

export interface RecommendedVibe {
  _id: string;
  itemName: string;
  description: string;
  price: number;
  location: string;
  category: string;
  tags: string[];
  mediaFiles: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  }[];
  userId: string;
  likes: number;
  views: number;
  commentsCount: number;
  score: number;
  reasons: string[];
}

export interface RecommendationsResponse {
  vibes: RecommendedVibe[];
  metadata: {
    totalResults: number;
    hasMore: boolean;
    cacheHit: boolean;
    computedAt: string;
  };
}

export interface TrackInteractionInput {
  vibeId: string;
  interactionType: 'view' | 'like' | 'comment' | 'share' | 'wishlist' | 'chat' | 'offer';
  duration?: number;
  metadata?: Record<string, any>;
}

export interface Interaction {
  _id: string;
  userId: string;
  vibeId: {
    _id: string;
    itemName: string;
    price: number;
    mediaFiles: { type: string; url: string }[];
    category: string;
  };
  interactionType: string;
  duration?: number;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface TrendingVibe extends RecommendedVibe {
  trendingScore: number;
  trendingUsers: number;
}

export interface VibeStats {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  wishlists: number;
  offers: number;
  uniqueUsers: number;
}

/**
 * Get personalized vibe recommendations
 */
export async function getRecommendations(
  token: string,
  filters: RecommendationFilters = {}
): Promise<RecommendationsResponse> {
  const params = new URLSearchParams();
  
  if (filters.category) params.append('category', filters.category);
  if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
  if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
  if (filters.minScore !== undefined) params.append('minScore', filters.minScore.toString());
  if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
  if (filters.offset !== undefined) params.append('offset', filters.offset.toString());

  const response = await fetch(`${API_BASE}/recommendations?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch recommendations');
  }

  return await response.json();
}

/**
 * Track user interaction with a vibe (fire-and-forget)
 */
export async function trackInteraction(
  token: string,
  data: TrackInteractionInput
): Promise<void> {
  const response = await fetch(`${API_BASE}/recommendations/interactions/track`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    console.error('Failed to track interaction');
    // Don't throw - this is fire-and-forget
  }
}

/**
 * Get user's interaction history
 */
export async function getInteractionHistory(
  token: string,
  options: { type?: string; limit?: number; offset?: number } = {}
): Promise<{ interactions: Interaction[] }> {
  const params = new URLSearchParams();
  
  if (options.type) params.append('type', options.type);
  if (options.limit !== undefined) params.append('limit', options.limit.toString());
  if (options.offset !== undefined) params.append('offset', options.offset.toString());

  const response = await fetch(`${API_BASE}/recommendations/interactions/history?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch interaction history');
  }

  return await response.json();
}

/**
 * Get trending vibes (public endpoint)
 */
export async function getTrendingVibes(
  limit: number = 10
): Promise<{ vibes: TrendingVibe[] }> {
  const response = await fetch(`${API_BASE}/recommendations/trending?limit=${limit}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch trending vibes');
  }

  return await response.json();
}

/**
 * Get vibe interaction statistics (public endpoint)
 */
export async function getVibeStats(
  vibeId: string
): Promise<{ stats: VibeStats }> {
  const response = await fetch(`${API_BASE}/recommendations/vibes/${vibeId}/stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch vibe stats');
  }

  return await response.json();
}
