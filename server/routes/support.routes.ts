import { Router } from "express";
import { getPublicSupport } from "../controllers/support.controllers";

const router = Router();

/**
 * @swagger
 * /support:
 *   get:
 *     summary: Public - list published support questions (FAQ)
 *     tags: [Support]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: tags
 *         description: Comma-separated list of tags
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of published support questions
 */
router.get("/", getPublicSupport as any);

export default router;
