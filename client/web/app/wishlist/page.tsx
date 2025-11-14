"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../_contexts/AuthContext";
import {
  IconStar,
  IconStarFilled,
  IconMapPin,
  IconEye,
  IconMessageCircle,
  IconHeart,
  IconShare,
  IconSearch,
  IconFilter,
  IconX,
  IconTrendingUp,
  IconCurrencyDollar,
  IconAdjustments,
} from "@tabler/icons-react";
import Image from "next/image";
import {
  getWishlistByUserId,
  removeVibeFromWishlist,
} from "../_apis/common/wishlist";
import Cookies from "js-cookie";
import { PageShell, SectionHeader } from "../_components/layout/PageShell";
import AuthGuard from "../_components/auth/AuthGuard";
import { FadeIn, SlideUp } from "../_motion/MotionWrappers";

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [viewsRange, setViewsRange] = useState({ min: "", max: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const userId = Cookies.get("userId");

  const toggleWishlist = async (wishlistItemId: string, vibeId: string) => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!userId) {
      console.error("User ID not found");
      return;
    }

    try {
      await removeVibeFromWishlist(vibeId, userId);
      setWishlistItems((prev) =>
        prev.filter((item) => item.id !== wishlistItemId)
      );
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  const handleShare = (link: string) => {
    window.open(`https://www.facebook.com/share.php?u=${link}`, "_blank");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Filter logic
  const filteredItems = useMemo(() => {
    return wishlistItems.filter((item) => {
      const matchesSearch = item.vibeId.itemName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const price = item.vibeId.price;
      const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
      const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
      const matchesPrice = price >= minPrice && price <= maxPrice;

      const views = item.vibeId.views || 0;
      const minViews = viewsRange.min ? parseInt(viewsRange.min) : 0;
      const maxViews = viewsRange.max ? parseInt(viewsRange.max) : Infinity;
      const matchesViews = views >= minViews && views <= maxViews;

      return matchesSearch && matchesPrice && matchesViews;
    });
  }, [wishlistItems, searchTerm, priceRange, viewsRange]);

  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange({ min: "", max: "" });
    setViewsRange({ min: "", max: "" });
  };

  const hasActiveFilters =
    searchTerm ||
    priceRange.min ||
    priceRange.max ||
    viewsRange.min ||
    viewsRange.max;

  useEffect(() => {
    const fetchWishlistItems = async () => {
      if (userId) {
        try {
          const response = await getWishlistByUserId(userId);
          setWishlistItems(response.wishlists[0]?.wishlist_vibes || []);
        } catch (error) {
          console.error("Error fetching wishlist:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    fetchWishlistItems();
  }, [userId]);

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

  if (isLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="min-h-screen bg-gruvbox-dark-bg0 py-12">
          <PageShell width="xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gruvbox-dark-bg1 rounded-xl overflow-hidden border border-gruvbox-dark-bg2 animate-pulse"
                >
                  <div className="aspect-square bg-gruvbox-dark-bg2"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gruvbox-dark-bg2 rounded w-3/4"></div>
                    <div className="h-6 bg-gruvbox-dark-bg2 rounded w-1/2"></div>
                    <div className="h-3 bg-gruvbox-dark-bg2 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </PageShell>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gruvbox-dark-bg0 py-8">
        <PageShell width="xl">
          {/* Header */}
          <SectionHeader
            title="My Wishlist"
            subtitle="Items you've saved for later"
            actions={
              <div className="flex items-center gap-2 text-sm text-gruvbox-dark-fg2">
                <IconStarFilled className="w-4 h-4 text-gruvbox-yellow" />
                <span className="font-medium">
                  {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"}
                </span>
              </div>
            }
          />

          {/* Search and Filter Controls */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gruvbox-gray" size={20} />
              <input
                type="text"
                placeholder="Search by item name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gruvbox-dark-bg1 border border-gruvbox-gray/20 rounded-lg focus:ring-2 focus:ring-gruvbox-yellow/50 focus:border-transparent text-gruvbox-dark-fg0 placeholder-gruvbox-gray"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showFilters
                    ? "bg-gruvbox-yellow text-gruvbox-dark-bg0"
                    : "bg-gruvbox-dark-bg1 border border-gruvbox-gray/20 text-gruvbox-dark-fg0 hover:bg-gruvbox-dark-bg2"
                }`}
              >
                <IconFilter size={16} />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-gruvbox-orange rounded-full"></span>
                )}
              </button>

              <div className="flex items-center gap-3 text-sm text-gruvbox-gray">
                <span>
                  Showing {filteredItems.length} of {wishlistItems.length}
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center space-x-1 px-3 py-1.5 text-gruvbox-red hover:bg-gruvbox-red/10 rounded-lg transition-colors"
                  >
                    <IconX size={14} />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <FadeIn>
                <div className="bg-gruvbox-dark-bg1 p-4 rounded-lg border border-gruvbox-gray/20 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Price Filter */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gruvbox-dark-fg0 mb-2">
                        <IconCurrencyDollar size={16} className="text-gruvbox-yellow" />
                        Price Range (VND)
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={priceRange.min}
                          onChange={(e) =>
                            setPriceRange((prev) => ({ ...prev, min: e.target.value }))
                          }
                          className="flex-1 px-3 py-2 bg-gruvbox-dark-bg0 border border-gruvbox-gray/20 rounded-lg focus:ring-2 focus:ring-gruvbox-yellow/50 focus:border-transparent text-gruvbox-dark-fg0"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={priceRange.max}
                          onChange={(e) =>
                            setPriceRange((prev) => ({ ...prev, max: e.target.value }))
                          }
                          className="flex-1 px-3 py-2 bg-gruvbox-dark-bg0 border border-gruvbox-gray/20 rounded-lg focus:ring-2 focus:ring-gruvbox-yellow/50 focus:border-transparent text-gruvbox-dark-fg0"
                        />
                      </div>
                    </div>

                    {/* Views Filter */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gruvbox-dark-fg0 mb-2">
                        <IconTrendingUp size={16} className="text-gruvbox-aqua" />
                        Views Range
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={viewsRange.min}
                          onChange={(e) =>
                            setViewsRange((prev) => ({ ...prev, min: e.target.value }))
                          }
                          className="flex-1 px-3 py-2 bg-gruvbox-dark-bg0 border border-gruvbox-gray/20 rounded-lg focus:ring-2 focus:ring-gruvbox-yellow/50 focus:border-transparent text-gruvbox-dark-fg0"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={viewsRange.max}
                          onChange={(e) =>
                            setViewsRange((prev) => ({ ...prev, max: e.target.value }))
                          }
                          className="flex-1 px-3 py-2 bg-gruvbox-dark-bg0 border border-gruvbox-gray/20 rounded-lg focus:ring-2 focus:ring-gruvbox-yellow/50 focus:border-transparent text-gruvbox-dark-fg0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            )}
          </div>

          {/* Wishlist Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <FadeIn key={item.id}>
                  <div className="bg-gruvbox-dark-bg1 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gruvbox-dark-bg2 hover:border-gruvbox-yellow/50 group">
                    {/* Image Container */}
                    <div
                      onClick={() => router.push(`/vibes/${item.vibeId._id}`)}
                      className="relative aspect-square cursor-pointer overflow-hidden"
                    >
                      <Image
                        src={item.vibeId.mediaFiles[0]?.url || "/placeholder.jpg"}
                        alt={item.vibeId.itemName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        width={500}
                        height={500}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(item.id, item.vibeId._id);
                        }}
                        className="absolute top-3 right-3 p-2 rounded-full transition-all bg-gruvbox-yellow text-gruvbox-dark-bg0 hover:bg-gruvbox-red hover:scale-110 shadow-lg"
                      >
                        <IconStarFilled size={16} />
                      </button>

                      {/* Condition Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.vibeId.condition)}`}>
                          {item.vibeId.condition}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gruvbox-dark-fg0 line-clamp-2 mb-2 min-h-[3.5rem]">
                        {item.vibeId.itemName}
                      </h3>

                      {/* Price */}
                      <div className="mb-3">
                        <span className="text-xl font-bold text-gruvbox-orange">
                          {formatPrice(item.vibeId.price)}
                        </span>
                      </div>

                      {/* Tags */}
                      {item.vibeId.tags && item.vibeId.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.vibeId.tags.slice(0, 3).map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gruvbox-dark-bg2 text-gruvbox-dark-fg2 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                          {item.vibeId.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gruvbox-dark-bg2 text-gruvbox-gray text-xs rounded-full">
                              +{item.vibeId.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Location and Stats */}
                      <div className="flex items-center justify-between text-xs text-gruvbox-gray mb-3 pb-3 border-b border-gruvbox-dark-bg2">
                        {item.vibeId.location && (
                          <div className="flex items-center gap-1">
                            <IconMapPin size={12} />
                            <span className="truncate">{item.vibeId.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <IconEye size={12} />
                            <span>{item.vibeId.views || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <IconMessageCircle size={12} />
                            <span>{item.vibeId.commentsCount || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gruvbox-dark-bg2 text-gruvbox-dark-fg2 text-sm flex-1 justify-center">
                          <IconHeart size={14} className="text-gruvbox-red" />
                          <span>{item.vibeId.likesCount || 0}</span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(`https://oldvibes.vercel.app/vibes/${item.vibeId._id}`);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gruvbox-dark-bg2 text-gruvbox-dark-fg2 hover:bg-gruvbox-blue/20 hover:text-gruvbox-blue transition-colors text-sm flex-1 justify-center"
                        >
                          <IconShare size={14} />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          ) : (
            /* Empty States */
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gruvbox-dark-bg1 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-gruvbox-gray/20">
                {wishlistItems.length === 0 ? (
                  <IconStarFilled size={32} className="text-gruvbox-gray" />
                ) : (
                  <IconSearch size={32} className="text-gruvbox-gray" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-gruvbox-dark-fg0 mb-2">
                {wishlistItems.length === 0
                  ? "Your wishlist is empty"
                  : "No items found"}
              </h3>
              <p className="text-gruvbox-gray mb-6">
                {wishlistItems.length === 0
                  ? "Start exploring to find vintage items you love"
                  : "Try adjusting your filters or search terms"}
              </p>
              {wishlistItems.length === 0 ? (
                <button
                  onClick={() => router.push("/")}
                  className="px-6 py-3 bg-gruvbox-yellow text-gruvbox-dark-bg0 font-medium rounded-lg hover:bg-gruvbox-yellow/90 transition-colors"
                >
                  Start Exploring
                </button>
              ) : (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gruvbox-orange text-white font-medium rounded-lg hover:bg-gruvbox-orange/90 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </PageShell>
      </div>
    </AuthGuard>
  );
}