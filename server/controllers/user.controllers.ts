import type { Response } from "express";
import { UserModel } from "../models/user.models";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import type { UpdateUserInput } from "../types/user.types";

const userModel = new UserModel();

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { username } = req.params;
    const requestingUserId = req.user?.userId;

    if (!username) {
      res.status(400).json({ message: "Username is required" });
      return;
    }
    const profile = await userModel.getUserProfile(username);
    if (!profile) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if requesting user follows this profile
    const isFollowing = requestingUserId
      ? await userModel.isFollowing(requestingUserId, profile.id)
      : false;

    res.json({
      profile: { ...profile, isFollowing },
      isOwnProfile: requestingUserId === profile.id,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Error fetching profile", error });
  }
};

export const getProfileById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.userId;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }
    const profile = await userModel.getUserProfileById(userId);
    if (!profile) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if requesting user follows this profile
    const isFollowing = requestingUserId
      ? await userModel.isFollowing(requestingUserId, profile.id)
      : false;

    res.json({
      profile: { ...profile, isFollowing },
      isOwnProfile: requestingUserId === profile.id,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Error fetching profile", error });
  }
};

export const getMyProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const user = await userModel.getById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({
      profile: {
        id: user._id!.toString(),
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        profilePicture: user.profilePicture,
        bio: user.bio,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        isEmailVerified: user.isEmailVerified,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get my profile error:", error);
    res.status(500).json({ message: "Error fetching profile", error });
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const updateData: UpdateUserInput = req.body;

    // Validate bio length
    if (updateData.bio && updateData.bio.length > 150) {
      res.status(400).json({ message: "Bio must be 150 characters or less" });
      return;
    }

    // Validate username format if provided
    if (updateData.username) {
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(updateData.username)) {
        res.status(400).json({ 
          message: "Username can only contain letters, numbers, and underscores" 
        });
        return;
      }
      // Check if username is already taken by another user
      const existingUser = await userModel.getByUsername(updateData.username.toLowerCase());
      if (existingUser && existingUser._id!.toString() !== userId) {
        res.status(409).json({ message: "Username already taken" });
        return;
      }
      // Convert to lowercase
      updateData.username = updateData.username.toLowerCase().trim();
    }

    // Validate email format if provided
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        res.status(400).json({ message: "Invalid email format" });
        return;
      }
      // Check if email is already taken by another user
      const existingUser = await userModel.getByEmail(updateData.email.toLowerCase());
      if (existingUser && existingUser._id!.toString() !== userId) {
        res.status(409).json({ message: "Email already taken" });
        return;
      }
      // Convert to lowercase
      updateData.email = updateData.email.toLowerCase().trim();
    }

    const updatedUser = await userModel.updateUser(userId, updateData);
    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({
      message: "Profile updated successfully",
      profile: {
        id: updatedUser._id!.toString(),
        email: updatedUser.email,
        name: updatedUser.name,
        username: updatedUser.username,
        profilePicture: updatedUser.profilePicture,
        bio: updatedUser.bio,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    // Handle MongoDB duplicate key error
    if ((error as any).code === 11000) {
      const field = Object.keys((error as any).keyPattern)[0];
      res.status(409).json({ 
        message: `${field === 'email' ? 'Email' : 'Username'} already taken` 
      });
      return;
    }
    res.status(500).json({ message: "Error updating profile", error });
  }
};

export const updateProfileById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const updateData: UpdateUserInput = req.body;

    // Validate bio length
    if (updateData.bio && updateData.bio.length > 150) {
      res.status(400).json({ message: "Bio must be 150 characters or less" });
      return;
    }

    const updatedUser = await userModel.updateUser(String(userId), updateData);
    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({
      message: "Profile updated successfully",
      profile: {
        id: updatedUser._id!.toString(),
        email: updatedUser.email,
        name: updatedUser.name,
        username: updatedUser.username,
        profilePicture: updatedUser.profilePicture,
        bio: updatedUser.bio,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Error updating profile", error });
  }
};
export const uploadProfilePicture = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const file = req.file as Express.MulterS3.File;

    if (!file) {
      res.status(400).json({ message: "No image uploaded" });
      return;
    }

    const updatedUser = await userModel.updateUser(userId, {
      profilePicture: file.location,
    });

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({
      message: "Profile picture updated successfully",
      profilePicture: updatedUser.profilePicture,
    });
  } catch (error) {
    console.error("Upload profile picture error:", error);
    res.status(500).json({ message: "Error uploading profile picture", error });
  }
};

export const followUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { targetUserId } = req.params;

    if (userId === targetUserId) {
      res.status(400).json({ message: "Cannot follow yourself" });
      return;
    }

    if (!targetUserId) {
      res.status(400).json({ message: "Target user ID is required" });
      return;
    }

    const success = await userModel.followUser(userId, targetUserId);
    if (!success) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ message: "User followed successfully" });
  } catch (error) {
    console.error("Follow user error:", error);
    res.status(500).json({ message: "Error following user", error });
  }
};

export const unfollowUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { targetUserId } = req.params;

    if (!targetUserId) {
      res.status(400).json({ message: "Target user ID is required" });
      return;
    }

    const success = await userModel.unfollowUser(userId, targetUserId);
    if (!success) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ message: "User unfollowed successfully" });
  } catch (error) {
    console.error("Unfollow user error:", error);
    res.status(500).json({ message: "Error unfollowing user", error });
  }
};

export const searchUsers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { q: query } = req.query;

    if (!query || typeof query !== "string") {
      res.status(400).json({ message: "Search query is required" });
      return;
    }

    const users = await userModel.searchUsers(query, 20);
    res.json({ users, count: users.length });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ message: "Error searching users", error });
  }
};

export const getFollowers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const followers = await userModel.getFollowers(userId);
    res.json({ followers, count: followers.length });
  } catch (error) {
    console.error("Get followers error:", error);
    res.status(500).json({ message: "Error fetching followers", error });
  }
};

export const getFollowing = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const following = await userModel.getFollowing(userId);
    res.json({ following, count: following.length });
  } catch (error) {
    console.error("Get following error:", error);
    res.status(500).json({ message: "Error fetching following", error });
  }
};

export const softDeleteAccount = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // Check if user exists
    const user = await userModel.getById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if account is already deleted
    if (user.deletedAt) {
      res.status(400).json({ message: "Account is already deleted" });
      return;
    }

    // Soft delete the account
    const success = await userModel.softDeleteAccount(userId);
    if (!success) {
      res.status(500).json({ message: "Failed to delete account" });
      return;
    }

    res.json({ 
      message: "Account deleted successfully",
      deletedAt: new Date()
    });
  } catch (error) {
    console.error("Soft delete account error:", error);
    res.status(500).json({ message: "Error deleting account", error });
  }
};
