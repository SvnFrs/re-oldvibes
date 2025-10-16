import type { Request, Response } from "express";
import { RecommendationService } from "../services/recommendation.services";
import { InteractionService } from "../services/interaction.services";
import type { RecommendationFilters } from "../types/recommendation.types";

const recommendationService = new RecommendationService();
const interactionService = new InteractionService();

/**
 * @swagger
 * /recommendations:
 *   get:
 *     summary: Get personalized vibe recommendations
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: minScore
 *         schema:
 *           type: number
 *         description: Minimum recommendation score (0-1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 20
 *         description: Number of recommendations to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: number
 *           default: 0
 *         description: Pagination offset
 *     responses:
 *       200:
 *         description: Personalized recommendations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 vibes:
 *                   type: array
 *                   items:
 *                     type: object
 *                 metadata:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */
export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Build filters from query params
    const filters: RecommendationFilters = {
      category: req.query.category as string,
      minScore: req.query.minScore ? parseFloat(req.query.minScore as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
    };

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filters.priceRange = {
        min: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        max: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      };
    }

    // Get recommendations
    const result = await recommendationService.getRecommendations(userId, filters);

    res.json(result);
  } catch (error: any) {
    console.error("Error getting recommendations:", error);
    res.status(500).json({ error: error.message || "Failed to get recommendations" });
  }
};

/**
 * @swagger
 * /recommendations/interactions/track:
 *   post:
 *     summary: Track user interaction with a vibe
 *     tags: [Interactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vibeId
 *               - interactionType
 *             properties:
 *               vibeId:
 *                 type: string
 *               interactionType:
 *                 type: string
 *                 enum: [view, like, comment, share, wishlist, chat, offer]
 *               duration:
 *                 type: number
 *                 description: Duration in seconds (for views)
 *               metadata:
 *                 type: object
 *                 description: Additional metadata
 *     responses:
 *       202:
 *         description: Interaction tracked (async)
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
export const trackInteraction = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { vibeId, interactionType, duration, metadata } = req.body;

    if (!vibeId || !interactionType) {
      return res.status(400).json({ error: "vibeId and interactionType are required" });
    }

    const validTypes = ["view", "like", "comment", "share", "wishlist", "chat", "offer"];
    if (!validTypes.includes(interactionType)) {
      return res.status(400).json({ error: "Invalid interaction type" });
    }

    // Track interaction asynchronously
    interactionService.trackInteraction({
      userId,
      vibeId,
      interactionType,
      duration,
      metadata,
    }).catch((err) => console.error("Async tracking error:", err));

    // Also update recommendation service cache
    recommendationService.trackInteraction({
      userId,
      vibeId,
      interactionType,
      duration,
      metadata,
    }).catch((err) => console.error("Async cache invalidation error:", err));

    // Return immediately (fire and forget)
    res.status(202).json({ message: "Interaction tracking initiated" });
  } catch (error: any) {
    console.error("Error tracking interaction:", error);
    res.status(500).json({ error: error.message || "Failed to track interaction" });
  }
};

/**
 * @swagger
 * /recommendations/interactions/history:
 *   get:
 *     summary: Get user's interaction history
 *     tags: [Interactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by interaction type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: number
 *           default: 0
 *     responses:
 *       200:
 *         description: Interaction history
 *       401:
 *         description: Unauthorized
 */
export const getInteractionHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const options = {
      type: req.query.type as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
    };

    const interactions = await interactionService.getUserInteractions(userId, options);

    res.json({ interactions });
  } catch (error: any) {
    console.error("Error getting interaction history:", error);
    res.status(500).json({ error: error.message || "Failed to get history" });
  }
};

/**
 * @swagger
 * /recommendations/trending:
 *   get:
 *     summary: Get trending vibes based on recent interactions
 *     tags: [Recommendations]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *     responses:
 *       200:
 *         description: Trending vibes
 */
export const getTrendingVibes = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const trending = await interactionService.getTrendingVibes(limit);

    res.json({ vibes: trending });
  } catch (error: any) {
    console.error("Error getting trending vibes:", error);
    res.status(500).json({ error: error.message || "Failed to get trending vibes" });
  }
};

/**
 * @swagger
 * /recommendations/vibes/{vibeId}/stats:
 *   get:
 *     summary: Get interaction statistics for a vibe
 *     tags: [Interactions]
 *     parameters:
 *       - in: path
 *         name: vibeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vibe statistics
 *       404:
 *         description: Vibe not found
 */
export const getVibeStats = async (req: Request, res: Response) => {
  try {
    const { vibeId } = req.params;

    if (!vibeId) {
      return res.status(400).json({ error: "vibeId is required" });
    }

    const stats = await interactionService.getVibeStats(vibeId);

    res.json({ stats });
  } catch (error: any) {
    console.error("Error getting vibe stats:", error);
    res.status(500).json({ error: error.message || "Failed to get stats" });
  }
};
