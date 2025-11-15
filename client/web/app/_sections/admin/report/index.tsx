"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  IconAlertTriangle,
  IconRefresh,
  IconSearch,
  IconEye,
  IconTrash,
  IconBan,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconClock,
  IconUser,
  IconPhoto,
  IconShieldCheck,
  IconFlag,
  IconMessageCircle,
  IconExternalLink,
  IconDownload,
  IconChevronRight,
} from "@tabler/icons-react";
import Modal from "@/app/_components/reusable/modal";
import { API } from "@/app/_libs/api";
import { Report, Vibe } from "@/app/_libs/types";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Stats Card Component
function StatCard({
  icon,
  label,
  value,
  color,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  trend?: string;
}) {
  return (
    <div
      className={`bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg3 rounded-xl p-6 hover:border-${color}/50 transition-all`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 bg-${color}/20 rounded-lg`}>{icon}</div>
        {trend && <span className="text-xs text-gruvbox-dark-fg3">{trend}</span>}
      </div>
      <h3 className="text-3xl font-bold text-gruvbox-dark-fg0 mb-1">{value}</h3>
      <p className="text-sm text-gruvbox-dark-fg2">{label}</p>
    </div>
  );
}

// Confirmation Modal Component
function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "danger" | "info";
}) {
  const typeColors = {
    warning: "bg-yellow-500",
    danger: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <Modal opened={isOpen} onClose={onClose} title={title} showCloseButton={false}>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 ${typeColors[type]}/20 rounded-lg`}>
            <IconAlertCircle
              size={24}
              className={`text-${
                type === "warning" ? "yellow" : type === "danger" ? "red" : "blue"
              }-400`}
            />
          </div>
          <p className="text-gruvbox-dark-fg1 flex-1">{message}</p>
        </div>
        <div className="flex gap-3 pt-4">
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              type === "danger"
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-gruvbox-orange hover:bg-gruvbox-yellow text-white"
            }`}
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="px-6 bg-gruvbox-dark-bg3 text-gruvbox-dark-fg1 py-3 rounded-lg font-semibold hover:bg-gruvbox-dark-bg2 transition-colors"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Report Detail Modal Component
function ReportDetailModal({
  report,
  reporterInfo,
  reportedUserInfo,
  vibeInfo,
  isOpen,
  onClose,
  onDelete,
  onBanUser,
  onDeleteVibe,
}: {
  report: Report | null;
  reporterInfo: any;
  reportedUserInfo: any;
  vibeInfo: any;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (reportId: string) => void;
  onBanUser: (userId: string, reason: string) => void;
  onDeleteVibe: (vibeId: string) => void;
}) {
  const [showDeleteReportConfirm, setShowDeleteReportConfirm] = useState(false);
  const [showBanUserConfirm, setShowBanUserConfirm] = useState(false);
  const [showDeleteVibeConfirm, setShowDeleteVibeConfirm] = useState(false);
  const [actionNotes, setActionNotes] = useState("");

  if (!report) return null;

  const handleDeleteReportClick = () => {
    setShowDeleteReportConfirm(true);
  };

  const handleDeleteReportConfirm = () => {
    onDelete(report.id);
    setShowDeleteReportConfirm(false);
  };

  const handleBanUserClick = () => {
    setShowBanUserConfirm(true);
  };

  const handleBanUserConfirm = () => {
    onBanUser(
      reportedUserInfo.id,
      actionNotes || `Reported for ${report.reportType}`
    );
    setShowBanUserConfirm(false);
    setActionNotes("");
  };

  const handleDeleteVibeClick = () => {
    setShowDeleteVibeConfirm(true);
  };

  const handleDeleteVibeConfirm = () => {
    onDeleteVibe(vibeInfo.id);
    setShowDeleteVibeConfirm(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "spam":
        return <IconAlertTriangle size={20} className="text-yellow-400" />;
      case "inappropriate":
        return <IconAlertCircle size={20} className="text-orange-400" />;
      case "abusive":
        return <IconFlag size={20} className="text-red-400" />;
      default:
        return <IconMessageCircle size={20} className="text-gruvbox-dark-fg3" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "spam":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "inappropriate":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "abusive":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gruvbox-dark-bg3 text-gruvbox-dark-fg2 border-gruvbox-dark-bg3";
    }
  };

  return (
    <>
      <Modal opened={isOpen} onClose={onClose} title="Report Details">
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Header with Type Badge */}
          <div className="flex items-center justify-between pb-4 border-b border-gruvbox-dark-bg3">
            <div className="flex items-center gap-3">
              {getTypeIcon(report.reportType)}
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${getTypeColor(
                  report.reportType
                )}`}
              >
                {report.reportType.toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-gruvbox-dark-fg3">
              ID: {report.id.slice(-12)}
            </span>
          </div>

          {/* Reporter Info */}
          <div className="bg-gruvbox-dark-bg2 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gruvbox-dark-fg2 mb-3 flex items-center gap-2">
              <IconUser size={16} />
              Reported By
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gruvbox-blue to-gruvbox-purple flex items-center justify-center text-white font-bold text-lg">
                {reporterInfo?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-semibold text-gruvbox-dark-fg0">
                  {reporterInfo?.name || "Unknown User"}
                </p>
                <p className="text-sm text-gruvbox-dark-fg2">
                  @{reporterInfo?.username || "unknown"}
                </p>
                <p className="text-xs text-gruvbox-dark-fg3 mt-0.5">
                  ID: {reporterInfo?.id?.slice(-12) || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Reported User Info (Vibe Owner) */}
          <div className="bg-gruvbox-dark-bg2 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gruvbox-dark-fg2 mb-3 flex items-center gap-2">
              <IconShieldCheck size={16} />
              Reported User (Vibe Owner)
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gruvbox-orange to-gruvbox-red flex items-center justify-center text-white font-bold text-lg">
                {reportedUserInfo?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gruvbox-dark-fg0">
                  {reportedUserInfo?.name || "Unknown User"}
                </p>
                <p className="text-sm text-gruvbox-dark-fg2">
                  @{reportedUserInfo?.username || "unknown"}
                </p>
                <p className="text-xs text-gruvbox-dark-fg3 mt-0.5">
                  ID: {reportedUserInfo?.id?.slice(-12) || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Reported Vibe Info */}
          <div className="bg-gruvbox-dark-bg2 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gruvbox-dark-fg2 mb-3 flex items-center gap-2">
              <IconPhoto size={16} />
              Reported Vibe
            </h4>
            <div className="flex items-center gap-3">
              {vibeInfo?.mediaFiles && vibeInfo.mediaFiles.length > 0 && (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gruvbox-dark-bg3 flex-shrink-0">
                  <Image
                    src={vibeInfo.mediaFiles[0].url}
                    alt={vibeInfo.itemName}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gruvbox-dark-fg0 truncate">
                  {vibeInfo?.itemName || "Unknown Vibe"}
                </p>
                <p className="text-sm text-gruvbox-dark-fg2 truncate">
                  {vibeInfo?.description || "No description"}
                </p>
                <p className="text-xs text-gruvbox-dark-fg3 mt-1">
                  Vibe ID: {vibeInfo?.id?.slice(-12) || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Report Description */}
          <div>
            <h4 className="text-sm font-semibold text-gruvbox-dark-fg2 mb-2 flex items-center gap-2">
              <IconMessageCircle size={16} />
              Report Reason
            </h4>
            <div className="bg-gruvbox-dark-bg2 rounded-lg p-4">
              <p className="text-sm text-gruvbox-dark-fg1 leading-relaxed whitespace-pre-wrap">
                {report.reportDescription}
              </p>
            </div>
          </div>

          {/* Report Images */}
          {report.reportImages && report.reportImages.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gruvbox-dark-fg2 mb-2 flex items-center gap-2">
                <IconExternalLink size={16} />
                Evidence Images ({report.reportImages.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {report.reportImages.map((img, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-lg overflow-hidden bg-gruvbox-dark-bg2 cursor-pointer hover:ring-2 hover:ring-gruvbox-orange transition-all group"
                    onClick={() => window.open(img, "_blank")}
                  >
                    <Image
                      src={img}
                      alt={`Report image ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <IconExternalLink
                        size={24}
                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex items-center gap-6 text-xs text-gruvbox-dark-fg3 pt-4 border-t border-gruvbox-dark-bg3">
            <div className="flex items-center gap-1">
              <IconClock size={14} />
              <span>
                Created: {new Date(report.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <IconClock size={14} />
              <span>
                Updated: {new Date(report.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Notes */}
          <div>
            <label className="block text-sm font-semibold text-gruvbox-dark-fg2 mb-2">
              Action Notes (Optional)
            </label>
            <textarea
              className="w-full bg-gruvbox-dark-bg2 border border-gruvbox-dark-bg3 rounded-lg px-4 py-2.5 text-gruvbox-dark-fg1 placeholder-gruvbox-dark-fg3 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50 resize-none"
              rows={3}
              placeholder="Add notes about the action you're taking..."
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 gap-3 pt-4 border-t border-gruvbox-dark-bg3">
            <button
              onClick={handleBanUserClick}
              className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2.5 rounded-lg hover:bg-red-600 transition-colors"
            >
              <IconBan size={18} />
              Ban Reported User
            </button>
            <button
              onClick={handleDeleteVibeClick}
              className="flex items-center justify-center gap-2 bg-orange-500/20 text-orange-400 px-4 py-2.5 rounded-lg hover:bg-orange-500/30 transition-colors"
            >
              <IconTrash size={18} />
              Delete Reported Vibe
            </button>
            <button
              onClick={handleDeleteReportClick}
              className="flex items-center justify-center gap-2 bg-gruvbox-dark-bg3 text-gruvbox-dark-fg1 px-4 py-2.5 rounded-lg hover:bg-gruvbox-dark-bg2 transition-colors"
            >
              <IconX size={18} />
              Dismiss Report
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Report Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteReportConfirm}
        onClose={() => setShowDeleteReportConfirm(false)}
        onConfirm={handleDeleteReportConfirm}
        title="Dismiss Report"
        message="Are you sure you want to dismiss this report? This action cannot be undone."
        confirmText="Dismiss Report"
        type="warning"
      />

      {/* Ban User Confirmation Modal */}
      <ConfirmationModal
        isOpen={showBanUserConfirm}
        onClose={() => setShowBanUserConfirm(false)}
        onConfirm={handleBanUserConfirm}
        title="Ban User"
        message={`Are you sure you want to ban ${reportedUserInfo?.name}? This will prevent them from accessing the platform.`}
        confirmText="Ban User"
        type="danger"
      />

      {/* Delete Vibe Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteVibeConfirm}
        onClose={() => setShowDeleteVibeConfirm(false)}
        onConfirm={handleDeleteVibeConfirm}
        title="Delete Vibe"
        message={`Are you sure you want to delete the vibe "${vibeInfo?.itemName}"? This action cannot be undone.`}
        confirmText="Delete Vibe"
        type="danger"
      />
    </>
  );
}

// User Info Type
interface UserInfo {
  id: string;
  username: string;
  name: string;
  profilePicture?: string;
}

// Vibe Info Type
interface VibeInfo {
  id: string;
  itemName: string;
  description: string;
  mediaFiles: Array<{ type: string; url: string }>;
  userId?: string | { _id: string; username?: string; name?: string };
}

export default function ReportSection() {
  const [reports, setReports] = useState<Report[]>([]);
  const [userInfoMap, setUserInfoMap] = useState<Record<string, UserInfo>>({});
  const [vibeInfoMap, setVibeInfoMap] = useState<Record<string, VibeInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    spam: 0,
    inappropriate: 0,
    abusive: 0,
    withEvidence: 0,
  });

  // Fetch user information by userId
  const fetchUserInfo = async (userId: string): Promise<UserInfo | null> => {
    if (userInfoMap[userId]) {
      return userInfoMap[userId];
    }

    try {
      const res = await fetch(`${API}/users/${userId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.profile) {
        const userInfo: UserInfo = {
          id: data.profile.id,
          username: data.profile.username || "Unknown",
          name: data.profile.name || "Unknown",
          profilePicture: data.profile.profilePicture,
        };
        setUserInfoMap((prev) => ({ ...prev, [userId]: userInfo }));
        return userInfo;
      }
    } catch (err) {
      console.error("Failed to fetch user info:", err);
    }
    return null;
  };

  // Fetch vibe information by vibeId
  const fetchVibeInfo = async (vibeId: string): Promise<VibeInfo | null> => {
    if (vibeInfoMap[vibeId]) {
      return vibeInfoMap[vibeId];
    }

    try {
      const res = await fetch(`${API}/vibes/${vibeId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.vibe) {
        const vibeInfo: VibeInfo = {
          id: data.vibe.id,
          itemName: data.vibe.itemName || "Unknown",
          description: data.vibe.description || "No description",
          mediaFiles: data.vibe.mediaFiles || [],
          userId: data.vibe.userId || data.vibe.user?._id || data.vibe.user?.id,
        };
        setVibeInfoMap((prev) => ({ ...prev, [vibeId]: vibeInfo }));

        // Fetch vibe owner's user info if userId is a string
        if (vibeInfo.userId && typeof vibeInfo.userId === "string") {
          await fetchUserInfo(vibeInfo.userId);
        }

        return vibeInfo;
      }
    } catch (err) {
      console.error("Failed to fetch vibe info:", err);
    }
    return null;
  };

  // Fetch reports
  const fetchReports = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        limit: "50",
        offset: "0",
      });

      if (typeFilter !== "all") {
        params.append("reportType", typeFilter);
      }

      const res = await fetch(`${API}/report?${params}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok) {
        setReports(data.reports || []);
        
        // Use stats from API if available
        if (data.stats) {
          setStats(data.stats);
        }

        // Fetch user and vibe info for all reports
        const userIds = new Set<string>();
        const vibeIds = new Set<string>();

        data.reports.forEach((r: Report) => {
          if (typeof r.userId === "string") {
            userIds.add(r.userId);
          } else if (r.userId && typeof r.userId === "object") {
            userIds.add(r.userId._id);
          }
          if (typeof r.vibeId === "string") {
            vibeIds.add(r.vibeId);
          } else if (r.vibeId && typeof r.vibeId === "object") {
            vibeIds.add(r.vibeId._id);
          }
        });

        // Fetch vibe info first
        const vibeInfos = await Promise.all(
          Array.from(vibeIds).map((vibeId) => fetchVibeInfo(vibeId))
        );

        // Extract vibe owner user IDs and fetch their info
        vibeInfos.forEach((vibeInfo) => {
          if (vibeInfo && vibeInfo.userId) {
            const vibeOwnerId =
              typeof vibeInfo.userId === "string"
                ? vibeInfo.userId
                : vibeInfo.userId._id;
            if (vibeOwnerId) {
              userIds.add(vibeOwnerId);
            }
          }
        });

        // Fetch all user info (reporters + vibe owners)
        await Promise.all(
          Array.from(userIds).map((userId) => fetchUserInfo(userId))
        );
      } else {
        setError(data.message || "Failed to fetch reports");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  // Delete report
  const handleDeleteReport = async (reportId: string) => {
    try {
      const res = await fetch(`${API}/report/${reportId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setSuccess("Report dismissed successfully!");
        setModalOpen(false);
        fetchReports();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete report");
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete report");
    }
  };

  // Ban user
  const handleBanUser = async (userId: string, reason: string) => {
    try {
      const res = await fetch(`${API}/admin/users/${userId}/ban`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (res.ok) {
        setSuccess("User banned successfully!");
        setModalOpen(false);
        fetchReports();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to ban user");
      }
    } catch (err: any) {
      setError(err.message || "Failed to ban user");
    }
  };

  // Delete vibe
  const handleDeleteVibe = async (vibeId: string) => {
    try {
      const res = await fetch(`${API}/vibes/${vibeId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setSuccess("Vibe deleted successfully!");
        setModalOpen(false);
        fetchReports();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete vibe");
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete vibe");
    }
  };

  // Quick dismiss report
  const quickDismissReport = async (report: Report) => {
    if (
      !window.confirm(
        "Are you sure you want to dismiss this report? This action cannot be undone."
      )
    )
      return;

    handleDeleteReport(report.id);
  };

  // View report details
  const viewReportDetails = async (reportId: string) => {
    try {
      const res = await fetch(`${API}/report/${reportId}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok && data.report) {
        // Fetch user and vibe info if not populated
        if (typeof data.report.userId === "string") {
          await fetchUserInfo(data.report.userId);
        }
        if (typeof data.report.vibeId === "string") {
          const vibeInfo = await fetchVibeInfo(data.report.vibeId);
          // Fetch vibe owner's user info if available
          if (vibeInfo && vibeInfo.userId) {
            const vibeOwnerId =
              typeof vibeInfo.userId === "string"
                ? vibeInfo.userId
                : vibeInfo.userId._id;
            if (vibeOwnerId) {
              await fetchUserInfo(vibeOwnerId);
            }
          }
        }
        setSelectedReport(data.report);
        setModalOpen(true);
      } else {
        setError("Failed to fetch report details");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  // Get user info from report
  const getUserInfo = (report: Report): UserInfo => {
    if (typeof report.userId === "object" && report.userId !== null) {
      return {
        id: report.userId._id,
        username: report.userId.username || "Unknown",
        name: report.userId.name || "Unknown",
        profilePicture: report.userId.profilePicture,
      };
    }

    const userId = report.userId as string;
    if (userInfoMap[userId]) {
      return userInfoMap[userId];
    }

    return {
      id: userId,
      username: "Loading...",
      name: "Loading...",
      profilePicture: undefined,
    };
  };

  // Get vibe info from report
  const getVibeInfo = (report: Report): VibeInfo => {
    if (typeof report.vibeId === "object" && report.vibeId !== null) {
      return {
        id: report.vibeId._id,
        itemName: report.vibeId.itemName || "Unknown",
        description: report.vibeId.description || "No description",
        mediaFiles: report.vibeId.mediaFiles || [],
        userId: report.vibeId.userId,
      };
    }

    const vibeId = report.vibeId as string;
    if (vibeInfoMap[vibeId]) {
      return vibeInfoMap[vibeId];
    }

    return {
      id: vibeId,
      itemName: "Loading...",
      description: "Loading...",
      mediaFiles: [],
    };
  };

  // Get vibe owner info
  const getVibeOwnerInfo = (report: Report): UserInfo => {
    const vibeInfo = getVibeInfo(report);
    if (!vibeInfo.userId) {
      return {
        id: "Unknown",
        username: "Unknown",
        name: "Unknown",
        profilePicture: undefined,
      };
    }

    const vibeOwnerId =
      typeof vibeInfo.userId === "string"
        ? vibeInfo.userId
        : vibeInfo.userId._id;

    if (userInfoMap[vibeOwnerId]) {
      return userInfoMap[vibeOwnerId];
    }

    if (typeof vibeInfo.userId === "object" && vibeInfo.userId !== null) {
      return {
        id: vibeInfo.userId._id,
        username: vibeInfo.userId.username || "Unknown",
        name: vibeInfo.userId.name || "Unknown",
        profilePicture: undefined,
      };
    }

    return {
      id: vibeOwnerId,
      username: "Loading...",
      name: "Loading...",
      profilePicture: undefined,
    };
  };

  // Export to CSV
  const handleExportCSV = () => {
    const csv = [
      [
        "ID",
        "Type",
        "Reporter",
        "Reported User",
        "Vibe",
        "Description",
        "Images",
        "Created At",
      ],
      ...filteredReports.map((r) => {
        const reporterInfo = getUserInfo(r);
        const reportedUserInfo = getVibeOwnerInfo(r);
        const vibeInfo = getVibeInfo(r);
        return [
          r.id.slice(-12),
          r.reportType,
          `${reporterInfo.name} (@${reporterInfo.username})`,
          `${reportedUserInfo.name} (@${reportedUserInfo.username})`,
          vibeInfo.itemName,
          r.reportDescription.replace(/,/g, ";"),
          r.reportImages?.length || 0,
          new Date(r.createdAt).toLocaleString(),
        ];
      }),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reports-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchReports();
  }, [typeFilter]);

  // Filter reports by search term
  const filteredReports = useMemo(() => {
    let filtered = reports.filter((r) => {
      const reporterInfo = getUserInfo(r);
      const reportedUserInfo = getVibeOwnerInfo(r);
      const vibeInfo = getVibeInfo(r);
      const searchLower = searchTerm.toLowerCase();

      return (
        r.reportDescription.toLowerCase().includes(searchLower) ||
        r.reportType.toLowerCase().includes(searchLower) ||
        reporterInfo.username.toLowerCase().includes(searchLower) ||
        reporterInfo.name.toLowerCase().includes(searchLower) ||
        reportedUserInfo.username.toLowerCase().includes(searchLower) ||
        reportedUserInfo.name.toLowerCase().includes(searchLower) ||
        vibeInfo.itemName.toLowerCase().includes(searchLower)
      );
    });

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [reports, searchTerm, sortBy, userInfoMap, vibeInfoMap]);

  // Calculate statistics
  // Stats are now provided by the API, but keep fallback calculation
  useEffect(() => {
    if (reports.length > 0 && stats.total === 0) {
      const total = reports.length;
      const spam = reports.filter((r) => r.reportType === "spam").length;
      const inappropriate = reports.filter(
        (r) => r.reportType === "inappropriate"
      ).length;
      const abusive = reports.filter((r) => r.reportType === "abusive").length;
      const withEvidence = reports.filter(
        (r) => r.reportImages && r.reportImages.length > 0
      ).length;

      setStats({ total, spam, inappropriate, abusive, withEvidence });
    }
  }, [reports, stats.total]);

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "spam":
        return <IconAlertTriangle size={16} className="text-yellow-400" />;
      case "inappropriate":
        return <IconAlertCircle size={16} className="text-orange-400" />;
      case "abusive":
        return <IconFlag size={16} className="text-red-400" />;
      default:
        return <IconMessageCircle size={16} className="text-gruvbox-dark-fg3" />;
    }
  };

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case "spam":
        return "bg-yellow-500/20 text-yellow-400";
      case "inappropriate":
        return "bg-orange-500/20 text-orange-400";
      case "abusive":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gruvbox-dark-bg3 text-gruvbox-dark-fg2";
    }
  };

  if (loading && reports.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gruvbox-orange"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-gruvbox-red to-gruvbox-orange rounded-lg">
            <IconAlertTriangle size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gruvbox-dark-fg0">
              Report Management
            </h2>
            <p className="text-sm text-gruvbox-dark-fg2">
              Review and handle user reports
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gruvbox-dark-bg2 hover:bg-gruvbox-dark-bg3 text-gruvbox-dark-fg1 rounded-lg transition-colors"
            onClick={handleExportCSV}
          >
            <IconDownload size={18} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gruvbox-dark-bg2 hover:bg-gruvbox-dark-bg3 text-gruvbox-orange rounded-lg transition-colors"
            onClick={fetchReports}
          >
            <IconRefresh size={18} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          icon={
            <IconAlertTriangle size={24} className="text-gruvbox-red-dark" />
          }
          label="Total Reports"
          value={stats.total}
          color="gruvbox-red"
        />
        <StatCard
          icon={<IconAlertTriangle size={24} className="text-yellow-400" />}
          label="Spam Reports"
          value={stats.spam}
          color="yellow-500"
        />
        <StatCard
          icon={<IconAlertCircle size={24} className="text-orange-400" />}
          label="Inappropriate"
          value={stats.inappropriate}
          color="orange-500"
        />
        <StatCard
          icon={<IconFlag size={24} className="text-red-400" />}
          label="Abusive"
          value={stats.abusive}
          color="red-500"
        />
        <StatCard
          icon={<IconExternalLink size={24} className="text-gruvbox-blue-dark" />}
          label="With Evidence"
          value={stats.withEvidence}
          color="gruvbox-blue"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative md:col-span-1">
          <IconSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gruvbox-dark-fg3"
          />
          <input
            className="w-full bg-gruvbox-dark-bg2 border border-gruvbox-dark-bg3 rounded-lg pl-10 pr-4 py-2.5 text-gruvbox-dark-fg1 placeholder-gruvbox-dark-fg3 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="bg-gruvbox-dark-bg2 border border-gruvbox-dark-bg3 rounded-lg px-4 py-2.5 text-gruvbox-dark-fg1 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="spam">🚫 Spam</option>
          <option value="inappropriate">⚠️ Inappropriate</option>
          <option value="abusive">🔴 Abusive</option>
          <option value="other">📋 Other</option>
        </select>
        <select
          className="bg-gruvbox-dark-bg2 border border-gruvbox-dark-bg3 rounded-lg px-4 py-2.5 text-gruvbox-dark-fg1 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="text-center py-12 bg-gruvbox-dark-bg1 rounded-lg border border-gruvbox-dark-bg3">
          <IconAlertTriangle
            size={48}
            className="mx-auto mb-3 text-gruvbox-dark-fg3"
          />
          <p className="text-gruvbox-dark-fg2">No reports found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredReports.map((report) => {
              const reporterInfo = getUserInfo(report);
              const reportedUserInfo = getVibeOwnerInfo(report);
              const vibeInfo = getVibeInfo(report);

              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg3 rounded-lg p-4 hover:border-gruvbox-red/50 transition-all"
                >
                  {/* Header with Type Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(report.reportType)}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(
                          report.reportType
                        )}`}
                      >
                        {report.reportType.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-gruvbox-dark-fg3">
                      #{report.id.slice(-8)}
                    </span>
                  </div>

                  {/* Reporter & Reported User */}
                  <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gruvbox-dark-bg3">
                    <div>
                      <p className="text-xs text-gruvbox-dark-fg3 mb-2">
                        Reported By
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gruvbox-blue to-gruvbox-purple flex items-center justify-center text-white text-xs font-bold">
                          {reporterInfo.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gruvbox-dark-fg0 truncate">
                            {reporterInfo.username}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gruvbox-dark-fg3 mb-2">
                        Vibe Owner
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gruvbox-orange to-gruvbox-red flex items-center justify-center text-white text-xs font-bold">
                          {reportedUserInfo.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gruvbox-dark-fg0 truncate">
                            {reportedUserInfo.username}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vibe Info */}
                  <div className="bg-gruvbox-dark-bg2 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gruvbox-dark-fg3 mb-1">
                      Reported Vibe
                    </p>
                    <div className="flex items-center gap-2">
                      {vibeInfo.mediaFiles && vibeInfo.mediaFiles.length > 0 && (
                        <div className="w-10 h-10 rounded overflow-hidden bg-gruvbox-dark-bg3 flex-shrink-0">
                          <Image
                            src={vibeInfo.mediaFiles[0].url}
                            alt={vibeInfo.itemName}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gruvbox-dark-fg0 truncate">
                          {vibeInfo.itemName}
                        </p>
                        <p className="text-xs text-gruvbox-dark-fg2 truncate">
                          {vibeInfo.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gruvbox-dark-fg1 mb-3 line-clamp-2">
                    {report.reportDescription}
                  </p>

                  {/* Images Preview */}
                  {report.reportImages && report.reportImages.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {report.reportImages.slice(0, 3).map((img, i) => (
                        <div
                          key={i}
                          className="relative w-16 h-16 rounded-lg overflow-hidden bg-gruvbox-dark-bg2"
                        >
                          <Image
                            src={img}
                            alt={`Report image ${i + 1}`}
                            fill
                            className="object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(img, "_blank")}
                          />
                        </div>
                      ))}
                      {report.reportImages.length > 3 && (
                        <div className="w-16 h-16 rounded-lg bg-gruvbox-dark-bg2 flex items-center justify-center text-xs text-gruvbox-dark-fg2">
                          +{report.reportImages.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gruvbox-dark-bg3">
                    <div className="flex items-center gap-1 text-xs text-gruvbox-dark-fg3">
                      <IconClock size={14} />
                      <span>
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="p-2 hover:bg-gruvbox-dark-bg3 rounded-lg transition-colors text-gruvbox-blue"
                        onClick={() => viewReportDetails(report.id)}
                        title="View Details"
                      >
                        <IconEye size={18} />
                      </button>
                      <button
                        className="p-2 hover:bg-gruvbox-dark-bg3 rounded-lg transition-colors text-gruvbox-dark-fg3"
                        onClick={() => quickDismissReport(report)}
                        title="Dismiss Report"
                      >
                        <IconX size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Report Detail Modal */}
      <ReportDetailModal
        report={selectedReport}
        reporterInfo={selectedReport ? getUserInfo(selectedReport) : null}
        reportedUserInfo={
          selectedReport ? getVibeOwnerInfo(selectedReport) : null
        }
        vibeInfo={selectedReport ? getVibeInfo(selectedReport) : null}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedReport(null);
        }}
        onDelete={handleDeleteReport}
        onBanUser={handleBanUser}
        onDeleteVibe={handleDeleteVibe}
      />

      {/* Success/Error Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2 shadow-lg max-w-md z-50"
          >
            <IconAlertCircle size={18} />
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="ml-2 hover:text-red-300"
            >
              <IconX size={16} />
            </button>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2 shadow-lg max-w-md z-50"
          >
            <IconCheck size={18} />
            <span>{success}</span>
            <button
              onClick={() => setSuccess("")}
              className="ml-2 hover:text-green-300"
            >
              <IconX size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}