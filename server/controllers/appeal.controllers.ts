import { Request, Response } from "express";
import { Appeal } from "../models/appeal.models";
import { User } from "../models/user.models";
import { AuthenticatedRequest } from "../types/handler.types";

/**
 * @swagger
 * /appeals:
 *   post:
 *     summary: Submit a new appeal or contact request
 *     tags: [Appeals]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - subject
 *               - message
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [ban_appeal, general_inquiry, bug_report, other]
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *               relatedBanId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appeal submitted successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
export const createAppeal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { type, subject, message, relatedBanId } = req.body;

    // Validate input
    if (!type || !subject || !message) {
      return res.status(400).json({ message: "Type, subject, and message are required" });
    }

    if (subject.length < 5 || subject.length > 200) {
      return res.status(400).json({ message: "Subject must be between 5 and 200 characters" });
    }

    if (message.length < 20 || message.length > 2000) {
      return res.status(400).json({ message: "Message must be between 20 and 2000 characters" });
    }

    const appeal = await Appeal.create({
      userId,
      type,
      subject,
      message,
      relatedBanId,
      status: "pending",
    });

    const populatedAppeal = await Appeal.findById(appeal._id)
      .populate("userId", "username name email profilePicture")
      .lean();

    res.status(201).json({
      message: "Appeal submitted successfully",
      appeal: populatedAppeal,
    });
  } catch (error) {
    console.error("Error creating appeal:", error);
    res.status(500).json({ message: "Failed to submit appeal" });
  }
};

/**
 * @swagger
 * /appeals/my-appeals:
 *   get:
 *     summary: Get current user's appeals
 *     tags: [Appeals]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, reviewed, resolved, rejected]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [ban_appeal, general_inquiry, bug_report, other]
 *     responses:
 *       200:
 *         description: List of user's appeals
 *       401:
 *         description: Unauthorized
 */
export const getMyAppeals = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { status, type } = req.query;
    const filter: any = { userId };

    if (status) {
      filter.status = status;
    }

    if (type) {
      filter.type = type;
    }

    const appeals = await Appeal.find(filter)
      .populate("reviewedBy", "username name")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ appeals, count: appeals.length });
  } catch (error) {
    console.error("Error fetching user appeals:", error);
    res.status(500).json({ message: "Failed to fetch appeals" });
  }
};

/**
 * @swagger
 * /appeals/{id}:
 *   get:
 *     summary: Get a specific appeal by ID
 *     tags: [Appeals]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appeal details
 *       404:
 *         description: Appeal not found
 *       401:
 *         description: Unauthorized
 */
export const getAppealById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const appeal = await Appeal.findById(id)
      .populate("userId", "username name email profilePicture isTempBanned badBehaviorCount")
      .populate("reviewedBy", "username name")
      .lean();

    if (!appeal) {
      return res.status(404).json({ message: "Appeal not found" });
    }

    // Only the owner or admin can view the appeal
    if (appeal.userId._id.toString() !== userId && req.user?.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({ appeal });
  } catch (error) {
    console.error("Error fetching appeal:", error);
    res.status(500).json({ message: "Failed to fetch appeal" });
  }
};

/**
 * @swagger
 * /admin/appeals:
 *   get:
 *     summary: Get all appeals (Admin only)
 *     tags: [Admin, Appeals]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, reviewed, resolved, rejected]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [ban_appeal, general_inquiry, bug_report, other]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of all appeals
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
export const getAllAppeals = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (type) {
      filter.type = type;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [appeals, totalCount] = await Promise.all([
      Appeal.find(filter)
        .populate("userId", "username name email profilePicture isTempBanned badBehaviorCount tempBanReason")
        .populate("reviewedBy", "username name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Appeal.countDocuments(filter),
    ]);

    res.status(200).json({
      appeals,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching all appeals:", error);
    res.status(500).json({ message: "Failed to fetch appeals" });
  }
};

/**
 * @swagger
 * /admin/appeals/{id}/status:
 *   patch:
 *     summary: Update appeal status (Admin only)
 *     tags: [Admin, Appeals]
 *     security:
 *       - cookieAuth: []
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
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, reviewed, resolved, rejected]
 *               adminResponse:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appeal status updated
 *       404:
 *         description: Appeal not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
export const updateAppealStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = req.user?.userId;
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const appeal = await Appeal.findById(id);

    if (!appeal) {
      return res.status(404).json({ message: "Appeal not found" });
    }

    appeal.status = status;
    if (adminResponse) {
      appeal.adminResponse = adminResponse;
    }
    appeal.reviewedBy = adminId as any;
    appeal.reviewedAt = new Date();

    await appeal.save();

    const updatedAppeal = await Appeal.findById(appeal._id)
      .populate("userId", "username name email profilePicture")
      .populate("reviewedBy", "username name")
      .lean();

    res.status(200).json({
      message: "Appeal status updated successfully",
      appeal: updatedAppeal,
    });
  } catch (error) {
    console.error("Error updating appeal status:", error);
    res.status(500).json({ message: "Failed to update appeal status" });
  }
};

/**
 * @swagger
 * /admin/appeals/{id}:
 *   delete:
 *     summary: Delete an appeal (Admin only)
 *     tags: [Admin, Appeals]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appeal deleted successfully
 *       404:
 *         description: Appeal not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
export const deleteAppeal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const appeal = await Appeal.findByIdAndDelete(id);

    if (!appeal) {
      return res.status(404).json({ message: "Appeal not found" });
    }

    res.status(200).json({ message: "Appeal deleted successfully" });
  } catch (error) {
    console.error("Error deleting appeal:", error);
    res.status(500).json({ message: "Failed to delete appeal" });
  }
};

/**
 * @swagger
 * /admin/appeals/stats:
 *   get:
 *     summary: Get appeal statistics (Admin only)
 *     tags: [Admin, Appeals]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Appeal statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
export const getAppealStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [
      totalAppeals,
      pendingAppeals,
      reviewedAppeals,
      resolvedAppeals,
      rejectedAppeals,
      banAppeals,
    ] = await Promise.all([
      Appeal.countDocuments(),
      Appeal.countDocuments({ status: "pending" }),
      Appeal.countDocuments({ status: "reviewed" }),
      Appeal.countDocuments({ status: "resolved" }),
      Appeal.countDocuments({ status: "rejected" }),
      Appeal.countDocuments({ type: "ban_appeal" }),
    ]);

    res.status(200).json({
      stats: {
        total: totalAppeals,
        pending: pendingAppeals,
        reviewed: reviewedAppeals,
        resolved: resolvedAppeals,
        rejected: rejectedAppeals,
        banAppeals,
      },
    });
  } catch (error) {
    console.error("Error fetching appeal stats:", error);
    res.status(500).json({ message: "Failed to fetch appeal statistics" });
  }
};
