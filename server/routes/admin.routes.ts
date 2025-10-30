import { Router } from "express";
import {
  addStaff,
  editStaff,
  deleteStaff,
  listStaff,
  banUser,
  unbanUser,
  listAllUsers,
  getCommentsByVibe,
  getVibesWithFilters,
  getAllVibesAdmin,
  getVibeDetailAdmin,
  banUserForBadComment,
} from "../controllers/admin.controllers";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireAdmin, requireStaff } from "../middleware/role.middleware";
import type { RequestHandler } from "../types/handler.types";

const router = Router();

/**
 * @swagger
 * /admin/staff:
 *   post:
 *     summary: Add new staff
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name, username]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               name: { type: string }
 *               username: { type: string }
 *     responses:
 *       201: { description: Staff created }
 *       409: { description: Email or username exists }
 */
router.post("/staff", authenticateToken, requireAdmin, addStaff);

/**
 * @swagger
 * /admin/staff/{staffId}:
 *   put:
 *     summary: Edit staff
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               name: { type: string }
 *               username: { type: string }
 *               bio: { type: string }
 *               profilePicture: { type: string }
 *     responses:
 *       200: { description: Staff updated }
 *       404: { description: Staff not found }
 */
router.put("/staff/:staffId", authenticateToken, requireAdmin, editStaff);

/**
 * @swagger
 * /admin/staff/{staffId}:
 *   delete:
 *     summary: Delete staff
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Staff deleted }
 *       404: { description: Staff not found }
 */
router.delete("/staff/:staffId", authenticateToken, requireAdmin, deleteStaff);

/**
 * @swagger
 * /admin/staff:
 *   get:
 *     summary: List all staff
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: List of staff }
 */
router.get("/staff", authenticateToken, requireAdmin, listStaff);

/**
 * @swagger
 * /admin/users/{targetUserId}/ban:
 *   patch:
 *     summary: Ban a user
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: targetUserId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User banned
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.patch(
  "/users/:targetUserId/ban",
  authenticateToken,
  requireStaff as RequestHandler,
  banUser as RequestHandler,
);

/**
 * @swagger
 * /admin/users/{targetUserId}/unban:
 *   patch:
 *     summary: Unban a user
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: targetUserId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User unbanned
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.patch(
  "/users/:targetUserId/unban",
  authenticateToken,
  requireStaff as RequestHandler,
  unbanUser as RequestHandler,
);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List all users (admin only)
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200: { description: List of users }
 */
router.get("/users", authenticateToken, requireStaff, listAllUsers);

// ===== NEW ADMIN FEATURES ROUTES =====

/**
 * @swagger
 * /admin/vibes/{vibeId}/comments:
 *   get:
 *     summary: Get comments by vibe (admin)
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: vibeId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [newest, oldest, likes], default: newest }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: Comments retrieved successfully }
 *       404: { description: Vibe not found }
 */
router.get("/vibes/:vibeId/comments", authenticateToken, requireStaff, getCommentsByVibe);

/**
 * @swagger
 * /admin/vibes/filter:
 *   get:
 *     summary: Filter vibes by name, category, price (admin)
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: condition
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, default: all }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200: { description: Filtered vibes retrieved successfully }
 */
router.get("/vibes/filter", authenticateToken, requireStaff, getVibesWithFilters);

/**
 * @swagger
 * /admin/vibes:
 *   get:
 *     summary: Get all vibes (admin)
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, default: all }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [newest, oldest, price_asc, price_desc, likes, views], default: newest }
 *     responses:
 *       200: { description: All vibes retrieved successfully }
 */
router.get("/vibes", authenticateToken, requireStaff, getAllVibesAdmin);

/**
 * @swagger
 * /admin/vibes/{vibeId}:
 *   get:
 *     summary: Get vibe detail (admin)
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: vibeId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Vibe detail retrieved successfully }
 *       404: { description: Vibe not found }
 */
router.get("/vibes/:vibeId", authenticateToken, requireStaff, getVibeDetailAdmin);

/**
 * @swagger
 * /admin/users/ban-for-comment:
 *   post:
 *     summary: Ban user for bad comment (AI detection)
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, commentId]
 *             properties:
 *               userId: { type: string }
 *               commentId: { type: string }
 *               reason: { type: string }
 *     responses:
 *       200: { description: User banned successfully }
 *       400: { description: Invalid request or comment does not violate guidelines }
 *       404: { description: User or comment not found }
 */
router.post("/users/ban-for-comment", authenticateToken, requireStaff, banUserForBadComment);

export default router;
