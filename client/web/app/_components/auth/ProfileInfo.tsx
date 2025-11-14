"use client";

import { useState, useEffect, useRef } from "react";
import { authAPI } from "../../_apis/common/auth";
import { updateMyProfile } from "../../_apis/common/user";
import {
  IconUser,
  IconEdit,
  IconCheck,
  IconX,
  IconCamera,
} from "@tabler/icons-react";
import { uploadProfilePictureToBackend } from "@/app/_apis/common/upload";

interface UserInfo {
  id: string;
  email: string;
  name: string;
  username: string;
  role: string;
  profilePicture?: string;
  bio?: string;
  createdAt?: string;
}

export default function ProfileInfo() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const response = await authAPI.getMe();
        const userData = response.user || null;
        setUser(userData);
        if (userData) {
          setEditForm({
            name: userData.name || "",
            username: userData.username || "",
            email: userData.email || "",
            bio: userData.bio || "",
          });
        }
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load user information"
        );
        console.error("Error fetching user info:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleEdit = () => {
    if (user) {
      setEditForm({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
      });
      setIsEditing(true);
      setSaveError(null);
      setSaveSuccess(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError(null);
    setSaveSuccess(false);
    if (user) {
      setEditForm({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
      });
    }
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePictureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setSaveError("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSaveError("Kích thước ảnh phải nhỏ hơn 5MB");
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Upload to backend (AWS S3) - this also updates the profile automatically
      const imageUrl = await uploadProfilePictureToBackend(file);

      if (!imageUrl) {
        throw new Error("Failed to upload profile picture");
      }

      // Update local state with new profile picture
      setUser({ ...user, profilePicture: imageUrl });

      setSaveSuccess(true);

      // Refresh user data
      const refreshResponse = await authAPI.getMe();
      if (refreshResponse.user) {
        setUser(refreshResponse.user);
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Không thể tải lên ảnh đại diện"
      );
      console.error("Error uploading profile picture:", error);
    } finally {
      setIsSaving(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate bio length
    if (editForm.bio && editForm.bio.length > 150) {
      setSaveError("Bio must be 150 characters or less");
      return;
    }

    // Validate username format
    if (editForm.username) {
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(editForm.username)) {
        setSaveError(
          "Username can only contain letters, numbers, and underscores"
        );
        return;
      }
    }

    // Validate email format
    if (editForm.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editForm.email)) {
        setSaveError("Invalid email format");
        return;
      }
    }

    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      const response = await updateMyProfile({
        name: editForm.name,
        username: editForm.username || undefined,
        email: editForm.email || undefined,
        bio: editForm.bio || undefined,
      });

      // Update local state with new data
      if (response.profile) {
        setUser({
          ...user,
          name: response.profile.name || user.name,
          username: response.profile.username || user.username,
          email: response.profile.email || user.email,
          bio: response.profile.bio || user.bio,
        });
      }

      setSaveSuccess(true);
      setIsEditing(false);

      // Refresh user data
      const refreshResponse = await authAPI.getMe();
      if (refreshResponse.user) {
        setUser(refreshResponse.user);
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to update profile"
      );
      console.error("Error updating profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDateToAsia = (dateString?: string): string => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      // Convert to Asia timezone (UTC+7 for Vietnam/Thailand, UTC+8 for Singapore/Malaysia, etc.)
      // Using Intl.DateTimeFormat for proper timezone handling
      const asiaDate = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Ho_Chi_Minh", // Vietnam timezone (UTC+7)
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(date);

      return asiaDate;
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Invalid date";
    }
  };

  const getRoleDisplay = (role: string): string => {
    const roleMap: Record<string, string> = {
      user: "Người dùng",
      admin: "Quản trị viên",
      moderator: "Điều hành viên",
    };
    return roleMap[role] || role;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gruvbox-orange"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gruvbox-red-light/10 dark:bg-gruvbox-red-dark/10 border border-gruvbox-red-light dark:border-gruvbox-red-dark rounded-lg p-4">
        <p className="text-gruvbox-red-light dark:text-gruvbox-red-dark text-sm">
          {error}
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-lg p-4">
        <p className="text-gruvbox-gray text-sm">
          Không tìm thấy thông tin người dùng
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex justify-end">
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-gruvbox-orange text-gruvbox-light-bg0 rounded-lg hover:bg-opacity-90 transition-colors font-medium"
          >
            <IconEdit className="w-4 h-4" />
            Chỉnh sửa
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 rounded-lg hover:bg-opacity-90 transition-colors font-medium disabled:opacity-50"
            >
              <IconX className="w-4 h-4" />
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-gruvbox-green-light dark:bg-gruvbox-green-dark text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <IconCheck className="w-4 h-4" />
                  Lưu
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {saveSuccess && (
        <div className="bg-gruvbox-green-light/10 dark:bg-gruvbox-green-dark/10 border border-gruvbox-green-light dark:border-gruvbox-green-dark rounded-lg p-4">
          <p className="text-gruvbox-green-light dark:text-gruvbox-green-dark text-sm">
            Cập nhật hồ sơ thành công!
          </p>
        </div>
      )}

      {saveError && (
        <div className="bg-gruvbox-red-light/10 dark:bg-gruvbox-red-dark/10 border border-gruvbox-red-light dark:border-gruvbox-red-dark rounded-lg p-4">
          <p className="text-gruvbox-red-light dark:text-gruvbox-red-dark text-sm">
            {saveError}
          </p>
        </div>
      )}

      {/* Profile Picture */}
      <div className="flex items-center justify-center">
        <div className="relative group">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfilePictureUpload}
            className="hidden"
            disabled={isSaving}
          />
          <button
            type="button"
            onClick={handleProfilePictureClick}
            disabled={isSaving}
            className="relative cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-gruvbox-orange transition-opacity group-hover:opacity-75"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gruvbox-orange flex items-center justify-center border-4 border-gruvbox-orange transition-opacity group-hover:opacity-75">
                <IconUser className="w-16 h-16 text-gruvbox-light-bg0" />
              </div>
            )}
            {/* Camera Icon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-opacity-0 group-hover:bg-opacity-50 rounded-full transition-all">
              <IconCamera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
          {isSaving && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>
      </div>
      <p className="text-center text-xs text-gruvbox-gray mt-2">
        Nhấp vào ảnh để thay đổi ảnh đại diện
      </p>

      {/* User Information */}
      <div className="space-y-4">
        {/* Name */}
        <div className="bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-lg p-4">
          <label className="text-xs font-semibold text-gruvbox-gray uppercase tracking-wide mb-1 block">
            Tên
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              className="w-full px-3 py-2 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border border-gruvbox-light-bg3 dark:border-gruvbox-dark-bg3 rounded-lg text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange"
              placeholder="Nhập tên của bạn"
            />
          ) : (
            <p className="text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 text-lg font-medium">
              {user.name}
            </p>
          )}
        </div>

        {/* Username */}
        <div className="bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-lg p-4">
          <label className="text-xs font-semibold text-gruvbox-gray uppercase tracking-wide mb-1 block">
            Tên người dùng
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editForm.username}
              onChange={(e) =>
                setEditForm({ ...editForm, username: e.target.value })
              }
              className="w-full px-3 py-2 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border border-gruvbox-light-bg3 dark:border-gruvbox-dark-bg3 rounded-lg text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange"
              placeholder="Nhập tên người dùng"
            />
          ) : (
            <p className="text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 text-lg font-medium">
              @{user.username}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-lg p-4">
          <label className="text-xs font-semibold text-gruvbox-gray uppercase tracking-wide mb-1 block">
            Email
          </label>
          {isEditing ? (
            <input
              type="email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
              className="w-full px-3 py-2 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border border-gruvbox-light-bg3 dark:border-gruvbox-dark-bg3 rounded-lg text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange"
              placeholder="Nhập email của bạn"
            />
          ) : (
            <p className="text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 text-lg font-medium">
              {user.email}
            </p>
          )}
        </div>

        {/* Role */}
        <div className="bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-lg p-4">
          <label className="text-xs font-semibold text-gruvbox-gray uppercase tracking-wide mb-1 block">
            Vai trò
          </label>
          <p className="text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 text-lg font-medium">
            {getRoleDisplay(user.role)}
          </p>
        </div>

        {/* Bio */}
        <div className="bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-lg p-4">
          <label className="text-xs font-semibold text-gruvbox-gray uppercase tracking-wide mb-1 block">
            Giới thiệu
            {isEditing && (
              <span className="text-gruvbox-gray ml-2 font-normal">
                ({editForm.bio.length}/150)
              </span>
            )}
          </label>
          {isEditing ? (
            <textarea
              value={editForm.bio}
              onChange={(e) => {
                if (e.target.value.length <= 150) {
                  setEditForm({ ...editForm, bio: e.target.value });
                }
              }}
              maxLength={150}
              rows={4}
              className="w-full px-3 py-2 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border border-gruvbox-light-bg3 dark:border-gruvbox-dark-bg3 rounded-lg text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange resize-none"
              placeholder="Nhập giới thiệu về bản thân (tối đa 150 ký tự)"
            />
          ) : (
            <p className="text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1">
              {user.bio || (
                <span className="text-gruvbox-gray italic">
                  Chưa có giới thiệu
                </span>
              )}
            </p>
          )}
        </div>

        {/* Created At */}
        <div className="bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-lg p-4">
          <label className="text-xs font-semibold text-gruvbox-gray uppercase tracking-wide mb-1 block">
            Ngày tạo tài khoản
          </label>
          <p className="text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1">
            {formatDateToAsia(user.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
