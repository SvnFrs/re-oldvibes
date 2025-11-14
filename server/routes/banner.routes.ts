import { Router } from "express";
import {
  getActiveBanners,
  getBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../controllers/banner.controllers";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireStaff } from "../middleware/role.middleware";
import { uploadBannerImage } from "../middleware/upload.middleware";
import type { RequestHandler } from "../types/handler.types";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     BannerInput:
 *       type: object
 *       required: [title, imageUrl]
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 200
 *           example: "Summer Sale"
 *         description:
 *           type: string
 *           maxLength: 500
 *           example: "Get up to 50% off on all items"
 *         imageUrl:
 *           type: string
 *           example: "https://example.com/banner.jpg"
 *         linkUrl:
 *           type: string
 *           example: "https://example.com/sale"
 *         displayOrder:
 *           type: number
 *           default: 0
 *           example: 1
 *         isActive:
 *           type: boolean
 *           default: true
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *
 *     BannerResponse:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         title: { type: string }
 *         description: { type: string }
 *         imageUrl: { type: string }
 *         linkUrl: { type: string }
 *         displayOrder: { type: number }
 *         isActive: { type: boolean }
 *         startDate: { type: string, format: date-time }
 *         endDate: { type: string, format: date-time }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 */

/**
 * @swagger
 * /banner/public:
 *   get:
 *     summary: Get active banners for homepage (public)
 *     tags: [Banner]
 *     responses:
 *       200:
 *         description: List of active banners
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 banners:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BannerResponse'
 *                 count:
 *                   type: integer
 */
router.get("/public", getActiveBanners as RequestHandler);

/**
 * @swagger
 * /banner:
 *   get:
 *     summary: Get all banners (staff/admin only)
 *     tags: [Banner]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or description
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of banners
 *       403:
 *         description: Staff/Admin access required
 */
router.get(
  "/",
  authenticateToken,
  requireStaff as RequestHandler,
  getBanners as RequestHandler
);

/**
 * @swagger
 * /banner/{id}:
 *   get:
 *     summary: Get banner by ID (staff/admin only)
 *     tags: [Banner]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Banner details
 *       404:
 *         description: Banner not found
 *       403:
 *         description: Staff/Admin access required
 */
router.get(
  "/:id",
  authenticateToken,
  requireStaff as RequestHandler,
  getBannerById as RequestHandler
);

/**
 * @swagger
 * /banner:
 *   post:
 *     summary: Create a new banner (staff/admin only)
 *     tags: [Banner]
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BannerInput'
 *     responses:
 *       201:
 *         description: Banner created successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Staff/Admin access required
 */
router.post(
  "/",
  authenticateToken,
  requireStaff as RequestHandler,
  uploadBannerImage.single("image"),
  createBanner as RequestHandler
);

/**
 * @swagger
 * /banner/{id}:
 *   put:
 *     summary: Update banner by ID (staff/admin only)
 *     tags: [Banner]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BannerInput'
 *     responses:
 *       200:
 *         description: Banner updated successfully
 *       404:
 *         description: Banner not found
 *       403:
 *         description: Staff/Admin access required
 */
router.put(
  "/:id",
  authenticateToken,
  requireStaff as RequestHandler,
  uploadBannerImage.single("image"),
  updateBanner as RequestHandler
);

/**
 * @swagger
 * /banner/{id}:
 *   delete:
 *     summary: Delete banner by ID (staff/admin only)
 *     tags: [Banner]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Banner deleted successfully
 *       404:
 *         description: Banner not found
 *       403:
 *         description: Staff/Admin access required
 */
router.delete(
  "/:id",
  authenticateToken,
  requireStaff as RequestHandler,
  deleteBanner as RequestHandler
);

export default router;

