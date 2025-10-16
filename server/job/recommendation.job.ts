import cron from "node-cron";
import { Vibe } from "../schema/vibe.schema";
import { Interaction } from "../schema/interaction.schema";
import { User } from "../schema/user.schema";

/**
 * Update engagement scores for all active vibes
 * Runs every 15 minutes
 */
export const setupEngagementJob = () => {
  // Run every 15 minutes
  cron.schedule("*/15 * * * *", async () => {
    try {
      console.log("🔄 Running engagement score update job...");

      const batchSize = 100;
      let processed = 0;

      // Get all active vibes
      const activeVibes = await Vibe.find({
        status: "approved",
        expiresAt: { $gt: new Date() },
      }).select("_id engagementScore");

      console.log(`📊 Processing ${activeVibes.length} active vibes...`);

      // Process in batches
      for (let i = 0; i < activeVibes.length; i += batchSize) {
        const batch = activeVibes.slice(i, i + batchSize);
        const vibeIds = batch.map((v) => v._id);

        // Calculate engagement score from interactions
        const scores = await Interaction.aggregate([
          { $match: { vibeId: { $in: vibeIds } } },
          {
            $addFields: {
              weight: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$interactionType", "view"] }, then: 1 },
                    { case: { $eq: ["$interactionType", "like"] }, then: 5 },
                    {
                      case: { $eq: ["$interactionType", "comment"] },
                      then: 8,
                    },
                    {
                      case: { $eq: ["$interactionType", "share"] },
                      then: 10,
                    },
                    {
                      case: { $eq: ["$interactionType", "wishlist"] },
                      then: 12,
                    },
                    { case: { $eq: ["$interactionType", "chat"] }, then: 7 },
                    { case: { $eq: ["$interactionType", "offer"] }, then: 15 },
                  ],
                  default: 1,
                },
              },
            },
          },
          {
            $group: {
              _id: "$vibeId",
              totalScore: { $sum: "$weight" },
            },
          },
        ]);

        // Update vibes with new scores
        const bulkOps = scores.map((score) => ({
          updateOne: {
            filter: { _id: score._id },
            update: { $set: { engagementScore: score.totalScore } },
          },
        }));

        if (bulkOps.length > 0) {
          await Vibe.bulkWrite(bulkOps);
          processed += bulkOps.length;
        }
      }

      console.log(
        `✅ Engagement score update complete. Updated ${processed} vibes.`
      );
    } catch (error) {
      console.error("❌ Error updating engagement scores:", error);
    }
  });

  console.log("📅 Engagement score job scheduled (every 15 minutes)");
};

/**
 * Update user preference profiles based on interaction history
 * Runs every hour
 */
export const setupPreferenceUpdateJob = () => {
  // Run every hour
  cron.schedule("0 * * * *", async () => {
    try {
      console.log("🔄 Running user preference update job...");

      const batchSize = 50;
      let processed = 0;

      // Get users who have recent interactions
      const activeUsers = await Interaction.distinct("userId", {
        timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
      });

      console.log(`👥 Processing ${activeUsers.length} active users...`);

      // Process in batches
      for (let i = 0; i < activeUsers.length; i += batchSize) {
        const batch = activeUsers.slice(i, i + batchSize);

        for (const userId of batch) {
          // Aggregate user preferences from interactions
          const preferenceData = await Interaction.aggregate([
            { $match: { userId } },
            {
              $addFields: {
                weight: {
                  $switch: {
                    branches: [
                      { case: { $eq: ["$interactionType", "view"] }, then: 1 },
                      {
                        case: { $eq: ["$interactionType", "like"] },
                        then: 5,
                      },
                      {
                        case: { $eq: ["$interactionType", "comment"] },
                        then: 3,
                      },
                      {
                        case: { $eq: ["$interactionType", "share"] },
                        then: 4,
                      },
                      {
                        case: { $eq: ["$interactionType", "wishlist"] },
                        then: 6,
                      },
                      {
                        case: { $eq: ["$interactionType", "chat"] },
                        then: 4,
                      },
                      {
                        case: { $eq: ["$interactionType", "offer"] },
                        then: 7,
                      },
                    ],
                    default: 1,
                  },
                },
              },
            },
            { $unwind: "$metadata.tags" },
            {
              $group: {
                _id: {
                  tag: "$metadata.tags",
                  category: "$metadata.category",
                },
                score: { $sum: "$weight" },
              },
            },
            { $sort: { score: -1 } },
            { $limit: 50 }, // Top 50 preferences
          ]);

          // Build preferences object
          const tags: string[] = [];
          const categories: string[] = [];
          const tagMap = new Map<string, number>();
          const categoryMap = new Map<string, number>();

          for (const pref of preferenceData) {
            if (pref._id.tag) {
              if (!tagMap.has(pref._id.tag)) {
                tags.push(pref._id.tag);
                tagMap.set(pref._id.tag, pref.score);
              }
            }
            if (pref._id.category) {
              if (!categoryMap.has(pref._id.category)) {
                categories.push(pref._id.category);
                categoryMap.set(pref._id.category, pref.score);
              }
            }
          }

          // Update user preferences
          await User.findByIdAndUpdate(
            userId,
            {
              $set: {
                "preferences.tags": tags.slice(0, 20), // Top 20 tags
                "preferences.categories": categories.slice(0, 10), // Top 10 categories
              },
            },
            { upsert: false }
          );

          processed++;
        }
      }

      console.log(
        `✅ Preference update complete. Updated ${processed} user profiles.`
      );
    } catch (error) {
      console.error("❌ Error updating user preferences:", error);
    }
  });

  console.log("📅 Preference update job scheduled (every hour)");
};

/**
 * Initialize all recommendation-related cron jobs
 */
export const setupRecommendationJobs = () => {
  setupEngagementJob();
  setupPreferenceUpdateJob();
};
