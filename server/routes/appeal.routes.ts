import { Router } from "express";
import {
  createAppeal,
  getMyAppeals,
  getAppealById,
} from "../controllers/appeal.controllers";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// User routes - require authentication
router.post("/", authenticateToken, createAppeal as any);
router.get("/my-appeals", authenticateToken, getMyAppeals as any);
router.get("/:id", authenticateToken, getAppealById as any);

export default router;
