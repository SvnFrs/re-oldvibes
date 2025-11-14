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
} from "@tabler/icons-react";
import Wrapper from "../_sections/wrapper";
import { useAuth } from "../_contexts/AuthContext";
import AuthGuard from "../_components/auth/AuthGuard";
import { getUserVibes } from "../_apis/common/admin";
import { UpdateVibeDialog } from "../_components/vibes/UpdateVibeDialog";
import Cookies from "js-cookie";

interface Vibe {
  _id: string;
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

export default function MyVibesPage() {
  const { user } = useAuth();
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVibe, setSelectedVibe] = useState<Vibe | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
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
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b px-6 py-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gruvbox-orange mb-2">
                    My Vibes
                  </h1>
                  <p className="text-gray-600">
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
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <IconAlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {/* Vibes List */}
            {vibes.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <IconPhoto size={64} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No vibes found
                </h3>
                <p className="text-gray-500 mb-6">
                  You haven&apos;t created any vibes yet.
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
                {vibes.map((vibe) => (
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
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <IconPhoto size={48} className="text-gray-400" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg text-gray-800 line-clamp-2 flex-1">
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

                      {/* Status Badge */}
                      <div className="mb-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            vibe.status
                          )}`}
                        >
                          {vibe.status.charAt(0).toUpperCase() +
                            vibe.status.slice(1)}
                        </span>
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
                              className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs"
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
                      <div className="flex gap-2 pt-3 border-t">
                        <Link
                          href={`/vibes/${vibe._id}`}
                          className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                        >
                          <IconEye size={16} />
                          View
                        </Link>
                        <button
                          onClick={() => handleEditClick(vibe)}
                          className="flex-1 flex items-center justify-center gap-2 bg-gruvbox-orange text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gruvbox-orange/90 transition"
                        >
                          <IconEdit size={16} />
                          Edit
                        </button>
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

