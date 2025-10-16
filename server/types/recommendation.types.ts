import type { ObjectId } from "mongoose";

export interface LocationData {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface UserPreferences {
  tags: Map<string, number>; // tag -> frequency/weight
  categories: Map<string, number>; // category -> frequency/weight
  conditions: Map<string, number>; // condition -> frequency/weight
  avgPrice: number;
  priceRange: { min: number; max: number };
}

export interface InteractionScore {
  view: number;
  like: number;
  comment: number;
  share: number;
  wishlist: number;
  chat: number;
  offer: number;
}

export interface RecommendationScore {
  vibeId: string;
  totalScore: number;
  breakdown: {
    locationScore: number;
    contentScore: number;
    collaborativeScore: number;
    behavioralScore: number;
    socialScore: number;
  };
  reasons: string[];
}

export interface RecommendationFilters {
  excludeVibeIds?: string[]; // Already seen/interacted
  minScore?: number;
  category?: string;
  maxDistance?: number; // in kilometers
  priceRange?: { min?: number; max?: number };
  limit?: number;
  offset?: number;
}

export interface RecommendationResult {
  vibes: Array<{
    _id: string;
    itemName: string;
    description: string;
    price: number;
    location?: string;
    category: string;
    tags: string[];
    mediaFiles: Array<{ type: string; url: string; thumbnail?: string }>;
    userId: {
      _id: string;
      username: string;
      name: string;
      profilePicture?: string;
    };
    likes: number;
    views: number;
    commentsCount: number;
    score: number;
    reasons: string[];
  }>;
  metadata: {
    totalResults: number;
    hasMore: boolean;
    cacheHit: boolean;
    computedAt: Date;
  };
}

export interface TrackInteractionInput {
  userId: string;
  vibeId: string;
  interactionType: "view" | "like" | "comment" | "share" | "wishlist" | "chat" | "offer";
  duration?: number;
  metadata?: {
    tags?: string[];
    category?: string;
    location?: string;
  };
}
