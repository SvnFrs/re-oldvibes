"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconPhoto,
  IconEdit,
  IconEye,
  IconHeart,
  IconMessageCircle,
  IconCalendar,
  IconTag,
  IconMapPin,
  IconRefresh,
  IconAlertCircle,
  IconClock,
  IconArchive,
  IconClockHour4,
  IconCheck,
  IconX,
  IconTrendingUp,
  IconSparkles,
  IconFilter,
  IconSearch,
  IconChevronDown,
  IconPlus,
  IconPackage,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import { PageShell, SectionHeader } from "../_components/layout/PageShell";
import { Card, CardContent } from "../_components/ui/card";
import { FadeIn, SlideUp } from "../_motion/MotionWrappers";
import { useAuth } from "../_contexts/AuthContext";
import AuthGuard from "../_components/auth/AuthGuard";
import { getUserVibes } from "../_apis/common/admin";
import { UpdateVibeDialog } from "../_components/vibes/UpdateVibeDialog";
import Cookies from "js-cookie";
import { API } from "../_libs/api";

interface Vibe {
  _id: string;
  id?: string; // Add id as optional for compatibility
  itemName: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  tags: string[];
  location?: string;
  status: "pending" | "approved" | "rejected" | "archived" | "sold";
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

type TabType = "all" | "active" | "pending" | "expired" | "archived";
type SortType = "newest" | "oldest" | "price-high" | "price-low" | "popular";

export default function MyVibesPage() {
  const { user } = useAuth();
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedVibe, setSelectedVibe] = useState<Vibe | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [sortBy, setSortBy] = useState<SortType>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Fix: Use tokenSession instead of tokenAuth
  const token = Cookies.get("tokenSession");

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
      const vibesWithUserId = (response.vibes || []).map((vibe: any) => ({
        ...vibe,
        // Ensure both _id and id are available for compatibility
        _id: vibe._id || vibe.id,
        id: vibe.id || vibe._id,
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
    if (user?.id && token) {
      fetchVibes();
    }
  }, [user?.id, token]);

  const handleEditClick = (vibe: Vibe) => {
    setSelectedVibe(vibe);
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateSuccess = () => {
    fetchVibes();
    setSuccess("Vibe updated successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const isExpiringSoon = (expiresAt: string) => {
    const expiryTime = new Date(expiresAt).getTime();
    const now = Date.now();
    const twoHours = 2 * 60 * 60 * 1000;
    return expiryTime - now < twoHours && expiryTime > now;
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt).getTime() < Date.now();
  };

  const getTimeRemaining = (expiresAt: string) => {
    const expiryTime = new Date(expiresAt).getTime();
    const now = Date.now();
    const diff = expiryTime - now;

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleExtendExpiry = async (vibeId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${API}/vibes/${vibeId}/extend`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hours: 24 }),
      });

      if (response.ok) {
        setSuccess("Vibe expiry extended by 24 hours!");
        fetchVibes();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to extend vibe expiry");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to extend vibe expiry");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleArchiveVibe = async (vibeId: string) => {
    if (!token || !confirm("Are you sure you want to archive this vibe?")) return;

    try {
      const response = await fetch(`${API}/vibes/${vibeId}/archive`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setSuccess("Vibe archived successfully!");
        fetchVibes();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to archive vibe");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to archive vibe");
      setTimeout(() => setError(""), 3000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-gruvbox-green/10 text-gruvbox-green border-gruvbox-green/30";
      case "pending":
        return "bg-gruvbox-yellow/10 text-gruvbox-yellow border-gruvbox-yellow/30";
      case "rejected":
        return "bg-gruvbox-red/10 text-gruvbox-red border-gruvbox-red/30";
      case "sold":
        return "bg-gruvbox-blue/10 text-gruvbox-blue border-gruvbox-blue/30";
      case "archived":
        return "bg-gruvbox-gray/10 text-gruvbox-gray border-gruvbox-gray/30";
      default:
        return "bg-gruvbox-dark-bg2 text-gruvbox-dark-fg2 border-gruvbox-dark-bg3";
    }
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Filter vibes
  const filteredVibes = vibes
    .filter((vibe) => {
      // Tab filter
      if (activeTab === "active") {
        return vibe.status === "approved" && !isExpired(vibe.expiresAt);
      }
      if (activeTab === "pending") {
        return vibe.status === "pending";
      }
      if (activeTab === "expired") {
        return vibe.status === "approved" && isExpired(vibe.expiresAt);
      }
      if (activeTab === "archived") {
        return vibe.status === "archived";
      }
      return vibe.status !== "archived"; // "all" shows everything except archived
    })
    .filter((vibe) => {
      // Search filter
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        vibe.itemName.toLowerCase().includes(query) ||
        vibe.description.toLowerCase().includes(query) ||
        vibe.category.toLowerCase().includes(query) ||
        vibe.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      // Sort
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "price-high":
          return b.price - a.price;
        case "price-low":
          return a.price - b.price;
        case "popular":
          return (b.views || 0) - (a.views || 0);
        default:
          return 0;
      }
    });

  // Calculate stats
  const stats = {
    total: vibes.filter((v) => v.status !== "archived").length,
    active: vibes.filter((v) => v.status === "approved" && !isExpired(v.expiresAt)).length,
    pending: vibes.filter((v) => v.status === "pending").length,
    expired: vibes.filter((v) => v.status === "approved" && isExpired(v.expiresAt)).length,
    archived: vibes.filter((v) => v.status === "archived").length,
    totalViews: vibes.reduce((sum, v) => sum + (v.views || 0), 0),
    totalLikes: vibes.reduce((sum, v) => sum + (v.likesCount || 0), 0),
    totalRevenue: vibes
      .filter((v) => v.status === "sold")
      .reduce((sum, v) => sum + v.price, 0),
  };

  const tabs = [
    { key: "all" as TabType, label: "All", count: stats.total, icon: IconPackage },
    { key: "active" as TabType, label: "Active", count: stats.active, icon: IconCheck },
    { key: "pending" as TabType, label: "Pending", count: stats.pending, icon: IconClock },
    { key: "expired" as TabType, label: "Expired", count: stats.expired, icon: IconAlertCircle },
    { key: "archived" as TabType, label: "Archived", count: stats.archived, icon: IconArchive },
  ];

  if (loading) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="min-h-screen bg-gruvbox-dark-bg0 pt-20">
          <PageShell width="full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-56 bg-gruvbox-dark-bg2"></div>
                  <CardContent className="p-4 space-y-3">
                    <div className="h-5 bg-gruvbox-dark-bg2 rounded w-3/4"></div>
                    <div className="h-4 bg-gruvbox-dark-bg2 rounded w-1/2"></div>
                    <div className="h-3 bg-gruvbox-dark-bg2 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </PageShell>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gruvbox-dark-bg0 pt-8 pb-12">
        <PageShell width="full">
          {/* Header */}
          <FadeIn>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <IconPackage className="w-8 h-8 text-gruvbox-orange" />
                    <h1 className="text-4xl font-bold text-gruvbox-dark-fg0">
                      My Vibes
                    </h1>
                  </div>
                  <p className="text-gruvbox-gray text-lg">
                    Manage and track your listings
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={fetchVibes}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg2 text-gruvbox-dark-fg0 rounded-lg hover:bg-gruvbox-dark-bg2 transition-colors"
                  >
                    <IconRefresh size={18} className={loading ? "animate-spin" : ""} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                  <Link
                    href="/upload"
                    className="flex items-center gap-2 px-6 py-2 bg-gruvbox-orange text-white rounded-lg hover:bg-gruvbox-yellow transition-colors shadow-lg font-medium"
                  >
                    <IconPlus size={18} />
                    <span>New Vibe</span>
                  </Link>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-gruvbox-orange/10 to-gruvbox-yellow/10 border-gruvbox-orange/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <IconPackage className="w-8 h-8 text-gruvbox-orange" />
                      <span className="text-xs text-gruvbox-gray">Total</span>
                    </div>
                    <div className="text-3xl font-bold text-gruvbox-dark-fg0">
                      {stats.total}
                    </div>
                    <div className="text-xs text-gruvbox-gray mt-1">Active listings</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-gruvbox-blue/10 to-gruvbox-aqua/10 border-gruvbox-blue/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <IconEye className="w-8 h-8 text-gruvbox-blue" />
                      <span className="text-xs text-gruvbox-gray">Views</span>
                    </div>
                    <div className="text-3xl font-bold text-gruvbox-dark-fg0">
                      {stats.totalViews}
                    </div>
                    <div className="text-xs text-gruvbox-gray mt-1">Total views</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-gruvbox-green/10 to-gruvbox-aqua/10 border-gruvbox-green/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <IconHeart className="w-8 h-8 text-gruvbox-green" />
                      <span className="text-xs text-gruvbox-gray">Likes</span>
                    </div>
                    <div className="text-3xl font-bold text-gruvbox-dark-fg0">
                      {stats.totalLikes}
                    </div>
                    <div className="text-xs text-gruvbox-gray mt-1">Total likes</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-gruvbox-yellow/10 to-gruvbox-orange/10 border-gruvbox-yellow/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <IconCurrencyDollar className="w-8 h-8 text-gruvbox-yellow" />
                      <span className="text-xs text-gruvbox-gray">Revenue</span>
                    </div>
                    <div className="text-xl font-bold text-gruvbox-dark-fg0">
                      {formatPrice(stats.totalRevenue)}
                    </div>
                    <div className="text-xs text-gruvbox-gray mt-1">From sold items</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </FadeIn>

          {/* Notifications */}
          {success && (
            <FadeIn>
              <Card className="mb-6 border-gruvbox-green">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 text-gruvbox-green">
                    <IconCheck size={24} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold mb-1">Success</h3>
                      <p className="text-sm text-gruvbox-dark-fg2">{success}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {error && (
            <FadeIn>
              <Card className="mb-6 border-gruvbox-red">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 text-gruvbox-red">
                    <IconX size={24} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold mb-1">Error</h3>
                      <p className="text-sm text-gruvbox-dark-fg2">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* Filters and Tabs */}
          <SlideUp delay={0.1}>
            <Card className="mb-6">
              <CardContent className="p-4">
                {/* Tabs */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                        activeTab === tab.key
                          ? "bg-gruvbox-orange text-white shadow-lg"
                          : "bg-gruvbox-dark-bg2 text-gruvbox-dark-fg1 hover:bg-gruvbox-dark-bg1"
                      }`}
                    >
                      <tab.icon size={18} />
                      <span className="font-medium">{tab.label}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          activeTab === tab.key
                            ? "bg-white/20"
                            : "bg-gruvbox-dark-bg1"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Search and Sort */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <IconSearch
                      size={20}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gruvbox-gray"
                    />
                    <input
                      type="text"
                      placeholder="Search your vibes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg2 rounded-lg text-gruvbox-dark-fg0 placeholder-gruvbox-gray focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent"
                    />
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortType)}
                    className="px-4 py-2 bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg2 rounded-lg text-gruvbox-dark-fg0 focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>

                {/* Results count */}
                <div className="mt-3 text-sm text-gruvbox-gray">
                  Showing {filteredVibes.length} of {vibes.length} vibes
                </div>
              </CardContent>
            </Card>
          </SlideUp>

          {/* Vibes Grid */}
          {filteredVibes.length === 0 ? (
            <FadeIn>
              <Card>
                <CardContent className="text-center py-20">
                  <IconPhoto className="w-16 h-16 text-gruvbox-gray mx-auto mb-6 opacity-50" />
                  <h3 className="text-2xl font-bold text-gruvbox-dark-fg0 mb-3">
                    {searchQuery
                      ? "No vibes found"
                      : activeTab === "archived"
                      ? "No archived vibes"
                      : "No vibes yet"}
                  </h3>
                  <p className="text-gruvbox-gray mb-8 max-w-md mx-auto">
                    {searchQuery
                      ? "Try adjusting your search query"
                      : activeTab === "archived"
                      ? "You haven't archived any vibes yet"
                      : "Start creating vibes to grow your collection!"}
                  </p>
                  {!searchQuery && activeTab !== "archived" && (
                    <Link
                      href="/upload"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gruvbox-orange text-white rounded-lg hover:bg-gruvbox-yellow transition-all shadow-lg"
                    >
                      <IconPlus size={20} />
                      <span>Create Your First Vibe</span>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVibes.map((vibe, index) => {
                // Use _id or fallback to id
                const vibeId = vibe._id || vibe.id || "";

                return (
                  <FadeIn key={vibeId} delay={index * 0.05}>
                    <Card className="group overflow-hidden hover:shadow-xl hover:shadow-gruvbox-orange/10 transition-all duration-300 hover:-translate-y-1">
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden">
                        {vibe.mediaFiles && vibe.mediaFiles.length > 0 ? (
                          <>
                            <Image
                              src={vibe.mediaFiles[0].url}
                              alt={vibe.itemName}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            {vibe.mediaFiles.length > 1 && (
                              <div className="absolute top-3 left-3 px-2.5 py-1 bg-gruvbox-dark-bg0/90 backdrop-blur-sm text-white text-xs font-bold rounded-full border border-gruvbox-dark-bg2">
                                +{vibe.mediaFiles.length - 1}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full bg-gruvbox-dark-bg2 flex items-center justify-center">
                            <IconPhoto size={48} className="text-gruvbox-gray" />
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${getStatusColor(
                              vibe.status
                            )}`}
                          >
                            {vibe.status}
                          </span>
                        </div>

                        {/* Expiry Warning */}
                        {vibe.status === "approved" && vibe.expiresAt && (
                          <div className="absolute bottom-3 left-3 right-3">
                            {isExpired(vibe.expiresAt) ? (
                              <div className="px-3 py-1.5 bg-gruvbox-red/90 backdrop-blur-sm text-white text-xs font-bold rounded-full flex items-center gap-1.5 border border-gruvbox-red">
                                <IconX size={14} />
                                Expired
                              </div>
                            ) : isExpiringSoon(vibe.expiresAt) ? (
                              <div className="px-3 py-1.5 bg-gruvbox-yellow/90 backdrop-blur-sm text-gruvbox-dark-bg0 text-xs font-bold rounded-full flex items-center gap-1.5 border border-gruvbox-yellow animate-pulse">
                                <IconClock size={14} />
                                {getTimeRemaining(vibe.expiresAt)}
                              </div>
                            ) : (
                              <div className="px-3 py-1.5 bg-gruvbox-dark-bg0/90 backdrop-blur-sm text-gruvbox-dark-fg0 text-xs font-semibold rounded-full flex items-center gap-1.5 border border-gruvbox-dark-bg2">
                                <IconClock size={14} />
                                {getTimeRemaining(vibe.expiresAt)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <CardContent className="p-4">
                        {/* Title and Price */}
                        <h3 className="font-bold text-lg text-gruvbox-dark-fg0 mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-gruvbox-orange transition">
                          {vibe.itemName}
                        </h3>

                        <p className="text-xl font-bold bg-gradient-to-r from-gruvbox-orange to-gruvbox-yellow bg-clip-text text-transparent mb-3">
                          {formatPrice(vibe.price)}
                        </p>

                        {/* Meta Info */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-xs">
                            <span
                              className={`px-2 py-1 rounded-full border ${getConditionColor(
                                vibe.condition
                              )}`}
                            >
                              {vibe.condition}
                            </span>
                            <span className="px-2 py-1 rounded-full bg-gruvbox-dark-bg2 text-gruvbox-dark-fg1 border border-gruvbox-dark-bg3">
                              {vibe.category}
                            </span>
                          </div>

                          {vibe.location && (
                            <div className="flex items-center gap-1.5 text-sm text-gruvbox-gray">
                              <IconMapPin size={14} />
                              <span className="truncate">{vibe.location}</span>
                            </div>
                          )}

                          {/* Stats */}
                          <div className="flex items-center gap-4 text-sm text-gruvbox-gray">
                            <div className="flex items-center gap-1.5">
                              <IconEye size={16} />
                              <span>{vibe.views || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <IconHeart size={16} />
                              <span>{vibe.likesCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <IconMessageCircle size={16} />
                              <span>{vibe.commentsCount || 0}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-gruvbox-gray">
                            <IconCalendar size={14} />
                            <span>
                              {new Date(vibe.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 pt-4 border-t border-gruvbox-dark-bg2">
                          <div className="flex gap-2">
                            <Link
                              href={`/vibes/${vibeId}`}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gruvbox-dark-bg2 text-gruvbox-dark-fg0 rounded-lg hover:bg-gruvbox-dark-bg1 transition-colors"
                            >
                              <IconEye size={16} />
                              <span className="text-sm font-medium">View</span>
                            </Link>
                            {vibe.status !== "archived" && (
                              <button
                                onClick={() => handleEditClick(vibe)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gruvbox-orange text-white rounded-lg hover:bg-gruvbox-yellow transition-colors"
                              >
                                <IconEdit size={16} />
                                <span className="text-sm font-medium">Edit</span>
                              </button>
                            )}
                          </div>

                          {/* Extended Actions */}
                          {vibe.status === "approved" && vibe.expiresAt && (
                            <button
                              onClick={() => handleExtendExpiry(vibeId)}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gruvbox-blue/10 text-gruvbox-blue border border-gruvbox-blue/30 rounded-lg hover:bg-gruvbox-blue/20 transition-colors"
                            >
                              <IconClockHour4 size={16} />
                              <span className="text-sm font-medium">Extend +24h</span>
                            </button>
                          )}

                          {(vibe.status === "approved" ||
                            vibe.status === "pending") && (
                            <button
                              onClick={() => handleArchiveVibe(vibeId)}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gruvbox-dark-bg2 text-gruvbox-dark-fg1 rounded-lg hover:bg-gruvbox-dark-bg1 transition-colors"
                            >
                              <IconArchive size={16} />
                              <span className="text-sm font-medium">Archive</span>
                            </button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </FadeIn>
                );
              })}
            </div>
          )}

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
        </PageShell>
      </div>
    </AuthGuard>
  );
}