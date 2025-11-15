"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  IconStars,
  IconRefresh,
  IconSearch,
  IconEye,
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
  IconExternalLink,
  IconFilter,
  IconChevronRight,
  IconPhoto,
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

// Moderation Action Modal Component
function ModerationModal({
  vibe,
  isOpen,
  onClose,
  onModerate,
}: {
  vibe: Vibe | null;
  isOpen: boolean;
  onClose: () => void;
  onModerate: (id: string, action: "approve" | "reject", notes?: string) => void;
}) {
  const [action, setAction] = useState<"approve" | "reject">("approve");
  const [notes, setNotes] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  if (!vibe) return null;

  const handleSubmit = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    onModerate(vibe.id, action, notes);
    setShowConfirm(false);
    setNotes("");
  };

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "new":
        return "bg-green-500/20 text-green-400";
      case "like-new":
        return "bg-blue-500/20 text-blue-400";
      case "good":
        return "bg-yellow-500/20 text-yellow-400";
      case "fair":
        return "bg-orange-500/20 text-orange-400";
      case "poor":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gruvbox-dark-bg3 text-gruvbox-dark-fg2";
    }
  };

  return (
    <>
      {/* Main Review Modal with Larger Width */}
      <Modal
        opened={isOpen}
        onClose={onClose}
        title="Review Vibe"
        className="!max-w-4xl" // Increased from default lg to 4xl
      >
        <div className="space-y-6 max-h-[calc(90vh-8rem)] overflow-y-auto">
          {/* Vibe Header */}
          <div className="bg-gruvbox-dark-bg2 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gruvbox-dark-fg0 mb-1">
                  {vibe.itemName}
                </h3>
                <p className="text-sm text-gruvbox-dark-fg3">
                  by @{vibe.user?.username || "Unknown"}
                </p>
              </div>
              <span className="text-2xl font-bold text-gruvbox-orange">
                ${vibe.price}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-gruvbox-dark-bg3 text-gruvbox-dark-fg1 rounded-full text-xs">
                {vibe.category}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getConditionColor(
                  vibe.condition
                )}`}
              >
                {vibe.condition}
              </span>
              {vibe.location && (
                <span className="px-3 py-1 bg-gruvbox-dark-bg3 text-gruvbox-dark-fg1 rounded-full text-xs flex items-center gap-1">
                  <IconMapPin size={12} />
                  {vibe.location}
                </span>
              )}
            </div>
          </div>

          {/* Media Gallery - Now with 3 columns for wider modal */}
          {vibe.mediaFiles && vibe.mediaFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gruvbox-dark-fg2 flex items-center gap-2">
                <IconPhoto size={16} />
                Media Files ({vibe.mediaFiles.length})
              </h4>
              <div className="grid grid-cols-3 gap-3"> {/* Changed from 2 to 3 columns */}
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

          {/* Description and Tags in Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Description */}
            <div className="bg-gruvbox-dark-bg2 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gruvbox-dark-fg2 mb-2 flex items-center gap-2">
                <IconMessageCircle size={16} />
                Description
              </h4>
              <p className="text-sm text-gruvbox-dark-fg1 leading-relaxed">
                {vibe.description || "No description provided"}
              </p>
            </div>

            {/* Tags */}
            {vibe.tags && vibe.tags.length > 0 && (
              <div className="bg-gruvbox-dark-bg2 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gruvbox-dark-fg2 mb-2 flex items-center gap-2">
                  <IconTag size={16} />
                  Tags
                </h4>
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
          </div>

          {/* Seller Information */}
          <div className="bg-gruvbox-dark-bg2 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gruvbox-dark-fg2 mb-3 flex items-center gap-2">
              <IconUser size={16} />
              Seller Information
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gruvbox-orange to-gruvbox-red flex items-center justify-center text-white font-bold text-lg">
                {vibe.user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-semibold text-gruvbox-dark-fg0">
                  {vibe.user?.name || "Unknown User"}
                </p>
                <p className="text-sm text-gruvbox-dark-fg3">
                  @{vibe.user?.username || "unknown"}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex items-center gap-6 text-xs text-gruvbox-dark-fg3 pt-4 border-t border-gruvbox-dark-bg3">
            <div className="flex items-center gap-1">
              <IconClock size={14} />
              <span>
                Submitted: {vibe.createdAt ? new Date(vibe.createdAt).toLocaleString() : "N/A"}
              </span>
            </div>
          </div>

          {/* Moderation Actions */}
          <div className="bg-gruvbox-dark-bg2 rounded-lg p-4 space-y-4">
            <h4 className="text-sm font-semibold text-gruvbox-dark-fg2">
              Moderation Decision
            </h4>

            {/* Action Selection */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAction("approve")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  action === "approve"
                    ? "border-green-500 bg-green-500/20"
                    : "border-gruvbox-dark-bg3 hover:border-green-500/50"
                }`}
              >
                <IconCheck
                  size={24}
                  className={`mx-auto mb-2 ${
                    action === "approve" ? "text-green-400" : "text-gruvbox-dark-fg3"
                  }`}
                />
                <p
                  className={`text-sm font-semibold ${
                    action === "approve"
                      ? "text-green-400"
                      : "text-gruvbox-dark-fg2"
                  }`}
                >
                  Approve
                </p>
              </button>
              <button
                onClick={() => setAction("reject")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  action === "reject"
                    ? "border-red-500 bg-red-500/20"
                    : "border-gruvbox-dark-bg3 hover:border-red-500/50"
                }`}
              >
                <IconX
                  size={24}
                  className={`mx-auto mb-2 ${
                    action === "reject" ? "text-red-400" : "text-gruvbox-dark-fg3"
                  }`}
                />
                <p
                  className={`text-sm font-semibold ${
                    action === "reject" ? "text-red-400" : "text-gruvbox-dark-fg2"
                  }`}
                >
                  Reject
                </p>
              </button>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gruvbox-dark-fg2 mb-2">
                Notes (Optional)
              </label>
              <textarea
                className="w-full bg-gruvbox-dark-bg3 border border-gruvbox-dark-bg3 rounded-lg px-4 py-2.5 text-gruvbox-dark-fg1 placeholder-gruvbox-dark-fg3 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50 resize-none"
                rows={3}
                placeholder={
                  action === "approve"
                    ? "Add any notes about this approval..."
                    : "Explain why this vibe is being rejected..."
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                action === "approve"
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              {action === "approve" ? "Approve Vibe" : "Reject Vibe"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal - Keep standard width */}
      <Modal
        opened={showConfirm}
        onClose={() => setShowConfirm(false)}
        title={`Confirm ${action === "approve" ? "Approval" : "Rejection"}`}
        showCloseButton={false}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 ${
                action === "approve" ? "bg-green-500/20" : "bg-red-500/20"
              } rounded-lg`}
            >
              <IconAlertCircle
                size={24}
                className={action === "approve" ? "text-green-400" : "text-red-400"}
              />
            </div>
            <div className="flex-1">
              <p className="text-gruvbox-dark-fg1 mb-2">
                Are you sure you want to {action} "{vibe.itemName}"?
              </p>
              {notes && (
                <div className="bg-gruvbox-dark-bg2 rounded-lg p-3 mt-2">
                  <p className="text-xs text-gruvbox-dark-fg3 mb-1">Your notes:</p>
                  <p className="text-sm text-gruvbox-dark-fg1">{notes}</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleConfirm}
              className={`flex-1 ${
                action === "approve"
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              } text-white py-3 rounded-lg font-semibold transition-all`}
            >
              Confirm {action === "approve" ? "Approval" : "Rejection"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
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

export default function VibeModerationSection() {
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedVibe, setSelectedVibe] = useState<Vibe | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch pending vibes
  const fetchVibes = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        status: "pending",
        sortBy,
        limit: "50",
        offset: "0",
      });

      const response = await fetch(`${API}/admin/vibes?${params}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        setVibes(data.vibes || []);
      } else {
        setError(data.message || "Failed to fetch pending vibes");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch pending vibes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVibes();
  }, [sortBy]);

  // Filter vibes
  const filteredVibes = useMemo(() => {
    return vibes.filter((v) => {
      const matchesSearch =
        v.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.user?.username.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || v.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [vibes, searchTerm, categoryFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(vibes.map((v) => v.category));
    return Array.from(cats).sort();
  }, [vibes]);

  // Moderate vibe
  const handleModerate = async (
    id: string,
    action: "approve" | "reject",
    notes?: string
  ) => {
    try {
      const response = await fetch(`${API}/vibes/${id}/moderate`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes }),
      });

      if (response.ok) {
        setSuccess(`Vibe ${action}d successfully!`);
        setModalOpen(false);
        fetchVibes();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.message || `Failed to ${action} vibe`);
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${action} vibe`);
    }
  };

  // Quick moderate (no modal)
  const quickModerate = async (
    vibe: Vibe,
    action: "approve" | "reject"
  ) => {
    if (
      !window.confirm(
        `Are you sure you want to ${action} "${vibe.itemName}"?`
      )
    )
      return;

    handleModerate(vibe.id, action);
  };

  if (loading) {
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
            <IconStars size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gruvbox-dark-fg0">
              Vibe Moderation
            </h2>
            <p className="text-sm text-gruvbox-dark-fg2">
              Review and approve pending vibes
            </p>
          </div>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-gruvbox-dark-bg2 hover:bg-gruvbox-dark-bg3 text-gruvbox-orange rounded-lg transition-colors"
          onClick={fetchVibes}
        >
          <IconRefresh size={18} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={<IconClock size={24} className="text-yellow-400" />}
          label="Pending Review"
          value={vibes.length}
          color="yellow-500"
        />
        <StatCard
          icon={<IconUser size={24} className="text-gruvbox-blue-dark" />}
          label="Unique Sellers"
          value={new Set(vibes.map((v) => v.user?.username)).size}
          color="gruvbox-blue"
        />
        <StatCard
          icon={<IconTag size={24} className="text-gruvbox-purple-dark" />}
          label="Categories"
          value={categories.length}
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
            placeholder="Search by name, category, or seller..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="bg-gruvbox-dark-bg2 border border-gruvbox-dark-bg3 rounded-lg px-4 py-2.5 text-gruvbox-dark-fg1 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
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
        </select>
      </div>

      {/* Vibes List */}
      {filteredVibes.length === 0 ? (
        <div className="text-center py-12 bg-gruvbox-dark-bg1 rounded-lg border border-gruvbox-dark-bg3">
          <IconStars size={48} className="mx-auto mb-3 text-gruvbox-dark-fg3" />
          <p className="text-gruvbox-dark-fg2">
            {vibes.length === 0
              ? "No pending vibes to review! 🎉"
              : "No vibes match your filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredVibes.map((vibe) => (
              <motion.div
                key={vibe.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg3 rounded-lg overflow-hidden hover:border-gruvbox-orange/50 transition-all"
              >
                <div className="flex">
                  {/* Image */}
                  <div className="relative w-40 h-40 bg-gruvbox-dark-bg2 flex-shrink-0">
                    {vibe.mediaFiles && vibe.mediaFiles.length > 0 ? (
                      <Image
                        src={vibe.mediaFiles[0].url}
                        alt={vibe.itemName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IconPhoto size={32} className="text-gruvbox-dark-fg3" />
                      </div>
                    )}
                    {vibe.mediaFiles && vibe.mediaFiles.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        +{vibe.mediaFiles.length - 1}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 flex flex-col">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gruvbox-dark-fg0 line-clamp-2">
                          {vibe.itemName}
                        </h3>
                        <span className="text-lg font-bold text-gruvbox-orange whitespace-nowrap ml-2">
                          ${vibe.price}
                        </span>
                      </div>

                      <p className="text-xs text-gruvbox-dark-fg3 mb-2">
                        by @{vibe.user?.username || "Unknown"}
                      </p>

                      <p className="text-sm text-gruvbox-dark-fg2 line-clamp-2 mb-3">
                        {vibe.description || "No description"}
                      </p>

                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <span className="px-2 py-1 bg-gruvbox-dark-bg2 text-gruvbox-dark-fg1 rounded text-xs">
                          {vibe.category}
                        </span>
                        <span className="px-2 py-1 bg-gruvbox-dark-bg2 text-gruvbox-dark-fg1 rounded text-xs">
                          {vibe.condition}
                        </span>
                        {vibe.location && (
                          <span className="px-2 py-1 bg-gruvbox-dark-bg2 text-gruvbox-dark-fg1 rounded text-xs flex items-center gap-1">
                            <IconMapPin size={12} />
                            {vibe.location}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gruvbox-dark-fg3">
                        <IconClock size={12} />
                        <span>
                          {vibe.createdAt
                            ? new Date(vibe.createdAt).toLocaleString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gruvbox-dark-bg3">
                      <button
                        onClick={() => {
                          setSelectedVibe(vibe);
                          setModalOpen(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 bg-gruvbox-blue text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                      >
                        <IconEye size={16} />
                        Review
                      </button>
                      <button
                        onClick={() => quickModerate(vibe, "approve")}
                        className="flex items-center justify-center gap-1 bg-green-500/20 text-green-400 px-3 py-2 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                      >
                        <IconCheck size={16} />
                      </button>
                      <button
                        onClick={() => quickModerate(vibe, "reject")}
                        className="flex items-center justify-center gap-1 bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                      >
                        <IconX size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Moderation Modal */}
      <ModerationModal
        vibe={selectedVibe}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedVibe(null);
        }}
        onModerate={handleModerate}
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
