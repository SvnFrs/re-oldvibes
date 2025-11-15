"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  IconPhoto,
  IconRefresh,
  IconSearch,
  IconPlus,
  IconEye,
  IconEyeOff,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconClock,
  IconExternalLink,
  IconCalendar,
  IconSortAscending,
  IconSortDescending,
  IconFilter,
} from "@tabler/icons-react";
import Modal from "@/app/_components/reusable/modal";
import { API } from "@/app/_libs/api";
import { BannerItem, BannerInputForm } from "@/app/_libs/types";
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

// Banner Detail Modal Component
function BannerDetailModal({
  banner,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  banner: BannerItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (banner: BannerItem) => void;
  onDelete: (id: string) => void;
  onToggleActive: (banner: BannerItem) => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);

  if (!banner) return null;

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(banner.id);
    setShowDeleteConfirm(false);
  };

  const handleToggleClick = () => {
    setShowToggleConfirm(true);
  };

  const handleToggleConfirm = () => {
    onToggleActive(banner);
    setShowToggleConfirm(false);
  };

  return (
    <>
      <Modal opened={isOpen} onClose={onClose} title="Banner Details" className="!max-w-3xl">
        <div className="space-y-6">
          {/* Banner Image */}
          <div className="relative aspect-[2/1] rounded-lg overflow-hidden bg-gruvbox-dark-bg2">
            <Image
              src={banner.imageUrl}
              alt={banner.title}
              fill
              className="object-cover"
            />
            {!banner.isActive && (
              <div className="absolute top-2 right-2 bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <IconEyeOff size={14} />
                Inactive
              </div>
            )}
          </div>

          {/* Banner Info */}
          <div className="bg-gruvbox-dark-bg2 rounded-lg p-4">
            <h3 className="text-xl font-bold text-gruvbox-dark-fg0 mb-2">
              {banner.title}
            </h3>
            {banner.description && (
              <p className="text-sm text-gruvbox-dark-fg2 mb-4">
                {banner.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gruvbox-dark-fg3">Status:</span>
                <span
                  className={`ml-2 font-semibold ${
                    banner.isActive ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {banner.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div>
                <span className="text-gruvbox-dark-fg3">Display Order:</span>
                <span className="ml-2 font-semibold text-gruvbox-dark-fg1">
                  {banner.displayOrder}
                </span>
              </div>
            </div>
          </div>

          {/* Link URL */}
          {banner.linkUrl && (
            <div className="bg-gruvbox-dark-bg2 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gruvbox-dark-fg2 mb-2 flex items-center gap-2">
                <IconExternalLink size={16} />
                Link URL
              </h4>
              <a
                href={banner.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gruvbox-blue hover:underline break-all"
              >
                {banner.linkUrl}
              </a>
            </div>
          )}

          {/* Date Range */}
          {(banner.startDate || banner.endDate) && (
            <div className="bg-gruvbox-dark-bg2 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gruvbox-dark-fg2 mb-3 flex items-center gap-2">
                <IconCalendar size={16} />
                Schedule
              </h4>
              <div className="space-y-2 text-sm">
                {banner.startDate && (
                  <div className="flex items-center gap-2">
                    <span className="text-gruvbox-dark-fg3">Start:</span>
                    <span className="text-gruvbox-dark-fg1">
                      {new Date(banner.startDate).toLocaleString()}
                    </span>
                  </div>
                )}
                {banner.endDate && (
                  <div className="flex items-center gap-2">
                    <span className="text-gruvbox-dark-fg3">End:</span>
                    <span className="text-gruvbox-dark-fg1">
                      {new Date(banner.endDate).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex items-center gap-6 text-xs text-gruvbox-dark-fg3 pt-4 border-t border-gruvbox-dark-bg3">
            <div className="flex items-center gap-1">
              <IconClock size={14} />
              <span>
                Created: {new Date(banner.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <IconClock size={14} />
              <span>
                Updated: {new Date(banner.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gruvbox-dark-bg3">
            <button
              onClick={() => onEdit(banner)}
              className="flex items-center justify-center gap-2 bg-gruvbox-blue text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <IconEdit size={18} />
              Edit
            </button>
            <button
              onClick={handleToggleClick}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
                banner.isActive
                  ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                  : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
              }`}
            >
              {banner.isActive ? <IconEyeOff size={18} /> : <IconEye size={18} />}
              {banner.isActive ? "Deactivate" : "Activate"}
            </button>
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
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Banner"
        message={`Are you sure you want to delete "${banner.title}"? This action cannot be undone.`}
        confirmText="Delete Banner"
        type="danger"
      />

      {/* Toggle Active Confirmation Modal */}
      <ConfirmationModal
        isOpen={showToggleConfirm}
        onClose={() => setShowToggleConfirm(false)}
        onConfirm={handleToggleConfirm}
        title={banner.isActive ? "Deactivate Banner" : "Activate Banner"}
        message={`Are you sure you want to ${
          banner.isActive ? "deactivate" : "activate"
        } "${banner.title}"?`}
        confirmText={banner.isActive ? "Deactivate" : "Activate"}
        type="warning"
      />
    </>
  );
}

// Banner Form Modal Component
function BannerFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingBanner,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData, isEditing: boolean) => void;
  editingBanner: BannerItem | null;
}) {
  const [formData, setFormData] = useState<BannerInputForm>({
    title: "",
    description: "",
    imageUrl: "",
    displayOrder: 0,
    isActive: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingBanner) {
      setFormData({
        title: editingBanner.title,
        description: editingBanner.description || "",
        imageUrl: editingBanner.imageUrl,
        displayOrder: editingBanner.displayOrder,
        isActive: editingBanner.isActive,
        startDate: editingBanner.startDate,
        endDate: editingBanner.endDate,
      });
      setImagePreview(editingBanner.imageUrl);
    } else {
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        displayOrder: 0,
        isActive: true,
      });
      setImagePreview("");
    }
    setImageFile(null);
    setErrors({});
  }, [editingBanner, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 200) {
      newErrors.title = "Title must be 200 characters or less";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be 500 characters or less";
    }

    if (!editingBanner && !imageFile) {
      newErrors.image = "Image is required";
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start >= end) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = new FormData();
    if (imageFile) {
      data.append("image", imageFile);
    }
    data.append("title", formData.title);
    if (formData.description) {
      data.append("description", formData.description);
    }
    data.append("displayOrder", formData.displayOrder.toString());
    data.append("isActive", formData.isActive.toString());
    if (formData.linkUrl) {
      data.append("linkUrl", formData.linkUrl);
    }
    if (formData.startDate) {
      data.append("startDate", new Date(formData.startDate).toISOString());
    }
    if (formData.endDate) {
      data.append("endDate", new Date(formData.endDate).toISOString());
    }

    onSubmit(data, !!editingBanner);
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={editingBanner ? "Edit Banner" : "Create New Banner"}
      className="!max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gruvbox-dark-fg1 mb-2">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            className={`w-full bg-gruvbox-dark-bg2 border ${
              errors.title ? "border-red-500" : "border-gruvbox-dark-bg3"
            } rounded-lg px-4 py-2.5 text-gruvbox-dark-fg0 placeholder-gruvbox-dark-fg3 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50`}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            maxLength={200}
            placeholder="Enter banner title"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-400">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gruvbox-dark-fg1 mb-2">
            Description
          </label>
          <textarea
            className={`w-full bg-gruvbox-dark-bg2 border ${
              errors.description ? "border-red-500" : "border-gruvbox-dark-bg3"
            } rounded-lg px-4 py-2.5 text-gruvbox-dark-fg0 placeholder-gruvbox-dark-fg3 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50 resize-none`}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            maxLength={500}
            rows={3}
            placeholder="Optional description"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-400">{errors.description}</p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-gruvbox-dark-fg1 mb-2">
            Banner Image <span className="text-red-400">*</span>
          </label>
          <input
            type="file"
            accept="image/*"
            className={`w-full bg-gruvbox-dark-bg2 border ${
              errors.image ? "border-red-500" : "border-gruvbox-dark-bg3"
            } rounded-lg px-4 py-2.5 text-gruvbox-dark-fg0 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gruvbox-orange file:text-white hover:file:bg-orange-600 file:cursor-pointer cursor-pointer`}
            onChange={handleImageChange}
          />
          {errors.image && (
            <p className="mt-1 text-xs text-red-400">{errors.image}</p>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <div className="mt-3 relative aspect-[2/1] rounded-lg overflow-hidden bg-gruvbox-dark-bg2 border border-gruvbox-dark-bg3">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          )}

          {editingBanner && !imageFile && (
            <p className="mt-2 text-xs text-gruvbox-dark-fg3">
              💡 Leave empty to keep current image, or upload a new one to replace it.
            </p>
          )}
        </div>

        {/* Link URL */}
        <div>
          <label className="block text-sm font-semibold text-gruvbox-dark-fg1 mb-2">
            Link URL (Optional)
          </label>
          <input
            type="url"
            className="w-full bg-gruvbox-dark-bg2 border border-gruvbox-dark-bg3 rounded-lg px-4 py-2.5 text-gruvbox-dark-fg0 placeholder-gruvbox-dark-fg3 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
            value={formData.linkUrl || ""}
            onChange={(e) =>
              setFormData({ ...formData, linkUrl: e.target.value })
            }
            placeholder="https://example.com"
          />
        </div>

        {/* Display Order and Active Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gruvbox-dark-fg1 mb-2">
              Display Order
            </label>
            <input
              type="number"
              min="0"
              className="w-full bg-gruvbox-dark-bg2 border border-gruvbox-dark-bg3 rounded-lg px-4 py-2.5 text-gruvbox-dark-fg0 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
              value={formData.displayOrder}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  displayOrder: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gruvbox-dark-fg1 mb-2">
              Status
            </label>
            <select
              className="w-full bg-gruvbox-dark-bg2 border border-gruvbox-dark-bg3 rounded-lg px-4 py-2.5 text-gruvbox-dark-fg0 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
              value={formData.isActive ? "true" : "false"}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.value === "true" })
              }
            >
              <option value="true">✅ Active</option>
              <option value="false">❌ Inactive</option>
            </select>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gruvbox-dark-fg1 mb-2">
              Start Date (Optional)
            </label>
            <input
              type="datetime-local"
              className="w-full bg-gruvbox-dark-bg2 border border-gruvbox-dark-bg3 rounded-lg px-4 py-2.5 text-gruvbox-dark-fg0 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
              value={
                formData.startDate
                  ? new Date(formData.startDate).toISOString().slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  startDate: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : undefined,
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gruvbox-dark-fg1 mb-2">
              End Date (Optional)
            </label>
            <input
              type="datetime-local"
              className={`w-full bg-gruvbox-dark-bg2 border ${
                errors.endDate ? "border-red-500" : "border-gruvbox-dark-bg3"
              } rounded-lg px-4 py-2.5 text-gruvbox-dark-fg0 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50`}
              value={
                formData.endDate
                  ? new Date(formData.endDate).toISOString().slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  endDate: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : undefined,
                })
              }
            />
            {errors.endDate && (
              <p className="mt-1 text-xs text-red-400">{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-gruvbox-orange to-gruvbox-yellow text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            {editingBanner ? "Update Banner" : "Create Banner"}
          </button>
          <button
            type="button"
            className="px-6 bg-gruvbox-dark-bg3 text-gruvbox-dark-fg1 py-3 rounded-lg font-semibold hover:bg-gruvbox-dark-bg2 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Main BannerSection Component
export default function BannerSection() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedBanner, setSelectedBanner] = useState<BannerItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [isActiveFilter, setIsActiveFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("displayOrder");

  // Fetch banners
  const fetchBanners = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (isActiveFilter !== "all") {
        params.append("isActive", isActiveFilter);
      }
      if (searchTerm) {
        params.append("search", searchTerm);
      }
      params.append("limit", "50");
      params.append("offset", "0");

      const res = await fetch(`${API}/banner?${params}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setBanners(data.banners || []);
      } else {
        setError(data.message || "Failed to fetch banners");
        setBanners([]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch banners");
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [isActiveFilter]);

  // Create banner
  const handleCreate = async (formData: FormData) => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API}/banner`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Banner created successfully!");
        setFormModalOpen(false);
        fetchBanners();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to create banner");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create banner");
    }
  };

  // Update banner
  const handleUpdate = async (formData: FormData) => {
    if (!editingBanner) return;
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API}/banner/${editingBanner.id}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Banner updated successfully!");
        setFormModalOpen(false);
        setEditingBanner(null);
        fetchBanners();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to update banner");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update banner");
    }
  };

  // Delete banner
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API}/banner/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Banner deleted successfully!");
        setModalOpen(false);
        fetchBanners();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to delete banner");
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete banner");
    }
  };

  // Toggle active status
  const handleToggleActive = async (banner: BannerItem) => {
    setError("");
    try {
      const formData = new FormData();
      formData.append("isActive", (!banner.isActive).toString());

      const res = await fetch(`${API}/banner/${banner.id}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(
          `Banner ${banner.isActive ? "deactivated" : "activated"} successfully!`
        );
        setModalOpen(false);
        fetchBanners();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to update banner");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update banner");
    }
  };

  // Submit handler for form
  const handleFormSubmit = (formData: FormData, isEditing: boolean) => {
    if (isEditing) {
      handleUpdate(formData);
    } else {
      handleCreate(formData);
    }
  };

  // Filter and sort banners
  const filteredBanners = useMemo(() => {
    let filtered = banners.filter((banner) => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        banner.title.toLowerCase().includes(search) ||
        (banner.description && banner.description.toLowerCase().includes(search))
      );
    });

    // Sort banners
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "displayOrder":
          return a.displayOrder - b.displayOrder;
        case "title":
          return a.title.localeCompare(b.title);
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [banners, searchTerm, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = banners.length;
    const active = banners.filter((b) => b.isActive).length;
    const inactive = banners.filter((b) => !b.isActive).length;
    const scheduled = banners.filter(
      (b) => b.startDate && new Date(b.startDate) > new Date()
    ).length;

    return { total, active, inactive, scheduled };
  }, [banners]);

  if (loading && banners.length === 0) {
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
          <div className="p-2 bg-gradient-to-br from-gruvbox-yellow to-gruvbox-orange rounded-lg">
            <IconPhoto size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gruvbox-dark-fg0">
              Banner Management
            </h2>
            <p className="text-sm text-gruvbox-dark-fg2">
              Manage homepage banners and promotions
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gruvbox-dark-bg2 hover:bg-gruvbox-dark-bg3 text-gruvbox-orange rounded-lg transition-colors"
            onClick={fetchBanners}
          >
            <IconRefresh size={18} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gruvbox-orange to-gruvbox-yellow text-white rounded-lg hover:shadow-lg transition-all"
            onClick={() => {
              setEditingBanner(null);
              setFormModalOpen(true);
            }}
          >
            <IconPlus size={18} />
            <span>Add Banner</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<IconPhoto size={24} className="text-gruvbox-blue-dark" />}
          label="Total Banners"
          value={stats.total}
          color="gruvbox-blue"
        />
        <StatCard
          icon={<IconEye size={24} className="text-green-400" />}
          label="Active"
          value={stats.active}
          color="green-500"
        />
        <StatCard
          icon={<IconEyeOff size={24} className="text-red-400" />}
          label="Inactive"
          value={stats.inactive}
          color="red-500"
        />
        <StatCard
          icon={<IconCalendar size={24} className="text-gruvbox-purple-dark" />}
          label="Scheduled"
          value={stats.scheduled}
          color="gruvbox-purple"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <IconSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gruvbox-dark-fg3"
          />
          <input
            className="w-full bg-gruvbox-dark-bg2 border border-gruvbox-dark-bg3 rounded-lg pl-10 pr-4 py-2.5 text-gruvbox-dark-fg1 placeholder-gruvbox-dark-fg3 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
            placeholder="Search banners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="bg-gruvbox-dark-bg2 border border-gruvbox-dark-bg3 rounded-lg px-4 py-2.5 text-gruvbox-dark-fg1 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
          value={isActiveFilter}
          onChange={(e) => setIsActiveFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="true">✅ Active Only</option>
          <option value="false">❌ Inactive Only</option>
        </select>
        <select
          className="bg-gruvbox-dark-bg2 border border-gruvbox-dark-bg3 rounded-lg px-4 py-2.5 text-gruvbox-dark-fg1 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="displayOrder">Display Order</option>
          <option value="title">Title (A-Z)</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Banners Grid */}
      {filteredBanners.length === 0 ? (
        <div className="text-center py-12 bg-gruvbox-dark-bg1 rounded-lg border border-gruvbox-dark-bg3">
          <IconPhoto size={48} className="mx-auto mb-3 text-gruvbox-dark-fg3" />
          <p className="text-gruvbox-dark-fg2">No banners found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredBanners.map((banner) => (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg3 rounded-lg overflow-hidden hover:border-gruvbox-orange/50 transition-all group cursor-pointer ${
                  !banner.isActive ? "opacity-60" : ""
                }`}
                onClick={() => {
                  setSelectedBanner(banner);
                  setModalOpen(true);
                }}
              >
                {/* Banner Image */}
                <div className="relative aspect-[2/1] bg-gruvbox-dark-bg2 overflow-hidden">
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {!banner.isActive && (
                    <div className="absolute top-2 right-2 bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <IconEyeOff size={14} />
                      Inactive
                    </div>
                  )}
                  {banner.isActive && (
                    <div className="absolute top-2 left-2 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <IconEye size={14} />
                      Active
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    Order: {banner.displayOrder}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gruvbox-dark-fg0 mb-2 line-clamp-1">
                    {banner.title}
                  </h3>
                  {banner.description && (
                    <p className="text-sm text-gruvbox-dark-fg2 mb-3 line-clamp-2">
                      {banner.description}
                    </p>
                  )}

                  {/* Link */}
                  {banner.linkUrl && (
                    <div className="flex items-center gap-1 text-xs text-gruvbox-blue mb-3">
                      <IconExternalLink size={14} />
                      <span className="truncate">{banner.linkUrl}</span>
                    </div>
                  )}

                  {/* Date Info */}
                  {(banner.startDate || banner.endDate) && (
                    <div className="text-xs text-gruvbox-dark-fg3 mb-3 space-y-1">
                      {banner.startDate && (
                        <div className="flex items-center gap-1">
                          <IconClock size={12} />
                          <span>
                            Starts: {new Date(banner.startDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {banner.endDate && (
                        <div className="flex items-center gap-1">
                          <IconClock size={12} />
                          <span>
                            Ends: {new Date(banner.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-gruvbox-dark-bg3">
                    <button
                      className="flex-1 flex items-center justify-center gap-1 bg-gruvbox-blue text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingBanner(banner);
                        setFormModalOpen(true);
                      }}
                    >
                      <IconEdit size={16} /> Edit
                    </button>
                    <button
                      className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                        banner.isActive
                          ? "bg-gruvbox-dark-bg3 text-gruvbox-dark-fg1 hover:bg-gruvbox-dark-bg2"
                          : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleActive(banner);
                      }}
                      title={banner.isActive ? "Deactivate" : "Activate"}
                    >
                      {banner.isActive ? (
                        <IconEyeOff size={16} />
                      ) : (
                        <IconEye size={16} />
                      )}
                    </button>
                    <button
                      className="flex items-center justify-center gap-1 bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            `Are you sure you want to delete "${banner.title}"?`
                          )
                        ) {
                          handleDelete(banner.id);
                        }
                      }}
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Banner Detail Modal */}
      <BannerDetailModal
        banner={selectedBanner}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedBanner(null);
        }}
        onEdit={(banner) => {
          setEditingBanner(banner);
          setModalOpen(false);
          setFormModalOpen(true);
        }}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

      {/* Banner Form Modal */}
      <BannerFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingBanner(null);
        }}
        onSubmit={handleFormSubmit}
        editingBanner={editingBanner}
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
