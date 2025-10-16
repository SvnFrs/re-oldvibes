import { Interaction } from "../schema/interaction.schema";
import { Vibe } from "../schema/vibe.schema";
import type { TrackInteractionInput } from "../types/recommendation.types";
import mongoose from "mongoose";

export class InteractionService {
  /**
   * Track user interaction asynchronously
   * Used for analytics and recommendations
   */
  async trackInteraction(data: TrackInteractionInput): Promise<void> {
    try {
      // Validate IDs
      if (!mongoose.Types.ObjectId.isValid(data.userId)) {
        throw new Error("Invalid userId");
      }
      if (!mongoose.Types.ObjectId.isValid(data.vibeId)) {
        throw new Error("Invalid vibeId");
      }

      // Fetch vibe metadata for enrichment
      const vibe = await Vibe.findById(data.vibeId)
        .select("tags category condition price")
        .lean();

      if (!vibe) {
        console.warn(`Vibe ${data.vibeId} not found for interaction tracking`);
        return;
      }

      // Enrich metadata with vibe information
      const enrichedMetadata = {
        ...data.metadata,
        tags: vibe.tags || [],
        category: vibe.category,
        condition: vibe.condition,
        price: vibe.price,
      };

      // Create interaction record
      await Interaction.create({
        userId: new mongoose.Types.ObjectId(data.userId),
        vibeId: new mongoose.Types.ObjectId(data.vibeId),
        interactionType: data.interactionType,
        duration: data.duration,
        metadata: enrichedMetadata,
        timestamp: new Date(),
      });

      // Update vibe engagement score asynchronously (fire and forget)
      this.updateVibeEngagement(data.vibeId, data.interactionType).catch(
        (err) => console.error("Error updating engagement:", err)
      );
    } catch (error) {
      console.error("Error tracking interaction:", error);
      // Don't throw - tracking failures shouldn't break user experience
    }
  }

  /**
   * Batch track multiple interactions (for initial data or bulk operations)
   */
  async batchTrackInteractions(
    interactions: TrackInteractionInput[]
  ): Promise<void> {
    try {
      const promises = interactions.map((interaction) =>
        this.trackInteraction(interaction)
      );
      await Promise.allSettled(promises);
    } catch (error) {
      console.error("Error batch tracking interactions:", error);
    }
  }

  /**
   * Get user's interaction history with pagination
   */
  async getUserInteractions(
    userId: string,
    options: {
      type?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<any[]> {
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };

    if (options.type) {
      query.interactionType = options.type;
    }

    const limit = options.limit || 50;
    const offset = options.offset || 0;

    return await Interaction.find(query)
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .populate("vibeId", "itemName price mediaFiles category")
      .lean();
  }

  /**
   * Get vibe's interaction statistics
   */
  async getVibeStats(vibeId: string): Promise<{
    views: number;
    likes: number;
    comments: number;
    shares: number;
    wishlists: number;
    offers: number;
    uniqueUsers: number;
  }> {
    const stats = await Interaction.aggregate([
      { $match: { vibeId: new mongoose.Types.ObjectId(vibeId) } },
      {
        $group: {
          _id: "$interactionType",
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: "$userId" },
        },
      },
    ]);

    const result = {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      wishlists: 0,
      offers: 0,
      uniqueUsers: 0,
    };

    const allUsers = new Set();

    for (const stat of stats) {
      const type = stat._id as string;
      if (type in result) {
        result[type as keyof typeof result] = stat.count;
      }
      stat.uniqueUsers.forEach((userId: string) => allUsers.add(userId));
    }

    result.uniqueUsers = allUsers.size;

    return result;
  }

  /**
   * Update vibe engagement score based on weighted interactions
   * Called asynchronously after each interaction
   */
  private async updateVibeEngagement(
    vibeId: string,
    interactionType: string
  ): Promise<void> {
    try {
      // Interaction weights for engagement calculation
      const weights = {
        view: 1,
        like: 5,
        comment: 8,
        share: 10,
        wishlist: 12,
        chat: 7,
        offer: 15,
      };

      const weight = weights[interactionType as keyof typeof weights] || 1;

      // Increment engagement score
      await Vibe.findByIdAndUpdate(
        vibeId,
        { $inc: { engagementScore: weight } },
        { upsert: false }
      );
    } catch (error) {
      console.error("Error updating vibe engagement:", error);
    }
  }

  /**
   * Clean up old interactions (called by cron job)
   * TTL index handles this automatically, but useful for manual cleanup
   */
  async cleanupOldInteractions(daysOld: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Interaction.deleteMany({
        timestamp: { $lt: cutoffDate },
      });

      return result.deletedCount || 0;
    } catch (error) {
      console.error("Error cleaning up interactions:", error);
      return 0;
    }
  }

  /**
   * Get trending vibes based on recent interactions
   */
  async getTrendingVibes(limit: number = 10): Promise<any[]> {
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const trending = await Interaction.aggregate([
      {
        $match: {
          timestamp: { $gte: oneDayAgo },
          interactionType: { $in: ["like", "share", "wishlist", "offer"] },
        },
      },
      {
        $group: {
          _id: "$vibeId",
          score: { $sum: 1 },
          uniqueUsers: { $addToSet: "$userId" },
        },
      },
      { $sort: { score: -1 } },
      { $limit: limit },
    ]);

    const vibeIds = trending.map((t) => t._id);
    const vibes = await Vibe.find({ _id: { $in: vibeIds } })
      .select("itemName price mediaFiles category location engagementScore")
      .lean();

    // Merge trending data with vibe data
    return vibes.map((vibe) => {
      const trendingData = trending.find((t) =>
        t._id.equals(vibe._id)
      );
      return {
        ...vibe,
        trendingScore: trendingData?.score || 0,
        trendingUsers: trendingData?.uniqueUsers?.length || 0,
      };
    });
  }
}
