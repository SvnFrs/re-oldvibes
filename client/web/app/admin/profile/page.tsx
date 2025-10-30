"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconUser,
  IconMail,
  IconAt,
  IconCamera,
  IconEdit,
  IconDeviceFloppy,
  IconX,
  IconLock,
  IconLoader2,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import { authAPI } from "../../_apis/common/auth";
import {
  updateUserProfile,
  uploadUserProfilePicture,
} from "@/app/_apis/common/user";
import { uploadToCloudinaryImage } from "@/app/_apis/common/upload";
import Cookies from "js-cookie";
import ChangePasswordFormAdmin from "@/app/_components/auth/ChangePasswordFormAdmin";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  username: string;
  role: string;
  profilePicture?: string;
  bio?: string;
  isEmailVerified: boolean;
  isVerified: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  provider?: "local" | "google";
}

interface ProfileUpdateData {
  name: string;
  username: string;
  email: string;
  bio?: string;
  profilePicture?: string;
}

export default function AdminProfilePage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const router = useRouter();

  const token = Cookies.get("tokenAuth");

  const [formData, setFormData] = useState<ProfileUpdateData>({
    name: "",
    username: "",
    email: "",
    bio: "",
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await authAPI.getMe();

      if (!response.user || !["admin", "staff"].includes(response.user.role)) {
        router.replace("/admin/signin");
        return;
      }

      setUser(response.user);
      setFormData({
        name: response.user.name || "",
        username: response.user.username || "",
        email: response.user.email || "",
        bio: response.user.bio || "",
      });
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      router.replace("/admin/signin");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
      });
    }
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await updateUserProfile(token || "", formData);

      if (!response.message) {
        throw new Error(response.message || "Failed to update profile");
      }

      setUser({ ...user, ...response.profile });

      setIsEditing(false);
      setSuccess("Profile updated successfully!");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfilePictureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      // Upload to Cloudinary first
      const uploadResults = await uploadToCloudinaryImage([file]);

      if (!uploadResults || !Array.isArray(uploadResults)) {
        throw new Error("Failed to upload image to Cloudinary");
      }

      // Get the uploaded image URL
      const uploadedImage = uploadResults[0];
      const imageUrl = uploadedImage.secure_url;

      if (!imageUrl) {
        throw new Error("No image URL returned from upload");
      }

      // Update user profile with the new image URL
      const response = await updateUserProfile(token || "", {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        bio: formData.bio,
        profilePicture: imageUrl,
      });

      if (!response.message) {
        throw new Error(response.message || "Failed to update profile");
      }

      // Update local state with new profile picture
      setUser({ ...user, profilePicture: imageUrl });
      setSuccess("Profile picture updated successfully!");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to upload profile picture"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <IconLoader2 className="animate-spin h-6 w-6 text-blue-600" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Profile
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your account information
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <IconX className="h-5 w-5" />
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <IconCheck className="h-5 w-5 text-green-600" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <IconAlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Profile Picture
              </h2>

              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <IconUser className="w-16 h-16 text-gray-400" />
                    )}
                  </div>

                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                    <IconCamera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                      disabled={isSaving}
                    />
                  </label>
                </div>

                <p className="text-sm text-gray-500 mt-4 text-center">
                  Click the camera icon to upload a new profile picture
                </p>
              </div>
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Profile Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                  >
                    <IconEdit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-700"
                    >
                      <IconX className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <IconLoader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <IconDeviceFloppy className="h-4 w-4" />
                      )}
                      <span>{isSaving ? "Saving..." : "Save"}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <IconUser className="inline h-4 w-4 mr-2" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {user.name || "Not provided"}
                    </p>
                  )}
                </div>

                {/* Username Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <IconAt className="inline h-4 w-4 mr-2" />
                    Username
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your username"
                    />
                  ) : (
                    <p className="text-gray-900">
                      @{user.username || "Not provided"}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <IconMail className="inline h-4 w-4 mr-2" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-900">{user.email}</p>
                      {/* {user.isEmailVerified && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      )} */}
                    </div>
                  )}
                </div>

                {/* Bio Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell us about yourself"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {user.bio || "No bio provided"}
                    </p>
                  )}
                </div>

                {/* Account Status */}
                <div className="border-t pt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">
                    Account Status
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {user.role}
                      </p>
                    </div>
                    {/* <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </div> */}
                    {/* <div>
                      <p className="text-sm text-gray-500">Email Verified</p>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.isEmailVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {user.isEmailVerified ? "Verified" : "Pending"}
                      </span>
                    </div> */}
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-medium text-gray-900">
                        {new Date(user.createdAt || "").toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Change Password Section */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Security
                </h2>
                <button
                  onClick={() => setShowChangePassword(!showChangePassword)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  <IconLock className="h-4 w-4" />
                  <span>{showChangePassword ? "Hide" : "Change Password"}</span>
                </button>
              </div>

              {showChangePassword && (
                <div className="border-t pt-4">
                  <ChangePasswordFormAdmin />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
