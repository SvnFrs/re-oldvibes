"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  IconMessage,
  IconRefresh,
  IconSearch,
  IconEye,
  IconTrash,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconClock,
  IconUser,
  IconBug,
  IconBulb,
  IconListDetails,
  IconFileText,
  IconChevronRight,
  IconExternalLink,
  IconFilter,
  IconDownload,
} from "@tabler/icons-react";
import Modal from "@/app/_components/reusable/modal";
import { API } from "@/app/_libs/api";
import { Feedback } from "@/app/_libs/types";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Stats Card Component
function StatCard({
  icon,
  label,
  value,
  color,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  trend?: string;
}) {
  return (
    <div
      className={`bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg3 rounded-xl p-6 hover:border-${color}/50 transition-all`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 bg-${color}/20 rounded-lg`}>{icon}</div>
        {trend && <span className="text-xs text-gruvbox-dark-fg3">{trend}</span>}
      </div>
      <h3 className="text-3xl font-bold text-gruvbox-dark-fg0 mb-1">{value}</h3>
      <p className="text-sm text-gruvbox-dark-fg2">{label}</p>
    </div>
  );
}

// Confirmation Modal Component
function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "danger" | "info";
}) {
  const typeColors = {
    warning: "bg-yellow-500",
    danger: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <Modal opened={isOpen} onClose={onClose} title={title} showCloseButton={false}>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 ${typeColors[type]}/20 rounded-lg`}>
            <IconAlertCircle
              size={24}
              className={`text-${
                type === "warning" ? "yellow" : type === "danger" ? "red" : "blue"
              }-400`}
            />
          </div>
          <p className="text-gruvbox-dark-fg1 flex-1">{message}</p>
        </div>
        <div className="flex gap-3 pt-4">
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              type === "danger"
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-gruvbox-orange hover:bg-gruvbox-yellow text-white"
            }`}
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="px-6 bg-gruvbox-dark-bg3 text-gruvbox-dark-fg1 py-3 rounded-lg font-semibold hover:bg-gruvbox-dark-bg2 transition-colors"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Feedback Detail Modal Component
function FeedbackDetailModal({
  feedback,
  userInfo,
  isOpen,
  onClose,
  onDelete,
}: {
  feedback: Feedback | null;
  userInfo: any;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (feedbackId: string) => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!feedback) return null;

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(feedback.id);
    setShowDeleteConfirm(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bug":
        return <IconBug size={20} className="text-red-400" />;
      case "feature":
        return <IconBulb size={20} className="text-blue-400" />;
      case "suggestion":
        return <IconListDetails size={20} className="text-green-400" />;
      default:
        return <IconFileText size={20} className="text-gruvbox-dark-fg3" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "bug":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "feature":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "suggestion":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-gruvbox-dark-bg3 text-gruvbox-dark-fg2 border-gruvbox-dark-bg3";
    }
  };

  return (
    <>
      <Modal opened={isOpen} onClose={onClose} title="Feedback Details">
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Header with Type Badge */}
          <div className="flex items-center justify-between pb-4 border-b border-gruvbox-dark-bg3">
            <div className="flex items-center gap-3">
              {getTypeIcon(feedback.feedbackType)}
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${getTypeColor(
                  feedback.feedbackType
                )}`}
              >
                {feedback.feedbackType.toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-gruvbox-dark-fg3">
              ID: {feedback.id.slice(-12)}
            </span>
          </div>

          {/* User Info */}
          <div className="bg-gruvbox-dark-bg2 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gruvbox-dark-fg2 mb-3 flex items-center gap-2">
              <IconUser size={16} />
              Submitted By
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gruvbox-orange to-gruvbox-red flex items-center justify-center text-white font-bold text-lg">
                {userInfo?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-semibold text-gruvbox-dark-fg0">
                  {userInfo?.name || "Unknown User"}
                </p>
                <p className="text-sm text-gruvbox-dark-fg2">
                  @{userInfo?.username || "unknown"}
                </p>
                <p className="text-xs text-gruvbox-dark-fg3 mt-0.5">
                  ID: {userInfo?.id?.slice(-12) || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold text-gruvbox-dark-fg2 mb-2 flex items-center gap-2">
              <IconFileText size={16} />
              Description
            </h4>
            <div className="bg-gruvbox-dark-bg2 rounded-lg p-4">
              <p className="text-sm text-gruvbox-dark-fg1 leading-relaxed whitespace-pre-wrap">
                {feedback.feedbackDescription}
              </p>
            </div>
          </div>

          {/* Images */}
          {feedback.feedbackImages && feedback.feedbackImages.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gruvbox-dark-fg2 mb-2 flex items-center gap-2">
                <IconExternalLink size={16} />
                Attached Images ({feedback.feedbackImages.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {feedback.feedbackImages.map((img, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-lg overflow-hidden bg-gruvbox-dark-bg2 cursor-pointer hover:ring-2 hover:ring-gruvbox-orange transition-all group"
                    onClick={() => window.open(img, "_blank")}
                  >
                    <Image
                      src={img}
                      alt={`Feedback image ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <IconExternalLink
                        size={24}
                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex items-center gap-6 text-xs text-gruvbox-dark-fg3 pt-4 border-t border-gruvbox-dark-bg3">
            <div className="flex items-center gap-1">
              <IconClock size={14} />
              <span>
                Created:{" "}
                {new Date(feedback.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <IconClock size={14} />
              <span>
                Updated:{" "}
                {new Date(feedback.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gruvbox-dark-bg3">
            <button
              onClick={handleDeleteClick}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 text-red-400 px-4 py-2.5 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              <IconTrash size={18} />
              Delete Feedback
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Feedback"
        message="Are you sure you want to delete this feedback? This action cannot be undone."
        confirmText="Delete Feedback"
        type="danger"
      />
    </>
  );
}

// User Info Type
interface UserInfo {
  id: string;
  username: string;
  name: string;
  profilePicture?: string;
}

export default function FeedbackSection() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [userInfoMap, setUserInfoMap] = useState<Record<string, UserInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    bugs: 0,
    features: 0,
    suggestions: 0,
    withImages: 0,
  });

  // Fetch user information by userId
  const fetchUserInfo = async (userId: string): Promise<UserInfo | null> => {
    if (userInfoMap[userId]) {
      return userInfoMap[userId];
    }

    try {
      const res = await fetch(`${API}/users/${userId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.profile) {
        const userInfo: UserInfo = {
          id: data.profile.id,
          username: data.profile.username || "Unknown",
          name: data.profile.name || "Unknown",
          profilePicture: data.profile.profilePicture,
        };
        setUserInfoMap((prev) => ({ ...prev, [userId]: userInfo }));
        return userInfo;
      }
    } catch (err) {
      console.error("Failed to fetch user info:", err);
    }
    return null;
  };

  // Fetch feedbacks
  const fetchFeedbacks = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        limit: "50",
        offset: "0",
      });

      if (typeFilter !== "all") {
        params.append("feedbackType", typeFilter);
      }

      const res = await fetch(`${API}/feedback?${params}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok) {
        setFeedbacks(data.feedbacks || []);
        
        // Use stats from API if available
        if (data.stats) {
          setStats(data.stats);
        }

        // Fetch user info for all feedbacks
        const userIds = new Set<string>();
        data.feedbacks.forEach((f: Feedback) => {
          if (typeof f.userId === "string") {
            userIds.add(f.userId);
          } else if (f.userId && typeof f.userId === "object") {
            userIds.add(f.userId._id);
          }
        });

        // Fetch user info for all unique user IDs
        await Promise.all(
          Array.from(userIds).map((userId) => fetchUserInfo(userId))
        );
      } else {
        setError(data.message || "Failed to fetch feedbacks");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch feedbacks");
    } finally {
      setLoading(false);
    }
  };

  // Delete feedback
  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      const res = await fetch(`${API}/feedback/${feedbackId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setSuccess("Feedback deleted successfully!");
        setModalOpen(false);
        fetchFeedbacks();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete feedback");
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete feedback");
    }
  };

  // Quick delete feedback
  const quickDeleteFeedback = async (feedback: Feedback) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this feedback? This action cannot be undone."
      )
    )
      return;

    handleDeleteFeedback(feedback.id);
  };

  // View feedback details
  const viewFeedbackDetails = async (feedbackId: string) => {
    try {
      const res = await fetch(`${API}/feedback/${feedbackId}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.feedback) {
        if (typeof data.feedback.userId === "string") {
          await fetchUserInfo(data.feedback.userId);
        }
        setSelectedFeedback(data.feedback);
        setModalOpen(true);
      } else {
        setError("Failed to fetch feedback details");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  // Get user info from feedback
  const getUserInfo = (feedback: Feedback): UserInfo => {
    if (typeof feedback.userId === "object" && feedback.userId !== null) {
      return {
        id: feedback.userId._id,
        username: feedback.userId.username || "Unknown",
        name: feedback.userId.name || "Unknown",
        profilePicture: feedback.userId.profilePicture,
      };
    }

    const userId = feedback.userId as string;
    if (userInfoMap[userId]) {
      return userInfoMap[userId];
    }

    return {
      id: userId,
      username: "Loading...",
      name: "Loading...",
      profilePicture: undefined,
    };
  };

  // Export to CSV
  const handleExportCSV = () => {
    const csv = [
      ["ID", "Type", "User", "Description", "Images", "Created At"],
      ...filteredFeedbacks.map((f) => {
        const userInfo = getUserInfo(f);
        return [
          f.id.slice(-12),
          f.feedbackType,
          `${userInfo.name} (@${userInfo.username})`,
          f.feedbackDescription.replace(/,/g, ";"),
          f.feedbackImages?.length || 0,
          new Date(f.createdAt).toLocaleString(),
        ];
      }),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedbacks-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [typeFilter]);

  // Filter feedbacks by search term
  const filteredFeedbacks = useMemo(() => {
    let filtered = feedbacks.filter((f) => {
      const userInfo = getUserInfo(f);
      const searchLower = searchTerm.toLowerCase();
      return (
        f.feedbackDescription.toLowerCase().includes(searchLower) ||
        f.feedbackType.toLowerCase().includes(searchLower) ||
        userInfo.username.toLowerCase().includes(searchLower) ||
        userInfo.name.toLowerCase().includes(searchLower)
      );
    });

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [feedbacks, searchTerm, sortBy, userInfoMap]);

  // Calculate statistics
  // Stats are now provided by the API, but keep fallback calculation
  useEffect(() => {
    if (feedbacks.length > 0 && stats.total === 0) {
      const total = feedbacks.length;
      const bugs = feedbacks.filter((f) => f.feedbackType === "bug").length;
      const features = feedbacks.filter((f) => f.feedbackType === "feature").length;
      const suggestions = feedbacks.filter((f) => f.feedbackType === "suggestion").length;
      const withImages = feedbacks.filter(
        (f) => f.feedbackImages && f.feedbackImages.length > 0
      ).length;

      setStats({ total, bugs, features, suggestions, withImages });
    }
  }, [feedbacks, stats.total]);

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bug":
        return <IconBug size={16} className="text-red-400" />;
      case "feature":
        return <IconBulb size={16} className="text-blue-400" />;
      case "suggestion":
        return <IconListDetails size={16} className="text-green-400" />;
      default:
        return <IconFileText size={16} className="text-gruvbox-dark-fg3" />;
    }
  };

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case "bug":
        return "bg-red-500/20 text-red-400";
      case "feature":
        return "bg-blue-500/20 text-blue-400";
      case "suggestion":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-gruvbox-dark-bg3 text-gruvbox-dark-fg2";
    }
  };

  if (loading && feedbacks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gruvbox-orange"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-gruvbox-purple to-gruvbox-blue rounded-lg">
            <IconMessage size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gruvbox-dark-fg0">
              Feedback Management
            </h2>
            <p className="text-sm text-gruvbox-dark-fg2">
              Review and manage user feedback
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gruvbox-dark-bg2 hover:bg-gruvbox-dark-bg3 text-gruvbox-dark-fg1 rounded-lg transition-colors"
            onClick={handleExportCSV}
          >
            <IconDownload size={18} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gruvbox-dark-bg2 hover:bg-gruvbox-dark-bg3 text-gruvbox-orange rounded-lg transition-colors"
            onClick={fetchFeedbacks}
          >
            <IconRefresh size={18} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          icon={<IconMessage size={24} className="text-gruvbox-blue-dark" />}
          label="Total Feedback"
          value={stats.total}
          color="gruvbox-blue"
        />
        <StatCard
          icon={<IconBug size={24} className="text-red-400" />}
          label="Bug Reports"
          value={stats.bugs}
          color="red-500"
        />
        <StatCard
          icon={<IconBulb size={24} className="text-blue-400" />}
          label="Feature Requests"
          value={stats.features}
          color="blue-500"
        />
        <StatCard
          icon={<IconListDetails size={24} className="text-green-400" />}
          label="Suggestions"
          value={stats.suggestions}
          color="green-500"
        />
        <StatCard
          icon={<IconExternalLink size={24} className="text-gruvbox-purple-dark" />}
          label="With Images"
          value={stats.withImages}
          color="gruvbox-purple"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative md:col-span-1">
          <IconSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gruvbox-dark-fg3"
          />
          <input
            className="w-full bg-gruvbox-dark-bg2 border border-gruvbox-dark-bg3 rounded-lg pl-10 pr-4 py-2.5 text-gruvbox-dark-fg1 placeholder-gruvbox-dark-fg3 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
            placeholder="Search feedbacks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="bg-gruvbox-dark-bg2 border border-gruvbox-dark-bg3 rounded-lg px-4 py-2.5 text-gruvbox-dark-fg1 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="bug">🐛 Bug Reports</option>
          <option value="feature">💡 Feature Requests</option>
          <option value="suggestion">✨ Suggestions</option>
          <option value="other">📝 Other</option>
        </select>
        <select
          className="bg-gruvbox-dark-bg2 border border-gruvbox-dark-bg3 rounded-lg px-4 py-2.5 text-gruvbox-dark-fg1 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Feedbacks Grid */}
      {filteredFeedbacks.length === 0 ? (
        <div className="text-center py-12 bg-gruvbox-dark-bg1 rounded-lg border border-gruvbox-dark-bg3">
          <IconMessage size={48} className="mx-auto mb-3 text-gruvbox-dark-fg3" />
          <p className="text-gruvbox-dark-fg2">No feedbacks found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredFeedbacks.map((feedback) => {
              const userInfo = getUserInfo(feedback);
              return (
                <motion.div
                  key={feedback.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg3 rounded-lg p-4 hover:border-gruvbox-orange/50 transition-all group"
                >
                  {/* Type Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(feedback.feedbackType)}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(
                          feedback.feedbackType
                        )}`}
                      >
                        {feedback.feedbackType.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-gruvbox-dark-fg3">
                      #{feedback.id.slice(-8)}
                    </span>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gruvbox-dark-bg3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gruvbox-orange to-gruvbox-red flex items-center justify-center text-white font-bold">
                      {userInfo.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gruvbox-dark-fg0 truncate">
                        {userInfo.name}
                      </p>
                      <p className="text-xs text-gruvbox-dark-fg3 truncate">
                        @{userInfo.username}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gruvbox-dark-fg1 mb-3 line-clamp-3 leading-relaxed">
                    {feedback.feedbackDescription}
                  </p>

                  {/* Images Preview */}
                  {feedback.feedbackImages && feedback.feedbackImages.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {feedback.feedbackImages.slice(0, 3).map((img, i) => (
                        <div
                          key={i}
                          className="relative w-16 h-16 rounded-lg overflow-hidden bg-gruvbox-dark-bg2"
                        >
                          <Image
                            src={img}
                            alt={`Feedback image ${i + 1}`}
                            fill
                            className="object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(img, "_blank")}
                          />
                        </div>
                      ))}
                      {feedback.feedbackImages.length > 3 && (
                        <div className="w-16 h-16 rounded-lg bg-gruvbox-dark-bg2 flex items-center justify-center text-xs text-gruvbox-dark-fg2">
                          +{feedback.feedbackImages.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gruvbox-dark-bg3">
                    <div className="flex items-center gap-1 text-xs text-gruvbox-dark-fg3">
                      <IconClock size={14} />
                      <span>
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="p-2 hover:bg-gruvbox-dark-bg3 rounded-lg transition-colors text-gruvbox-blue"
                        onClick={() => viewFeedbackDetails(feedback.id)}
                        title="View Details"
                      >
                        <IconEye size={18} />
                      </button>
                      <button
                        className="p-2 hover:bg-gruvbox-dark-bg3 rounded-lg transition-colors text-red-400"
                        onClick={() => quickDeleteFeedback(feedback)}
                        title="Delete Feedback"
                      >
                        <IconTrash size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Feedback Detail Modal */}
      <FeedbackDetailModal
        feedback={selectedFeedback}
        userInfo={
          selectedFeedback ? getUserInfo(selectedFeedback) : null
        }
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedFeedback(null);
        }}
        onDelete={handleDeleteFeedback}
      />

      {/* Success/Error Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2 shadow-lg max-w-md z-50"
          >
            <IconAlertCircle size={18} />
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="ml-2 hover:text-red-300"
            >
              <IconX size={16} />
            </button>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2 shadow-lg max-w-md z-50"
          >
            <IconCheck size={18} />
            <span>{success}</span>
            <button
              onClick={() => setSuccess("")}
              className="ml-2 hover:text-green-300"
            >
              <IconX size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
