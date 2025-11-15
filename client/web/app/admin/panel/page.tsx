"use client";

import React, { useEffect, useState } from "react";
import {
  IconUsers,
  IconPhoto,
  IconMessageCircle,
  IconLogout,
  IconX,
  IconShieldCheck,
  IconMenu2,
  IconChartBar,
  IconAlertTriangle,
  IconMessageReport,
  IconStars,
  IconSettings,
} from "@tabler/icons-react";
import Link from "next/link";
import { Flag, Info } from "lucide-react";
import { API } from "@/app/_libs/api";
import UserSection from "@/app/_sections/admin/user";
import { User } from "@/app/_libs/types";
import BannerSection from "@/app/_sections/admin/banner";
import CommentModerationSection from "@/app/_sections/admin/comments";
import FeedbackSection from "@/app/_sections/admin/feedback";
import VibeModerationSection from "@/app/_sections/admin/moderation";
import ReportSection from "@/app/_sections/admin/report";
import ShowVibesSection from "@/app/_sections/admin/vibes";
import StaffSection from "@/app/_sections/admin/staff";

// --- Sidebar Tabs with Better Icons and Grouping ---
const tabs = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <IconChartBar size={20} />,
    group: "overview",
  },
  {
    id: "users",
    label: "User Management",
    icon: <IconUsers size={20} />,
    group: "management",
  },
  {
    id: "staff",
    label: "Staff Management",
    icon: <IconShieldCheck size={20} />,
    group: "management",
  },
  {
    id: "show-vibes",
    label: "All Vibes",
    icon: <IconPhoto size={20} />,
    group: "content",
  },
  {
    id: "vibes",
    label: "Vibe Moderation",
    icon: <IconStars size={20} />,
    group: "content",
  },
  {
    id: "comments",
    label: "Comment Moderation",
    icon: <IconMessageCircle size={20} />,
    group: "moderation",
  },
  {
    id: "reports",
    label: "Reports",
    icon: <Flag size={20} />,
    group: "moderation",
  },
  {
    id: "feedbacks",
    label: "Feedbacks",
    icon: <Info size={20} />,
    group: "support",
  },
  {
    id: "banners",
    label: "Banner Management",
    icon: <IconMessageReport size={20} />,
    group: "settings",
  },
];

const tabGroups = {
  overview: "Overview",
  management: "Management",
  content: "Content",
  moderation: "Moderation",
  support: "Support",
  settings: "Settings",
};

// Dashboard Component
function DashboardSection() {
  const [stats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch(`${API}/admin/dashboard/stats`, {
          credentials: "include",
        });
        const data = await response.json();
        setStats(data.stats);
        setRecentActivity(data.recentActivity);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gruvbox-dark-fg2">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gruvbox-dark-fg0 mb-2">
          Dashboard Overview
        </h2>
        <p className="text-gruvbox-dark-fg2">
          Welcome to the admin panel. Quick stats and insights.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gruvbox-blue/10 to-gruvbox-blue/5 border border-gruvbox-blue/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-gruvbox-blue/20 rounded-lg">
              <IconUsers size={24} className="text-gruvbox-blue-dark" />
            </div>
            <span className="text-xs text-gruvbox-dark-fg3">
              {stats?.totalUsers?.label || "This month"}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gruvbox-dark-fg0 mb-1">
            {stats?.totalUsers?.count || 0}
          </h3>
          <p className="text-sm text-gruvbox-dark-fg2">Total Users</p>
          <div className={`mt-2 flex items-center gap-1 text-xs ${
            (stats?.totalUsers?.growthPercent || 0) >= 0 ? "text-green-400" : "text-red-400"
          }`}>
            <span>
              {(stats?.totalUsers?.growthPercent || 0) >= 0 ? "↑" : "↓"} {Math.abs(stats?.totalUsers?.growthPercent || 0)}%
            </span>
            <span className="text-gruvbox-dark-fg3">vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gruvbox-orange/10 to-gruvbox-orange/5 border border-gruvbox-orange/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-gruvbox-orange/20 rounded-lg">
              <IconPhoto size={24} className="text-gruvbox-orange-dark" />
            </div>
            <span className="text-xs text-gruvbox-dark-fg3">
              {stats?.activeVibes?.label || "Active"}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gruvbox-dark-fg0 mb-1">
            {stats?.activeVibes?.count || 0}
          </h3>
          <p className="text-sm text-gruvbox-dark-fg2">Active Vibes</p>
          <div className={`mt-2 flex items-center gap-1 text-xs ${
            (stats?.activeVibes?.growthPercent || 0) >= 0 ? "text-green-400" : "text-red-400"
          }`}>
            <span>
              {(stats?.activeVibes?.growthPercent || 0) >= 0 ? "↑" : "↓"} {Math.abs(stats?.activeVibes?.growthPercent || 0)}%
            </span>
            <span className="text-gruvbox-dark-fg3">vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gruvbox-red/10 to-gruvbox-red/5 border border-gruvbox-red/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-gruvbox-red/20 rounded-lg">
              <IconAlertTriangle size={24} className="text-gruvbox-red-dark" />
            </div>
            <span className="text-xs text-gruvbox-dark-fg3">
              {stats?.pendingReports?.label || "Pending"}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gruvbox-dark-fg0 mb-1">
            {stats?.pendingReports?.count || 0}
          </h3>
          <p className="text-sm text-gruvbox-dark-fg2">Reports</p>
          <div className={`mt-2 flex items-center gap-1 text-xs ${
            (stats?.pendingReports?.diff || 0) > 0 ? "text-red-400" : "text-green-400"
          }`}>
            <span>
              {(stats?.pendingReports?.diff || 0) >= 0 ? "↑" : "↓"} {Math.abs(stats?.pendingReports?.diff || 0)}
            </span>
            <span className="text-gruvbox-dark-fg3">needs attention</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gruvbox-purple/10 to-gruvbox-purple/5 border border-gruvbox-purple/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-gruvbox-purple/20 rounded-lg">
              <IconStars size={24} className="text-gruvbox-purple-dark" />
            </div>
            <span className="text-xs text-gruvbox-dark-fg3">
              {stats?.pendingVibes?.label || "Awaiting review"}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gruvbox-dark-fg0 mb-1">
            {stats?.pendingVibes?.count || 0}
          </h3>
          <p className="text-sm text-gruvbox-dark-fg2">Pending Vibes</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-yellow-400">
            <span>⚠</span>
            <span className="text-gruvbox-dark-fg3">requires moderation</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg3 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gruvbox-dark-fg0 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 4).map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-gruvbox-dark-bg2 rounded-lg"
                >
                  {activity.user?.profilePicture ? (
                    <img
                      src={activity.user.profilePicture}
                      alt={activity.user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gruvbox-orange to-gruvbox-yellow flex items-center justify-center text-white font-bold">
                      {activity.user?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gruvbox-dark-fg1">
                      New user registered
                    </p>
                    <p className="text-xs text-gruvbox-dark-fg3">
                      {activity.user?.email} • {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gruvbox-dark-fg3">No recent activity</p>
            )}
          </div>
        </div>

        <div className="bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg3 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gruvbox-dark-fg0 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-gruvbox-dark-bg2 hover:bg-gruvbox-dark-bg3 border border-gruvbox-dark-bg3 hover:border-gruvbox-orange/50 rounded-lg transition-all group">
              <IconUsers size={24} className="text-gruvbox-orange-dark mb-2" />
              <p className="text-sm font-medium text-gruvbox-dark-fg1">
                Manage Users
              </p>
            </button>
            <button className="p-4 bg-gruvbox-dark-bg2 hover:bg-gruvbox-dark-bg3 border border-gruvbox-dark-bg3 hover:border-gruvbox-orange/50 rounded-lg transition-all group">
              <IconStars size={24} className="text-gruvbox-purple-dark mb-2" />
              <p className="text-sm font-medium text-gruvbox-dark-fg1">
                Review Vibes
              </p>
            </button>
            <button className="p-4 bg-gruvbox-dark-bg2 hover:bg-gruvbox-dark-bg3 border border-gruvbox-dark-bg3 hover:border-gruvbox-orange/50 rounded-lg transition-all group">
              <IconAlertTriangle
                size={24}
                className="text-gruvbox-red-dark mb-2"
              />
              <p className="text-sm font-medium text-gruvbox-dark-fg1">
                Check Reports
              </p>
            </button>
            <button className="p-4 bg-gruvbox-dark-bg2 hover:bg-gruvbox-dark-bg3 border border-gruvbox-dark-bg3 hover:border-gruvbox-orange/50 rounded-lg transition-all group">
              <IconSettings size={24} className="text-gruvbox-blue-dark mb-2" />
              <p className="text-sm font-medium text-gruvbox-dark-fg1">Settings</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Admin Panel ---
export default function AdminPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [error] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Auth check
  useEffect(() => {
    fetch(API + "/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.user || !["admin", "staff"].includes(data.user.role)) {
          window.location.href = "/admin/signin";
        } else {
          setUser(data.user);
        }
      })
      .catch(() => (window.location.href = "/admin/signin"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-gruvbox-dark-bg0 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gruvbox-orange mx-auto mb-4"></div>
          <p className="text-gruvbox-dark-fg2">Loading admin panel...</p>
        </div>
      </div>
    );
  if (!user) return null;

  // Logout
  const handleLogout = async () => {
    await fetch(API + "/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/admin/signin";
  };

  return (
    <div className="min-h-screen bg-gruvbox-dark-bg0 flex flex-col">
      {/* Header */}
      <div className="bg-gruvbox-dark-bg1 border-b border-gruvbox-dark-bg2 px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-gruvbox-dark-bg2 rounded-lg transition-colors"
          >
            <IconMenu2 size={24} className="text-gruvbox-dark-fg0" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gruvbox-orange to-gruvbox-yellow flex items-center justify-center shadow-lg">
              <IconShieldCheck size={24} className="text-gruvbox-dark-bg0" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gruvbox-orange to-gruvbox-yellow bg-clip-text text-transparent font-mono">
                Old Vibes Admin
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Link
                  href="/admin/profile"
                  className="text-xs text-gruvbox-dark-fg2 hover:text-gruvbox-dark-fg0 transition-colors"
                >
                  {user.email}
                </Link>
                <span className="px-2 py-0.5 bg-gruvbox-orange/20 text-gruvbox-orange-dark text-xs rounded-full font-semibold border border-gruvbox-orange/30">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>
        <button
          className="flex items-center gap-2 text-gruvbox-red-dark hover:bg-gruvbox-red/10 px-4 py-2 rounded-lg transition-all border border-gruvbox-red/30 hover:border-gruvbox-red hover:shadow-lg hover:shadow-gruvbox-red/20"
          onClick={handleLogout}
        >
          <IconLogout size={18} />
          <span className="font-medium hidden sm:inline">Logout</span>
        </button>
      </div>

      {/* Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <nav
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:sticky lg:top-[73px] top-0 left-0 z-40 w-64 bg-gruvbox-dark-bg1 border-r border-gruvbox-dark-bg2 flex flex-col py-6 px-3 shadow-xl lg:shadow-none transition-transform duration-300 overflow-y-auto h-screen lg:h-[calc(100vh-73px)] scrollbar-thin scrollbar-thumb-gruvbox-dark-bg3 scrollbar-track-transparent`}
        >
          {Object.entries(tabGroups).map(([groupKey, groupLabel]) => {
            const groupTabs = tabs.filter((t) => t.group === groupKey);
            if (groupTabs.length === 0) return null;

            return (
              <div key={groupKey} className="mb-6">
                <h3 className="text-xs font-semibold text-gruvbox-dark-fg3 uppercase tracking-wider px-4 mb-2">
                  {groupLabel}
                </h3>
                <div className="space-y-1.5">
                  {groupTabs.map((t) => (
                    <button
                      key={t.id}
                      className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden
                        ${
                          tab === t.id
                            ? "bg-gradient-to-r from-gruvbox-orange to-gruvbox-yellow text-gruvbox-dark-bg0 font-bold shadow-lg shadow-gruvbox-orange/30 scale-[1.02]"
                            : "text-gruvbox-dark-fg1 hover:bg-gruvbox-dark-bg2 hover:text-gruvbox-dark-fg0"
                        }
                      `}
                      onClick={() => {
                        setTab(t.id);
                        if (window.innerWidth < 1024) {
                          setSidebarOpen(false);
                        }
                      }}
                    >
                      {tab === t.id && (
                        <div className="absolute inset-0 bg-gradient-to-r from-gruvbox-orange/20 to-gruvbox-yellow/20 animate-pulse" />
                      )}
                      <div className="relative flex items-center gap-3 w-full">
                        {React.cloneElement(t.icon, {
                          className:
                            tab === t.id
                              ? "text-gruvbox-dark-bg0"
                              : "text-gruvbox-orange-dark group-hover:scale-110 transition-transform",
                          size: 20,
                        })}
                        <span className="text-sm">{t.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gruvbox-dark-bg0 scroll-smooth">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {error && (
              <div className="mb-6 text-gruvbox-red-dark bg-gruvbox-red/10 p-4 rounded-xl border border-gruvbox-red/30 animate-in slide-in-from-top duration-300">
                <div className="flex items-center gap-2">
                  <IconX size={18} />
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}
            <div className="animate-in fade-in duration-500">
              {tab === "dashboard" && <DashboardSection />}
              {tab === "users" && <UserSection />}
              {tab === "staff" && <StaffSection isAdmin={user.role === "admin"} />}
              {tab === "show-vibes" && <ShowVibesSection />}
              {tab === "vibes" && <VibeModerationSection />}
              {tab === "comments" && <CommentModerationSection />}
              {tab === "feedbacks" && <FeedbackSection />}
              {tab === "reports" && <ReportSection />}
              {tab === "banners" && <BannerSection />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
