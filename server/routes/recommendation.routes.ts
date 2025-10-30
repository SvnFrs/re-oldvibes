import { Router } from "express";
import {
  getRecommendations,
  trackInteraction,
  getInteractionHistory,
  getTrendingVibes,
  getVibeStats,
} from "../controllers/recommendation.controllers";
import { authenticateToken } from "../middleware/auth.middleware";
import type { RequestHandler } from "../types/handler.types";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Recommendations
 *     description: Personalized vibe recommendation system
 *   - name: Interactions
 *     description: User interaction tracking and analytics
 */

/**
 * @route   GET /api/recommendations
 * @desc    Get personalized vibe recommendations
 * @access  Private
 */
router.get("/", authenticateToken as any, getRecommendations as RequestHandler);

/**
 * @route   GET /api/recommendations/trending
 * @desc    Get trending vibes
 * @access  Public
 */
router.get("/trending", getTrendingVibes as RequestHandler);

/**
 * @route   POST /api/recommendations/track
 * @desc    Track user interaction with a vibe
 * @access  Private
 */
router.post("/track", authenticateToken as any, trackInteraction as RequestHandler);

/**
 * @route   GET /api/recommendations/history
 * @desc    Get user's interaction history
 * @access  Private
 */
router.get("/history", authenticateToken as any, getInteractionHistory as RequestHandler);

/**
 * @route   GET /api/recommendations/stats/:vibeId
 * @desc    Get vibe interaction statistics
 * @access  Public
 */
router.get("/stats/:vibeId", getVibeStats as RequestHandler);

export default router;
