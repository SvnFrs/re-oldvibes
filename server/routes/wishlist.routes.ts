import { Router } from "express";
import {
  createWishlist,
  deleteWishlist,
  getAllVibesWithWishlist,
  getAllWishlists,
  getVibeByIdWishlist,
} from "../controllers/wishlist.controllers";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireStaff, requireUser } from "../middleware/role.middleware";
import { requireEmailVerification } from "../middleware/emailVerification.middleware";
import type { RequestHandler } from "../types/handler.types";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateWishlistInput:
 *       type: object
 *       required: [userId, vibeId]
 *       properties:
 *         userId: { type: string, example: "60d5ecb74b24a9001f8e4b23" }
 *         vibeId: { type: string, example: "60d5ecb74b24a9001f8e4b24" }
 *
 *     WishlistResponse:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         userId: { type: string }
 *         vibeId: { type: string }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *
 *     VibeResponse:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         userId: { type: string }
 *         user:
 *           type: object
 *           properties:
 *             username: { type: string }
 *             name: { type: string }
 *             profilePicture: { type: string }
 *             isVerified: { type: boolean }
 *         itemName: { type: string }
 *         description: { type: string }
 *         price: { type: number }
 *         tags:
 *           type: array
 *           items: { type: string }
 *         mediaFiles:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type: { type: string, enum: [image, video] }
 *               url: { type: string }
 *               thumbnail: { type: string }
 *         status: { type: string, enum: [pending, approved, rejected, sold, archived] }
 *         category: { type: string }
 *         condition: { type: string }
 *         location: { type: string }
 *         likesCount: { type: number }
 *         commentsCount: { type: number }
 *         views: { type: number }
 *         isLiked: { type: boolean }
 *         isWishlist: { type: boolean }
 *         expiresAt: { type: string, format: date-time }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *
 *   parameters:
 *     wishlistId:
 *       in: path
 *       name: wishlistId
 *       required: true
 *       schema: { type: string }
 *       description: Wishlist ID
 */

/**
 * @swagger
 * /wishlist/all/{userId}:
 *   get:
 *     summary: Get all wishlists for a specific user
 *     description: Retrieve all wishlists grouped by user for the specified user ID
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to get wishlists for
 *         example: "68d8ec245e00ad737327d54a"
 *     responses:
 *       200:
 *         description: Successfully retrieved wishlists for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                     example: "68d8ec245e00ad737327d54a"
 *                   wishlist_vibes:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "68d9027a6b86bc12fd4e6cdb"
 *                         vibeId:
 *                           type: object
 *                           description: Full vibe object with details
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-09-28T09:40:10.254Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-09-28T09:40:10.254Z"
 *       400:
 *         description: Invalid user ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid user ID format"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to retrieve wishlists"
 */
router.get("/all/:userId", getAllWishlists);

/**
 * @swagger
 * /wishlist/all-vibes-with-wishlist/{userId}:
 *   get:
 *     summary: Get all vibes with wishlist status for a specific user
 *     description: Retrieve all vibes from the database with wishlist status information filtered by user ID
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to filter vibes
 *         example: "68d8ec245e00ad737327d54a"
 *     responses:
 *       200:
 *         description: Successfully retrieved vibes with wishlist status for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VibeResponse'
 *       400:
 *         description: Invalid user ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid user ID format"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to retrieve vibes"
 */
router.get("/all-vibes-with-wishlist/:userId", getAllVibesWithWishlist);

/**
 * @swagger
 * /wishlist/vibe/{vibeId}/{userId}:
 *   get:
 *     summary: Get vibe by ID with wishlist status for a specific user
 *     description: Retrieve a specific vibe with wishlist status information for the given user
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: vibeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The vibe ID to retrieve
 *         example: "68d9027a6b86bc12fd4e6cdb"
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to check wishlist status
 *         example: "68d8ec245e00ad737327d54a"
 *     responses:
 *       200:
 *         description: Successfully retrieved vibe with wishlist status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VibeResponse'
 *       400:
 *         description: Invalid vibe ID or user ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid ID format"
 *       404:
 *         description: Vibe not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Vibe not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to retrieve vibe"
 */
router.get("/vibe/:vibeId/:userId", getVibeByIdWishlist);

/**
 * @swagger
 * /wishlist:
 *   post:
 *     summary: Create new wishlist item
 *     tags: [Wishlist]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateWishlistInput' }
 *     responses:
 *       201: { description: Wishlist item created }
 *       400: { description: Invalid input }
 */
router.post(
  "/",
  // authenticateToken,
  // requireUser as RequestHandler,
  // requireEmailVerification,
  createWishlist as RequestHandler
);

/**
 * @swagger
 * /wishlist/{wishlistId}:
 *   delete:
 *     summary: Delete wishlist item
 *     tags: [Wishlist]
 *     security: [{ cookieAuth: [] }]
 *     parameters: [{ $ref: '#/components/parameters/wishlistId' }]
 *     responses:
 *       200: { description: Wishlist item deleted }
 *       404: { description: Wishlist item not found }
 */
router.delete(
  "/:vibeId/:userId",
  // authenticateToken,
  // requireUser as RequestHandler,
  deleteWishlist as RequestHandler
);

export default router;
