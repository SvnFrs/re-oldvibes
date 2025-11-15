"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconPhoto,
  IconEdit,
  IconEye,
  IconCurrencyDollar,
  IconCalendar,
  IconTag,
  IconMapPin,
  IconRefresh,
  IconAlertCircle,
  IconClock,
  IconArchive,
  IconClockHour4,
} from "@tabler/icons-react";
import Wrapper from "../_sections/wrapper";
import { useAuth } from "../_contexts/AuthContext";
import AuthGuard from "../_components/auth/AuthGuard";
import { getUserVibes } from "../_apis/common/admin";
import { UpdateVibeDialog } from "../_components/vibes/UpdateVibeDialog";
import Cookies from "js-cookie";
import { API } from "../_libs/api";

interface Vibe {
  _id: string;
  itemName: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  tags: string[];
  location?: string;
  status: "pending" | "approved" | "rejected" | "archived" | "sold";
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

export default function MyVibesPage() {
  const { user } = useAuth();
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedVibe, setSelectedVibe] = useState<Vibe | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");

  const token = Cookies.get("tokenAuth");

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

  // Helper function to check if vibe is expiring soon (less than 2 hours)
  const isExpiringSoon = (expiresAt: string) => {
    const expiryTime = new Date(expiresAt).getTime();
    const now = Date.now();
    const twoHours = 2 * 60 * 60 * 1000;
    return expiryTime - now < twoHours && expiryTime > now;
  };

  // Helper function to get time remaining
  const getTimeRemaining = (expiresAt: string) => {
    const expiryTime = new Date(expiresAt).getTime();
    const now = Date.now();
    const diff = expiryTime - now;

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Filter vibes by active tab
  const filteredVibes = vibes.filter((vibe) => {
    if (activeTab === "archived") {
      return vibe.status === "archived";
    }
    return vibe.status !== "archived";
  });

  // Handle extend expiry
  const handleExtendExpiry = async (vibeId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${API}/vibes/${vibeId}/extend`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hours: 24 }),
      });

      if (response.ok) {
        setSuccess("Vibe expiry extended by 24 hours!");
        fetchVibes();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to extend vibe expiry");
      }
    } catch (err: any) {
      setError(err.message || "Failed to extend vibe expiry");
    }
  };

  // Handle archive vibe
  const handleArchiveVibe = async (vibeId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${API}/vibes/${vibeId}/archive`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setSuccess("Vibe archived successfully!");
        fetchVibes();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to archive vibe");
      }
    } catch (err: any) {
      setError(err.message || "Failed to archive vibe");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-gruvbox-green-dark/20 text-gruvbox-green-dark border-gruvbox-green";
      case "pending":
        return "bg-gruvbox-yellow-dark/20 text-gruvbox-yellow-dark border-gruvbox-yellow";
      case "rejected":
        return "bg-gruvbox-red-dark/20 text-gruvbox-red-dark border-gruvbox-red";
      case "sold":
        return "bg-gruvbox-blue/20 text-gruvbox-blue border-gruvbox-blue";
      case "archived":
        return "bg-gruvbox-dark-bg3 text-gruvbox-dark-fg2 border-gruvbox-dark-bg3";
      default:
        return "bg-gruvbox-dark-bg2 text-gruvbox-dark-fg2 border-gruvbox-dark-bg3";
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
      <AuthGuard requireAuth={true}>
        <Wrapper>
                  return (
          <div className="min-h-screen bg-gruvbox-dark-bg0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gruvbox-orange mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your vibes...</p>
            </div>
          </div>
        </Wrapper>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <Wrapper>
        <div className="min-h-screen bg-gruvbox-dark-bg0">
          {/* Header */}
          <div className="bg-gruvbox-dark-bg1 border-b border-gruvbox-dark-bg2 px-6 py-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gruvbox-orange mb-2">
                    My Vibes
                  </h1>
                  <p className="text-gruvbox-dark-fg2">
                    Manage and update your listed items
                  </p>
                </div>
                <button
                  onClick={fetchVibes}
                  className="flex items-center gap-2 bg-gruvbox-orange text-white px-4 py-2 rounded-lg font-semibold hover:bg-gruvbox-orange/90 transition"
                >
                  <IconRefresh size={18} />
                  Refresh
                </button>
              </div>
              
              {/* Tab Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setActiveTab("active")}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    activeTab === "active"
                      ? "bg-gruvbox-orange text-white"
                      : "bg-gruvbox-dark-bg2 text-gruvbox-dark-fg1 hover:bg-gruvbox-dark-bg3"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <IconPhoto size={18} />
                    Active ({vibes.filter((v) => v.status !== "archived").length})
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("archived")}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    activeTab === "archived"
                      ? "bg-gruvbox-orange text-white"
                      : "bg-gruvbox-dark-bg2 text-gruvbox-dark-fg1 hover:bg-gruvbox-dark-bg3"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <IconArchive size={18} />
                    Archived ({vibes.filter((v) => v.status === "archived").length})
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-gruvbox-red-dark/20 border border-gruvbox-red text-gruvbox-red-dark px-4 py-3 rounded-lg flex items-center gap-2">
                <IconAlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-gruvbox-green/20 border border-gruvbox-green text-gruvbox-green px-4 py-3 rounded-lg flex items-center gap-2">
                <IconAlertCircle size={20} />
                <span>{success}</span>
              </div>
            )}

            {/* Vibes List */}
            {filteredVibes.length === 0 ? (
              <div className="bg-gruvbox-dark-bg1 rounded-lg shadow p-12 text-center border border-gruvbox-dark-bg2">
                <IconPhoto size={64} className="mx-auto mb-4 text-gruvbox-dark-bg3" />
                <h3 className="text-xl font-semibold text-gruvbox-dark-fg0 mb-2">
                  {activeTab === "archived" ? "No archived vibes" : "No vibes found"}
                </h3>
                <p className="text-gruvbox-dark-fg2 mb-6">
                  {activeTab === "archived"
                    ? "You don't have any archived vibes yet."
                    : "You haven't created any vibes yet."}
                </p>
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-2 bg-gruvbox-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-gruvbox-orange/90 transition"
                >
                  <IconPhoto size={18} />
                  Create Your First Vibe
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVibes.map((vibe) => (
                  <div
                    key={vibe._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Media Preview */}
                    {vibe.mediaFiles && vibe.mediaFiles.length > 0 ? (
                      <div className="relative w-full h-48 bg-gray-200">
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
                          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                            +{vibe.mediaFiles.length - 1}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gruvbox-dark-bg2 flex items-center justify-center">
                        <IconPhoto size={48} className="text-gray-400" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg text-gruvbox-dark-fg0 line-clamp-2 flex-1">
                          {vibe.itemName}
                        </h3>
                        <span className="text-gruvbox-orange font-bold text-lg ml-2">
                          {formatPrice(vibe.price)}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {vibe.description}
                      </p>

                      {/* Status Badge and Expiry */}
                      <div className="mb-3 flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            vibe.status
                          )}`}
                        >
                          {vibe.status.charAt(0).toUpperCase() +
                            vibe.status.slice(1)}
                        </span>
                        {vibe.status === "approved" && vibe.expiresAt && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                              isExpiringSoon(vibe.expiresAt)
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : "bg-gruvbox-dark-bg2 text-gruvbox-dark-fg2 border border-gruvbox-dark-bg3"
                            }`}
                          >
                            <IconClock size={12} />
                            {getTimeRemaining(vibe.expiresAt)}
                          </span>
                        )}
                      </div>

                      {/* Meta Info */}
                      <div className="space-y-1 mb-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <IconTag size={14} />
                          <span>{vibe.category}</span>
                          <span className="mx-1">•</span>
                          <span className="capitalize">{vibe.condition}</span>
                        </div>
                        {vibe.location && (
                          <div className="flex items-center gap-1">
                            <IconMapPin size={14} />
                            <span>{vibe.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <IconCalendar size={14} />
                          <span>
                            {new Date(vibe.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {vibe.views !== undefined && (
                          <div className="flex items-center gap-1">
                            <IconEye size={14} />
                            <span>{vibe.views} views</span>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      {vibe.tags && vibe.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {vibe.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="bg-gruvbox-dark-bg2 text-gruvbox-dark-fg1 px-2 py-0.5 rounded text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                          {vibe.tags.length > 3 && (
                            <span className="text-gray-400 text-xs">
                              +{vibe.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-col gap-2 pt-3 border-t">
                        <div className="flex gap-2">
                          <Link
                            href={`/vibes/${vibe._id}`}
                            className="flex-1 flex items-center justify-center gap-2 bg-gruvbox-dark-bg2 text-gruvbox-dark-fg0 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gruvbox-dark-bg3 transition"
                          >
                            <IconEye size={16} />
                            View
                          </Link>
                          {vibe.status !== "archived" && (
                            <button
                              onClick={() => handleEditClick(vibe)}
                              className="flex-1 flex items-center justify-center gap-2 bg-gruvbox-orange text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gruvbox-orange/90 transition"
                            >
                              <IconEdit size={16} />
                              Edit
                            </button>
                          )}
                        </div>
                        {vibe.status === "approved" && vibe.expiresAt && (
                          <div className="flex gap-2">
                            {isExpiringSoon(vibe.expiresAt) && (
                              <div className="flex-1 text-xs text-red-400 flex items-center gap-1 px-2">
                                <IconAlertCircle size={14} />
                                Expiring soon!
                              </div>
                            )}
                            <button
                              onClick={() => handleExtendExpiry(vibe._id)}
                              className="flex-1 flex items-center justify-center gap-2 bg-gruvbox-blue/20 text-gruvbox-blue border border-gruvbox-blue/30 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gruvbox-blue/30 transition"
                            >
                              <IconClockHour4 size={16} />
                              Extend +24h
                            </button>
                          </div>
                        )}
                        {(vibe.status === "approved" || vibe.status === "pending") && (
                          <button
                            onClick={() => handleArchiveVibe(vibe._id)}
                            className="w-full flex items-center justify-center gap-2 bg-gruvbox-dark-bg2 text-gruvbox-dark-fg1 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gruvbox-dark-bg3 transition"
                          >
                            <IconArchive size={16} />
                            Archive
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
        </div>
      </Wrapper>
    </AuthGuard>
  );
}

