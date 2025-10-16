import { Interaction } from "../schema/interaction.schema";
import { Vibe } from "../schema/vibe.schema";
import { User } from "../schema/user.schema";
import { redis } from "../config/redis.config";
import type {
  RecommendationFilters,
  RecommendationResult,
  RecommendationScore,
  UserPreferences,
  TrackInteractionInput,
} from "../types/recommendation.types";
import mongoose from "mongoose";

export class RecommendationService {
  private readonly CACHE_TTL = 900; // 15 minutes
  private readonly WEIGHTS = {
    location: 0.3,
    content: 0.25,
    collaborative: 0.2,
    behavioral: 0.15,
    social: 0.1,
  };

  /**
   * Track user interaction with a vibe
   */
  async trackInteraction(data: TrackInteractionInput): Promise<void> {
    try {
      await Interaction.create({
        userId: new mongoose.Types.ObjectId(data.userId),
        vibeId: new mongoose.Types.ObjectId(data.vibeId),
        interactionType: data.interactionType,
        duration: data.duration,
        metadata: data.metadata,
        timestamp: new Date(),
      });

      // Invalidate user's recommendation cache
      await this.invalidateUserCache(data.userId);
    } catch (error) {
      console.error("Error tracking interaction:", error);
      // Don't throw - tracking failures shouldn't break user experience
    }
  }

  /**
   * Get personalized recommendations for a user
   */
  async getRecommendations(
    userId: string,
    filters: RecommendationFilters = {}
  ): Promise<RecommendationResult> {
    const cacheKey = `recommendations:${userId}:${JSON.stringify(filters)}`;

    // Try cache first
    const cached = await this.getCachedRecommendations(cacheKey);
    if (cached) {
      return cached;
    }

    // Get user data
    const user = await User.findById(userId).lean();
    if (!user) {
      throw new Error("User not found");
    }

    // Get user's interaction history
    const interactions = await this.getUserInteractions(userId);
    
    // Build user preferences from history
    const preferences = await this.buildUserPreferences(userId, interactions);

    // Get candidate vibes (approved, not expired, not user's own)
    const candidates = await this.getCandidateVibes(userId, filters);

    if (candidates.length === 0) {
      return this.buildEmptyResult();
    }

    // Score each vibe
    const scoredVibes = await Promise.all(
      candidates.map(async (vibe) => {
        const score = await this.calculateVibeScore(
          user,
          vibe,
          preferences,
          interactions
        );
        return { vibe, ...score };
      })
    );

    // Sort by total score and apply limit
    const sortedVibes = scoredVibes
      .filter((v) => v.totalScore > (filters.minScore || 0))
      .sort((a, b) => b.totalScore - a.totalScore);

    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    const paginatedVibes = sortedVibes.slice(offset, offset + limit);

    // Format result
    const result = await this.formatRecommendationResult(
      paginatedVibes,
      sortedVibes.length,
      false
    );

    // Cache result
    await this.cacheRecommendations(cacheKey, result);

    return result;
  }

  /**
   * Calculate haversine distance between two points (in km)
   */
  private calculateDistance(
    coords1: [number, number],
    coords2: [number, number]
  ): number {
    const [lon1, lat1] = coords1;
    const [lon2, lat2] = coords2;

    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Calculate location-based score (30% weight)
   * Uses exponential decay: closer items score higher
   */
  private calculateLocationScore(
    user: any,
    vibe: any
  ): { score: number; reason?: string } {
    if (!user.locationEnabled || !user.location || !vibe.locationData) {
      return { score: 0.5 }; // Neutral score if no location data
    }

    const distance = this.calculateDistance(
      user.location.coordinates,
      vibe.locationData.coordinates
    );

    // Exponential decay: e^(-distance/threshold)
    // threshold = 10km means 10km away gets ~0.37 score
    const threshold = 10;
    const score = Math.exp(-distance / threshold);

    let reason: string | undefined;
    if (distance < 5) {
      reason = "Very close to you";
    } else if (distance < 15) {
      reason = "Nearby";
    }

    return { score, reason };
  }

  /**
   * Calculate content-based score (25% weight)
   * Based on tag similarity, category, condition preferences
   */
  private calculateContentScore(
    vibe: any,
    preferences: UserPreferences
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // Tag similarity (Jaccard similarity)
    const userTags = new Set(Array.from(preferences.tags.keys()));
    const vibeTags = new Set(vibe.tags || []);
    const intersection = new Set([...userTags].filter((x) => vibeTags.has(x)));
    const union = new Set([...userTags, ...vibeTags]);

    if (union.size > 0) {
      const jaccardSimilarity = intersection.size / union.size;
      score += jaccardSimilarity * 0.5;

      if (intersection.size > 0) {
        const matchedTags = Array.from(intersection).slice(0, 2).join(", ");
        reasons.push(`Tags: ${matchedTags}`);
      }
    }

    // Category preference
    const categoryWeight = preferences.categories.get(vibe.category) || 0;
    score += Math.min(categoryWeight / 10, 0.3); // Max 0.3 contribution

    if (categoryWeight > 0) {
      reasons.push(`Category: ${vibe.category}`);
    }

    // Condition preference
    const conditionWeight = preferences.conditions.get(vibe.condition) || 0;
    score += Math.min(conditionWeight / 10, 0.2); // Max 0.2 contribution

    // Normalize to 0-1
    score = Math.min(score, 1);

    return { score, reasons };
  }

  /**
   * Calculate collaborative filtering score (20% weight)
   * Based on similar users' interactions
   */
  private async calculateCollaborativeScore(
    userId: string,
    vibeId: string
  ): Promise<{ score: number; reason?: string }> {
    try {
      // Find users who interacted with this vibe
      const vibeInteractors = await Interaction.distinct("userId", {
        vibeId: new mongoose.Types.ObjectId(vibeId),
        interactionType: { $in: ["like", "wishlist", "offer"] },
      });

      if (vibeInteractors.length === 0) {
        return { score: 0.3 }; // Neutral for new items
      }

      // Find overlap in interactions (simple collaborative filtering)
      const currentUserInteractions = await Interaction.find({
        userId: new mongoose.Types.ObjectId(userId),
        interactionType: { $in: ["like", "wishlist", "offer"] },
      }).distinct("vibeId");

      // Count how many of these users also liked items the current user liked
      const similarUsers = await Interaction.countDocuments({
        userId: { $in: vibeInteractors },
        vibeId: { $in: currentUserInteractions },
        interactionType: { $in: ["like", "wishlist"] },
      });

      const similarityScore = Math.min(similarUsers / 5, 1); // Normalize

      let reason: string | undefined;
      if (similarityScore > 0.5) {
        reason = "Popular with users like you";
      }

      return { score: similarityScore, reason };
    } catch (error) {
      console.error("Collaborative score error:", error);
      return { score: 0.5 };
    }
  }

  /**
   * Calculate behavioral score (15% weight)
   * Based on engagement metrics and recency
   */
  private calculateBehavioralScore(vibe: any): {
    score: number;
    reason?: string;
  } {
    // Engagement score (pre-calculated)
    const engagementScore = Math.min((vibe.engagementScore || 0) / 100, 0.6);

    // Recency score (time decay)
    const ageInHours =
      (Date.now() - new Date(vibe.createdAt).getTime()) / (1000 * 60 * 60);
    const recencyScore = Math.exp(-ageInHours / 12) * 0.4; // Decay over 12 hours

    const totalScore = engagementScore + recencyScore;

    let reason: string | undefined;
    if (vibe.engagementScore > 50) {
      reason = "Trending";
    } else if (ageInHours < 2) {
      reason = "Just posted";
    }

    return { score: totalScore, reason };
  }

  /**
   * Calculate social score (10% weight)
   * Based on followers' activities
   */
  private async calculateSocialScore(
    userId: string,
    vibeId: string
  ): Promise<{ score: number; reason?: string }> {
    try {
      const user = await User.findById(userId).select("following").lean();
      if (!user || user.following.length === 0) {
        return { score: 0.5 };
      }

      // Check if any followed users interacted with this vibe
      const followingInteractions = await Interaction.countDocuments({
        userId: { $in: user.following },
        vibeId: new mongoose.Types.ObjectId(vibeId),
        interactionType: { $in: ["like", "wishlist", "comment"] },
      });

      const score = Math.min(followingInteractions / 3, 1);

      let reason: string | undefined;
      if (score > 0) {
        reason = "Liked by people you follow";
      }

      return { score, reason };
    } catch (error) {
      console.error("Social score error:", error);
      return { score: 0.5 };
    }
  }

  /**
   * Combine all scores with weights
   */
  private async calculateVibeScore(
    user: any,
    vibe: any,
    preferences: UserPreferences,
    interactions: any[]
  ): Promise<RecommendationScore> {
    const reasons: string[] = [];

    // Location score (30%)
    const locationResult = this.calculateLocationScore(user, vibe);
    const locationScore = locationResult.score * this.WEIGHTS.location;
    if (locationResult.reason) reasons.push(locationResult.reason);

    // Content score (25%)
    const contentResult = this.calculateContentScore(vibe, preferences);
    const contentScore = contentResult.score * this.WEIGHTS.content;
    reasons.push(...contentResult.reasons);

    // Collaborative score (20%)
    const collaborativeResult = await this.calculateCollaborativeScore(
      user._id.toString(),
      vibe._id.toString()
    );
    const collaborativeScore =
      collaborativeResult.score * this.WEIGHTS.collaborative;
    if (collaborativeResult.reason) reasons.push(collaborativeResult.reason);

    // Behavioral score (15%)
    const behavioralResult = this.calculateBehavioralScore(vibe);
    const behavioralScore = behavioralResult.score * this.WEIGHTS.behavioral;
    if (behavioralResult.reason) reasons.push(behavioralResult.reason);

    // Social score (10%)
    const socialResult = await this.calculateSocialScore(
      user._id.toString(),
      vibe._id.toString()
    );
    const socialScore = socialResult.score * this.WEIGHTS.social;
    if (socialResult.reason) reasons.push(socialResult.reason);

    const totalScore =
      locationScore +
      contentScore +
      collaborativeScore +
      behavioralScore +
      socialScore;

    return {
      vibeId: vibe._id.toString(),
      totalScore,
      breakdown: {
        locationScore,
        contentScore,
        collaborativeScore,
        behavioralScore,
        socialScore,
      },
      reasons: reasons.slice(0, 3), // Top 3 reasons
    };
  }

  /**
   * Get candidate vibes for recommendation
   */
  private async getCandidateVibes(
    userId: string,
    filters: RecommendationFilters
  ): Promise<any[]> {
    const query: any = {
      status: "approved",
      expiresAt: { $gt: new Date() },
      userId: { $ne: new mongoose.Types.ObjectId(userId) },
    };

    if (filters.excludeVibeIds && filters.excludeVibeIds.length > 0) {
      query._id = { $nin: filters.excludeVibeIds.map((id) => new mongoose.Types.ObjectId(id)) };
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.priceRange) {
      query.price = {};
      if (filters.priceRange.min !== undefined) {
        query.price.$gte = filters.priceRange.min;
      }
      if (filters.priceRange.max !== undefined) {
        query.price.$lte = filters.priceRange.max;
      }
    }

    // Limit candidate pool for performance (top 200 by engagement)
    const vibes = await Vibe.find(query)
      .sort({ engagementScore: -1 })
      .limit(200)
      .lean();

    return vibes;
  }

  /**
   * Build user preferences from interaction history
   */
  private async buildUserPreferences(
    userId: string,
    interactions: any[]
  ): Promise<UserPreferences> {
    const preferences: UserPreferences = {
      tags: new Map(),
      categories: new Map(),
      conditions: new Map(),
      avgPrice: 0,
      priceRange: { min: 0, max: 0 },
    };

    if (interactions.length === 0) {
      return preferences;
    }

    // Weight interactions differently
    const weights: Record<string, number> = {
      view: 1,
      like: 5,
      comment: 3,
      share: 4,
      wishlist: 6,
      chat: 4,
      offer: 7,
    };

    let totalPrice = 0;
    let priceCount = 0;

    for (const interaction of interactions) {
      const weight = weights[interaction.interactionType as string] || 1;

      // Update tags
      if (interaction.metadata?.tags) {
        for (const tag of interaction.metadata.tags) {
          preferences.tags.set(
            tag,
            (preferences.tags.get(tag) || 0) + weight
          );
        }
      }

      // Update categories
      if (interaction.metadata?.category) {
        preferences.categories.set(
          interaction.metadata.category,
          (preferences.categories.get(interaction.metadata.category) || 0) +
            weight
        );
      }

      // Note: conditions would need to be fetched from vibe data
    }

    return preferences;
  }

  /**
   * Get user's recent interactions
   */
  private async getUserInteractions(userId: string): Promise<any[]> {
    return await Interaction.find({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();
  }

  /**
   * Format recommendation result
   */
  private async formatRecommendationResult(
    scoredVibes: any[],
    totalCount: number,
    cacheHit: boolean
  ): Promise<RecommendationResult> {
    const vibes = scoredVibes.map((sv) => ({
      _id: sv.vibe._id.toString(),
      itemName: sv.vibe.itemName,
      description: sv.vibe.description,
      price: sv.vibe.price,
      location: sv.vibe.location,
      category: sv.vibe.category,
      tags: sv.vibe.tags,
      mediaFiles: sv.vibe.mediaFiles,
      userId: sv.vibe.userId,
      likes: sv.vibe.likes?.length || 0,
      views: sv.vibe.views,
      commentsCount: sv.vibe.commentsCount,
      score: Math.round(sv.totalScore * 100) / 100,
      reasons: sv.reasons,
    }));

    return {
      vibes,
      metadata: {
        totalResults: totalCount,
        hasMore: totalCount > vibes.length,
        cacheHit,
        computedAt: new Date(),
      },
    };
  }

  /**
   * Cache management
   */
  private async getCachedRecommendations(
    key: string
  ): Promise<RecommendationResult | null> {
    try {
      const cached = await redis.get(key);
      if (cached) {
        const result = JSON.parse(cached);
        result.metadata.cacheHit = true;
        return result;
      }
    } catch (error) {
      console.error("Cache read error:", error);
    }
    return null;
  }

  private async cacheRecommendations(
    key: string,
    result: RecommendationResult
  ): Promise<void> {
    try {
      await redis.setex(key, this.CACHE_TTL, JSON.stringify(result));
    } catch (error) {
      console.error("Cache write error:", error);
    }
  }

  private async invalidateUserCache(userId: string): Promise<void> {
    try {
      const pattern = `recommendations:${userId}:*`;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error("Cache invalidation error:", error);
    }
  }

  private buildEmptyResult(): RecommendationResult {
    return {
      vibes: [],
      metadata: {
        totalResults: 0,
        hasMore: false,
        cacheHit: false,
        computedAt: new Date(),
      },
    };
  }
}
