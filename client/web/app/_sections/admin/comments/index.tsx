"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  IconMessageCircle,
  IconRefresh,
  IconSearch,
  IconEye,
  IconTrash,
  IconBan,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconUser,
  IconPhoto,
  IconHeart,
  IconClock,
  IconChevronDown,
  IconChevronUp,
  IconArrowLeft,
} from "@tabler/icons-react";
import Modal from "@/app/_components/reusable/modal";
import { API } from "@/app/_libs/api";
import { Comment, Vibe } from "@/app/_libs/types";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Stats Card Component
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className={`bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg3 rounded-xl p-4 hover:border-${color}/50 transition-all`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 bg-${color}/20 rounded-lg`}>{icon}</div>
        <div>
          <h3 className="text-2xl font-bold text-gruvbox-dark-fg0">{value}</h3>
          <p className="text-xs text-gruvbox-dark-fg2">{label}</p>
        </div>
      </div>
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

// Comment Detail Modal Component
function CommentDetailModal({
  comment,
  vibe,
  isOpen,
  onClose,
  onDelete,
  onBanUser,
}: {
  comment: Comment | null;
  vibe: Vibe | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (commentId: string) => void;
  onBanUser: (userId: string, commentId: string) => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBanConfirm, setShowBanConfirm] = useState(false);

  if (!comment || !vibe) return null;

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(comment.id);
    setShowDeleteConfirm(false);
  };

  const handleBanClick = () => {
    setShowBanConfirm(true);
  };

  const handleBanConfirm = () => {
    onBanUser(comment.user.id, comment.id);
    setShowBanConfirm(false);
  };

  return (
    <>
      <Modal opened={isOpen} onClose={onClose} title="Comment Details">
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Vibe Context */}
          <div className="bg-gruvbox-dark-bg2 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gruvbox-dark-fg2 mb-3 flex items-center gap-2">
              <IconPhoto size={16} />
              Related Vibe
            </h4>
            <div className="flex items-center gap-3">
              {vibe.mediaFiles && vibe.mediaFiles.length > 0 && (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gruvbox-dark-bg3 flex-shrink-0">
                  <Image
                    src={vibe.mediaFiles[0].url}
                    alt={vibe.itemName}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gruvbox-dark-fg0 truncate">
                  {vibe.itemName}
                </p>
                <p className="text-sm text-gruvbox-dark-fg2">${vibe.price}</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-gruvbox-dark-bg2 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gruvbox-dark-fg2 mb-3 flex items-center gap-2">
              <IconUser size={16} />
              Comment Author
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gruvbox-blue to-gruvbox-purple flex items-center justify-center text-white font-bold text-lg">
                {comment.user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-semibold text-gruvbox-dark-fg0">
                  {comment.user.name}
                </p>
                <p className="text-sm text-gruvbox-dark-fg2">
                  @{comment.user.username}
                </p>
                {comment.user.isVerified && (
                  <span className="text-xs text-blue-400 flex items-center gap-1 mt-1">
                    <IconCheck size={12} />
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Comment Content */}
          <div className="bg-gruvbox-dark-bg2 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gruvbox-dark-fg2 mb-2">
              Comment Content
            </h4>
            <p className="text-sm text-gruvbox-dark-fg1 leading-relaxed">
              {comment.content}
            </p>
          </div>

          {/* Comment Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gruvbox-dark-bg2 rounded-lg p-4 text-center">
              <IconHeart size={20} className="mx-auto mb-2 text-red-400" />
              <p className="text-2xl font-bold text-gruvbox-dark-fg0">
                {comment.likesCount}
              </p>
              <p className="text-xs text-gruvbox-dark-fg3">Likes</p>
            </div>
            <div className="bg-gruvbox-dark-bg2 rounded-lg p-4 text-center">
              <IconClock size={20} className="mx-auto mb-2 text-gruvbox-blue" />
              <p className="text-xs text-gruvbox-dark-fg1">
                {new Date(comment.createdAt).toLocaleString()}
              </p>
              <p className="text-xs text-gruvbox-dark-fg3 mt-1">Posted</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gruvbox-dark-bg3">
            <button
              onClick={handleBanClick}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 text-red-400 px-4 py-2.5 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              <IconBan size={18} />
              Ban User
            </button>
            <button
              onClick={handleDeleteClick}
              className="flex items-center justify-center gap-2 bg-red-500/20 text-red-400 px-4 py-2.5 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              <IconTrash size={18} />
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Comment"
        message={`Are you sure you want to delete this comment? This action cannot be undone.`}
        confirmText="Delete Comment"
        type="danger"
      />

      {/* Ban User Confirmation Modal */}
      <ConfirmationModal
        isOpen={showBanConfirm}
        onClose={() => setShowBanConfirm(false)}
        onConfirm={handleBanConfirm}
        title="Ban User"
        message={`Are you sure you want to ban ${comment.user.name} for this comment? This will prevent them from accessing the platform.`}
        confirmText="Ban User"
        type="danger"
      />
    </>
  );
}

export default function CommentModerationSection() {
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [selectedVibe, setSelectedVibe] = useState<Vibe | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [vibeSearchTerm, setVibeSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [showVibesList, setShowVibesList] = useState(true);
  const [commentStats, setCommentStats] = useState<any>(null);

  // Fetch vibes for selection
  const fetchVibes = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        limit: "100",
        offset: "0",
        sortBy: "newest",
      });

      const response = await fetch(`${API}/admin/vibes?${params}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        setVibes(data.vibes || []);
      } else {
        setError(data.message || "Failed to fetch vibes");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch vibes");
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments for selected vibe
  const fetchComments = async (vibeId: string) => {
    setCommentsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        limit: "50",
        offset: "0",
        sortBy,
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(
        `${API}/admin/vibes/${vibeId}/comments?${params}`,
        { credentials: "include" }
      );
      const data = await response.json();

      if (response.ok) {
        setComments(data.comments || []);
        // Use stats from API if available
        if (data.stats) {
          setCommentStats(data.stats);
        }
      } else {
        setError(data.message || "Failed to fetch comments");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch comments");
    } finally {
      setCommentsLoading(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`${API}/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setSuccess("Comment deleted successfully!");
        setModalOpen(false);
        if (selectedVibe) {
          fetchComments(selectedVibe.id);
        }
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to delete comment");
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete comment");
    }
  };

  // Ban user for inappropriate comment
  const handleBanUser = async (userId: string, commentId: string) => {
    try {
      const response = await fetch(`${API}/admin/users/ban-for-comment`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          commentId,
          reason: "Inappropriate comment detected",
        }),
      });

      if (response.ok) {
        setSuccess("User banned successfully!");
        setModalOpen(false);
        if (selectedVibe) {
          fetchComments(selectedVibe.id);
        }
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to ban user");
      }
    } catch (err: any) {
      setError(err.message || "Failed to ban user");
    }
  };

  // Quick delete comment
  const quickDeleteComment = async (comment: Comment) => {
    if (
      !window.confirm(
        `Are you sure you want to delete this comment by ${comment.user.name}?`
      )
    )
      return;

    handleDeleteComment(comment.id);
  };

  // Handle vibe selection
  const handleVibeSelect = (vibe: Vibe) => {
    setSelectedVibe(vibe);
    setShowVibesList(false);
  };

  // Handle back to vibes list
  const handleBackToVibes = () => {
    setSelectedVibe(null);
    setComments([]);
    setShowVibesList(true);
  };

  useEffect(() => {
    fetchVibes();
  }, []);

  useEffect(() => {
    if (selectedVibe) {
      fetchComments(selectedVibe.id);
    }
  }, [selectedVibe, searchTerm, sortBy]);

  // Filter vibes by search term
  const filteredVibes = useMemo(() => {
    return vibes.filter(
      (v) =>
        v.itemName.toLowerCase().includes(vibeSearchTerm.toLowerCase()) ||
        v.category.toLowerCase().includes(vibeSearchTerm.toLowerCase()) ||
        v.user?.username.toLowerCase().includes(vibeSearchTerm.toLowerCase())
    );
  }, [vibes, vibeSearchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!selectedVibe) {
      const totalVibes = vibes.length;
      const totalComments = vibes.reduce(
        (acc, v) => acc + (v.commentsCount || 0),
        0
      );
      return {
        totalComments,
        totalVibes,
        vibesWithComments: vibes.filter((v) => (v.commentsCount || 0) > 0)
          .length,
        avgCommentsPerVibe:
          totalVibes > 0
            ? Math.round((totalComments / totalVibes) * 10) / 10
            : 0,
      };
    }

    // Use stats from API if available, otherwise calculate
    if (commentStats) {
      return commentStats;
    }

    const totalComments = comments.length;
    const totalLikes = comments.reduce((acc, c) => acc + c.likesCount, 0);
    const avgLikesPerComment =
      totalComments > 0
        ? Math.round((totalLikes / totalComments) * 10) / 10
        : 0;

    return {
      totalComments,
      totalLikes,
      avgLikesPerComment,
      activeComments: comments.filter((c) => c.isActive).length,
    };
  }, [comments, vibes, selectedVibe, commentStats]);

  if (loading && vibes.length === 0) {
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
            <IconMessageCircle size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gruvbox-dark-fg0">
              Comment Moderation
            </h2>
            <p className="text-sm text-gruvbox-dark-fg2">
              Review and moderate user comments
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {selectedVibe && (
            <button
              className="flex items-center gap-2 px-4 py-2 bg-gruvbox-dark-bg2 hover:bg-gruvbox-dark-bg3 text-gruvbox-dark-fg1 rounded-lg transition-colors"
              onClick={handleBackToVibes}
            >
              <IconArrowLeft size={18} />
              <span className="hidden sm:inline">Back to Vibes</span>
            </button>
          )}
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gruvbox-dark-bg2 hover:bg-gruvbox-dark-bg3 text-gruvbox-orange rounded-lg transition-colors"
            onClick={fetchVibes}
          >
            <IconRefresh size={18} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      {!selectedVibe ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={
              <IconPhoto size={24} className="text-gruvbox-purple-dark" />
            }
            label="Total Vibes"
            value={stats.totalVibes}
            color="gruvbox-purple"
          />
          <StatCard
            icon={
              <IconMessageCircle size={24} className="text-gruvbox-blue-dark" />
            }
            label="Total Comments"
            value={stats.totalComments}
            color="gruvbox-blue"
          />
          <StatCard
            icon={<IconCheck size={24} className="text-green-400" />}
            label="Vibes w/ Comments"
            value={stats.vibesWithComments}
            color="green-500"
          />
          <StatCard
            icon={<IconUser size={24} className="text-gruvbox-orange-dark" />}
            label="Avg Comments/Vibe"
            value={stats.avgCommentsPerVibe}
            color="gruvbox-orange"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={
              <IconMessageCircle size={24} className="text-gruvbox-blue-dark" />
            }
            label="Total Comments"
            value={stats.totalComments}
            color="gruvbox-blue"
          />
          <StatCard
            icon={<IconHeart size={24} className="text-red-400" />}
            label="Total Likes"
            value={stats.totalLikes}
            color="red-500"
          />
          <StatCard
            icon={<IconCheck size={24} className="text-green-400" />}
            label="Active Comments"
            value={stats.activeComments}
            color="green-500"
          />
          <StatCard
            icon={<IconUser size={24} className="text-gruvbox-purple-dark" />}
            label="Avg Likes/Comment"
            value={stats.avgLikesPerComment}
            color="gruvbox-purple"
          />
        </div>
      )}

      {/* Main Content - Side by Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel - Vibes List (Collapsible on mobile) */}
        <div
          className={`lg:col-span-2 ${
            !showVibesList && selectedVibe ? "hidden lg:block" : ""
          }`}
        >
          <div className="bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg3 rounded-xl overflow-hidden sticky top-4">
            {/* Vibes Panel Header */}
            <div className="p-4 border-b border-gruvbox-dark-bg3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gruvbox-dark-fg0 flex items-center gap-2">
                  <IconPhoto size={20} />
                  Select Vibe
                </h3>
                <button
                  className="lg:hidden p-2 hover:bg-gruvbox-dark-bg2 rounded-lg transition-colors"
                  onClick={() => setShowVibesList(!showVibesList)}
                >
                  {showVibesList ? (
                    <IconChevronUp size={20} />
                  ) : (
                    <IconChevronDown size={20} />
                  )}
                </button>
              </div>

              {/* Vibe Search */}
              <div className="relative">
                <IconSearch
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gruvbox-dark-fg3"
                />
                <input
                  className="w-full bg-gruvbox-dark-bg2 border border-gruvbox-dark-bg3 rounded-lg pl-9 pr-3 py-2 text-sm text-gruvbox-dark-fg1 placeholder-gruvbox-dark-fg3 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
                  placeholder="Search vibes..."
                  value={vibeSearchTerm}
                  onChange={(e) => setVibeSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Vibes List */}
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredVibes.length === 0 ? (
                <div className="p-8 text-center">
                  <IconPhoto
                    size={48}
                    className="mx-auto mb-3 text-gruvbox-dark-fg3"
                  />
                  <p className="text-gruvbox-dark-fg2 text-sm">
                    No vibes found
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gruvbox-dark-bg3">
                  {filteredVibes.map((vibe) => (
                    <div
                      key={vibe.id}
                      className={`p-4 cursor-pointer transition-all hover:bg-gruvbox-dark-bg2 ${
                        selectedVibe?.id === vibe.id
                          ? "bg-gruvbox-dark-bg2 border-l-4 border-gruvbox-orange"
                          : ""
                      }`}
                      onClick={() => handleVibeSelect(vibe)}
                    >
                      <div className="flex gap-3">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gruvbox-dark-bg3 flex-shrink-0">
                          {vibe.mediaFiles && vibe.mediaFiles.length > 0 ? (
                            <Image
                              src={vibe.mediaFiles[0].url}
                              alt={vibe.itemName}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <IconPhoto
                                size={24}
                                className="text-gruvbox-dark-fg3"
                              />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-gruvbox-dark-fg0 line-clamp-1 mb-1">
                            {vibe.itemName}
                          </h4>
                          <p className="text-xs text-gruvbox-dark-fg3 mb-2">
                            @{vibe.user?.username || "Unknown"}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gruvbox-dark-fg3">
                            <span className="flex items-center gap-1">
                              <IconMessageCircle size={12} />
                              {vibe.commentsCount || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <IconHeart size={12} />
                              {vibe.likesCount || 0}
                            </span>
                            <span className="text-gruvbox-orange font-semibold">
                              ${vibe.price}
                            </span>
                          </div>
                        </div>

                        {/* Selection indicator */}
                        {selectedVibe?.id === vibe.id && (
                          <div className="flex-shrink-0">
                            <IconCheck
                              size={20}
                              className="text-gruvbox-orange"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Comments */}
        <div
          className={`lg:col-span-3 ${
            showVibesList && !selectedVibe ? "hidden lg:block" : ""
          }`}
        >
          {!selectedVibe ? (
            <div className="bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg3 rounded-xl p-12 text-center">
              <IconMessageCircle
                size={64}
                className="mx-auto mb-4 text-gruvbox-dark-fg3"
              />
              <h3 className="text-xl font-bold text-gruvbox-dark-fg0 mb-2">
                Select a Vibe
              </h3>
              <p className="text-gruvbox-dark-fg2">
                Choose a vibe from the list to view and moderate its comments
              </p>
            </div>
          ) : (
            <div className="bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg3 rounded-xl overflow-hidden">
              {/* Comments Panel Header */}
              <div className="p-4 border-b border-gruvbox-dark-bg3">
                {/* Vibe Info */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gruvbox-dark-bg3">
                  {selectedVibe.mediaFiles &&
                    selectedVibe.mediaFiles.length > 0 && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gruvbox-dark-bg3 flex-shrink-0">
                        <Image
                          src={selectedVibe.mediaFiles[0].url}
                          alt={selectedVibe.itemName}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gruvbox-dark-fg0 truncate">
                      {selectedVibe.itemName}
                    </h3>
                    <p className="text-sm text-gruvbox-dark-fg3">
                      @{selectedVibe.user?.username || "Unknown"} • $
                      {selectedVibe.price}
                    </p>
                  </div>
                </div>

                {/* Search and Sort */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <IconSearch
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gruvbox-dark-fg3"
                    />
                    <input
                      className="w-full bg-gruvbox-dark-bg2 border border-gruvbox-dark-bg3 rounded-lg pl-9 pr-3 py-2 text-sm text-gruvbox-dark-fg1 placeholder-gruvbox-dark-fg3 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
                      placeholder="Search comments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="bg-gruvbox-dark-bg2 border border-gruvbox-dark-bg3 rounded-lg px-3 py-2 text-sm text-gruvbox-dark-fg1 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="likes">Most Liked</option>
                  </select>
                </div>
              </div>

              {/* Comments List */}
              <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
                {commentsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gruvbox-orange"></div>
                    <span className="ml-2 text-gruvbox-dark-fg2">
                      Loading comments...
                    </span>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="p-12 text-center">
                    <IconMessageCircle
                      size={48}
                      className="mx-auto mb-3 text-gruvbox-dark-fg3"
                    />
                    <p className="text-gruvbox-dark-fg2">
                      No comments found for this vibe
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gruvbox-dark-bg3">
                    <AnimatePresence>
                      {comments.map((comment) => (
                        <motion.div
                          key={comment.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="p-4 hover:bg-gruvbox-dark-bg2 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gruvbox-blue to-gruvbox-purple flex items-center justify-center text-white font-bold flex-shrink-0">
                              {comment.user.name?.[0]?.toUpperCase() || "U"}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-bold text-sm text-gruvbox-dark-fg0">
                                  {comment.user.name}
                                </span>
                                <span className="text-xs text-gruvbox-dark-fg3">
                                  @{comment.user.username}
                                </span>
                                {comment.user.isVerified && (
                                  <IconCheck
                                    size={14}
                                    className="text-blue-400"
                                  />
                                )}
                                <span className="text-xs text-gruvbox-dark-fg3">
                                  •
                                </span>
                                <span className="text-xs text-gruvbox-dark-fg3">
                                  {new Date(
                                    comment.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gruvbox-dark-fg1 mb-2 break-words">
                                {comment.content}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gruvbox-dark-fg3">
                                <span className="flex items-center gap-1">
                                  <IconHeart size={12} />
                                  {comment.likesCount}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                className="p-2 hover:bg-gruvbox-dark-bg3 rounded-lg transition-colors text-gruvbox-blue"
                                onClick={() => {
                                  setSelectedComment(comment);
                                  setModalOpen(true);
                                }}
                                title="View Details"
                              >
                                <IconEye size={18} />
                              </button>
                              <button
                                className="p-2 hover:bg-gruvbox-dark-bg3 rounded-lg transition-colors text-red-400"
                                onClick={() => quickDeleteComment(comment)}
                                title="Delete Comment"
                              >
                                <IconTrash size={18} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comment Detail Modal */}
      <CommentDetailModal
        comment={selectedComment}
        vibe={selectedVibe}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedComment(null);
        }}
        onDelete={handleDeleteComment}
        onBanUser={handleBanUser}
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