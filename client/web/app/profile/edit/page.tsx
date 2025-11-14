"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  IconUser,
  IconCamera,
  IconCheck,
  IconX,
  IconArrowLeft,
} from "@tabler/icons-react";
import Image from "next/image";
import Wrapper from "../../_sections/wrapper";
import { useAuth } from "../../_contexts/AuthContext";
import { apiClient } from "../../_libs/api";

const API_BASE = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:4000/api";

export default function EditProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setProfilePicture(user.profilePicture || "");
      setPreviewImage(user.profilePicture || "");
    }
  }, [user, isAuthenticated, authLoading, router]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setError("");
    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch(`${API_BASE}/users/me/avatar`, {
        method: "PATCH",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      setProfilePicture(data.profilePicture);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (bio.length > 150) {
      setError("Bio must be 150 characters or less");
      return;
    }

    setSaving(true);

    try {
      const response = await apiClient.patch("/users/me", {
        name: name.trim(),
        bio: bio.trim(),
        profilePicture,
      });

      // If we get here without error, the update was successful
      setSuccess(true);
      
      // Refresh user data in context first
      await refreshUser();
      
      // Wait a bit for the success message to be visible, then redirect
      setTimeout(() => {
        router.push("/profile");
      }, 1000);
    } catch (err: any) {
      console.error("Update profile error:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <Wrapper>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-48 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-lg mb-4"></div>
            <div className="h-64 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-lg"></div>
          </div>
        </div>
      </Wrapper>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Wrapper>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/profile")}
            className="p-2 hover:bg-gruvbox-light-bg2 dark:hover:bg-gruvbox-dark-bg2 rounded-lg transition-colors"
          >
            <IconArrowLeft size={24} className="text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
              Edit Profile
            </h1>
            <p className="text-gruvbox-gray">
              Update your personal information
            </p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-gruvbox-green-light/10 dark:bg-gruvbox-green-dark/10 border-2 border-gruvbox-green-light dark:border-gruvbox-green-dark rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <IconCheck className="text-gruvbox-green-light dark:text-gruvbox-green-dark flex-shrink-0 mt-0.5" size={24} />
              <div>
                <h3 className="font-bold text-gruvbox-green-light dark:text-gruvbox-green-dark mb-1">
                  Profile Updated Successfully!
                </h3>
                <p className="text-sm text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2">
                  Redirecting to your profile...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-gruvbox-red-light/10 dark:bg-gruvbox-red-dark/10 border-2 border-gruvbox-red-light dark:border-gruvbox-red-dark rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <IconX className="text-gruvbox-red-light dark:text-gruvbox-red-dark flex-shrink-0 mt-0.5" size={24} />
              <div>
                <h3 className="font-bold text-gruvbox-red-light dark:text-gruvbox-red-dark mb-1">
                  Error
                </h3>
                <p className="text-sm text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Edit Form */}
        <div className="bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 rounded-xl shadow-lg border border-gruvbox-light-bg2 dark:border-gruvbox-dark-bg2 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-4">
                Profile Picture
              </label>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 flex items-center justify-center overflow-hidden">
                    {previewImage ? (
                      <Image
                        src={previewImage}
                        alt="Profile"
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <IconUser size={64} className="text-gruvbox-gray" />
                    )}
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="avatar-upload"
                    className="flex items-center gap-2 px-4 py-2 bg-gruvbox-orange text-white rounded-lg cursor-pointer hover:bg-gruvbox-yellow transition-colors"
                  >
                    <IconCamera size={20} />
                    <span>Upload Photo</span>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={uploading}
                  />
                  <p className="text-xs text-gruvbox-gray mt-2">
                    JPG, PNG or GIF. Max 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                Display Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your display name"
                maxLength={50}
                className="w-full px-4 py-3 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border border-gruvbox-light-bg2 dark:border-gruvbox-dark-bg2 rounded-lg text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange"
              />
              <div className="text-xs text-gruvbox-gray mt-1">
                {name.length}/50 characters
              </div>
            </div>

            {/* Username (Read-only) */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={user.username}
                disabled
                className="w-full px-4 py-3 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 border border-gruvbox-light-bg2 dark:border-gruvbox-dark-bg2 rounded-lg text-gruvbox-gray cursor-not-allowed"
              />
              <p className="text-xs text-gruvbox-gray mt-1">
                Username cannot be changed
              </p>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={user.email}
                disabled
                className="w-full px-4 py-3 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 border border-gruvbox-light-bg2 dark:border-gruvbox-dark-bg2 rounded-lg text-gruvbox-gray cursor-not-allowed"
              />
              <p className="text-xs text-gruvbox-gray mt-1">
                Email cannot be changed
              </p>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                Bio (150 characters max)
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                maxLength={150}
                className="w-full px-4 py-3 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border border-gruvbox-light-bg2 dark:border-gruvbox-dark-bg2 rounded-lg text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange resize-none"
              />
              <div className="text-xs text-gruvbox-gray mt-1">
                {bio.length}/150 characters
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="flex-1 px-6 py-3 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 rounded-lg font-medium hover:bg-gruvbox-light-bg1 dark:hover:bg-gruvbox-dark-bg1 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gruvbox-orange text-white rounded-lg font-medium hover:bg-gruvbox-yellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <IconCheck size={20} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Wrapper>
  );
}
