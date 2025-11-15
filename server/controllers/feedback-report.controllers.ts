import type { Request, Response } from "express";
import { FeedbackReportModel } from "../models/feedback-report.model";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import type {
  FeedbackInput,
  ReportInput,
} from "../types/feedback-report.types";

const feedbackReportModel = new FeedbackReportModel();

// ========== FEEDBACK CONTROLLERS ==========

/**
 * Get authenticated user's own feedbacks
 * GET /feedback/me
 */
export const getMyFeedbacks = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { limit: limitParam, offset: offsetParam } = req.query;

    const filters: {
      userId: string;
      limit?: number;
      offset?: number;
    } = { userId };

    if (limitParam) {
      const limit = parseInt(limitParam as string, 10);
      if (!isNaN(limit) && limit > 0) {
        filters.limit = limit;
      }
    }

    if (offsetParam) {
      const offset = parseInt(offsetParam as string, 10);
      if (!isNaN(offset) && offset >= 0) {
        filters.offset = offset;
      }
    }

    const feedbacks = await feedbackReportModel.getFeedbacks(filters);

    res.json({
      feedbacks,
      count: feedbacks.length,
    });
  } catch (error) {
    console.error("Get my feedbacks error:", error);
    res.status(500).json({ message: "Error fetching your feedbacks", error });
  }
};

/**
 * Get feedbacks by user ID (user-level access)
 * GET /feedback/user/:id
 */
export const getUserFeedbacks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const { limit: limitParam, offset: offsetParam } = req.query;

    const filters: {
      userId: string;
      limit?: number;
      offset?: number;
    } = { userId: id };

    if (limitParam) {
      const limit = parseInt(limitParam as string, 10);
      if (!isNaN(limit) && limit > 0) {
        filters.limit = limit;
      }
    }

    if (offsetParam) {
      const offset = parseInt(offsetParam as string, 10);
      if (!isNaN(offset) && offset >= 0) {
        filters.offset = offset;
      }
    }

    const feedbacks = await feedbackReportModel.getFeedbacks(filters);

    res.json({
      feedbacks,
      count: feedbacks.length,
    });
  } catch (error) {
    console.error("Get user feedbacks error:", error);
    res.status(500).json({ message: "Error fetching user feedbacks", error });
  }
};

/**
 * Create a new feedback
 * POST /feedback/create
 */
export const createFeedback = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const files = req.files as Express.MulterS3.File[] | undefined;
    
    // Extract image URLs from uploaded files (AWS S3)
    // If files are uploaded, use their S3 URLs; otherwise use URLs from body (backward compatibility)
    const feedbackImages: string[] = files && files.length > 0
      ? files.map((file) => file.location)
      : req.body.feedbackImages
      ? Array.isArray(req.body.feedbackImages)
        ? req.body.feedbackImages
        : [req.body.feedbackImages]
      : [];

    const feedbackData: FeedbackInput = {
      feedbackType: req.body.feedbackType,
      feedbackDescription: req.body.feedbackDescription || '',
      feedbackImages: feedbackImages,
    };

    // Validate required fields
    if (!feedbackData.feedbackType || !feedbackData.feedbackDescription) {
      res.status(400).json({
        message: "Missing required fields",
        required: ["feedbackType", "feedbackDescription"],
      });
      return;
    }

    // Validate feedbackType enum
    const validTypes = ["bug", "feature", "suggestion", "other"];
    if (!validTypes.includes(feedbackData.feedbackType)) {
      res.status(400).json({
        message: "Invalid feedbackType",
        validTypes,
      });
      return;
    }

    // Validate description length
    if (
      feedbackData.feedbackDescription.trim().length === 0 ||
      feedbackData.feedbackDescription.length > 1000
    ) {
      res.status(400).json({
        message: "Feedback description must be between 1 and 1000 characters",
      });
      return;
    }

    const newFeedback = await feedbackReportModel.createFeedback(
      userId,
      feedbackData
    );

    res.status(201).json({
      message: "Feedback created successfully",
      feedback: {
        id: newFeedback._id,
        feedbackType: newFeedback.feedbackType,
        createdAt: newFeedback.createdAt,
      },
    });
  } catch (error) {
    console.error("Create feedback error:", error);
    res.status(500).json({ message: "Error creating feedback", error });
  }
};

/**
 * Get all feedbacks with optional filters
 * GET /feedback
 */
export const getFeedbacks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      userId,
      feedbackType,
      limit: limitParam,
      offset: offsetParam,
    } = req.query;

    const filters: {
      userId?: string;
      feedbackType?: "bug" | "feature" | "suggestion" | "other";
      limit?: number;
      offset?: number;
    } = {};

    if (userId && typeof userId === "string") {
      filters.userId = userId;
    }

    if (feedbackType && typeof feedbackType === "string") {
      const validTypes = ["bug", "feature", "suggestion", "other"];
      if (validTypes.includes(feedbackType)) {
        filters.feedbackType = feedbackType as
          | "bug"
          | "feature"
          | "suggestion"
          | "other";
      }
    }

    if (limitParam) {
      const limit = parseInt(limitParam as string, 10);
      if (!isNaN(limit) && limit > 0) {
        filters.limit = limit;
      }
    }

    if (offsetParam) {
      const offset = parseInt(offsetParam as string, 10);
      if (!isNaN(offset) && offset >= 0) {
        filters.offset = offset;
      }
    }

    const feedbacks = await feedbackReportModel.getFeedbacks(filters);

    // Calculate stats
    const total = feedbacks.length;
    const bugs = feedbacks.filter((f) => f.feedbackType === "bug").length;
    const features = feedbacks.filter((f) => f.feedbackType === "feature").length;
    const suggestions = feedbacks.filter((f) => f.feedbackType === "suggestion").length;
    const withImages = feedbacks.filter(
      (f) => f.feedbackImages && f.feedbackImages.length > 0
    ).length;

    res.json({
      feedbacks,
      count: feedbacks.length,
      stats: {
        total,
        bugs,
        features,
        suggestions,
        withImages,
      },
    });
  } catch (error) {
    console.error("Get feedbacks error:", error);
    res.status(500).json({ message: "Error fetching feedbacks", error });
  }
};

/**
 * Get feedback detail by ID
 * GET /feedback/:id
 */
export const getFeedbackById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "Feedback ID is required" });
      return;
    }

    const feedback = await feedbackReportModel.getFeedbackById(id);

    if (!feedback) {
      res.status(404).json({ message: "Feedback not found" });
      return;
    }

    res.json({ feedback });
  } catch (error) {
    console.error("Get feedback by ID error:", error);
    res.status(500).json({ message: "Error fetching feedback", error });
  }
};

// ========== REPORT CONTROLLERS ==========

/**
 * Get authenticated user's own reports
 * GET /report/me
 */
export const getMyReports = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { limit: limitParam, offset: offsetParam } = req.query;

    const filters: {
      userId: string;
      limit?: number;
      offset?: number;
    } = { userId };

    if (limitParam) {
      const limit = parseInt(limitParam as string, 10);
      if (!isNaN(limit) && limit > 0) {
        filters.limit = limit;
      }
    }

    if (offsetParam) {
      const offset = parseInt(offsetParam as string, 10);
      if (!isNaN(offset) && offset >= 0) {
        filters.offset = offset;
      }
    }

    const reports = await feedbackReportModel.getReports(filters);

    res.json({
      reports,
      count: reports.length,
    });
  } catch (error) {
    console.error("Get my reports error:", error);
    res.status(500).json({ message: "Error fetching your reports", error });
  }
};

/**
 * Get reports by user ID (user-level access)
 * GET /report/user/:id
 */
export const getUserReports = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const { limit: limitParam, offset: offsetParam } = req.query;

    const filters: {
      userId: string;
      limit?: number;
      offset?: number;
    } = { userId: id };

    if (limitParam) {
      const limit = parseInt(limitParam as string, 10);
      if (!isNaN(limit) && limit > 0) {
        filters.limit = limit;
      }
    }

    if (offsetParam) {
      const offset = parseInt(offsetParam as string, 10);
      if (!isNaN(offset) && offset >= 0) {
        filters.offset = offset;
      }
    }

    const reports = await feedbackReportModel.getReports(filters);

    // Calculate stats
    const total = reports.length;
    const spam = reports.filter((r) => r.reportType === "spam").length;
    const inappropriate = reports.filter(
      (r) => r.reportType === "inappropriate"
    ).length;
    const abusive = reports.filter((r) => r.reportType === "abusive").length;
    const withEvidence = reports.filter(
      (r) => r.reportImages && r.reportImages.length > 0
    ).length;

    res.json({
      reports,
      count: reports.length,
      stats: {
        total,
        spam,
        inappropriate,
        abusive,
        withEvidence,
      },
    });
  } catch (error) {
    console.error("Get user reports error:", error);
    res.status(500).json({ message: "Error fetching user reports", error });
  }
};

/**
 * Create a new report
 * POST /report/create
 */
export const createReport = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const files = req.files as Express.MulterS3.File[] | undefined;
    
    // Extract image URLs from uploaded files (AWS S3)
    // If files are uploaded, use their S3 URLs; otherwise use URLs from body (backward compatibility)
    const reportImages: string[] = files && files.length > 0
      ? files.map((file) => file.location)
      : req.body.reportImages
      ? Array.isArray(req.body.reportImages)
        ? req.body.reportImages
        : [req.body.reportImages]
      : [];

    const reportData: ReportInput = {
      vibeId: req.body.vibeId,
      reportType: req.body.reportType,
      reportDescription: req.body.reportDescription || '',
      reportImages: reportImages,
    };

    // Validate required fields
    if (
      !reportData.vibeId ||
      !reportData.reportType ||
      !reportData.reportDescription
    ) {
      res.status(400).json({
        message: "Missing required fields",
        required: ["vibeId", "reportType", "reportDescription"],
      });
      return;
    }

    // Validate reportType enum
    const validTypes = ["spam", "inappropriate", "abusive", "other"];
    if (!validTypes.includes(reportData.reportType)) {
      res.status(400).json({
        message: "Invalid reportType",
        validTypes,
      });
      return;
    }

    // Validate description length
    if (
      reportData.reportDescription.trim().length === 0 ||
      reportData.reportDescription.length > 1000
    ) {
      res.status(400).json({
        message: "Report description must be between 1 and 1000 characters",
      });
      return;
    }

    const newReport = await feedbackReportModel.createReport(
      userId,
      reportData
    );

    res.status(201).json({
      message: "Report created successfully",
      report: {
        id: newReport._id,
        vibeId: newReport.vibeId,
        reportType: newReport.reportType,
        createdAt: newReport.createdAt,
      },
    });
  } catch (error) {
    console.error("Create report error:", error);
    res.status(500).json({ message: "Error creating report", error });
  }
};

/**
 * Get all reports with optional filters
 * GET /report
 */
export const getReports = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      userId,
      vibeId,
      reportType,
      limit: limitParam,
      offset: offsetParam,
    } = req.query;

    const filters: {
      userId?: string;
      vibeId?: string;
      reportType?: "spam" | "inappropriate" | "abusive" | "other";
      limit?: number;
      offset?: number;
    } = {};

    if (userId && typeof userId === "string") {
      filters.userId = userId;
    }

    if (vibeId && typeof vibeId === "string") {
      filters.vibeId = vibeId;
    }

    if (reportType && typeof reportType === "string") {
      const validTypes = ["spam", "inappropriate", "abusive", "other"];
      if (validTypes.includes(reportType)) {
        filters.reportType = reportType as
          | "spam"
          | "inappropriate"
          | "abusive"
          | "other";
      }
    }

    if (limitParam) {
      const limit = parseInt(limitParam as string, 10);
      if (!isNaN(limit) && limit > 0) {
        filters.limit = limit;
      }
    }

    if (offsetParam) {
      const offset = parseInt(offsetParam as string, 10);
      if (!isNaN(offset) && offset >= 0) {
        filters.offset = offset;
      }
    }

    const reports = await feedbackReportModel.getReports(filters);

    res.json({
      reports,
      count: reports.length,
    });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({ message: "Error fetching reports", error });
  }
};

/**
 * Get report detail by ID
 * GET /report/:id
 */
export const getReportById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "Report ID is required" });
      return;
    }

    const report = await feedbackReportModel.getReportById(id);

    if (!report) {
      res.status(404).json({ message: "Report not found" });
      return;
    }

    res.json({ report });
  } catch (error) {
    console.error("Get report by ID error:", error);
    res.status(500).json({ message: "Error fetching report", error });
  }
};
