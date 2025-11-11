"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconPhoto,
  IconEdit,
  IconEye,
  IconCalendar,
  IconTag,
  IconMapPin,
  IconRefresh,
  IconAlertCircle,
  IconX,
} from "@tabler/icons-react";
import { useAuth } from "../../_contexts/AuthContext";
import { getUserVibes } from "../../_apis/common/admin";
import { UpdateVibeDialog } from "./UpdateVibeDialog";
import Cookies from "js-cookie";

interface Vibe {
  id: string;
  itemName: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  tags: string[];
  location?: string;
  status: "pending" | "approved" | "rejected";
  mediaFiles: {
    type: "image" | "video";
    url: string;
    thumbnail?: string;
    _id?: string;
  }[];
  userId: string;
  views?: number;
  likesCount?: number;
  commentsCount?: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export default function MyVibesList() {
  const { user } = useAuth();
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVibe, setSelectedVibe] = useState<Vibe | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const token = Cookies.get("tokenSession");

  const fetchVibes = async () => {
    if (!user?.id || !token) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await getUserVibes(token, user.id);
      // Ensure each vibe has userId
      const vibesWithUserId = (response.vibes || []).map((vibe: Vibe) => ({
        ...vibe,
        userId: vibe.userId || user.id,
      }));
      setVibes(vibesWithUserId);
    } catch (err: any) {
      setError(err.message || "Failed to fetch vibes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchVibes();
    }
  }, [user?.id]);

  const handleEditClick = (vibe: Vibe) => {
    setSelectedVibe(vibe);
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateSuccess = () => {
    fetchVibes(); // Refresh the list after update
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gruvbox-orange"></div>
        <span className="ml-2 text-gruvbox-gray">Đang tải...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
        <IconAlertCircle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  if (vibes.length === 0) {
    return (
      <div className="bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-lg p-8 text-center">
        <IconPhoto size={48} className="mx-auto mb-4 text-gruvbox-gray" />
        <h3 className="text-lg font-semibold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mb-2">
          Chưa có vibe nào
        </h3>
        <p className="text-gruvbox-gray mb-6">
          Bạn chưa tạo vibe nào. Hãy tạo vibe đầu tiên của bạn!
        </p>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 bg-gruvbox-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-gruvbox-orange/90 transition"
        >
          <IconPhoto size={18} />
          Tạo Vibe
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-gruvbox-gray text-sm">
          Bạn có {vibes.length} vibe{vibes.length > 1 ? "s" : ""}
        </p>
        <button
          onClick={fetchVibes}
          className="flex items-center gap-2 text-gruvbox-orange hover:text-gruvbox-orange/80 transition text-sm"
        >
          <IconRefresh size={16} />
          Làm mới
        </button>
      </div>

      <div className="space-y-4">
        {vibes.map((vibe) => (
          <div
            key={vibe.id}
            className="bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-lg overflow-hidden border border-gruvbox-gray/20 hover:border-gruvbox-orange/50 transition-colors"
          >
            <div className="flex gap-4 p-4">
              {/* Media Preview */}
              <div className="flex-shrink-0">
                {vibe.mediaFiles && vibe.mediaFiles.length > 0 ? (
                  <div className="relative w-24 h-24 bg-gruvbox-gray/20 rounded-lg overflow-hidden">
                    {vibe.mediaFiles[0].type === "image" ? (
                      <Image
                        src={vibe.mediaFiles[0].url}
                        alt={vibe.itemName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <video
                        src={vibe.mediaFiles[0].url}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {vibe.mediaFiles.length > 1 && (
                      <div className="absolute top-1 right-1 bg-black/70 text-white px-1.5 py-0.5 rounded text-xs">
                        +{vibe.mediaFiles.length - 1}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gruvbox-gray/20 rounded-lg flex items-center justify-center">
                    <IconPhoto size={32} className="text-gruvbox-gray" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 truncate">
                      {vibe.itemName}
                    </h4>
                    <p className="text-gruvbox-orange font-bold text-sm mt-1">
                      {formatPrice(vibe.price)}
                    </p>
                  </div>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${getStatusColor(
                      vibe.status
                    )}`}
                  >
                    {vibe.status === "approved"
                      ? "Đã duyệt"
                      : vibe.status === "pending"
                      ? "Đang chờ"
                      : "Từ chối"}
                  </span>
                </div>

                <p className="text-gruvbox-gray text-sm mb-2 line-clamp-2">
                  {vibe.description}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-gruvbox-gray mb-2">
                  <div className="flex items-center gap-1">
                    <IconTag size={12} />
                    <span>{vibe.category}</span>
                  </div>
                  <span className="capitalize">{vibe.condition}</span>
                  {vibe.location && (
                    <div className="flex items-center gap-1">
                      <IconMapPin size={12} />
                      <span>{vibe.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <IconCalendar size={12} />
                    <span>
                      {new Date(vibe.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  {vibe.views !== undefined && (
                    <div className="flex items-center gap-1">
                      <IconEye size={12} />
                      <span>{vibe.views} lượt xem</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {vibe.tags && vibe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {vibe.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 text-gruvbox-gray px-2 py-0.5 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                    {vibe.tags.length > 3 && (
                      <span className="text-gruvbox-gray text-xs">
                        +{vibe.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Link
                    href={`/vibes/${vibe.id}`}
                    className="flex items-center gap-1.5 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gruvbox-light-bg3 dark:hover:bg-gruvbox-dark-bg3 transition"
                  >
                    <IconEye size={14} />
                    Xem
                  </Link>
                  <button
                    onClick={() => handleEditClick(vibe)}
                    className="flex items-center gap-1.5 bg-gruvbox-orange text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gruvbox-orange/90 transition"
                  >
                    <IconEdit size={14} />
                    Chỉnh sửa
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Update Dialog */}
      {selectedVibe && (
        <UpdateVibeDialog
          open={isUpdateDialogOpen}
          onClose={() => {
            setIsUpdateDialogOpen(false);
            setSelectedVibe(null);
          }}
          vibe={selectedVibe}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}
    </>
  );
}
