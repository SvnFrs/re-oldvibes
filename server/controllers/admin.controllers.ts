import type { Request, Response } from "express";
import { UserModel } from "../models/user.models";
import { VibeModel } from "../models/vibe.models";
import { CommentModel } from "../models/comment.models";
import { FeedbackReportModel } from "../models/feedback-report.model";

const userModel = new UserModel();
const vibeModel = new VibeModel();
const commentModel = new CommentModel();
const feedbackReportModel = new FeedbackReportModel();

export const addStaff = async (req: Request, res: Response) => {
  try {
    const { email, password, name, username } = req.body;

    if (!email || !password || !name || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email or username exists
    const existingEmail = await userModel.getByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }
    const existingUsername = await userModel.getByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const staff = await userModel.createStaff({
      email,
      password,
      name,
      username,
      role: "staff",
    });

    res.status(201).json({
      message: "Staff created successfully",
      staff: {
        id: staff._id,
        email: staff.email,
        name: staff.name,
        username: staff.username,
        role: staff.role,
      },
    });
  } catch (error) {
    console.error("Add staff error:", error);
    res.status(500).json({ message: "Error creating staff", error });
  }
};

export const editStaff = async (req: Request, res: Response) => {
  try {
    const { staffId } = req.params;
    if (!staffId) {
      return res.status(400).json({ message: "Staff ID is required" });
    }
    const updateData = req.body;

    const updated = await userModel.updateStaff(staffId, updateData);

    if (!updated) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.json({
      message: "Staff updated successfully",
      staff: {
        id: updated._id,
        email: updated.email,
        name: updated.name,
        username: updated.username,
        role: updated.role,
      },
    });
  } catch (error) {
    console.error("Edit staff error:", error);
    res.status(500).json({ message: "Error updating staff", error });
  }
};

export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const { staffId } = req.params;

    if (!staffId) {
      return res.status(400).json({ message: "Staff ID is required" });
    }

    const deleted = await userModel.deleteStaff(staffId);

    if (!deleted) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.json({ message: "Staff deleted successfully" });
  } catch (error) {
    console.error("Delete staff error:", error);
    res.status(500).json({ message: "Error deleting staff", error });
  }
};

export const listStaff = async (req: Request, res: Response) => {
  try {
    const staffList = await userModel.listStaff();
    res.json({
      staff: staffList.map((u) => ({
        id: u._id,
        email: u.email,
        name: u.name,
        username: u.username,
        role: u.role,
      })),
    });
  } catch (error) {
    console.error("List staff error:", error);
    res.status(500).json({ message: "Error listing staff", error });
  }
};

export const banUser = async (req: Request, res: Response) => {
  try {
    const { targetUserId } = req.params;
    const requester = (req as any).user; // from auth middleware

    if (!targetUserId) {
      return res.status(400).json({ message: "Target user ID is required" });
    }

    // Prevent self-ban
    if (requester.userId === targetUserId) {
      return res.status(400).json({ message: "You cannot ban yourself" });
    }

    const targetRole = await userModel.getRole(targetUserId);
    if (!targetRole) {
      return res.status(404).json({ message: "Target user not found" });
    }

    // Permission logic
    if (requester.role === "staff" && targetRole !== "user") {
      return res
        .status(403)
        .json({ message: "Staff can only ban normal users" });
    }
    // Admin can ban anyone

    const banned = await userModel.banUser(targetUserId);
    if (!banned) {
      return res
        .status(404)
        .json({ message: "User not found or already banned" });
    }

    res.json({ message: "User banned successfully" });
  } catch (error) {
    console.error("Ban user error:", error);
    res.status(500).json({ message: "Error banning user", error });
  }
};

export const unbanUser = async (req: Request, res: Response) => {
  try {
    const { targetUserId } = req.params;
    const requester = (req as any).user;

    if (!targetUserId) {
      return res.status(400).json({ message: "Target user ID is required" });
    }

    // Prevent self-unban (optional, can remove if not needed)
    // if (requester.userId === targetUserId) {
    //   return res.status(400).json({ message: "You cannot unban yourself" });
    // }

    const targetRole = await userModel.getRole(targetUserId);
    if (!targetRole) {
      return res.status(404).json({ message: "Target user not found" });
    }

    // Permission logic
    if (requester.role === "staff" && targetRole !== "user") {
      return res
        .status(403)
        .json({ message: "Staff can only unban normal users" });
    }
    // Admin can unban anyone

    const unbanned = await userModel.unbanUser(targetUserId);
    if (!unbanned) {
      return res.status(404).json({ message: "User not found or not banned" });
    }

    const { User } = await import("../schema/user.schema");
    const previouslyDeleted = await User.exists({
      _id: targetUserId,
      deletedAt: { $exists: true, $ne: null },
    });

    if (previouslyDeleted) {
      await User.updateOne(
        { _id: targetUserId },
        { $unset: { deletedAt: "" } }
      );
    }

    res.json({ message: "User unbanned successfully" });
  } catch (error) {
    console.error("Unban user error:", error);
    res.status(500).json({ message: "Error unbanning user", error });
  }
};

export const listAllUsers = async (req: Request, res: Response) => {
  try {
    // Optionally add pagination: limit/offset from query
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const users = await userModel.listAllUsers(limit, offset);

    // Calculate stats
    const total = users.filter((u) => u.role !== "admin" && u.role !== "staff").length;
    const active = users.filter((u) => u.isActive && u.role !== "admin" && u.role !== "staff").length;
    const banned = users.filter(
      (u) => !u.isActive && !u.deletedAt && u.role !== "admin" && u.role !== "staff"
    ).length;
    const deleted = users.filter((u) => u.deletedAt && u.role !== "admin" && u.role !== "staff").length;

    res.json({
      users: users.map((u) => ({
        id: u._id,
        email: u.email,
        name: u.name,
        username: u.username,
        role: u.role,
        isActive: u.isActive,
        isEmailVerified: u.isEmailVerified,
        createdAt: u.createdAt,
        deletedAt: u.deletedAt,
        isTempBanned: u.isTempBanned,
        tempBanReason: u.tempBanReason,
        tempBanAt: u.tempBanAt,
        badBehaviorCount: u.badBehaviorCount,
      })),
      count: users.length,
      limit,
      offset,
      stats: {
        total,
        active,
        banned,
        deleted,
      },
    });
  } catch (error) {
    console.error("List all users error:", error);
    res.status(500).json({ message: "Error listing users", error });
  }
};

/**
 * Remove temp ban from user (admin/staff)
 */
export const removeTempBan = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const removed = await userModel.removeTempBan(userId);
    if (!removed) {
      return res.status(404).json({ message: "User not found or error removing temp ban" });
    }

    res.json({
      message: "Temp ban removed successfully",
    });
  } catch (error) {
    console.error("Remove temp ban error:", error);
    res.status(500).json({ message: "Error removing temp ban", error });
  }
};

/**
 * Reset bad behavior count for user (admin only)
 */
export const resetBadBehavior = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const reset = await userModel.resetBadBehavior(userId);
    if (!reset) {
      return res.status(404).json({ message: "User not found or error resetting bad behavior" });
    }

    res.json({
      message: "Bad behavior count reset successfully",
    });
  } catch (error) {
    console.error("Reset bad behavior error:", error);
    res.status(500).json({ message: "Error resetting bad behavior", error });
  }
};

/**
 * Get list of temp banned users (admin/staff)
 */
export const getTempBannedUsers = async (req: Request, res: Response) => {
  try {
    const { User } = await import("../schema/user.schema");

    const tempBannedUsers = await User.find({ isTempBanned: true })
      .select(
        "_id username email badBehaviorCount tempBanReason tempBanAt badBehaviorHistory"
      )
      .sort({ tempBanAt: -1 })
      .limit(100);

    res.json({
      users: tempBannedUsers.map((u) => ({
        id: u._id,
        username: u.username,
        email: u.email,
        badBehaviorCount: u.badBehaviorCount,
        tempBanReason: u.tempBanReason,
        tempBanAt: u.tempBanAt,
        recentViolations: u.badBehaviorHistory.slice(-3),
      })),
      count: tempBannedUsers.length,
    });
  } catch (error) {
    console.error("Get temp banned users error:", error);
    res
      .status(500)
      .json({ message: "Error fetching temp banned users", error });
  }
};

/**
 * Get user's bad behavior history (admin/staff)
 */
export const getUserBadBehaviorHistory = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = req.params;
    const { User } = await import("../schema/user.schema");

    const user = await User.findById(userId)
      .select(
        "username email badBehaviorCount isTempBanned tempBanReason tempBanAt badBehaviorHistory"
      )
      .populate("badBehaviorHistory.vibeId", "itemName");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        badBehaviorCount: user.badBehaviorCount,
        isTempBanned: user.isTempBanned,
        tempBanReason: user.tempBanReason,
        tempBanAt: user.tempBanAt,
      },
      violations: user.badBehaviorHistory,
      totalViolations: user.badBehaviorHistory.length,
    });
  } catch (error) {
    console.error("Get bad behavior history error:", error);
    res
      .status(500)
      .json({ message: "Error fetching bad behavior history", error });
  }
};
// ===== NEW ADMIN FEATURES =====

// Filter Comment by Vibe
export const getCommentsByVibe = async (req: Request, res: Response) => {
  try {
    const { vibeId } = req.params;
    const {
      limit = "20",
      offset = "0",
      sortBy = "newest",
      search = "",
    } = req.query;

    if (!vibeId) {
      return res.status(400).json({ message: "Vibe ID is required" });
    }

    const filters = {
      vibeId,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      sortBy: sortBy as "newest" | "oldest" | "likes",
      search: search as string,
    };

    const result = await commentModel.getCommentsByVibe(filters);

    // Calculate stats
    const totalComments = result.comments.length;
    const totalLikes = result.comments.reduce((acc, c) => acc + c.likesCount, 0);
    const avgLikesPerComment =
      totalComments > 0
        ? Math.round((totalLikes / totalComments) * 10) / 10
        : 0;
    const activeComments = result.comments.filter((c) => c.isActive).length;

    res.json({
      comments: result.comments,
      pagination: {
        total: result.total,
        limit: filters.limit,
        offset: filters.offset,
        hasMore: result.hasMore,
      },
      stats: {
        totalComments,
        totalLikes,
        avgLikesPerComment,
        activeComments,
      },
    });
  } catch (error) {
    console.error("Get comments by vibe error:", error);
    res.status(500).json({ message: "Error fetching comments", error });
  }
};

// Filter Vibe by name, category, price
export const getVibesWithFilters = async (req: Request, res: Response) => {
  try {
    const {
      name,
      category,
      minPrice,
      maxPrice,
      condition,
      status = "all",
      limit = "20",
      offset = "0",
    } = req.query;

    const filters = {
      name: name as string,
      category: category as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      condition: condition as string,
      status: status as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    };

    const result = await vibeModel.getVibesWithFilters(filters);

    res.json({
      vibes: result.data,
      pagination: result.pagination,
      filters: {
        name: filters.name,
        category: filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        condition: filters.condition,
        status: filters.status,
      },
    });
  } catch (error) {
    console.error("Get vibes with filters error:", error);
    res.status(500).json({ message: "Error fetching vibes", error });
  }
};

// View all vibes (admin)
export const getAllVibesAdmin = async (req: Request, res: Response) => {
  try {
    const {
      status = "all",
      limit = "50",
      offset = "0",
      sortBy = "newest",
    } = req.query;

    const filters = {
      status: status as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      sortBy: sortBy as string,
    };

    const result = await vibeModel.getAllVibesAdmin(filters);

    // Calculate stats
    const vibes = result.data;
    const total = vibes.length;
    const pending = vibes.filter((v: any) => v.status === "pending").length;
    const approved = vibes.filter((v: any) => v.status === "approved").length;
    const rejected = vibes.filter((v: any) => v.status === "rejected").length;
    const sold = vibes.filter((v: any) => v.status === "sold").length;
    const archived = vibes.filter((v: any) => v.status === "archived").length;

    res.json({
      vibes: result.data,
      pagination: result.pagination,
      totalCount: result.totalCount,
      stats: {
        total,
        pending,
        approved,
        rejected,
        sold,
        archived,
      },
    });
  } catch (error) {
    console.error("Get all vibes admin error:", error);
    res.status(500).json({ message: "Error fetching all vibes", error });
  }
};

// View detail vibe (admin)
export const getVibeDetailAdmin = async (req: Request, res: Response) => {
  try {
    const { vibeId } = req.params;

    if (!vibeId) {
      return res.status(400).json({ message: "Vibe ID is required" });
    }

    const vibe = await vibeModel.getById(vibeId);
    if (!vibe) {
      return res.status(404).json({ message: "Vibe not found" });
    }

    // Get comments for this vibe
    const commentsResult = await commentModel.getCommentsByVibe({
      vibeId,
      limit: 10,
      offset: 0,
      sortBy: "newest",
    });

    res.json({
      vibe,
      comments: commentsResult.comments,
      commentsCount: commentsResult.total,
    });
  } catch (error) {
    console.error("Get vibe detail admin error:", error);
    res.status(500).json({ message: "Error fetching vibe detail", error });
  }
};

export const banUserForBadComment = async (req: Request, res: Response) => {
  try {
    const { userId, commentId, reason } = req.body;
    const requester = (req as any).user;

    if (!userId || !commentId) {
      return res.status(400).json({
        message: "User ID and Comment ID are required",
      });
    }

    const comment = await commentModel.getById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.id !== userId) {
      return res.status(400).json({
        message: "User does not own this comment",
      });
    }

    const isBadComment = await detectBadComment(comment.content);

    if (!isBadComment) {
      return res.status(400).json({
        message: "Comment does not violate community guidelines",
      });
    }

    // Use addBadBehavior which handles temp ban and auto-ban logic
    const result = await userModel.addBadBehavior(
      userId,
      reason || "Inappropriate Language",
      commentId,
      comment.vibeId?.toString()
    );

    if (!result.success) {
      return res.status(400).json({
        message: result.message,
      });
    }

    console.log(
      `User ${userId} ${result.isPermanentlyBanned ? "permanently banned" : "temporarily banned"} for bad comment ${commentId} by ${
        requester.userId
      }. Reason: ${reason || "AI detected inappropriate content"}`
    );

    res.json({
      message: result.message,
      userId,
      commentId,
      reason: reason || "AI detected inappropriate content",
      isTempBanned: result.isTempBanned,
      isPermanentlyBanned: result.isPermanentlyBanned,
    });
  } catch (error) {
    console.error("Ban user for bad comment error:", error);
    res.status(500).json({ message: "Error banning user", error });
  }
};

async function detectBadComment(content: string): Promise<boolean> {
  const badKeywords = [
    "spam",
    "scam",
    "fake",
    "hate",
    "abuse",
    "harassment",
    "inappropriate",
    "offensive",
    "vulgar",
    "threat",
  ];

  const lowerContent = content.toLowerCase();
  return badKeywords.some((keyword) => lowerContent.includes(keyword));
}

/**
 * Get dashboard statistics for admin panel
 * GET /admin/dashboard/stats
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const { User } = await import("../schema/user.schema");
    const { Vibe } = await import("../schema/vibe.schema");
    const { Feedback } = await import("../schema/feedback.schema");
    const { Report } = await import("../schema/report.schema");

    // Get date range for "this month"
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Total users this month
    const totalUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth },
      role: { $nin: ["admin", "staff"] },
    });

    const totalUsersLastMonth = await User.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      role: { $nin: ["admin", "staff"] },
    });

    const userGrowthPercent =
      totalUsersLastMonth > 0
        ? Math.round(((totalUsersThisMonth - totalUsersLastMonth) / totalUsersLastMonth) * 100)
        : 0;

    // Active vibes (approved status)
    const activeVibes = await Vibe.countDocuments({ status: "approved" });
    const activeVibesLastMonth = await Vibe.countDocuments({
      status: "approved",
      createdAt: { $lte: endOfLastMonth },
    });

    const vibeGrowthPercent =
      activeVibesLastMonth > 0
        ? Math.round(((activeVibes - activeVibesLastMonth) / activeVibesLastMonth) * 100)
        : 0;

    // Pending reports
    const pendingReports = await Report.countDocuments({});
    const pendingReportsLastMonth = await Report.countDocuments({
      createdAt: { $lte: endOfLastMonth },
    });

    const reportsDiff = pendingReports - pendingReportsLastMonth;

    // Pending vibes (awaiting moderation)
    const pendingVibes = await Vibe.countDocuments({ status: "pending" });

    // Recent activity (last 10 users registered)
    const recentUsers = await User.find({
      role: { $nin: ["admin", "staff"] },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("_id email username name profilePicture createdAt");

    const recentActivity = recentUsers.map((user) => ({
      type: "user_registered",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
        profilePicture: user.profilePicture,
      },
      timestamp: user.createdAt,
    }));

    res.json({
      stats: {
        totalUsers: {
          count: totalUsersThisMonth,
          growthPercent: userGrowthPercent,
          label: "This month",
        },
        activeVibes: {
          count: activeVibes,
          growthPercent: vibeGrowthPercent,
          label: "Active",
        },
        pendingReports: {
          count: pendingReports,
          diff: reportsDiff,
          label: "Pending",
        },
        pendingVibes: {
          count: pendingVibes,
          label: "Awaiting review",
        },
      },
      recentActivity,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ message: "Error fetching dashboard stats", error });
  }
};
