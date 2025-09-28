"use client";

import { useState, useEffect } from "react";
import {
  IconSearch,
  IconHeart,
  IconEye,
  IconMessageCircle,
  IconMapPin,
  IconClock,
  IconPhoto,
  IconDeviceMobile,
  IconShirt,
  IconBook,
  IconBallFootball,
  IconHome,
  IconBallBasketball,
  IconMoodSmile,
  IconTool,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import Wrapper from "./_sections/wrapper";
import { getVibes } from "./_apis/common/vibes";

// Vibe Card Component
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

  return (
    <div className="bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg1 rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gruvbox-light-bg1 dark:border-gruvbox-dark-bg2">
      {/* Image */}
      <div className="relative h-48 w-full">
        {vibe.mediaFiles && vibe.mediaFiles.length > 0 ? (
          <Image
            src={vibe.mediaFiles[0].url}
            alt={vibe.itemName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 flex items-center justify-center">
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
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 text-lg line-clamp-1">
            {vibe.itemName}
          </h3>
          <span className="text-lg font-bold text-gruvbox-orange">
            {formatPrice(vibe.price)}
          </span>
        </div>

        <p className="text-gruvbox-light-fg3 dark:text-gruvbox-dark-fg3 text-sm line-clamp-2 mb-3">
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
            <div className="w-6 h-6 rounded-full bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 flex items-center justify-center">
              <span className="text-xs font-bold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1">
                {vibe.user?.name?.charAt(0) || "U"}
              </span>
            </div>
            <span className="text-sm font-medium text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1">
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
      </div>
    </div>
  );
}

// Categories Component
function CategoriesSection() {
  const categories = [
    { name: "Electronics", icon: IconDeviceMobile, count: 245 },
    { name: "Fashion", icon: IconShirt, count: 189 },
    { name: "Books", icon: IconBook, count: 156 },
    { name: "Toys", icon: IconBallFootball, count: 98 },
    { name: "Home", icon: IconHome, count: 167 },
    { name: "Sports", icon: IconBallBasketball, count: 89 },
    { name: "Beauty", icon: IconMoodSmile, count: 134 },
    { name: "Other", icon: IconTool, count: 76 },
  ];

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-6">
        Browse Categories
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Link
              key={category.name}
              href={`/search?category=${encodeURIComponent(category.name)}`}
              className="bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg1 rounded-xl p-3 md:p-4 text-center hover:shadow-md transition-shadow border border-gruvbox-light-bg1 dark:border-gruvbox-dark-bg2 hover:border-gruvbox-orange"
            >
              <div className="mb-2 flex justify-center">
                <IconComponent size={24} className="text-gruvbox-orange md:w-8 md:h-8" />
              </div>
              <h3 className="font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 text-sm">
                {category.name}
              </h3>
              {/* <p className="text-xs text-gruvbox-gray">
                {category.count} items
              </p> */}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// Main Homepage Component
export default function HomePage() {
  const [vibes, setVibes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Fetch vibes on component mount
  useEffect(() => {
    const fetchVibes = async () => {
      try {
        const response = await getVibes({ page: 1, limit: 12 });
        setVibes(response.data || []);
        setPagination(response.pagination);
      } catch (error) {
        console.error("Error fetching vibes:", error);
        setVibes([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    const loadMoreVibes = async () => {
      if (!pagination.hasNext || loadingMore) return;
      
      setLoadingMore(true);
      try {
        const response = await getVibes({ 
          page: pagination.page + 1, 
          limit: 12 
        });
        setVibes(prev => [...prev, ...response.data]);
        setPagination(response.pagination);
      } catch (error) {
        console.error("Error loading more vibes:", error);
      } finally {
        setLoadingMore(false);
      }
    };

    fetchVibes();
  }, []);

  return (
    <Wrapper>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-gruvbox-orange to-gruvbox-yellow py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Discover Amazing Finds
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Browse thousands of unique items from our community
          </p>

          {/* Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = `/search?q=${encodeURIComponent(
                searchQuery
              )}`;
            }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for items, categories, or users..."
                className="w-full px-6 py-4 pr-12 rounded-xl text-lg bg-white/95 backdrop-blur-sm text-gruvbox-dark-fg0 placeholder-gruvbox-gray border-2 border-white/20 focus:ring-4 focus:ring-white/40 focus:border-white/40 focus:bg-white shadow-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-4 bg-gruvbox-blue text-white rounded-lg hover:bg-blue-600 transition shadow-md"
              >
                <IconSearch size={20} />
              </button>
            </div>
          </form>
        </div>
      </section>
      <div className="bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg2 border-b border-gruvbox-gray sticky top-0 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          {/* Categories */}
          <CategoriesSection />

          {/* Featured Vibes */}
          <section className="py-6 md:py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
                Latest Vibes
              </h2>
              <Link
                href="/feed"
                className="text-gruvbox-orange hover:text-gruvbox-yellow font-medium"
              >
                View All →
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg1 rounded-xl p-4 animate-pulse border border-gruvbox-light-bg1 dark:border-gruvbox-dark-bg2"
                  >
                    <div className="h-48 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded mb-2"></div>
                    <div className="h-3 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {vibes.map((vibe: any) => (
                    <Link key={vibe.id} href={`/vibes/${vibe.id}`}>
                      <VibeCard vibe={vibe} />
                    </Link>
                  ))}
                </div>
                
                {pagination.hasNext && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => {
                        const loadMoreVibes = async () => {
                          if (!pagination.hasNext || loadingMore) return;
                          
                          setLoadingMore(true);
                          try {
                            const response = await getVibes({ 
                              page: pagination.page + 1, 
                              limit: 12 
                            });
                            setVibes(prev => [...prev, ...response.data]);
                            setPagination(response.pagination);
                          } catch (error) {
                            console.error("Error loading more vibes:", error);
                          } finally {
                            setLoadingMore(false);
                          }
                        };
                        loadMoreVibes();
                      }}
                      disabled={loadingMore}
                      className="px-8 py-3 bg-gruvbox-orange text-white rounded-lg hover:bg-gruvbox-yellow transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingMore ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Loading...
                        </span>
                      ) : (
                        "Load More Vibes"
                      )}
                    </button>
                    <p className="text-sm text-gruvbox-gray mt-2">
                      Showing {vibes.length} of {pagination.total} vibes
                    </p>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Call to Action */}
          {/* <section className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 rounded-2xl p-8 text-center border border-gruvbox-light-bg2 dark:border-gruvbox-dark-bg2">
            <h2 className="text-2xl font-bold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-4">
              Ready to Start Trading?
            </h2>
            <p className="text-gruvbox-light-fg3 dark:text-gruvbox-dark-fg3 mb-6">
              Join thousands of users buying and selling unique items in our
              community
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="inline-block px-8 py-3 rounded-lg bg-gruvbox-orange text-gruvbox-light-bg0 dark:text-gruvbox-dark-bg0 font-bold hover:bg-gruvbox-yellow transition"
              >
                Get Started Free
              </Link>
              <Link
                href="/about"
                className="inline-block px-8 py-3 rounded-lg border border-gruvbox-orange text-gruvbox-orange font-bold hover:bg-gruvbox-orange hover:text-gruvbox-light-bg0 dark:hover:text-gruvbox-dark-bg0 transition"
              >
                Learn More
              </Link>
            </div>
          </section> */}
        </div>
      </div>
    </Wrapper>
  );
}
