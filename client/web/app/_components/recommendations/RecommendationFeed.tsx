"use client";

import { useState, useEffect } from "react";
import { 
  IconHeart, 
  IconEye, 
  IconMapPin, 
  IconClock,
  IconSparkles,
  IconTrendingUp,
  IconRefresh,
  IconAdjustments
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../_contexts/AuthContext";

// API Base URL
const API_BASE = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:4000/api";

// Types
interface RecommendationFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minScore?: number;
  limit?: number;
  offset?: number;
}

interface RecommendedVibe {
  _id: string;
  itemName: string;
  description: string;
  price: number;
  location: string;
  category: string;
  condition: string;
  tags: string[];
  mediaFiles: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  }[];
  userId: string;
  likes: number;
  likesCount?: number;
  views: number;
  viewsCount?: number;
  commentsCount: number;
  score: number;
  reasons: string[];
  expiresAt?: string;
}

interface RecommendationFeedProps {
  limit?: number;
  showFilters?: boolean;
}

export default function RecommendationFeed({ 
  limit = 10, 
  showFilters = true 
}: RecommendationFeedProps) {
  const { user, isAuthenticated } = useAuth();
  const [vibes, setVibes] = useState<RecommendedVibe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<RecommendationFilters>({
    limit,
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Fetch recommendations
  const fetchRecommendations = async () => {
    if (!isAuthenticated || !user) return;

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.minScore !== undefined) params.append('minScore', filters.minScore.toString());
      if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
      if (filters.offset !== undefined) params.append('offset', filters.offset.toString());

      const response = await fetch(`${API_BASE}/recommendations?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      setVibes(data.vibes || []);
    } catch (err: any) {
      setError(err.message || "Failed to load recommendations");
      console.error("Error fetching recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [isAuthenticated, user]); // Fetch on mount

  // Track interaction when user views/clicks a vibe
  const handleVibeClick = async (vibeId: string) => {
    if (!isAuthenticated) return;

    try {
      await fetch(`${API_BASE}/recommendations/track`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vibeId,
          interactionType: 'view',
        }),
      });
    } catch (err) {
      console.error("Error tracking interaction:", err);
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
        return "text-gruvbox-green-light dark:text-gruvbox-green-dark bg-gruvbox-green-light/10 dark:bg-gruvbox-green-dark/10";
      case "like-new":
        return "text-gruvbox-blue-light dark:text-gruvbox-blue-dark bg-gruvbox-blue-light/10 dark:bg-gruvbox-blue-dark/10";
      case "good":
        return "text-gruvbox-yellow-light dark:text-gruvbox-yellow-dark bg-gruvbox-yellow-light/10 dark:bg-gruvbox-yellow-dark/10";
      case "fair":
        return "text-gruvbox-orange-light dark:text-gruvbox-orange-dark bg-gruvbox-orange-light/10 dark:bg-gruvbox-orange-dark/10";
      case "poor":
        return "text-gruvbox-red-light dark:text-gruvbox-red-dark bg-gruvbox-red-light/10 dark:bg-gruvbox-red-dark/10";
      default:
        return "text-gruvbox-gray bg-gruvbox-gray/10";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-gruvbox-green-dark";
    if (score >= 0.6) return "text-gruvbox-blue-dark";
    if (score >= 0.4) return "text-gruvbox-yellow-dark";
    return "text-gruvbox-orange-dark";
  };

  if (!user) {
    return (
      <div className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 rounded-lg p-6 text-center">
        <IconSparkles className="w-12 h-12 mx-auto mb-2 text-gruvbox-orange" />
        <p className="text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2">
          Sign in to see personalized recommendations
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconSparkles className="w-6 h-6 text-gruvbox-orange" />
          <h2 className="text-xl font-bold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
            Recommended For You
          </h2>
        </div>
        <div className="flex gap-2">
          {showFilters && (
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="flex items-center gap-2 px-3 py-2 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-lg hover:bg-gruvbox-light-bg3 dark:hover:bg-gruvbox-dark-bg3 transition"
            >
              <IconAdjustments size={18} />
              <span className="text-sm">Filters</span>
            </button>
          )}
          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-gruvbox-orange text-white rounded-lg hover:bg-gruvbox-yellow transition disabled:opacity-50"
          >
            <IconRefresh size={18} className={loading ? "animate-spin" : ""} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gruvbox-gray mb-1 block">Category</label>
              <input
                type="text"
                placeholder="e.g., Electronics"
                value={filters.category || ""}
                onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
                className="w-full px-3 py-2 rounded bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2"
              />
            </div>
            <div>
              <label className="text-sm text-gruvbox-gray mb-1 block">Min Score (%)</label>
              <input
                type="number"
                placeholder="0-100"
                value={filters.minScore !== undefined ? filters.minScore * 100 : ""}
                onChange={(e) => setFilters({ ...filters, minScore: e.target.value ? Number(e.target.value) / 100 : undefined })}
                className="w-full px-3 py-2 rounded bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="text-sm text-gruvbox-gray mb-1 block">Min Price</label>
              <input
                type="number"
                placeholder="0"
                value={filters.minPrice || ""}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 rounded bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2"
                min="0"
              />
            </div>
            <div>
              <label className="text-sm text-gruvbox-gray mb-1 block">Max Price</label>
              <input
                type="number"
                placeholder="No limit"
                value={filters.maxPrice || ""}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 rounded bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2"
                min="0"
              />
            </div>
          </div>
          <button
            onClick={fetchRecommendations}
            className="w-full px-4 py-2 bg-gruvbox-orange text-white rounded hover:bg-gruvbox-yellow transition"
          >
            Apply Filters
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-gruvbox-red-light/10 dark:bg-gruvbox-red-dark/10 text-gruvbox-red-dark p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-gruvbox-orange border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gruvbox-gray">Loading recommendations...</p>
        </div>
      )}

      {/* Vibes Grid */}
      {!loading && vibes.length === 0 && (
        <div className="text-center py-8 text-gruvbox-gray">
          <IconSparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No recommendations available at the moment.</p>
          <p className="text-sm mt-1">Try adjusting your filters or interacting with more vibes!</p>
        </div>
      )}

      {!loading && vibes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vibes.map((vibe) => (
            <Link
              key={vibe._id}
              href={`/vibes/${vibe._id}`}
              onClick={() => handleVibeClick(vibe._id)}
              className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 rounded-lg overflow-hidden hover:shadow-lg transition group"
            >
              {/* Image */}
              <div className="relative aspect-square">
                {vibe.mediaFiles && vibe.mediaFiles.length > 0 ? (
                  <Image
                    src={vibe.mediaFiles[0].url}
                    alt={vibe.itemName}
                    fill
                    className="object-cover group-hover:scale-105 transition"
                  />
                ) : (
                  <div className="w-full h-full bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 flex items-center justify-center">
                    <IconEye className="w-12 h-12 text-gruvbox-gray" />
                  </div>
                )}
                
                {/* Score Badge */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full bg-gruvbox-dark-bg1/90 backdrop-blur-sm flex items-center gap-1 border border-gruvbox-dark-bg2`}>
                  <IconTrendingUp size={14} className={getScoreColor(vibe.score)} />
                  <span className={`text-xs font-bold ${getScoreColor(vibe.score)}`}>
                    {(vibe.score * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Condition Badge */}
                <div className={`absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-medium ${getConditionColor(vibe.condition)}`}>
                  {vibe.condition}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-1 truncate">
                  {vibe.itemName}
                </h3>
                <p className="text-lg font-bold text-gruvbox-orange mb-2">
                  {formatPrice(vibe.price)}
                </p>

                {/* Reasons */}
                {vibe.reasons && vibe.reasons.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-gruvbox-gray mb-1">Why recommended:</p>
                    <div className="flex flex-wrap gap-1">
                      {vibe.reasons.slice(0, 2).map((reason, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 bg-gruvbox-orange/10 text-gruvbox-orange rounded-full"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-gruvbox-gray">
                  <div className="flex items-center gap-1">
                    <IconHeart size={14} />
                    <span>{vibe.likes || vibe.likesCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconEye size={14} />
                    <span>{vibe.views || vibe.viewsCount || 0}</span>
                  </div>
                  {vibe.location && (
                    <div className="flex items-center gap-1">
                      <IconMapPin size={14} />
                      <span className="truncate max-w-[100px]">{vibe.location}</span>
                    </div>
                  )}
                </div>

                {/* Time Remaining */}
                {vibe.expiresAt && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-gruvbox-red-dark">
                    <IconClock size={14} />
                    <span>
                      Expires {new Date(vibe.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
