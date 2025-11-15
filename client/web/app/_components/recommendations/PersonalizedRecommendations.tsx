"use client";

import { useState, useEffect } from "react";
import { 
  IconSparkles, 
  IconHeart, 
  IconEye, 
  IconMapPin,
  IconTrendingUp,
  IconRefresh,
  IconArrowRight
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../_contexts/AuthContext";

// API Base URL
const API_BASE = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:4000/api";

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
}

interface PersonalizedRecommendationsProps {
  limit?: number;
}

export default function PersonalizedRecommendations({ limit = 6 }: PersonalizedRecommendationsProps) {
  const { user, isAuthenticated } = useAuth();
  const [vibes, setVibes] = useState<RecommendedVibe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRecommendations = async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/recommendations?limit=${limit}`, {
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
  }, [isAuthenticated, user?.id]);

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

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <IconSparkles className="w-6 h-6 text-gruvbox-orange animate-pulse" />
          <h2 className="text-2xl md:text-3xl font-bold text-gruvbox-dark-fg0">
            Recommended For You
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {!loading && vibes.length > 0 && (
            <button
              onClick={fetchRecommendations}
              className="p-2 hover:bg-gruvbox-dark-bg1 rounded-lg transition"
              title="Refresh recommendations"
            >
              <IconRefresh size={20} className="text-gruvbox-gray hover:text-gruvbox-orange transition" />
            </button>
          )}
          <Link
            href="/recommendations"
            className="text-sm font-medium text-gruvbox-orange hover:text-gruvbox-yellow transition flex items-center gap-1"
          >
            View All
            <IconArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-gruvbox-red/10 border border-gruvbox-red/30 text-gruvbox-red p-4 rounded-xl mb-4">
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchRecommendations}
            className="text-sm underline mt-2"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(limit)].map((_, i) => (
            <div
              key={i}
              className="bg-gruvbox-dark-bg1 rounded-xl overflow-hidden border border-gruvbox-dark-bg2 animate-pulse"
            >
              <div className="h-56 bg-gruvbox-dark-bg2"></div>
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gruvbox-dark-bg2 rounded w-3/4"></div>
                <div className="h-4 bg-gruvbox-dark-bg2 rounded w-1/2"></div>
                <div className="h-3 bg-gruvbox-dark-bg2 rounded"></div>
                <div className="h-3 bg-gruvbox-dark-bg2 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && vibes.length === 0 && !error && (
        <div className="text-center py-12 bg-gruvbox-dark-bg1 rounded-xl border border-gruvbox-dark-bg2">
          <IconSparkles className="w-16 h-16 text-gruvbox-gray mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-gruvbox-dark-fg0 mb-2">
            No recommendations yet
          </h3>
          <p className="text-gruvbox-gray mb-6">
            Start interacting with vibes to get personalized recommendations!
          </p>
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gruvbox-orange text-white rounded-lg hover:bg-gruvbox-yellow transition"
          >
            <IconSparkles size={20} />
            <span>Explore Vibes</span>
          </Link>
        </div>
      )}

      {/* Vibes Grid */}
      {!loading && vibes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vibes.map((vibe) => (
            <Link
              key={vibe._id}
              href={`/vibes/${vibe._id}`}
              className="bg-gruvbox-dark-bg1 rounded-xl overflow-hidden border border-gruvbox-dark-bg2 hover:border-gruvbox-orange/50 hover:shadow-lg hover:shadow-gruvbox-orange/10 transition-all duration-300 group"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                {vibe.mediaFiles && vibe.mediaFiles.length > 0 ? (
                  <Image
                    src={vibe.mediaFiles[0].url}
                    alt={vibe.itemName}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
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
                <h3 className="font-bold text-lg text-gruvbox-dark-fg0 mb-1 truncate group-hover:text-gruvbox-orange transition">
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
          ))}
        </div>
      )}

      {/* View More Link */}
      {!loading && vibes.length > 0 && (
        <div className="text-center mt-8">
          <Link
            href="/recommendations"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gruvbox-orange to-gruvbox-yellow text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <IconSparkles size={20} />
            <span>See All Recommendations</span>
            <IconArrowRight size={20} />
          </Link>
        </div>
      )}
    </section>
  );
}