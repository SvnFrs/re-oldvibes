import { Router } from "express";
import {
  createFeedback,
  getFeedbacks,
  getFeedbackById,
  getUserFeedbacks,
  createReport,
  getReports,
  getReportById,
  getUserReports,
} from "../controllers/feedback-report.controllers";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireUser, requireStaff } from "../middleware/role.middleware";
import type { RequestHandler } from "../types/handler.types";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     FeedbackInput:
 *       type: object
 *       required: [feedbackType, feedbackDescription]
 *       properties:
 *         feedbackType:
 *           type: string
 *           enum: [bug, feature, suggestion, other]
 *           example: bug
 *         feedbackDescription:
 *           type: string
 *           maxLength: 1000
 *           example: "I found a bug when uploading images"
 *         feedbackImages:
 *           type: array
 *           items:
 *             type: string
 *           example: ["https://example.com/image1.png"]
 *
 *     ReportInput:
 *       type: object
 *       required: [vibeId, reportType, reportDescription]
 *       properties:
 *         vibeId:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         reportType:
 *           type: string
 *           enum: [spam, inappropriate, abusive, other]
 *           example: spam
 *         reportDescription:
 *           type: string
 *           maxLength: 1000
 *           example: "This vibe contains spam content"
 *         reportImages:
 *           type: array
 *           items:
 *             type: string
 *           example: ["https://example.com/report1.png"]
 *
 *     FeedbackResponse:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         userId: { type: string }
 *         feedbackType: { type: string, enum: [bug, feature, suggestion, other] }
 *         feedbackDescription: { type: string }
 *         feedbackImages: { type: array, items: { type: string } }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *
 *     ReportResponse:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         userId: { type: string }
 *         vibeId: { type: string }
 *         reportType: { type: string, enum: [spam, inappropriate, abusive, other] }
 *         reportDescription: { type: string }
 *         reportImages: { type: array, items: { type: string } }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 */

/**
 * @swagger
 * /feedback/create:
 *   post:
 *     summary: Create a new feedback
 *     tags: [Feedback]
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeedbackInput'
 *     responses:
 *       201:
 *         description: Feedback created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Authentication required
 */
router.post(
  "/feedback/create",
  authenticateToken,
  requireUser as RequestHandler,
  createFeedback as RequestHandler
);

/**
 * @swagger
 * /feedback/user/{id}:
 *   get:
 *     summary: Get feedbacks by user ID (any authenticated user)
 *     tags: [Feedback]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
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
 *         description: List of user feedbacks
 */
router.get(
  "/feedback/user/:id",
  authenticateToken,
  requireUser as RequestHandler,
  getUserFeedbacks as RequestHandler
);

/**
 * @swagger
 * /feedback:
 *   get:
 *     summary: Get all feedbacks (staff/admin only)
 *     tags: [Feedback]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: feedbackType
 *         schema:
 *           type: string
 *           enum: [bug, feature, suggestion, other]
 *         description: Filter by feedback type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of feedbacks to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of feedbacks to skip
 *     responses:
 *       200:
 *         description: List of feedbacks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 feedbacks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FeedbackResponse'
 *                 count:
 *                   type: integer
 *       403:
 *         description: Staff/Admin access required
 */
router.get(
  "/feedback",
  authenticateToken,
  requireStaff as RequestHandler,
  getFeedbacks as RequestHandler
);

/**
 * @swagger
 * /feedback/{id}:
 *   get:
 *     summary: Get feedback detail by ID (staff/admin only)
 *     tags: [Feedback]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feedback ID
 *     responses:
 *       200:
 *         description: Feedback details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 feedback:
 *                   $ref: '#/components/schemas/FeedbackResponse'
 *       404:
 *         description: Feedback not found
 *       403:
 *         description: Staff/Admin access required
 */
router.get(
  "/feedback/:id",
  authenticateToken,
  requireStaff as RequestHandler,
  getFeedbackById as RequestHandler
);

/**
 * @swagger
 * /report/create:
 *   post:
 *     summary: Create a new report
 *     tags: [Report]
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReportInput'
 *     responses:
 *       201:
 *         description: Report created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Authentication required
 */
router.post(
  "/report/create",
  authenticateToken,
  requireUser as RequestHandler,
  createReport as RequestHandler
);

/**
 * @swagger
 * /report/user/{id}:
 *   get:
 *     summary: Get reports by user ID (any authenticated user)
 *     tags: [Report]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
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
 *         description: List of user reports
 */
router.get(
  "/report/user/:id",
  authenticateToken,
  requireUser as RequestHandler,
  getUserReports as RequestHandler
);

/**
 * @swagger
 * /report:
 *   get:
 *     summary: Get all reports (staff/admin only)
 *     tags: [Report]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: vibeId
 *         schema:
 *           type: string
 *         description: Filter by vibe ID
 *       - in: query
 *         name: reportType
 *         schema:
 *           type: string
 *           enum: [spam, inappropriate, abusive, other]
 *         description: Filter by report type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of reports to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of reports to skip
 *     responses:
 *       200:
 *         description: List of reports
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reports:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ReportResponse'
 *                 count:
 *                   type: integer
 *       403:
 *         description: Staff/Admin access required
 */
router.get(
  "/report",
  authenticateToken,
  requireStaff as RequestHandler,
  getReports as RequestHandler
);

/**
 * @swagger
 * /report/{id}:
 *   get:
 *     summary: Get report detail by ID (staff/admin only)
 *     tags: [Report]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 report:
 *                   $ref: '#/components/schemas/ReportResponse'
 *       404:
 *         description: Report not found
 *       403:
 *         description: Staff/Admin access required
 */
router.get(
  "/report/:id",
  authenticateToken,
  requireStaff as RequestHandler,
  getReportById as RequestHandler
);

export default router;
