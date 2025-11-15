import { Router } from "express";
import {
  addStaff,
  editStaff,
  deleteStaff,
  listStaff,
  banUser,
  unbanUser,
  listAllUsers,
  // Temp ban management
  removeTempBan,
  resetBadBehavior,
  getTempBannedUsers,
  getUserBadBehaviorHistory,
  // Admin vibe/comment management
  getCommentsByVibe,
  getVibesWithFilters,
  getAllVibesAdmin,
  getVibeDetailAdmin,
  banUserForBadComment,
  // Dashboard stats
  getDashboardStats,
} from "../controllers/admin.controllers";
// Appeal management
import {
  getAllAppeals,
  updateAppealStatus,
  deleteAppeal,
  getAppealStats,
} from "../controllers/appeal.controllers";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireAdmin, requireStaff } from "../middleware/role.middleware";
import type { RequestHandler } from "../types/handler.types";
// Support management
import {
  getAdminSupport,
  createSupport,
  updateSupport,
  deleteSupport,
  getSupportById,
} from "../controllers/support.controllers";

const router = Router();

/**
 * @swagger
 * /admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200:
 *         description: Dashboard statistics including users, vibes, reports, and recent activity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: object
 *                       properties:
 *                         count: { type: integer }
 *                         growthPercent: { type: integer }
 *                         label: { type: string }
 *                     activeVibes:
 *                       type: object
 *                       properties:
 *                         count: { type: integer }
 *                         growthPercent: { type: integer }
 *                         label: { type: string }
 *                     pendingReports:
 *                       type: object
 *                       properties:
 *                         count: { type: integer }
 *                         diff: { type: integer }
 *                         label: { type: string }
 *                     pendingVibes:
 *                       type: object
 *                       properties:
 *                         count: { type: integer }
 *                         label: { type: string }
 *                 recentActivity:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get("/dashboard/stats", authenticateToken, requireStaff, getDashboardStats);

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

// ===== TEMP BAN MANAGEMENT ROUTES =====

/**
 * @swagger
 * /admin/users/{userId}/remove-temp-ban:
 *   patch:
 *     summary: Remove temporary ban from user
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Temp ban removed }
 *       404: { description: User not found }
 */
router.patch(
  "/users/:userId/remove-temp-ban",
  authenticateToken,
  requireStaff as RequestHandler,
  removeTempBan as RequestHandler,
);

/**
 * @swagger
 * /admin/users/{userId}/reset-bad-behavior:
 *   patch:
 *     summary: Reset bad behavior count for user (admin only)
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Bad behavior reset }
 *       404: { description: User not found }
 */
router.patch(
  "/users/:userId/reset-bad-behavior",
  authenticateToken,
  requireAdmin as RequestHandler,
  resetBadBehavior as RequestHandler,
);

/**
 * @swagger
 * /admin/temp-banned-users:
 *   get:
 *     summary: Get list of temporarily banned users
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: List of temp banned users }
 */
router.get(
  "/temp-banned-users",
  authenticateToken,
  requireStaff as RequestHandler,
  getTempBannedUsers as RequestHandler,
);

/**
 * @swagger
 * /admin/users/{userId}/bad-behavior-history:
 *   get:
 *     summary: Get user's bad behavior history
 *     tags: [Admin]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Bad behavior history }
 *       404: { description: User not found }
 */
router.get(
  "/users/:userId/bad-behavior-history",
  authenticateToken,
  requireStaff as RequestHandler,
  getUserBadBehaviorHistory as RequestHandler,
);

// ===== ADMIN VIBE/COMMENT MANAGEMENT ROUTES =====

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

// ===== APPEAL MANAGEMENT ROUTES =====

/**
 * @swagger
 * /admin/appeals:
 *   get:
 *     summary: Get all appeals
 *     tags: [Admin, Appeals]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, reviewed, resolved, rejected] }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [ban_appeal, general_inquiry, bug_report, other] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: List of appeals }
 */
router.get("/appeals", authenticateToken, requireStaff, getAllAppeals as any);

/**
 * @swagger
 * /admin/appeals/stats:
 *   get:
 *     summary: Get appeal statistics
 *     tags: [Admin, Appeals]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Appeal statistics }
 */
router.get("/appeals/stats", authenticateToken, requireStaff, getAppealStats as any);

/**
 * @swagger
 * /admin/appeals/{id}/status:
 *   patch:
 *     summary: Update appeal status
 *     tags: [Admin, Appeals]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [pending, reviewed, resolved, rejected] }
 *               adminResponse: { type: string }
 *     responses:
 *       200: { description: Appeal status updated }
 */
router.patch("/appeals/:id/status", authenticateToken, requireStaff, updateAppealStatus as any);

/**
 * @swagger
 * /admin/appeals/{id}:
 *   delete:
 *     summary: Delete an appeal
 *     tags: [Admin, Appeals]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Appeal deleted successfully }
 */
router.delete("/appeals/:id", authenticateToken, requireAdmin, deleteAppeal as any);

// ===== SUPPORT MANAGEMENT ROUTES =====

/**
 * @swagger
 * /admin/support:
 *   get:
 *     summary: Get support questions (admin)
 *     tags: [Admin, Support]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: tags
 *         schema: { type: string, description: Comma-separated tags }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: isPublished
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: List of support questions }
 */
router.get("/support", authenticateToken, requireStaff, getAdminSupport as any);

/**
 * @swagger
 * /admin/support:
 *   post:
 *     summary: Create a support question
 *     tags: [Admin, Support]
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question, answer]
 *             properties:
 *               question: { type: string }
 *               answer: { type: string }
 *               tags: { type: array, items: { type: string } }
 *               category: { type: string }
 *               isPublished: { type: boolean }
 *     responses:
 *       201: { description: Created }
 */
router.post("/support", authenticateToken, requireStaff, createSupport as any);

/**
 * @swagger
 * /admin/support/{id}:
 *   get:
 *     summary: Get a support question
 *     tags: [Admin, Support]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 */
router.get("/support/:id", authenticateToken, requireStaff, getSupportById as any);

/**
 * @swagger
 * /admin/support/{id}:
 *   patch:
 *     summary: Update a support question
 *     tags: [Admin, Support]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question: { type: string }
 *               answer: { type: string }
 *               tags: { type: array, items: { type: string } }
 *               category: { type: string }
 *               isPublished: { type: boolean }
 *     responses:
 *       200: { description: Updated }
 */
router.patch("/support/:id", authenticateToken, requireStaff, updateSupport as any);

/**
 * @swagger
 * /admin/support/{id}:
 *   delete:
 *     summary: Delete a support question
 *     tags: [Admin, Support]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 */
router.delete("/support/:id", authenticateToken, requireAdmin, deleteSupport as any);

export default router;
