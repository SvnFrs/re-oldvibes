"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  IconPhoto,
  IconRefresh,
  IconSearch,
  IconEye,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconClock,
  IconUser,
  IconCurrencyDollar,
  IconTag,
  IconMapPin,
  IconHeart,
  IconMessageCircle,
  IconChevronRight,
  IconExternalLink,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import Modal from "@/app/_components/reusable/modal";
import { API } from "@/app/_libs/api";
import { Vibe } from "@/app/_libs/types";
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

// Vibe Detail Modal Component
function VibeDetailModal({
  vibe,
  isOpen,
  onClose,
  onDelete,
  onModerate,
  onArchive,
  onUnarchive,
}: {
  vibe: Vibe | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onModerate: (id: string, action: "approve" | "reject") => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showModerateConfirm, setShowModerateConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showUnarchiveConfirm, setShowUnarchiveConfirm] = useState(false);
  const [moderateAction, setModerateAction] = useState<"approve" | "reject">("approve");

  if (!vibe) return null;

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(vibe.id);
    setShowDeleteConfirm(false);
  };

  const handleModerateClick = (action: "approve" | "reject") => {
    setModerateAction(action);
    setShowModerateConfirm(true);
  };

  const handleModerateConfirm = () => {
    onModerate(vibe.id, moderateAction);
    setShowModerateConfirm(false);
  };

  const handleArchiveClick = () => {
    setShowArchiveConfirm(true);
  };

  const handleArchiveConfirm = () => {
    onArchive(vibe.id);
    setShowArchiveConfirm(false);
  };

  const handleUnarchiveClick = () => {
    setShowUnarchiveConfirm(true);
  };

  const handleUnarchiveConfirm = () => {
    onUnarchive(vibe.id);
    setShowUnarchiveConfirm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "sold":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "archived":
        return "bg-gruvbox-dark-bg3 text-gruvbox-dark-fg2 border-gruvbox-dark-bg3";
      default:
        return "bg-gruvbox-dark-bg3 text-gruvbox-dark-fg2 border-gruvbox-dark-bg3";
    }
  };

  return (
    <>
      <Modal opened={isOpen} onClose={onClose} title="Vibe Details" className="!max-w-4xl">
        <div className="space-y-6 max-h-[calc(90vh-8rem)] overflow-y-auto">
          {/* Header with Status */}
          <div className="flex items-center justify-between pb-4 border-b border-gruvbox-dark-bg3">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-gruvbox-dark-fg0">
                {vibe.itemName}
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                  vibe.status
                )}`}
              >
                {vibe.status.toUpperCase()}
              </span>
            </div>
            <span className="text-2xl font-bold text-gruvbox-orange">
              ${vibe.price}
            </span>
          </div>

          {/* Media Gallery */}
          {vibe.mediaFiles && vibe.mediaFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gruvbox-dark-fg2 flex items-center gap-2">
                <IconPhoto size={16} />
                Media ({vibe.mediaFiles.length})
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {vibe.mediaFiles.map((media, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden bg-gruvbox-dark-bg2 cursor-pointer hover:ring-2 hover:ring-gruvbox-orange transition-all group"
                    onClick={() => window.open(media.url, "_blank")}
                  >
                    {media.type === "image" ? (
                      <Image
                        src={media.url}
                        alt={`Media ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <video
                        src={media.url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    )}
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

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gruvbox-dark-bg2 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <IconUser size={16} className="text-gruvbox-dark-fg3" />
                <span className="text-xs text-gruvbox-dark-fg3">Owner</span>
              </div>
              <p className="font-semibold text-gruvbox-dark-fg0">
                {vibe.user?.username || "Unknown"}
              </p>
            </div>

            <div className="bg-gruvbox-dark-bg2 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <IconTag size={16} className="text-gruvbox-dark-fg3" />
                <span className="text-xs text-gruvbox-dark-fg3">Category</span>
              </div>
              <p className="font-semibold text-gruvbox-dark-fg0">{vibe.category}</p>
            </div>

            <div className="bg-gruvbox-dark-bg2 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <IconCheck size={16} className="text-gruvbox-dark-fg3" />
                <span className="text-xs text-gruvbox-dark-fg3">Condition</span>
              </div>
              <p className="font-semibold text-gruvbox-dark-fg0">{vibe.condition}</p>
            </div>

            {vibe.location && (
              <div className="bg-gruvbox-dark-bg2 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <IconMapPin size={16} className="text-gruvbox-dark-fg3" />
                  <span className="text-xs text-gruvbox-dark-fg3">Location</span>
                </div>
                <p className="font-semibold text-gruvbox-dark-fg0">{vibe.location}</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-gruvbox-dark-bg2 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gruvbox-dark-fg2 mb-2">
              Description
            </h4>
            <p className="text-sm text-gruvbox-dark-fg1 leading-relaxed">
              {vibe.description || "No description provided"}
            </p>
          </div>

          {/* Tags */}
          {vibe.tags && vibe.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gruvbox-dark-fg2 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {vibe.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gruvbox-dark-bg3 text-gruvbox-dark-fg1 rounded-full text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gruvbox-dark-bg2 rounded-lg p-3 text-center">
              <IconEye size={20} className="mx-auto mb-1 text-gruvbox-blue" />
              <p className="text-lg font-bold text-gruvbox-dark-fg0">
                {vibe.views || 0}
              </p>
              <p className="text-xs text-gruvbox-dark-fg3">Views</p>
            </div>
            <div className="bg-gruvbox-dark-bg2 rounded-lg p-3 text-center">
              <IconHeart size={20} className="mx-auto mb-1 text-red-400" />
              <p className="text-lg font-bold text-gruvbox-dark-fg0">
                {vibe.likesCount || 0}
              </p>
              <p className="text-xs text-gruvbox-dark-fg3">Likes</p>
            </div>
            <div className="bg-gruvbox-dark-bg2 rounded-lg p-3 text-center">
              <IconMessageCircle
                size={20}
                className="mx-auto mb-1 text-gruvbox-green"
              />
              <p className="text-lg font-bold text-gruvbox-dark-fg0">
                {vibe.commentsCount || 0}
              </p>
              <p className="text-xs text-gruvbox-dark-fg3">Comments</p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex items-center gap-6 text-xs text-gruvbox-dark-fg3 pt-4 border-t border-gruvbox-dark-bg3">
            <div className="flex items-center gap-1">
              <IconClock size={14} />
              <span>
                Created: {vibe.createdAt ? new Date(vibe.createdAt).toLocaleString() : "N/A"}
              </span>
            </div>
            {vibe.updatedAt && (
              <div className="flex items-center gap-1">
                <IconClock size={14} />
                <span>Updated: {new Date(vibe.updatedAt).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gruvbox-dark-bg3">
            {vibe.status === "pending" && (
              <>
                <button
                  onClick={() => handleModerateClick("approve")}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <IconCheck size={18} />
                  Approve
                </button>
                <button
                  onClick={() => handleModerateClick("reject")}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2.5 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <IconX size={18} />
                  Reject
                </button>
              </>
            )}
            {vibe.status === "archived" && (
              <button
                onClick={handleUnarchiveClick}
                className="flex-1 flex items-center justify-center gap-2 bg-gruvbox-blue text-white px-4 py-2.5 rounded-lg hover:bg-gruvbox-blue/90 transition-colors"
              >
                <IconRefresh size={18} />
                Unarchive
              </button>
            )}
            {(vibe.status === "approved" || vibe.status === "pending") && (
              <button
                onClick={handleArchiveClick}
                className="flex items-center justify-center gap-2 bg-gruvbox-dark-bg3 text-gruvbox-dark-fg1 px-4 py-2.5 rounded-lg hover:bg-gruvbox-dark-bg2 transition-colors"
              >
                <IconClock size={18} />
                Archive
              </button>
            )}
            <button
              onClick={handleDeleteClick}
              className="flex items-center justify-center gap-2 bg-red-500/20 text-red-400 px-4 py-2.5 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              <IconTrash size={18} />
              Delete
            </button>

          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Vibe"
        showCloseButton={false}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <IconAlertCircle size={24} className="text-red-400" />
            </div>
            <p className="text-gruvbox-dark-fg1 flex-1">
              Are you sure you want to delete "{vibe.itemName}"? This action cannot be
              undone.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleDeleteConfirm}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-all"
            >
              Delete Vibe
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-6 bg-gruvbox-dark-bg3 text-gruvbox-dark-fg1 py-3 rounded-lg font-semibold hover:bg-gruvbox-dark-bg2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Moderate Confirmation Modal */}
      <Modal
        opened={showModerateConfirm}
        onClose={() => setShowModerateConfirm(false)}
        title={`${moderateAction === "approve" ? "Approve" : "Reject"} Vibe`}
        showCloseButton={false}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 ${
                moderateAction === "approve"
                  ? "bg-green-500/20"
                  : "bg-yellow-500/20"
              } rounded-lg`}
            >
              <IconAlertCircle
                size={24}
                className={
                  moderateAction === "approve" ? "text-green-400" : "text-yellow-400"
                }
              />
            </div>
            <p className="text-gruvbox-dark-fg1 flex-1">
              Are you sure you want to {moderateAction} "{vibe.itemName}"?
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleModerateConfirm}
              className={`flex-1 ${
                moderateAction === "approve"
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-yellow-500 hover:bg-yellow-600"
              } text-white py-3 rounded-lg font-semibold transition-all`}
            >
              {moderateAction === "approve" ? "Approve" : "Reject"} Vibe
            </button>
            <button
              onClick={() => setShowModerateConfirm(false)}
              className="px-6 bg-gruvbox-dark-bg3 text-gruvbox-dark-fg1 py-3 rounded-lg font-semibold hover:bg-gruvbox-dark-bg2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Archive Confirmation Modal */}
      <Modal
        opened={showArchiveConfirm}
        onClose={() => setShowArchiveConfirm(false)}
        title="Archive Vibe"
        showCloseButton={false}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gruvbox-dark-bg3 rounded-lg">
              <IconAlertCircle size={24} className="text-gruvbox-dark-fg2" />
            </div>
            <p className="text-gruvbox-dark-fg1 flex-1">
              Are you sure you want to archive "{vibe.itemName}"? The vibe will be hidden from the public feed but can be restored later.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleArchiveConfirm}
              className="flex-1 bg-gruvbox-dark-bg3 hover:bg-gruvbox-dark-bg2 text-gruvbox-dark-fg0 py-3 rounded-lg font-semibold transition-all"
            >
              Archive Vibe
            </button>
            <button
              onClick={() => setShowArchiveConfirm(false)}
              className="px-6 bg-gruvbox-dark-bg2 text-gruvbox-dark-fg1 py-3 rounded-lg font-semibold hover:bg-gruvbox-dark-bg3 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Unarchive Confirmation Modal */}
      <Modal
        opened={showUnarchiveConfirm}
        onClose={() => setShowUnarchiveConfirm(false)}
        title="Unarchive Vibe"
        showCloseButton={false}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gruvbox-blue/20 rounded-lg">
              <IconAlertCircle size={24} className="text-gruvbox-blue" />
            </div>
            <p className="text-gruvbox-dark-fg1 flex-1">
              Are you sure you want to unarchive "{vibe.itemName}"? The vibe will be made public again with a new 24-hour expiry.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleUnarchiveConfirm}
              className="flex-1 bg-gruvbox-blue hover:bg-gruvbox-blue/90 text-white py-3 rounded-lg font-semibold transition-all"
            >
              Unarchive Vibe
            </button>
            <button
              onClick={() => setShowUnarchiveConfirm(false)}
              className="px-6 bg-gruvbox-dark-bg3 text-gruvbox-dark-fg1 py-3 rounded-lg font-semibold hover:bg-gruvbox-dark-bg2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default function ShowVibesSection() {
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedVibe, setSelectedVibe] = useState<Vibe | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    sold: 0,
    archived: 0,
  });

  // Fetch vibes
  const fetchVibes = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const offset = (page - 1) * itemsPerPage;
      const params = new URLSearchParams({
        status: statusFilter,
        sortBy,
        limit: itemsPerPage.toString(),
        offset: offset.toString(),
      });

      const response = await fetch(`${API}/admin/vibes?${params}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        setVibes(data.vibes || []);
        setTotalPages(Math.ceil((data.totalCount || 0) / itemsPerPage));
        setCurrentPage(page);
        // Use stats from API if available
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        setError(data.message || "Failed to fetch vibes");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch vibes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVibes(1);
  }, [statusFilter, sortBy]);

  // Filter vibes by search term
  const filteredVibes = useMemo(() => {
    return vibes.filter(
      (v) =>
        v.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.user?.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vibes, searchTerm]);

  // Stats are now provided by the API, but keep fallback calculation
  useEffect(() => {
    if (vibes.length > 0 && stats.total === 0) {
    const total = vibes.length;
    const pending = vibes.filter((v) => v.status === "pending").length;
    const approved = vibes.filter((v) => v.status === "approved").length;
    const rejected = vibes.filter((v) => v.status === "rejected").length;
    const sold = vibes.filter((v) => v.status === "sold").length;
    const archived = vibes.filter((v) => v.status === "archived").length;

    setStats({ total, pending, approved, rejected, sold, archived });
  }
}, [vibes, stats.total]);

  // View vibe details
  const viewVibeDetails = async (vibeId: string) => {
    try {
      const response = await fetch(`${API}/admin/vibes/${vibeId}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        setSelectedVibe(data.vibe);
        setModalOpen(true);
      } else {
        setError("Failed to fetch vibe details");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  // Delete vibe
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API}/vibes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setSuccess("Vibe deleted successfully!");
        setModalOpen(false);
        fetchVibes(currentPage);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to delete vibe");
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete vibe");
    }
  };

  // Moderate vibe
  const handleModerate = async (id: string, action: "approve" | "reject") => {
    try {
      const response = await fetch(`${API}/vibes/${id}/moderate`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        setSuccess(`Vibe ${action}d successfully!`);
        setModalOpen(false);
        fetchVibes(currentPage);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.message || `Failed to ${action} vibe`);
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${action} vibe`);
    }
  };

  // Archive vibe
  const handleArchive = async (id: string) => {
    try {
      const response = await fetch(`${API}/vibes/${id}/archive`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setSuccess("Vibe archived successfully!");
        setModalOpen(false);
        fetchVibes(currentPage);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to archive vibe");
      }
    } catch (err: any) {
      setError(err.message || "Failed to archive vibe");
    }
  };

  // Unarchive vibe
  const handleUnarchive = async (id: string) => {
    try {
      const response = await fetch(`${API}/vibes/${id}/unarchive`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setSuccess("Vibe unarchived successfully!");
        setModalOpen(false);
        fetchVibes(currentPage);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to unarchive vibe");
      }
    } catch (err: any) {
      setError(err.message || "Failed to unarchive vibe");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "sold":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "archived":
        return "bg-gruvbox-dark-bg3 text-gruvbox-dark-fg2 border-gruvbox-dark-bg3";
      default:
        return "bg-gruvbox-dark-bg3 text-gruvbox-dark-fg2 border-gruvbox-dark-bg3";
    }
  };

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
          <div className="p-2 bg-gradient-to-br from-gruvbox-orange to-gruvbox-yellow rounded-lg">
            <IconPhoto size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gruvbox-dark-fg0">
              Vibe Management
            </h2>
            <p className="text-sm text-gruvbox-dark-fg2">
              View and manage all vibes
            </p>
          </div>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-gruvbox-dark-bg2 hover:bg-gruvbox-dark-bg3 text-gruvbox-orange rounded-lg transition-colors"
          onClick={() => fetchVibes(currentPage)}
        >
          <IconRefresh size={18} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard
          icon={<IconPhoto size={24} className="text-gruvbox-blue-dark" />}
          label="Total Vibes"
          value={stats.total}
          color="gruvbox-blue"
        />
        <StatCard
          icon={<IconClock size={24} className="text-yellow-400" />}
          label="Pending"
          value={stats.pending}
          color="yellow-500"
        />
        <StatCard
          icon={<IconCheck size={24} className="text-green-400" />}
          label="Approved"
          value={stats.approved}
          color="green-500"
        />
        <StatCard
          icon={<IconX size={24} className="text-red-400" />}
          label="Rejected"
          value={stats.rejected}
          color="red-500"
        />
        <StatCard
          icon={<IconCurrencyDollar size={24} className="text-blue-400" />}
          label="Sold"
          value={stats.sold}
          color="blue-500"
        />
        <StatCard
          icon={<IconClock size={24} className="text-gruvbox-dark-fg3" />}
          label="Archived"
          value={stats.archived}
          color="gruvbox-dark-bg3"
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
            placeholder="Search by name, category, or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="bg-gruvbox-dark-bg2 border border-gruvbox-dark-bg3 rounded-lg px-4 py-2.5 text-gruvbox-dark-fg1 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">⏳ Pending</option>
          <option value="approved">✅ Approved</option>
          <option value="rejected">❌ Rejected</option>
          <option value="sold">💰 Sold</option>
          <option value="archived">📦 Archived</option>
        </select>
        <select
          className="bg-gruvbox-dark-bg2 border border-gruvbox-dark-bg3 rounded-lg px-4 py-2.5 text-gruvbox-dark-fg1 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="likes">Most Liked</option>
          <option value="views">Most Viewed</option>
        </select>
      </div>

      {/* Vibes Grid */}
      {filteredVibes.length === 0 ? (
        <div className="text-center py-12 bg-gruvbox-dark-bg1 rounded-lg border border-gruvbox-dark-bg3">
          <IconPhoto size={48} className="mx-auto mb-3 text-gruvbox-dark-fg3" />
          <p className="text-gruvbox-dark-fg2">No vibes found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            <AnimatePresence>
              {filteredVibes.map((vibe) => (
                <motion.div
                  key={vibe.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg3 rounded-lg overflow-hidden hover:border-gruvbox-orange/50 transition-all group cursor-pointer"
                  onClick={() => viewVibeDetails(vibe.id)}
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gruvbox-dark-bg2">
                    {vibe.mediaFiles && vibe.mediaFiles.length > 0 ? (
                      <Image
                        src={vibe.mediaFiles[0].url}
                        alt={vibe.itemName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IconPhoto
                          size={48}
                          className="text-gruvbox-dark-fg3"
                        />
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          vibe.status
                        )}`}
                      >
                        {vibe.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gruvbox-dark-fg0 line-clamp-1">
                        {vibe.itemName}
                      </h3>
                      <span className="text-lg font-bold text-gruvbox-orange whitespace-nowrap ml-2">
                        ${vibe.price}
                      </span>
                    </div>

                    <p className="text-xs text-gruvbox-dark-fg3 mb-3">
                      by @{vibe.user?.username || "Unknown"}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-gruvbox-dark-fg3 mb-3">
                      <span className="px-2 py-1 bg-gruvbox-dark-bg2 rounded">
                        {vibe.category}
                      </span>
                      <span className="px-2 py-1 bg-gruvbox-dark-bg2 rounded">
                        {vibe.condition}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-gruvbox-dark-fg3 pt-3 border-t border-gruvbox-dark-bg3">
                      <div className="flex items-center gap-1">
                        <IconEye size={14} />
                        <span>{vibe.views || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IconHeart size={14} />
                        <span>{vibe.likesCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IconMessageCircle size={14} />
                        <span>{vibe.commentsCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                className="px-4 py-2 bg-gruvbox-dark-bg2 text-gruvbox-dark-fg1 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gruvbox-dark-bg3 transition-colors"
                disabled={currentPage === 1}
                onClick={() => fetchVibes(currentPage - 1)}
              >
                Previous
              </button>
              <span className="text-sm text-gruvbox-dark-fg2 px-4">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="px-4 py-2 bg-gruvbox-dark-bg2 text-gruvbox-dark-fg1 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gruvbox-dark-bg3 transition-colors"
                disabled={currentPage === totalPages}
                onClick={() => fetchVibes(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Vibe Detail Modal */}
      <VibeDetailModal
        vibe={selectedVibe}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedVibe(null);
        }}
        onDelete={handleDelete}
        onModerate={handleModerate}
        onArchive={handleArchive}
        onUnarchive={handleUnarchive}
      />

      {/* Success/Error Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2 shadow-lg max-w-md"
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
            className="fixed bottom-4 right-4 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2 shadow-lg max-w-md"
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