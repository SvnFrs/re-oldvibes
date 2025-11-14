"use client";

import { useState, useEffect } from "react";
import {
  IconSearch,
  IconHeart,
  IconEye,
  IconMessageCircle,
  IconMapPin,
  IconPhoto,
  IconDeviceMobile,
  IconShirt,
  IconBook,
  IconBallFootball,
  IconHome,
  IconBallBasketball,
  IconMoodSmile,
  IconTool,
  IconSparkles,
  IconTrendingUp,
  IconArrowRight,
  IconFilter,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { PageShell } from "./_components/layout/PageShell";
import { FadeIn, SlideUp } from "./_motion/MotionWrappers";
import { getVibes } from "./_apis/common/vibes";
import { useAuth } from "./_contexts/AuthContext";
import BannerCarousel from "./_components/banner/BannerCarousel";
import TrendingVibes from "./_components/recommendations/TrendingVibes";

// Enhanced Vibe Card Component
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

  return (
    <div className="group bg-gruvbox-dark-bg1 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gruvbox-dark-bg2 hover:border-gruvbox-orange/50 hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-56 w-full overflow-hidden">
        {vibe.mediaFiles && vibe.mediaFiles.length > 0 ? (
          <Image
            src={vibe.mediaFiles[0].url}
            alt={vibe.itemName}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gruvbox-dark-bg2 flex items-center justify-center">
            <IconPhoto size={48} className="text-gruvbox-gray" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Condition Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${getConditionColor(
              vibe.condition
            )}`}
          >
            {vibe.condition}
          </span>
        </div>

        {/* Quick Stats Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-1 text-xs bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
            <IconHeart size={12} />
            <span>{vibe.likesCount}</span>
          </div>
          <div className="flex items-center gap-1 text-xs bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
            <IconEye size={12} />
            <span>{vibe.views}</span>
          </div>
          <div className="flex items-center gap-1 text-xs bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
            <IconMessageCircle size={12} />
            <span>{vibe.commentsCount}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Price */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-gruvbox-dark-fg0 text-base line-clamp-2 flex-1 min-h-[3rem]">
            {vibe.itemName}
          </h3>
        </div>

        <div className="mb-3">
          <span className="text-xl font-bold bg-gradient-to-r from-gruvbox-orange to-gruvbox-yellow bg-clip-text text-transparent">
            {formatPrice(vibe.price)}
          </span>
        </div>

        <p className="text-gruvbox-dark-fg3 text-sm line-clamp-2 mb-3 min-h-[2.5rem]">
          {vibe.description}
        </p>

        {/* User and Location */}
        <div className="flex items-center justify-between pt-3 border-t border-gruvbox-dark-bg2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gruvbox-orange to-gruvbox-yellow flex items-center justify-center">
              <span className="text-xs font-bold text-gruvbox-dark-bg0">
                {vibe.user?.name?.charAt(0) || "U"}
              </span>
            </div>
            <span className="text-sm font-medium text-gruvbox-dark-fg1 truncate max-w-[100px]">
              {vibe.user?.name || "Unknown"}
            </span>
          </div>

          {vibe.location && (
            <div className="flex items-center gap-1 text-xs text-gruvbox-gray">
              <IconMapPin size={12} />
              <span className="truncate max-w-[80px]">{vibe.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Enhanced Categories Component
function CategoriesSection() {
  const categories = [
    { name: "Electronics", icon: IconDeviceMobile, color: "from-blue-500 to-cyan-500" },
    { name: "Fashion", icon: IconShirt, color: "from-pink-500 to-rose-500" },
    { name: "Books", icon: IconBook, color: "from-amber-500 to-orange-500" },
    { name: "Toys", icon: IconBallFootball, color: "from-green-500 to-emerald-500" },
    { name: "Home", icon: IconHome, color: "from-purple-500 to-violet-500" },
    { name: "Sports", icon: IconBallBasketball, color: "from-red-500 to-pink-500" },
    { name: "Beauty", icon: IconMoodSmile, color: "from-yellow-500 to-amber-500" },
    { name: "Other", icon: IconTool, color: "from-gray-500 to-slate-500" },
  ];

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <IconFilter className="w-6 h-6 text-gruvbox-orange" />
          <h2 className="text-2xl font-bold text-gruvbox-dark-fg0">
            Browse Categories
          </h2>
        </div>
        <Link
          href="/search"
          className="text-sm font-medium text-gruvbox-orange hover:text-gruvbox-yellow transition flex items-center gap-1"
        >
          View All
          <IconArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Link
              key={category.name}
              href={`/search?category=${encodeURIComponent(category.name)}`}
              className="group relative bg-gruvbox-dark-bg1 rounded-xl p-4 text-center hover:shadow-lg transition-all duration-300 border border-gruvbox-dark-bg2 hover:border-gruvbox-orange/50 hover:-translate-y-1"
            >
              <div className={`mb-3 flex justify-center`}>
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent size={24} className="text-white" />
                </div>
              </div>
              <h3 className="font-semibold text-gruvbox-dark-fg0 text-sm group-hover:text-gruvbox-orange transition-colors">
                {category.name}
              </h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// Stats Section Component
// function StatsSection() {
//   const [stats, setStats] = useState({
//     totalVibes: 0,
//     activeUsers: 0,
//     totalViews: 0,
//   });

//   useEffect(() => {
//     // Simulate fetching stats - replace with actual API call
//     setStats({
//       totalVibes: 1234,
//       activeUsers: 567,
//       totalViews: 45678,
//     });
//   }, []);

//   const statItems = [
//     { label: "Active Listings", value: stats.totalVibes, icon: IconSparkles },
//     { label: "Active Users", value: stats.activeUsers, icon: IconTrendingUp },
//     { label: "Total Views", value: stats.totalViews, icon: IconEye },
//   ];

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//       {statItems.map((stat, index) => (
//         <FadeIn key={stat.label} delay={index * 0.1}>
//           <div className="bg-gruvbox-dark-bg1 rounded-xl p-6 border border-gruvbox-dark-bg2 hover:border-gruvbox-orange/50 transition-colors">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-gruvbox-gray text-sm mb-1">{stat.label}</p>
//                 <p className="text-3xl font-bold text-gruvbox-dark-fg0">
//                   {stat.value.toLocaleString()}
//                 </p>
//               </div>
//               <div className="w-12 h-12 rounded-full bg-gruvbox-orange/10 flex items-center justify-center">
//                 <stat.icon className="w-6 h-6 text-gruvbox-orange" />
//               </div>
//             </div>
//           </div>
//         </FadeIn>
//       ))}
//     </div>
//   );
// }

// Main Homepage Component
export default function HomePage() {
  interface Vibe {
    id: string;
    itemName: string;
    price: number;
    description: string;
    condition: string;
    mediaFiles: Array<{ url: string }>;
    likesCount: number;
    views: number;
    commentsCount: number;
    user?: { name: string };
    location?: string;
  }

  const [vibes, setVibes] = useState<Vibe[]>([]);
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

  useEffect(() => {
    const fetchVibes = async () => {
      try {
        const response = await getVibes({ limit: 12 });
        setVibes(response.data || []);
        setPagination(response.pagination);
      } catch (error) {
        console.error("Error fetching vibes:", error);
        setVibes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVibes();
  }, []);

  const loadMoreVibes = async () => {
    if (!pagination.hasNext || loadingMore) return;

    setLoadingMore(true);
    try {
      const response = await getVibes({
        limit: 12,
        offset: vibes.length,
      });
      setVibes((prev) => [...prev, ...response.data]);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error loading more vibes:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="bg-gruvbox-dark-bg0 min-h-screen">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gruvbox-orange via-gruvbox-yellow to-gruvbox-aqua/40">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gruvbox-orange/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gruvbox-yellow/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <section className="relative py-20 md:py-32">
          <PageShell width="lg" className="text-center">
            <FadeIn>
              <div className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <span className="text-sm font-medium text-white">✨ Welcome to OldVibes</span>
              </div>
            </FadeIn>

            <FadeIn>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
                Discover Vintage
                <br />
                <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  Treasures
                </span>
              </h1>
            </FadeIn>

            <SlideUp>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
                Browse unique secondhand items shared by our community. Find your next favorite piece or sell your vintage finds.
              </p>
            </SlideUp>

            <SlideUp>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                }}
                className="max-w-2xl mx-auto"
              >
                <div className="relative group">
                  <IconSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gruvbox-gray z-10" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for vintage items, categories, or sellers..."
                    className="w-full pl-14 pr-32 py-5 rounded-2xl text-base bg-white/95 backdrop-blur-sm text-gruvbox-dark-bg0 placeholder-gruvbox-gray border-2 border-white/20 focus:ring-4 focus:ring-white/30 focus:border-white shadow-2xl transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-gruvbox-orange text-white font-medium hover:bg-gruvbox-dark-bg0 transition-all shadow-lg hover:shadow-xl"
                    aria-label="Search"
                  >
                    Search
                  </button>
                </div>
              </form>
            </SlideUp>
          </PageShell>
        </section>
      </div>

      {/* Banner Carousel */}
      <div className="bg-gruvbox-dark-bg0 border-b border-gruvbox-dark-bg2">
        <div className="max-w-7xl mx-auto px-4">
          <BannerCarousel />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Section */}
        {/*<StatsSection />*/}

        <div className="flex gap-8">
          {/* Main Feed */}
          <div className="flex-1 min-w-0">
            {/* Categories */}
            <CategoriesSection />

            {/* Featured Vibes */}
            <section className="py-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <IconSparkles className="w-6 h-6 text-gruvbox-orange" />
                  <h2 className="text-2xl md:text-3xl font-bold text-gruvbox-dark-fg0">
                    Latest Vibes
                  </h2>
                </div>
                <Link
                  href="/feed"
                  className="text-sm font-medium text-gruvbox-orange hover:text-gruvbox-yellow transition flex items-center gap-1"
                >
                  View All
                  <IconArrowRight size={16} />
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
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
              ) : vibes.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vibes.map((vibe: Vibe, index: number) => (
                      <FadeIn key={vibe.id}>
                        <Link href={`/vibes/${vibe.id}`}>
                          <VibeCard vibe={vibe} />
                        </Link>
                      </FadeIn>
                    ))}
                  </div>

                  {pagination?.hasNext && (
                    <div className="text-center mt-12">
                      <button
                        onClick={loadMoreVibes}
                        disabled={loadingMore}
                        className="group px-8 py-4 bg-gradient-to-r from-gruvbox-orange to-gruvbox-yellow text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 mx-auto"
                      >
                        {loadingMore ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Loading...</span>
                          </>
                        ) : (
                          <>
                            <span>Load More Vibes</span>
                            <IconArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                      <p className="text-sm text-gruvbox-gray mt-4">
                        Showing <span className="font-semibold text-gruvbox-dark-fg0">{vibes.length}</span> of{" "}
                        <span className="font-semibold text-gruvbox-dark-fg0">{pagination.total}</span> vibes
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <IconPhoto className="w-16 h-16 text-gruvbox-gray mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gruvbox-dark-fg0 mb-2">
                    No Vibes Yet
                  </h3>
                  <p className="text-gruvbox-gray mb-6">
                    Be the first to share your vintage finds!
                  </p>
                  <Link
                    href="/upload"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gruvbox-orange text-white rounded-lg hover:bg-gruvbox-yellow transition"
                  >
                    <IconSparkles size={20} />
                    <span>Upload Your First Vibe</span>
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar - Trending */}
          <aside className="hidden lg:block w-96 flex-shrink-0">
            <div className="sticky top-20 space-y-6">
              <FadeIn>
                <TrendingVibes limit={8} />
              </FadeIn>

              {/* Call to Action Card */}
              <FadeIn>
                <div className="bg-gradient-to-br from-gruvbox-orange to-gruvbox-yellow rounded-xl p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">Start Selling Today!</h3>
                  <p className="text-white/90 text-sm mb-4">
                    Share your vintage finds with our community and turn your treasures into cash.
                  </p>
                  <Link
                    href="/upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gruvbox-orange rounded-lg font-medium hover:shadow-lg transition"
                  >
                    <IconSparkles size={18} />
                    <span>Upload Now</span>
                  </Link>
                </div>
              </FadeIn>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}