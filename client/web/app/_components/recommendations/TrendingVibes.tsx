"use client";

import { useState, useEffect } from "react";
import { IconTrendingUp, IconHeart, IconEye, IconRefresh } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

// API Base URL
const API_BASE = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:4000/api";

interface TrendingVibe {
  _id: string;
  itemName: string;
  price: number;
  location: string;
  category: string;
  condition: string;
  mediaFiles: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  }[];
  likes: number;
  views: number;
  score: number;
  trendingScore: number;
  trendingUsers: number;
}

interface TrendingVibesProps {
  limit?: number;
}

export default function TrendingVibes({ limit = 5 }: TrendingVibesProps) {
  const [vibes, setVibes] = useState<TrendingVibe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTrending = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/recommendations/trending?limit=${limit}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trending vibes');
      }

      const data = await response.json();
      setVibes(data.vibes || []);
    } catch (err: any) {
      setError(err.message || "Failed to load trending vibes");
      console.error("Error fetching trending vibes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, [limit]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="bg-gruvbox-dark-bg1 rounded-lg p-4 border border-gruvbox-dark-bg2">
        <div className="flex items-center gap-2 mb-4">
          <IconTrendingUp className="w-5 h-5 text-gruvbox-orange" />
          <h2 className="text-lg font-bold text-gruvbox-dark-fg0">
            Trending Now
          </h2>
        </div>
        <div className="text-center py-4">
          <div className="animate-spin w-6 h-6 border-4 border-gruvbox-orange border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gruvbox-dark-bg1 rounded-lg p-4 border border-gruvbox-dark-bg2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <IconTrendingUp className="w-5 h-5 text-gruvbox-orange" />
            <h2 className="text-lg font-bold text-gruvbox-dark-fg0">
              Trending Now
            </h2>
          </div>
          <button
            onClick={fetchTrending}
            className="text-sm text-gruvbox-orange hover:underline"
          >
            <IconRefresh size={16} />
          </button>
        </div>
        <div className="text-sm text-gruvbox-red-dark">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gruvbox-dark-bg1 rounded-lg p-4 border border-gruvbox-dark-bg2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <IconTrendingUp className="w-5 h-5 text-gruvbox-orange" />
          <h2 className="text-lg font-bold text-gruvbox-dark-fg0">
            Trending Now
          </h2>
        </div>
        <button
          onClick={fetchTrending}
          className="text-sm text-gruvbox-orange hover:underline flex items-center gap-1"
        >
          <IconRefresh size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {vibes.length === 0 ? (
        <div className="text-sm text-gruvbox-gray text-center py-4">
          No trending vibes at the moment
        </div>
      ) : (
        <div className="space-y-3">
          {vibes.map((vibe, index) => (
            <Link
              key={vibe._id}
              href={`/vibes/${vibe._id}`}
              className="flex gap-3 p-2 rounded hover:bg-gruvbox-dark-bg2 transition group"
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gruvbox-orange text-white text-xs font-bold">
                {index + 1}
              </div>

              {/* Image */}
              <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                {vibe.mediaFiles && vibe.mediaFiles.length > 0 ? (
                  <Image
                    src={vibe.mediaFiles[0].url}
                    alt={vibe.itemName}
                    fill
                    className="object-cover group-hover:scale-110 transition"
                  />
                ) : (
                  <div className="w-full h-full bg-gruvbox-dark-bg2" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-gruvbox-dark-fg0 truncate">
                  {vibe.itemName}
                </h3>
                <p className="text-sm font-bold text-gruvbox-orange">
                  {formatPrice(vibe.price)}
                </p>
                <div className="flex items-center gap-3 text-xs text-gruvbox-gray mt-1">
                  <div className="flex items-center gap-1">
                    <IconHeart size={12} />
                    <span>{vibe.likes || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconEye size={12} />
                    <span>{vibe.views || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconTrendingUp size={12} />
                    <span>{vibe.trendingUsers || 0} users</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-4 text-center">
        <Link
          href="/recommendations"
          className="text-sm text-gruvbox-orange hover:underline font-medium"
        >
          See more recommendations →
        </Link>
      </div>
    </div>
  );
}
