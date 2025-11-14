"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  IconUser,
  IconCalendar,
  IconMail,
  IconShield,
  IconAlertTriangle,
  IconBan,
  IconEdit,
  IconMapPin,
  IconEye,
  IconHeart,
  IconMessageCircle,
  IconClock,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import PageShell from "../_components/layout/PageShell";
import { Card, CardHeader, CardTitle, CardContent } from "../_components/ui/card";
import { FadeIn, SlideUp } from "../_motion/MotionWrappers";
import { useAuth } from "../_contexts/AuthContext";
import TrendingVibes from "../_components/recommendations/TrendingVibes";

interface Vibe {
  id: string;
  itemName: string;
  description: string;
  price: number;
  mediaFiles: Array<{ type: string; url: string }>;
  status: string;
  category: string;
  condition: string;
  location: string;
  likesCount: number;
  commentsCount: number;
  views: number;
  expiresAt: string;
  createdAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:4000/api";

export default function ProfilePage() {
  const { user, isAuthenticated, isBanned, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading before redirecting
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      fetchUserVibes();
    }
  }, [user, isAuthenticated, authLoading, router]);

  const fetchUserVibes = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${API_BASE}/vibes/user/${user.id}`, {
        credentials: "include",
      });
      const data = await response.json();
      setVibes(data.vibes || []);
    } catch (error) {
      console.error("Error fetching user vibes:", error);
    } finally {
      setLoading(false);
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

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return hours > 0 ? `${hours}h remaining` : "Expired";
  };

  // Show loading while checking authentication or fetching vibes
  if (authLoading || loading) {
    return (
      <PageShell width="lg">
        <div className="animate-pulse space-y-4">
          <Card>
            <div className="h-48 bg-gruvbox-dark-bg2 rounded-t-lg"></div>
            <CardContent className="p-6">
              <div className="h-8 bg-gruvbox-dark-bg2 rounded mb-4 w-1/3"></div>
              <div className="h-4 bg-gruvbox-dark-bg2 rounded mb-2"></div>
              <div className="h-4 bg-gruvbox-dark-bg2 rounded w-2/3"></div>
            </CardContent>
          </Card>
        </div>
      </PageShell>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <PageShell width="full" className="py-8">
      <div className="flex gap-6">
        {/* Main Profile Content */}
        <div className="flex-1 min-w-0">
          {/* Profile Header Card */}
          <FadeIn>
            <Card className="mb-6 overflow-hidden">
              {/* Cover Image */}
              <div className="h-32 bg-gradient-to-r from-gruvbox-orange via-gruvbox-yellow to-gruvbox-green-dark"></div>

              <CardContent className="px-6 pb-6">
                {/* Avatar & Basic Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 mb-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gruvbox-dark-bg2 border-4 border-gruvbox-dark-bg1 flex items-center justify-center overflow-hidden">
                      {user.profilePicture ? (
                        <Image
                          src={user.profilePicture}
                          alt={user.name}
                          width={128}
                          height={128}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <IconUser size={64} className="text-gruvbox-gray" />
                      )}
                    </div>
                    {user.isVerified && (
                      <div className="absolute bottom-2 right-2 w-8 h-8 bg-gruvbox-blue-dark rounded-full flex items-center justify-center border-2 border-gruvbox-dark-bg1">
                        <IconShield size={16} className="text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-3xl font-bold text-gruvbox-dark-fg0">
                        {user.name}
                      </h1>
                    </div>
                    <p className="text-gruvbox-gray text-lg mb-2">@{user.username}</p>
                    <p className="text-gruvbox-dark-fg2">
                      {user.bio || "No bio yet."}
                    </p>
                  </div>

                  <Link
                    href="/profile/edit"
                    className="flex items-center gap-2 px-4 py-2 bg-gruvbox-orange text-white rounded-lg hover:bg-gruvbox-yellow transition-colors"
                  >
                    <IconEdit size={20} />
                    <span>Edit Profile</span>
                  </Link>
                </div>

                {/* User Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gruvbox-dark-bg0 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gruvbox-orange mb-1">
                      {vibes.length}
                    </div>
                    <div className="text-sm text-gruvbox-gray">Total Vibes</div>
                  </div>
                  <div className="bg-gruvbox-dark-bg0 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gruvbox-green-dark mb-1">
                      {vibes.reduce((sum, v) => sum + v.likesCount, 0)}
                    </div>
                    <div className="text-sm text-gruvbox-gray">Total Likes</div>
                  </div>
                  <div className="bg-gruvbox-dark-bg0 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gruvbox-blue-dark mb-1">
                      {vibes.reduce((sum, v) => sum + v.views, 0)}
                    </div>
                    <div className="text-sm text-gruvbox-gray">Total Views</div>
                  </div>
                  <div className="bg-gruvbox-dark-bg0 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gruvbox-yellow-dark mb-1">
                      {vibes.reduce((sum, v) => sum + v.commentsCount, 0)}
                    </div>
                    <div className="text-sm text-gruvbox-gray">Total Comments</div>
                  </div>
                </div>

                {/* Account Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gruvbox-dark-bg0 rounded-lg">
                    <IconMail className="text-gruvbox-gray" size={20} />
                    <div>
                      <div className="text-xs text-gruvbox-gray">Email</div>
                      <div className="text-sm text-gruvbox-dark-fg0">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gruvbox-dark-bg0 rounded-lg">
                    <IconCalendar className="text-gruvbox-gray" size={20} />
                    <div>
                      <div className="text-xs text-gruvbox-gray">Joined</div>
                      <div className="text-sm text-gruvbox-dark-fg0">
                        {new Date(user.createdAt || "").toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gruvbox-dark-bg0 rounded-lg">
                    <IconShield className="text-gruvbox-gray" size={20} />
                    <div>
                      <div className="text-xs text-gruvbox-gray">Role</div>
                      <div className="text-sm text-gruvbox-dark-fg0 capitalize">
                        {user.role}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ban/Warning Status */}
                {(isBanned || (user.badBehaviorCount && user.badBehaviorCount > 0)) && (
                  <div className="mt-6">
                    {isBanned ? (
                      <div className="bg-gruvbox-red-dark/10 border-2 border-gruvbox-red-dark rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <IconBan className="text-gruvbox-red-dark flex-shrink-0" size={24} />
                          <div className="flex-1">
                            <h3 className="font-bold text-gruvbox-red-dark mb-1">
                              Account Temporarily Banned
                            </h3>
                            <p className="text-sm text-gruvbox-dark-fg2 mb-2">
                              {user.tempBanReason || "Your account has been temporarily banned due to repeated violations."}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gruvbox-gray">
                              <span>Violations: {user.badBehaviorCount}/3</span>
                              {user.tempBanAt && (
                                <span>Banned: {new Date(user.tempBanAt).toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gruvbox-yellow-dark/10 border-2 border-gruvbox-yellow-dark rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <IconAlertTriangle className="text-gruvbox-yellow-dark flex-shrink-0" size={24} />
                          <div className="flex-1">
                            <h3 className="font-bold text-gruvbox-yellow-dark mb-1">
                              Warning: {user.badBehaviorCount}/3 Strikes
                            </h3>
                            <p className="text-sm text-gruvbox-dark-fg2">
                              Please follow community guidelines to avoid a temporary ban.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>

          {/* User's Vibes Section */}
          <SlideUp delay={0.1}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Vibes ({vibes.length})</CardTitle>
                  <Link
                    href="/upload"
                    className="px-4 py-2 bg-gruvbox-orange text-white rounded-lg hover:bg-gruvbox-yellow transition-colors text-sm"
                  >
                    Post New Vibe
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {vibes.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gruvbox-gray mb-4">You haven't posted any vibes yet.</p>
                    <Link
                      href="/upload"
                      className="inline-block px-6 py-3 bg-gruvbox-orange text-white rounded-lg hover:bg-gruvbox-yellow transition-colors"
                    >
                      Create Your First Vibe
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vibes.map((vibe) => (
                      <Link
                        key={vibe.id}
                        href={`/vibes/${vibe.id}`}
                        className="group bg-gruvbox-dark-bg0 rounded-xl overflow-hidden border border-gruvbox-dark-bg2 hover:shadow-lg transition-all"
                      >
                        {/* Image */}
                        <div className="relative aspect-square overflow-hidden">
                          <Image
                            src={vibe.mediaFiles[0]?.url || "/placeholder.png"}
                            alt={vibe.itemName}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2 flex gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(vibe.condition)}`}>
                              {vibe.condition}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gruvbox-dark-bg2 text-gruvbox-dark-fg0">
                              {vibe.status}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-bold text-lg text-gruvbox-dark-fg0 mb-2 line-clamp-1">
                            {vibe.itemName}
                          </h3>
                          <p className="text-gruvbox-dark-fg2 text-sm mb-3 line-clamp-2">
                            {vibe.description}
                          </p>

                          <div className="flex items-center gap-2 text-sm text-gruvbox-gray mb-3">
                            <IconMapPin size={16} />
                            <span>{vibe.location}</span>
                          </div>

                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xl font-bold text-gruvbox-orange">
                              {formatPrice(vibe.price)}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-gruvbox-gray">
                              <IconClock size={14} />
                              <span>{getTimeRemaining(vibe.expiresAt)}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-gruvbox-dark-bg2">
                            <div className="flex items-center gap-4 text-sm text-gruvbox-gray">
                              <div className="flex items-center gap-1">
                                <IconHeart size={16} />
                                <span>{vibe.likesCount}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <IconMessageCircle size={16} />
                                <span>{vibe.commentsCount}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <IconEye size={16} />
                                <span>{vibe.views}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </SlideUp>
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-20">
            <TrendingVibes limit={8} />
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
