"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../_contexts/AuthContext";
import Wrapper from "../_sections/wrapper";
import { Star } from "lucide-react";
import { MapPin } from "lucide-react";
import { Eye } from "lucide-react";
import { MessageCircle } from "lucide-react";
import { Heart } from "lucide-react";
import { Share2 } from "lucide-react";
import { Search, Filter, X } from "lucide-react";
import Image from "next/image";
import {
  getWishlistByUserId,
  removeVibeFromWishlist,
} from "../_apis/common/wishlist";
import Cookies from "js-cookie";

// interface WishlistItem {}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [viewsRange, setViewsRange] = useState({ min: "", max: "" });
  const [showFilters, setShowFilters] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const userId = Cookies.get("userId");

  const toggleLike = (id: string) => {
    setWishlistItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              isLiked: !item.isLiked,
              likes: item.isLiked ? item.likes - 1 : item.likes + 1,
            }
          : item
      )
    );
  };

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
      // Xóa khỏi wishlist
      const response = await removeVibeFromWishlist(vibeId, userId);
      console.log("check response", response);

      // Cập nhật state để xóa item khỏi danh sách
      setWishlistItems((prev) =>
        prev.filter((item) => item.id !== wishlistItemId)
      );

      console.log("Removed from wishlist");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      // Có thể thêm toast notification để thông báo lỗi
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
      // Search filter
      const matchesSearch = item.vibeId.itemName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Price filter
      const price = item.vibeId.price;
      const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
      const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
      const matchesPrice = price >= minPrice && price <= maxPrice;

      // Views filter
      const views = item.vibeId.views || 0;
      const minViews = viewsRange.min ? parseInt(viewsRange.min) : 0;
      const maxViews = viewsRange.max ? parseInt(viewsRange.max) : Infinity;
      const matchesViews = views >= minViews && views <= maxViews;

      return matchesSearch && matchesPrice && matchesViews;
    });
  }, [wishlistItems, searchTerm, priceRange, viewsRange]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange({ min: "", max: "" });
    setViewsRange({ min: "", max: "" });
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm ||
    priceRange.min ||
    priceRange.max ||
    viewsRange.min ||
    viewsRange.max;

  useEffect(() => {
    const fetchWishlistItems = async () => {
      if (userId) {
        const response = await getWishlistByUserId(userId);
        setWishlistItems(response.wishlists[0].wishlist_vibes);
      }
    };
    fetchWishlistItems();
  }, []);

  return (
    <Wrapper>
      <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-[#FCF2C8] dark:bg-gruvbox-dark-bg2">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              My Wishlist
            </h2>
            <p className="text-gray-600">Items you've saved for later</p>
          </div>

          {/* Search and Filter Controls */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle Button */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter size={16} />
                <span>Bộ lọc</span>
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X size={16} />
                  <span>Xóa bộ lọc</span>
                </button>
              )}
            </div>

            {/* Filter Controls */}
            {showFilters && (
              <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Price Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lọc theo giá (VND)
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Từ"
                        value={priceRange.min}
                        onChange={(e) =>
                          setPriceRange((prev) => ({
                            ...prev,
                            min: e.target.value,
                          }))
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        placeholder="Đến"
                        value={priceRange.max}
                        onChange={(e) =>
                          setPriceRange((prev) => ({
                            ...prev,
                            max: e.target.value,
                          }))
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Views Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lọc theo lượt xem
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Từ"
                        value={viewsRange.min}
                        onChange={(e) =>
                          setViewsRange((prev) => ({
                            ...prev,
                            min: e.target.value,
                          }))
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        placeholder="Đến"
                        value={viewsRange.max}
                        onChange={(e) =>
                          setViewsRange((prev) => ({
                            ...prev,
                            max: e.target.value,
                          }))
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results Count */}
            <div className="text-sm text-gray-600">
              Hiển thị {filteredItems.length} trong {wishlistItems.length} sản
              phẩm
            </div>
          </div>

          {/* Wishlist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                {/* Image Container */}
                <div
                  onClick={() => router.push(`/vibes/${item.vibeId._id}`)}
                  className="relative aspect-square cursor-pointer"
                >
                  <Image
                    src={item.vibeId.mediaFiles[0].url}
                    alt={item.vibeId.mediaFiles[0].url}
                    className="w-full h-full object-cover"
                    width={500}
                    height={500}
                  />
                  <button
                    onClick={() => toggleWishlist(item.id, item.vibeId._id)}
                    className="absolute top-3 right-3 p-2 rounded-full transition-colors bg-orange-500 text-white hover:bg-red-500"
                  >
                    <Star size={16} className="fill-current" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Title and Price */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                      {item.vibeId.itemName}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-xl font-bold text-orange-600">
                      {formatPrice(item.vibeId.price)}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.vibeId.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Seller Information */}
                  {/* <div className="flex items-center space-x-2 mb-3 p-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                      <span className="text-sm text-white">
                        {item.vibeId.user?.name?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        cds
                      </p>
                    </div>
                  </div> */}

                  {/* Location and Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <MapPin size={12} />
                      <span>{item.vibeId.location}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Eye size={12} />
                        <span>{item.vibeId.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle size={12} />
                        <span>{item.vibeId.commentsCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <button
                      onClick={() => toggleLike(item.id)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                        item.isLiked
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600"
                      }`}
                    >
                      <Heart
                        size={14}
                        className={item.isLiked ? "fill-current" : ""}
                      />
                      <span>{item.vibeId.likesCount}</span>
                    </button>

                    <button
                      onClick={() =>
                        handleShare(
                          `https://oldvibes.vercel.app/vibes/${item.vibeId._id}`
                        )
                      }
                      className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                    >
                      <Share2 size={14} />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 && wishlistItems.length > 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Không tìm thấy sản phẩm
              </h3>
              <p className="text-gray-600 mb-6">
                Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

          {/* Original Empty State */}
          {wishlistItems.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Star size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-gray-600 mb-6">
                Start exploring to find vintage items you love
              </p>
            </div>
          )}
        </div>
      </main>
    </Wrapper>
  );
}
