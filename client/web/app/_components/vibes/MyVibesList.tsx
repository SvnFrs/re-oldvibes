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
  IconHeart,
  IconMessageCircle,
  IconSparkles,
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
    fetchVibes();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-gruvbox-green/10 text-gruvbox-green border-gruvbox-green/30";
      case "pending":
        return "bg-gruvbox-yellow/10 text-gruvbox-yellow border-gruvbox-yellow/30";
      case "rejected":
        return "bg-gruvbox-red/10 text-gruvbox-red border-gruvbox-red/30";
      default:
        return "bg-gruvbox-gray/10 text-gruvbox-gray border-gruvbox-gray/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "pending":
        return "Pending";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "new":
        return "text-gruvbox-green bg-gruvbox-green/10";
      case "like-new":
        return "text-gruvbox-blue bg-gruvbox-blue/10";
      case "good":
        return "text-gruvbox-yellow bg-gruvbox-yellow/10";
      case "fair":
        return "text-gruvbox-orange bg-gruvbox-orange/10";
      case "poor":
        return "text-gruvbox-red bg-gruvbox-red/10";
      default:
        return "text-gruvbox-gray bg-gruvbox-gray/10";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-gruvbox-dark-bg2 rounded-xl p-4 animate-pulse border border-gruvbox-dark-bg3"
          >
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gruvbox-dark-bg3 rounded-lg"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gruvbox-dark-bg3 rounded w-3/4"></div>
                <div className="h-3 bg-gruvbox-dark-bg3 rounded w-1/2"></div>
                <div className="h-3 bg-gruvbox-dark-bg3 rounded w-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gruvbox-red/10 border border-gruvbox-red/30 text-gruvbox-red px-4 py-3 rounded-xl flex items-center gap-3">
        <IconAlertCircle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  if (vibes.length === 0) {
    return (
      <div className="bg-gruvbox-dark-bg2 rounded-xl p-12 text-center border border-gruvbox-dark-bg3">
        <div className="w-20 h-20 bg-gruvbox-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <IconPhoto size={40} className="text-gruvbox-orange" />
        </div>
        <h3 className="text-xl font-semibold text-gruvbox-dark-fg0 mb-2">
          No Vibes Yet
        </h3>
        <p className="text-gruvbox-gray mb-6">
          Start sharing your vintage finds with the community!
        </p>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-gruvbox-orange to-gruvbox-yellow text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          <IconSparkles size={18} />
          <span>Create Your First Vibe</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Header Stats */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-gruvbox-orange/10 to-gruvbox-yellow/10 rounded-xl border border-gruvbox-orange/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gruvbox-orange flex items-center justify-center">
            <IconSparkles size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-gruvbox-gray">Total Vibes</p>
            <p className="text-xl font-bold text-gruvbox-dark-fg0">{vibes.length}</p>
          </div>
        </div>
        <button
          onClick={fetchVibes}
          className="flex items-center gap-2 px-4 py-2 bg-gruvbox-dark-bg2 hover:bg-gruvbox-dark-bg3 text-gruvbox-orange rounded-lg transition-colors"
        >
          <IconRefresh size={16} />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>

      {/* Vibes Grid */}
      <div className="space-y-4">
        {vibes.map((vibe) => (
          <div
            key={vibe.id}
            className="group bg-gruvbox-dark-bg2 rounded-xl overflow-hidden border border-gruvbox-dark-bg3 hover:border-gruvbox-orange/50 transition-all duration-200 hover:shadow-xl"
          >
            <div className="flex gap-4 p-4">
              {/* Media Preview */}
              <div className="flex-shrink-0">
                <Link href={`/vibes/${vibe.id}`}>
                  {vibe.mediaFiles && vibe.mediaFiles.length > 0 ? (
                    <div className="relative w-28 h-28 bg-gruvbox-dark-bg3 rounded-xl overflow-hidden">
                      {vibe.mediaFiles[0].type === "image" ? (
                        <Image
                          src={vibe.mediaFiles[0].url}
                          alt={vibe.itemName}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <video
                          src={vibe.mediaFiles[0].url}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {vibe.mediaFiles.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-medium">
                          +{vibe.mediaFiles.length - 1}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-28 h-28 bg-gruvbox-dark-bg3 rounded-xl flex items-center justify-center">
                      <IconPhoto size={32} className="text-gruvbox-gray" />
                    </div>
                  )}
                </Link>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg text-gruvbox-dark-fg0 truncate mb-1">
                      {vibe.itemName}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold bg-gradient-to-r from-gruvbox-orange to-gruvbox-yellow bg-clip-text text-transparent">
                        {formatPrice(vibe.price)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${getConditionColor(vibe.condition)}`}>
                        {vibe.condition}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(
                      vibe.status
                    )}`}
                  >
                    {getStatusLabel(vibe.status)}
                  </span>
                </div>

                <p className="text-gruvbox-gray text-sm mb-3 line-clamp-2 leading-relaxed">
                  {vibe.description}
                </p>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-gruvbox-gray mb-3">
                  <div className="flex items-center gap-1.5">
                    <IconTag size={14} className="text-gruvbox-aqua" />
                    <span>{vibe.category}</span>
                  </div>
                  {vibe.location && (
                    <div className="flex items-center gap-1.5">
                      <IconMapPin size={14} className="text-gruvbox-green" />
                      <span>{vibe.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <IconCalendar size={14} className="text-gruvbox-blue" />
                    <span>{new Date(vibe.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconEye size={14} className="text-gruvbox-purple" />
                    <span>{vibe.views || 0} views</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconHeart size={14} className="text-gruvbox-red" />
                    <span>{vibe.likesCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconMessageCircle size={14} className="text-gruvbox-yellow" />
                    <span>{vibe.commentsCount || 0}</span>
                  </div>
                </div>

                {/* Tags */}
                {vibe.tags && vibe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {vibe.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gruvbox-dark-bg3 text-gruvbox-gray px-2 py-1 rounded-md text-xs hover:bg-gruvbox-dark-bg4 transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                    {vibe.tags.length > 3 && (
                      <span className="bg-gruvbox-dark-bg3 text-gruvbox-gray px-2 py-1 rounded-md text-xs">
                        +{vibe.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Link
                    href={`/vibes/${vibe.id}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-gruvbox-dark-bg3 text-gruvbox-dark-fg0 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gruvbox-dark-bg4 transition-colors"
                  >
                    <IconEye size={16} />
                    <span>View</span>
                  </Link>
                  <button
                    onClick={() => handleEditClick(vibe)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-gruvbox-orange to-gruvbox-yellow text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                  >
                    <IconEdit size={16} />
                    <span>Edit</span>
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