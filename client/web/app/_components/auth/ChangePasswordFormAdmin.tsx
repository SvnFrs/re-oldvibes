"use client";

import { useState, useEffect } from "react";
import {
  IconEye,
  IconEyeOff,
  IconLock,
  IconLoader2,
  IconCheck,
} from "@tabler/icons-react";
import { authAPI } from "../../_apis/common/auth";

export default function ChangePasswordFormAdmin() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<any>(null);

  useEffect(() => {
    const fetchPasswordStatus = async () => {
      try {
        const status = await authAPI.getPasswordStatus();
        setPasswordStatus(status);
      } catch (error) {
        console.error("Failed to fetch password status:", error);
      }
    };

    fetchPasswordStatus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New password and confirmation do not match");
      return false;
    }
    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return false;
    }

    // Only check if current password is different for existing password users
    if (
      passwordStatus?.canChangePassword &&
      formData.currentPassword === formData.newPassword
    ) {
      setError("New password must be different from current password");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await authAPI.changePassword(
        passwordStatus?.canChangePassword
          ? formData.currentPassword
          : undefined,
        formData.newPassword
      );

      setSuccess(true);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Connection error. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 dark:bg-gruvbox-green-dark rounded-full flex items-center justify-center mx-auto mb-4">
              <IconCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mb-2">
              {passwordStatus?.canCreatePassword
                ? "Password created successfully! 🎉"
                : "Password changed successfully! 🎉"}
            </h2>
            <p className="text-gruvbox-gray mb-6">
              {passwordStatus?.canCreatePassword
                ? "Your password has been created successfully. You can now login with email and password."
                : "Your password has been changed successfully."}
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="w-full bg-gruvbox-orange text-gruvbox-light-bg0 py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while fetching password status
  if (!passwordStatus) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gruvbox-orange"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <h1 className="text-2xl font-bold text-black dark:text-gruvbox-orange-dark">
              {passwordStatus.canCreatePassword
                ? "Create Password"
                : "Change Password"}
            </h1>
          </div>
          <p className="text-gruvbox-gray">
            {passwordStatus.canCreatePassword
              ? "Create a new password for your account"
              : "Enter your current password and new password"}
          </p>
        </div>

        {/* Debug Info */}
        {/* {process.env.NODE_ENV === "development" && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Debug:</strong> {JSON.stringify(passwordStatus, null, 2)}
            </p>
          </div>
        )} */}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 dark:bg-gruvbox-red-dark border border-gruvbox-red rounded-lg">
            <p className="text-gruvbox-red text-sm">{error}</p>
          </div>
        )}

        {/* Change Password Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password Field - Only show for users who can change password */}
          {passwordStatus.canChangePassword && (
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mb-2"
              >
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconLock className="h-5 w-5 text-gruvbox-gray" />
                </div>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  required={passwordStatus.canChangePassword}
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-12 py-3 border border-black dark:border-gruvbox-dark-bg3 rounded-lg"
                  placeholder="Enter your current password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showCurrentPassword ? (
                    <IconEyeOff className="h-5 w-5 text-gruvbox-gray hover:text-gruvbox-light-fg1 dark:hover:text-gruvbox-dark-fg1" />
                  ) : (
                    <IconEye className="h-5 w-5 text-gruvbox-gray hover:text-gruvbox-light-fg1 dark:hover:text-gruvbox-dark-fg1" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* New Password Field */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mb-2"
            >
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconLock className="h-5 w-5 text-gruvbox-gray" />
              </div>
              <input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                required
                value={formData.newPassword}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-12 py-3 border border-black dark:border-gruvbox-dark-bg3 rounded-lg"
                placeholder="Enter your new password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={isLoading}
              >
                {showNewPassword ? (
                  <IconEyeOff className="h-5 w-5 text-gruvbox-gray hover:text-gruvbox-light-fg1 dark:hover:text-gruvbox-dark-fg1" />
                ) : (
                  <IconEye className="h-5 w-5 text-gruvbox-gray hover:text-gruvbox-light-fg1 dark:hover:text-gruvbox-dark-fg1" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gruvbox-gray">
              Minimum 6 characters
            </p>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mb-2"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconLock className="h-5 w-5 text-gruvbox-gray" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-12 py-3 border border-black dark:border-gruvbox-dark-bg3 rounded-lg"
                placeholder="Confirm your new password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <IconEyeOff className="h-5 w-5 text-gruvbox-gray hover:text-gruvbox-light-fg1 dark:hover:text-gruvbox-dark-fg1" />
                ) : (
                  <IconEye className="h-5 w-5 text-gruvbox-gray hover:text-gruvbox-light-fg1 dark:hover:text-gruvbox-dark-fg1" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gruvbox-orange text-gruvbox-light-bg0 py-3 px-4 rounded-lg font-semibold hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gruvbox-orange focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <IconLoader2 className="animate-spin h-5 w-5 mr-2" />
                {passwordStatus.canCreatePassword
                  ? "Creating..."
                  : "Changing..."}
              </>
            ) : passwordStatus.canCreatePassword ? (
              "Create Password"
            ) : (
              "Change Password"
            )}
          </button>
        </form>

        {/* Info for Google users */}
        {passwordStatus.canCreatePassword && (
          <div className="mt-6 p-4 dark:bg-gruvbox-blue-dark border border-gruvbox-blue rounded-lg">
            <p className="text-gruvbox-blue text-sm">
              💡 <strong>Note:</strong> You are creating a password for your
              Google account. After creation, you can login with both Google and
              email/password.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
