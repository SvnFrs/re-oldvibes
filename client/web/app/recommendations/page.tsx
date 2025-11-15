"use client";

import { useState, useEffect } from "react";
import {
  IconSparkles,
  IconHeart,
  IconEye,
  IconMessageCircle,
  IconMapPin,
  IconTrendingUp,
  IconRefresh,
  IconAdjustments,
  IconFilter,
  IconX,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { PageShell, SectionHeader } from "../_components/layout/PageShell";
import { Card, CardContent } from "../_components/ui/card";
import { FadeIn, SlideUp } from "../_motion/MotionWrappers";
import { useAuth } from "../_contexts/AuthContext";
import TrendingVibes from "../_components/recommendations/TrendingVibes";

const API_BASE = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:4000/api";

interface RecommendationFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minScore?: number;
  condition?: string;
  location?: string;
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
  user?: {
    id: string;
    name: string;
    profilePicture?: string;
  };
  likes: number;
  likesCount?: number;
  views: number;
  viewsCount?: number;
  commentsCount: number;
  score: number;
  reasons: string[];
  expiresAt?: string;
  createdAt: string;
}

const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Books",
  "Toys",
  "Home",
  "Sports",
  "Beauty",
  "Other",
];

const CONDITIONS = ["new", "like-new", "good", "fair", "poor"];

export default function RecommendationsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [vibes, setVibes] = useState<RecommendedVibe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState<RecommendationFilters>({});
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch recommendations
  const fetchRecommendations = async (reset: boolean = false) => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    if (reset) {
      setLoading(true);
      setPage(1);
    } else {
      setLoadingMore(true);
    }

    setError("");

    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.minScore !== undefined) params.append('minScore', filters.minScore.toString());
      if (filters.condition) params.append('condition', filters.condition);
      if (filters.location) params.append('location', filters.location);

      const currentPage = reset ? 1 : page;
      params.append('limit', '12');
      params.append('offset', ((currentPage - 1) * 12).toString());

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
      const newVibes = data.vibes || [];

      if (reset) {
        setVibes(newVibes);
      } else {
        setVibes(prev => [...prev, ...newVibes]);
      }

      setHasMore(newVibes.length === 12);
      if (!reset) {
        setPage(prev => prev + 1);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load recommendations");
      console.error("Error fetching recommendations:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    fetchRecommendations(true);
  }, [isAuthenticated, user, authLoading]);

  const handleApplyFilters = () => {
    setShowFilterPanel(false);
    fetchRecommendations(true);
  };

  const handleClearFilters = () => {
    setFilters({});
    setShowFilterPanel(false);
    fetchRecommendations(true);
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
        return "bg-gruvbox-green/10 text-gruvbox-green border-gruvbox-green/30";
      case "like-new":
        return "bg-gruvbox-blue/10 text-gruvbox-blue border-gruvbox-blue/30";
      case "good":
        return "bg-gruvbox-yellow/10 text-gruvbox-yellow border-gruvbox-yellow/30";
      case "fair":
        return "bg-gruvbox-orange/10 text-gruvbox-orange border-gruvbox-orange/30";
      case "poor":
        return "bg-gruvbox-red/10 text-gruvbox-red border-gruvbox-red/30";
      default:
        return "bg-gruvbox-gray/10 text-gruvbox-gray border-gruvbox-gray/30";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-gruvbox-green";
    if (score >= 0.6) return "text-gruvbox-blue";
    if (score >= 0.4) return "text-gruvbox-yellow";
    return "text-gruvbox-orange";
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

  // Not authenticated view
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gruvbox-dark-bg0 pt-20">
        <PageShell width="md">
          <FadeIn>
            <div className="text-center py-20">
              <IconSparkles className="w-20 h-20 text-gruvbox-orange mx-auto mb-6 animate-pulse" />
              <h1 className="text-4xl font-bold text-gruvbox-dark-fg0 mb-4">
                Personalized Recommendations
              </h1>
              <p className="text-lg text-gruvbox-gray mb-8 max-w-2xl mx-auto">
                Sign in to discover vibes tailored just for you based on your interests and interactions.
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/auth/login"
                  className="px-8 py-4 bg-gruvbox-orange text-white rounded-xl font-medium hover:bg-gruvbox-yellow transition-all shadow-lg hover:shadow-xl"
                >
                  Sign In
                </Link>
                <Link
                  href="/feed"
                  className="px-8 py-4 bg-gruvbox-dark-bg1 text-gruvbox-dark-fg0 border border-gruvbox-dark-bg2 rounded-xl font-medium hover:bg-gruvbox-dark-bg2 transition-all"
                >
                  Browse Feed
                </Link>
              </div>
            </div>
          </FadeIn>
        </PageShell>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gruvbox-dark-bg0 pt-8 pb-12">
      <PageShell width="full">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <FadeIn>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <IconSparkles className="w-8 h-8 text-gruvbox-orange animate-pulse" />
                  <h1 className="text-4xl font-bold text-gruvbox-dark-fg0">
                    Recommended For You
                  </h1>
                </div>
                <p className="text-gruvbox-gray text-lg">
                  Discover vibes tailored to your interests and browsing history
                </p>
              </div>
            </FadeIn>

            {/* Filter Bar */}
            <SlideUp delay={0.1}>
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <IconFilter className="text-gruvbox-gray" size={20} />
                      <span className="text-sm text-gruvbox-dark-fg2">
                        {vibes.length} recommendations
                        {activeFilterCount > 0 && ` • ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} applied`}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {activeFilterCount > 0 && (
                        <button
                          onClick={handleClearFilters}
                          className="text-sm text-gruvbox-red hover:text-gruvbox-red-light transition-colors flex items-center gap-1"
                        >
                          <IconX size={16} />
                          Clear Filters
                        </button>
                      )}

                      <button
                        onClick={() => setShowFilterPanel(!showFilterPanel)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          showFilterPanel
                            ? 'bg-gruvbox-orange text-white'
                            : 'bg-gruvbox-dark-bg2 text-gruvbox-dark-fg0 hover:bg-gruvbox-dark-bg1'
                        }`}
                      >
                        <IconAdjustments size={18} />
                        <span className="text-sm font-medium">Filters</span>
                        {activeFilterCount > 0 && (
                          <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                            {activeFilterCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => fetchRecommendations(true)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-gruvbox-orange text-white rounded-lg hover:bg-gruvbox-yellow transition-all disabled:opacity-50"
                      >
                        <IconRefresh size={18} className={loading ? "animate-spin" : ""} />
                        <span className="text-sm font-medium">Refresh</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter Panel */}
                  {showFilterPanel && (
                    <div className="mt-4 pt-4 border-t border-gruvbox-dark-bg2">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Category Filter */}
                        <div>
                          <label className="block text-sm font-medium text-gruvbox-dark-fg0 mb-2">
                            Category
                          </label>
                          <select
                            value={filters.category || ""}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
                            className="w-full px-3 py-2 bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg2 rounded-lg text-gruvbox-dark-fg0 focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent"
                          >
                            <option value="">All Categories</option>
                            {CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        {/* Condition Filter */}
                        <div>
                          <label className="block text-sm font-medium text-gruvbox-dark-fg0 mb-2">
                            Condition
                          </label>
                          <select
                            value={filters.condition || ""}
                            onChange={(e) => setFilters({ ...filters, condition: e.target.value || undefined })}
                            className="w-full px-3 py-2 bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg2 rounded-lg text-gruvbox-dark-fg0 focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent"
                          >
                            <option value="">All Conditions</option>
                            {CONDITIONS.map((cond) => (
                              <option key={cond} value={cond} className="capitalize">
                                {cond}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Min Score Filter */}
                        <div>
                          <label className="block text-sm font-medium text-gruvbox-dark-fg0 mb-2">
                            Min Match Score (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={filters.minScore !== undefined ? filters.minScore * 100 : ""}
                            onChange={(e) => setFilters({ ...filters, minScore: e.target.value ? Number(e.target.value) / 100 : undefined })}
                            placeholder="0"
                            className="w-full px-3 py-2 bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg2 rounded-lg text-gruvbox-dark-fg0 focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent"
                          />
                        </div>

                        {/* Min Price */}
                        <div>
                          <label className="block text-sm font-medium text-gruvbox-dark-fg0 mb-2">
                            Min Price (₫)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={filters.minPrice || ""}
                            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
                            placeholder="0"
                            className="w-full px-3 py-2 bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg2 rounded-lg text-gruvbox-dark-fg0 focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent"
                          />
                        </div>

                        {/* Max Price */}
                        <div>
                          <label className="block text-sm font-medium text-gruvbox-dark-fg0 mb-2">
                            Max Price (₫)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={filters.maxPrice || ""}
                            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                            placeholder="No limit"
                            className="w-full px-3 py-2 bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg2 rounded-lg text-gruvbox-dark-fg0 focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent"
                          />
                        </div>

                        {/* Location */}
                        <div>
                          <label className="block text-sm font-medium text-gruvbox-dark-fg0 mb-2">
                            Location
                          </label>
                          <input
                            type="text"
                            value={filters.location || ""}
                            onChange={(e) => setFilters({ ...filters, location: e.target.value || undefined })}
                            placeholder="Enter location"
                            className="w-full px-3 py-2 bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg2 rounded-lg text-gruvbox-dark-fg0 focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 mt-4">
                        <button
                          onClick={() => setShowFilterPanel(false)}
                          className="px-4 py-2 text-gruvbox-gray hover:text-gruvbox-dark-fg0 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleApplyFilters}
                          className="px-6 py-2 bg-gruvbox-orange text-white rounded-lg hover:bg-gruvbox-yellow transition-colors font-medium"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </SlideUp>

            {/* Error State */}
            {error && (
              <FadeIn>
                <Card className="mb-6 border-gruvbox-red">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 text-gruvbox-red">
                      <IconX size={24} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-bold mb-1">Error Loading Recommendations</h3>
                        <p className="text-sm text-gruvbox-dark-fg2">{error}</p>
                        <button
                          onClick={() => fetchRecommendations(true)}
                          className="mt-3 text-sm underline hover:no-underline"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            )}

            {/* Loading State */}
            {loading && vibes.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-56 bg-gruvbox-dark-bg2"></div>
                    <CardContent className="p-4 space-y-3">
                      <div className="h-5 bg-gruvbox-dark-bg2 rounded w-3/4"></div>
                      <div className="h-4 bg-gruvbox-dark-bg2 rounded w-1/2"></div>
                      <div className="h-3 bg-gruvbox-dark-bg2 rounded"></div>
                      <div className="h-3 bg-gruvbox-dark-bg2 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && vibes.length === 0 && !error && (
              <FadeIn>
                <Card>
                  <CardContent className="text-center py-20">
                    <IconSparkles className="w-16 h-16 text-gruvbox-gray mx-auto mb-6 opacity-50" />
                    <h3 className="text-2xl font-bold text-gruvbox-dark-fg0 mb-3">
                      No Recommendations Yet
                    </h3>
                    <p className="text-gruvbox-gray mb-8 max-w-md mx-auto">
                      Start exploring and interacting with vibes to get personalized recommendations!
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Link
                        href="/feed"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gruvbox-orange text-white rounded-lg hover:bg-gruvbox-yellow transition-all shadow-lg"
                      >
                        <IconSparkles size={20} />
                        <span>Explore Feed</span>
                      </Link>
                      <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gruvbox-dark-bg1 text-gruvbox-dark-fg0 border border-gruvbox-dark-bg2 rounded-lg hover:bg-gruvbox-dark-bg2 transition-all"
                      >
                        Browse Marketplace
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            )}

            {/* Vibes Grid */}
            {!loading && vibes.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vibes.map((vibe, index) => (
                    <FadeIn key={vibe._id} delay={index * 0.05}>
                      <Link
                        href={`/vibes/${vibe._id}`}
                        className="group bg-gruvbox-dark-bg1 rounded-xl overflow-hidden border border-gruvbox-dark-bg2 hover:border-gruvbox-orange/50 hover:shadow-xl hover:shadow-gruvbox-orange/10 transition-all duration-300 hover:-translate-y-1"
                      >
                        {/* Image */}
                        <div className="relative aspect-square overflow-hidden">
                          {vibe.mediaFiles && vibe.mediaFiles.length > 0 ? (
                            <Image
                              src={vibe.mediaFiles[0].url}
                              alt={vibe.itemName}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gruvbox-dark-bg2 flex items-center justify-center">
                              <IconEye className="w-12 h-12 text-gruvbox-gray" />
                            </div>
                          )}

                          {/* Score Badge */}
                          <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-gruvbox-dark-bg0/90 backdrop-blur-sm flex items-center gap-1.5 border border-gruvbox-dark-bg2 shadow-lg">
                            <IconTrendingUp size={14} className={getScoreColor(vibe.score)} />
                            <span className={`text-xs font-bold ${getScoreColor(vibe.score)}`}>
                              {(vibe.score * 100).toFixed(0)}% Match
                            </span>
                          </div>

                          {/* Condition Badge */}
                          <div className={`absolute bottom-3 left-3 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${getConditionColor(vibe.condition)}`}>
                            {vibe.condition}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-bold text-lg text-gruvbox-dark-fg0 mb-1 line-clamp-2 min-h-[3.5rem] group-hover:text-gruvbox-orange transition">
                            {vibe.itemName}
                          </h3>

                          <p className="text-xl font-bold bg-gradient-to-r from-gruvbox-orange to-gruvbox-yellow bg-clip-text text-transparent mb-3">
                            {formatPrice(vibe.price)}
                          </p>

                          {/* Recommendation Reasons */}
                          {vibe.reasons && vibe.reasons.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs text-gruvbox-gray mb-2 font-medium">Why recommended:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {vibe.reasons.slice(0, 2).map((reason, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs px-2.5 py-1 bg-gruvbox-orange/10 text-gruvbox-orange rounded-full border border-gruvbox-orange/20 font-medium"
                                  >
                                    {reason}
                                  </span>
                                ))}
                                {vibe.reasons.length > 2 && (
                                  <span className="text-xs px-2.5 py-1 bg-gruvbox-gray/10 text-gruvbox-gray rounded-full">
                                    +{vibe.reasons.length - 2}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Meta Info */}
                          <div className="flex items-center gap-4 text-sm text-gruvbox-gray">
                            <div className="flex items-center gap-1.5">
                              <IconHeart size={16} />
                              <span>{vibe.likes || vibe.likesCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <IconEye size={16} />
                              <span>{vibe.views || 0}</span>
                            </div>
                            {vibe.location && (
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                <IconMapPin size={16} className="flex-shrink-0" />
                                <span className="truncate">{vibe.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </FadeIn>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center mt-10">
                    <button
                      onClick={() => fetchRecommendations(false)}
                      disabled={loadingMore}
                      className="group px-8 py-4 bg-gradient-to-r from-gruvbox-orange to-gruvbox-yellow text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3 mx-auto"
                    >
                      {loadingMore ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Loading More...</span>
                        </>
                      ) : (
                        <>
                          <span>Load More Recommendations</span>
                          <IconChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar - Trending */}
          <aside className="hidden lg:block w-96 flex-shrink-0">
            <div className="sticky top-20">
              <FadeIn delay={0.2}>
                <TrendingVibes limit={8} />
              </FadeIn>

              {/* Info Card */}
              <FadeIn delay={0.3}>
                <Card className="mt-6">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <IconSparkles className="w-6 h-6 text-gruvbox-orange flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-gruvbox-dark-fg0 mb-2">
                          How Recommendations Work
                        </h3>
                        <p className="text-sm text-gruvbox-gray leading-relaxed">
                          We analyze your likes, views, and interactions to suggest vibes you'll love. The match score shows how well each item fits your preferences.
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gruvbox-dark-bg2">
                      <Link
                        href="/feed"
                        className="text-sm text-gruvbox-orange hover:text-gruvbox-yellow transition-colors font-medium flex items-center gap-1"
                      >
                        <span>Explore more vibes</span>
                        <IconChevronDown size={16} className="rotate-[-90deg]" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
          </aside>
        </div>
      </PageShell>
    </div>
  );
}