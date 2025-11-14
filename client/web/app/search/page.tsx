"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  IconSearch,
  IconHeart,
  IconEye,
  IconMessageCircle,
  IconMapPin,
  IconClock,
  IconPhoto,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { PageShell } from "../_components/layout/PageShell";
import { Card, CardHeader, CardTitle, CardContent } from "../_components/ui/card";
import { FadeIn } from "../_motion/MotionWrappers";
import { searchVibes, getVibes } from "../_apis/common/vibes";
import TrendingVibes from "../_components/recommendations/TrendingVibes";

// Vibe Card Component (reused from homepage)
function VibeCard({ vibe }: { vibe: any }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "new":
        return "text-gruvbox-green-dark bg-gruvbox-green-dark/10";
      case "like-new":
        return "text-gruvbox-blue-dark bg-gruvbox-blue-dark/10";
      case "good":
        return "text-gruvbox-yellow-dark bg-gruvbox-yellow-dark/10";
      case "fair":
        return "text-gruvbox-orange-dark bg-gruvbox-orange-dark/10";
      case "poor":
        return "text-gruvbox-red-dark bg-gruvbox-red-dark/10";
      default:
        return "text-gruvbox-gray bg-gruvbox-gray/10";
    }
  };

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300">
      {/* Image */}
      <div className="relative h-48 w-full">
        {vibe.mediaFiles && vibe.mediaFiles.length > 0 ? (
          <Image
            src={vibe.mediaFiles[0].url}
            alt={vibe.itemName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gruvbox-dark-bg2 flex items-center justify-center">
            <IconPhoto size={48} className="text-gruvbox-gray" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(
              vibe.condition
            )}`}
          >
            {vibe.condition}
          </span>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-gruvbox-dark-fg0 text-lg line-clamp-1">
            {vibe.itemName}
          </h3>
          <span className="text-lg font-bold text-gruvbox-orange">
            {formatPrice(vibe.price)}
          </span>
        </div>

        <p className="text-gruvbox-dark-fg3 text-sm line-clamp-2 mb-3">
          {vibe.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-gruvbox-gray mb-3">
          <div className="flex items-center gap-1">
            <IconHeart size={14} />
            <span>{vibe.likesCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <IconEye size={14} />
            <span>{vibe.views}</span>
          </div>
          <div className="flex items-center gap-1">
            <IconMessageCircle size={14} />
            <span>{vibe.commentsCount}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gruvbox-dark-bg2 flex items-center justify-center">
              <span className="text-xs font-bold text-gruvbox-dark-fg1">
                {vibe.user?.name?.charAt(0) || "U"}
              </span>
            </div>
            <span className="text-sm font-medium text-gruvbox-dark-fg1">
              {vibe.user?.name || "Unknown"}
            </span>
          </div>

          {vibe.location && (
            <div className="flex items-center gap-1 text-xs text-gruvbox-gray">
              <IconMapPin size={12} />
              <span>{vibe.location}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [vibes, setVibes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    condition: searchParams.get("condition") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  });

  const categories = [
    "Electronics",
    "Fashion",
    "Books",
    "Toys",
    "Home",
    "Sports",
    "Beauty",
    "Other",
  ];
  const conditions = ["new", "like-new", "good", "fair", "poor"];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchResults();
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const searchParams = {
        q: searchQuery.trim() || undefined,
        category: filters.category || undefined,
        condition: filters.condition || undefined,
        minPrice: filters.minPrice ? parseInt(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
      };

      console.log('Search params:', searchParams);
      const response = await searchVibes(searchParams);
      console.log('Search response:', response);
      setVibes(response.data || []);
    } catch (error) {
      console.error("Error searching vibes:", error);
      setVibes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // Auto-search when search query or filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchResults();
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters.category, filters.condition, filters.minPrice, filters.maxPrice]);

  return (
    <div className="bg-gruvbox-dark-bg0 min-h-screen">
      <PageShell width="full" className="py-8">
        <div className="flex gap-6">
        {/* Main Search Content */}
        <div className="flex-1 min-w-0">
          <FadeIn>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Search Vibes</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search Form */}
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for items, categories, or users..."
                      className="flex-1 px-4 py-3 rounded-lg border border-gruvbox-dark-bg2 bg-gruvbox-dark-bg0 text-gruvbox-dark-fg0 placeholder-gruvbox-gray focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent transition"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gruvbox-orange text-gruvbox-dark-bg0 rounded-lg hover:bg-gruvbox-yellow transition font-medium flex items-center gap-2"
                    >
                      <IconSearch size={20} />
                      Search
                    </button>
                  </div>
                </form>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gruvbox-dark-fg1 mb-2">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) =>
                        setFilters({ ...filters, category: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gruvbox-dark-bg2 rounded-lg bg-gruvbox-dark-bg0 text-gruvbox-dark-fg0"
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gruvbox-dark-fg1 mb-2">
                      Condition
                    </label>
                    <select
                      value={filters.condition}
                      onChange={(e) =>
                        setFilters({ ...filters, condition: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gruvbox-dark-bg2 rounded-lg bg-gruvbox-dark-bg0 text-gruvbox-dark-fg0"
                    >
                      <option value="">All Conditions</option>
                      {conditions.map((cond) => (
                        <option key={cond} value={cond}>
                          {cond}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gruvbox-dark-fg1 mb-2">
                      Min Price (VND)
                    </label>
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) =>
                        setFilters({ ...filters, minPrice: e.target.value })
                      }
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gruvbox-dark-bg2 rounded-lg bg-gruvbox-dark-bg0 text-gruvbox-dark-fg0 placeholder-gruvbox-gray"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gruvbox-dark-fg1 mb-2">
                      Max Price (VND)
                    </label>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        setFilters({ ...filters, maxPrice: e.target.value })
                      }
                      placeholder="No limit"
                      className="w-full px-3 py-2 border border-gruvbox-dark-bg2 rounded-lg bg-gruvbox-dark-bg0 text-gruvbox-dark-fg0 placeholder-gruvbox-gray"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Results */}
          <FadeIn>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gruvbox-dark-fg0">
                {loading ? "Searching..." : `${vibes.length} results found`}
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gruvbox-dark-bg2 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gruvbox-dark-bg2 rounded mb-2"></div>
                      <div className="h-3 bg-gruvbox-dark-bg2 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : vibes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vibes.map((vibe: any) => (
                  <Link key={vibe.id} href={`/vibes/${vibe.id}`}>
                    <VibeCard vibe={vibe} />
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gruvbox-gray text-lg mb-4">
                    No results found for your search.
                  </p>
                  <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-gruvbox-orange text-gruvbox-dark-bg0 rounded-lg hover:bg-gruvbox-yellow transition"
                  >
                    Browse All Items
                  </Link>
                </CardContent>
              </Card>
            )}
          </FadeIn>
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-20">
            <TrendingVibes limit={8} />
          </div>
        </aside>
      </div>
    </PageShell>
    </div>
  );
}
