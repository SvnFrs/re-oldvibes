import type { Request, Response } from "express";
import passport from "passport";
import { UserModel } from "../models/user.models";
import { generateToken } from "../utils/jwt.utils";
import { verificationService } from "../services/verification.services";
import { emailService } from "../services/email.services";
import type { LoginCredentials, RegisterInput } from "../types/user.types";

const userModel = new UserModel();

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite:
    process.env.NODE_ENV === "production"
      ? ("none" as const)
      : ("lax" as const),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  domain: process.env.NODE_ENV === "production" ? undefined : undefined,
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, username }: RegisterInput = req.body;

    // validate input
    if (!email || !password || !name || !username) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // check if user already exists
    const existingUser = await userModel.getByEmail(email);
    if (existingUser) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    // check if username is taken
    const existingUsername = await userModel.getByUsername(username);
    if (existingUsername) {
      res.status(409).json({ message: "Username already taken" });
      return;
    }

    // create user (local user - no googleId)
    const newUser = await userModel.create({ email, password, name, username });

    // Send verification email
    await verificationService.sendVerificationEmail(
      email,
      name,
      newUser._id!.toString(),
    );

    // generate jwt token
    const token = generateToken({
      userId: newUser._id!.toString(),
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
    });

    // set http-only cookie
    res.cookie("token", token, getCookieOptions());

    res.status(201).json({
      message:
        "User registered successfully. Please check your email for verification.",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        username: newUser.username,
        role: newUser.role,
        isEmailVerified: false,
      },
      emailSent: true,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Error registering user", error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginCredentials = req.body;

    // validate input
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    // validate user credentials
    const user = await userModel.validatePassword(email, password);
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // generate jwt token
    const token = generateToken({
      userId: user._id!.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    });

    // set http-only cookie
    res.cookie("token", token, getCookieOptions());

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in", error });
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ message: "Verification token is required" });
      return;
    }

    const result = await verificationService.verifyEmail(token);

    if (!result.success) {
      res.status(400).json({ message: result.message });
      return;
    }

    // Update user's email verification status AND isVerified
    await userModel.updateUser(result.userId!, {
      isEmailVerified: true,
      isVerified: true,
    });

    // Send welcome email
    const user = await userModel.getById(result.userId!);
    if (user) {
      await emailService.sendWelcomeEmail(user.email, user.name);
    }

    res.json({
      message: result.message,
      verified: true,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Error verifying email", error });
  }
};

export const resendVerification = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const user = await userModel.getByEmail(email);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({ message: "Email is already verified" });
      return;
    }

    await verificationService.sendVerificationEmail(
      user.email,
      user.name,
      user._id!.toString(),
    );

    res.json({
      message: "Verification email sent successfully",
      emailSent: true,
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res
      .status(500)
      .json({ message: "Error sending verification email", error });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Error logging out", error });
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jwtUser = (req as any).user;
    
    // Fetch full user data from database
    const user = await userModel.getById(jwtUser.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Return full user data
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isVerified: user.isVerified,
        profilePicture: user.profilePicture,
        bio: user.bio,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });
  } catch (error) {
    console.error("Me endpoint error:", error);
    res.status(500).json({ message: "Error getting user info", error });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (req as any).user;

    // Generate new token
    const token = generateToken({
      userId: user.userId,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    // Update cookie
    res.cookie("token", token, getCookieOptions());

    res.json({
      message: "Token refreshed successfully",
      token,
      user: {
        id: user.userId,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ message: "Error refreshing token", error });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const user = await userModel.getByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not for security
      res.json({ message: "If the email exists, a password reset link has been sent" });
      return;
    }

    // Generate password reset token
    const resetToken = await verificationService.sendPasswordResetEmail(
      email,
      user.name,
      user._id!.toString(),
    );

    res.json({
      message: "If the email exists, a password reset link has been sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Error processing forgot password request", error });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({ message: "Token and password are required" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters long" });
      return;
    }

    const result = await verificationService.verifyPasswordResetToken(token);

    if (!result.success) {
      res.status(400).json({ message: result.message });
      return;
    }

    // Hash new password
    const saltRounds = 12;
    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user password
    await userModel.updatePassword(result.userId!, hashedPassword);

    res.json({
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Error resetting password", error });
  }
};

export const checkPasswordStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (req as any).user.userId;
    const user = await userModel.getByIdWithPassword(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const hasPassword = !!user.password;
    const isGoogleUser = !!user.googleId;

    res.json({
      hasPassword,
      isGoogleUser,
      canCreatePassword: !hasPassword, 
      canChangePassword: hasPassword, 
    });
  } catch (error) {
    console.error("Check password status error:", error);
    res.status(500).json({ message: "Error checking password status", error });
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!newPassword) {
      res.status(400).json({ message: "New password is required" });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: "New password must be at least 6 characters long" });
      return;
    }

    // Get user with password field included
    const user = await userModel.getByIdWithPassword(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if user has existing password (local user)
    if (user.password) {
      // User has password - verify current password
      if (!currentPassword) {
        res.status(400).json({ message: "Current password is required" });
        return;
      }

      const bcrypt = require("bcrypt");
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        res.status(400).json({ message: "Current password is incorrect" });
        return;
      }
    } else {
      // User has no password (Google user) - create new password
      console.log("Creating new password for Google user");
    }

    // Hash new password
    const saltRounds = 12;
    const bcrypt = require("bcrypt");
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await userModel.updatePassword(userId, hashedNewPassword);

    const message = user.password 
      ? "Password has been changed successfully"
      : "Password has been created successfully";

    res.json({
      message,
      passwordCreated: !user.password
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ 
      message: "Error changing password", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
};

// Google OAuth Controllers
export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const googleCallback = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({ message: "Google authentication failed" });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id!.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    });

    // Set HTTP-only cookie
    res.cookie("token", token, getCookieOptions());

    // Redirect to frontend with success
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/auth/success?token=${token}`);
  } catch (error) {
    console.error("Google callback error:", error);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/auth/error?message=Authentication failed`);
  }
};