import { Feedback, type IFeedback } from "../schema/feedback.schema";
import { Report, type IReport } from "../schema/report.schema";
import type {
  FeedbackInput,
  FeedbackResponse,
  ReportInput,
  ReportResponse,
} from "../types/feedback-report.types";
import mongoose from "mongoose";

export class FeedbackReportModel {
  // ========== FEEDBACK METHODS ==========

  /**
   * Create a new feedback
   */
  async createFeedback(
    userId: string,
    feedbackData: FeedbackInput
  ): Promise<IFeedback> {
    const feedback = new Feedback({
      ...feedbackData,
      userId: new mongoose.Types.ObjectId(userId),
      feedbackImages: feedbackData.feedbackImages || [],
    });

    return await feedback.save();
  }

  /**
   * Get list of feedbacks with optional filters
   */
  async getFeedbacks(filters?: {
    userId?: string;
    feedbackType?: "bug" | "feature" | "suggestion" | "other";
    limit?: number;
    offset?: number;
  }): Promise<FeedbackResponse[]> {
    const query: any = {};

    if (filters?.userId) {
      query.userId = new mongoose.Types.ObjectId(filters.userId);
    }

    if (filters?.feedbackType) {
      query.feedbackType = filters.feedbackType;
    }

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    const feedbacks = await Feedback.find(query)
      .populate("userId", "username name profilePicture")
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    return feedbacks.map((feedback) => this.formatFeedbackResponse(feedback));
  }

  /**
   * Get detail of a feedback by ID
   */
  async getFeedbackById(feedbackId: string): Promise<FeedbackResponse | null> {
    const feedback = await Feedback.findById(feedbackId)
      .populate("userId", "username name profilePicture")
      .lean();

    if (!feedback) return null;

    return this.formatFeedbackResponse(feedback);
  }

  /**
   * Format feedback document to response format
   */
  private formatFeedbackResponse(feedback: any): FeedbackResponse {
    return {
      id: feedback._id.toString(),
      userId: feedback.userId._id
        ? feedback.userId._id.toString()
        : feedback.userId.toString(),
      feedbackType: feedback.feedbackType,
      feedbackDescription: feedback.feedbackDescription,
      feedbackImages: feedback.feedbackImages || [],
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
    };
  }

  // ========== REPORT METHODS ==========

  /**
   * Create a new report
   */
  async createReport(
    userId: string,
    reportData: ReportInput
  ): Promise<IReport> {
    const report = new Report({
      ...reportData,
      userId: new mongoose.Types.ObjectId(userId),
      vibeId: new mongoose.Types.ObjectId(reportData.vibeId),
      reportImages: reportData.reportImages || [],
    });

    return await report.save();
  }

  /**
   * Get list of reports with optional filters
   */
  async getReports(filters?: {
    userId?: string;
    vibeId?: string;
    reportType?: "spam" | "inappropriate" | "abusive" | "other";
    limit?: number;
    offset?: number;
  }): Promise<ReportResponse[]> {
    const query: any = {};

    if (filters?.userId) {
      query.userId = new mongoose.Types.ObjectId(filters.userId);
    }

    if (filters?.vibeId) {
      query.vibeId = new mongoose.Types.ObjectId(filters.vibeId);
    }

    if (filters?.reportType) {
      query.reportType = filters.reportType;
    }

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    const reports = await Report.find(query)
      .populate("userId", "username name profilePicture")
      .populate("vibeId", "itemName description")
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    return reports.map((report) => this.formatReportResponse(report));
  }

  /**
   * Get detail of a report by ID
   */
  async getReportById(reportId: string): Promise<ReportResponse | null> {
    const report = await Report.findById(reportId)
      .populate("userId", "username name profilePicture")
      .populate("vibeId", "itemName description mediaFiles")
      .lean();

    if (!report) return null;

    return this.formatReportResponse(report);
  }

  /**
   * Format report document to response format
   */
  private formatReportResponse(report: any): ReportResponse {
    return {
      id: report._id.toString(),
      userId: report.userId._id
        ? report.userId._id.toString()
        : report.userId.toString(),
      vibeId: report.vibeId._id
        ? report.vibeId._id.toString()
        : report.vibeId.toString(),
      reportType: report.reportType,
      reportDescription: report.reportDescription,
      reportImages: report.reportImages || [],
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    };
  }
}
