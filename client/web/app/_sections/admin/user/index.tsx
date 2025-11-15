"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  IconUsers,
  IconRefresh,
  IconSearch,
  IconEye,
  IconBan,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconUserCheck,
  IconUserX,
  IconCalendar,
  IconMail,
  IconDownload,
  IconShield,
} from "@tabler/icons-react";
import Modal from "@/app/_components/reusable/modal";
import { API } from "@/app/_libs/api";
import { User } from "@/app/_libs/types";
import { motion, AnimatePresence } from "framer-motion";

// User stats card component
function StatCard({
  icon,
  label,
  value,
  trend,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  trend?: string;
  color: string;
}) {
  return (
    <div className={`bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg3 rounded-xl p-6 hover:border-${color}/50 transition-all`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 bg-${color}/20 rounded-lg`}>{icon}</div>
        {trend && (
          <span className="text-xs text-gruvbox-dark-fg3">{trend}</span>
        )}
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
            <IconAlertCircle size={24} className={`text-${type === "warning" ? "yellow" : type === "danger" ? "red" : "blue"}-400`} />
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

// User Detail Modal Component
function UserDetailModal({
  user,
  isOpen,
  onClose,
  onBanToggle,
  onRoleChange,
}: {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onBanToggle: (userId: string, isActive: boolean) => void;
  onRoleChange: (userId: string, newRole: string) => void;
}) {
  const [showBanConfirm, setShowBanConfirm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  if (!user) return null;

  const handleBanClick = () => {
    setShowBanConfirm(true);
  };

  const handleBanConfirm = () => {
    onBanToggle(user.id, user.isActive || false);
    setShowBanConfirm(false);
  };

  const handleRoleClick = (role: string) => {
    setSelectedRole(role);
  };

  const handleRoleConfirm = () => {
    if (selectedRole) {
      onRoleChange(user.id, selectedRole);
      setSelectedRole(null);
    }
  };

  return (
    <>
      <Modal opened={isOpen} onClose={onClose} title="User Details">
        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-gruvbox-dark-bg2 rounded-lg p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gruvbox-orange to-gruvbox-red flex items-center justify-center text-white font-bold text-2xl">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gruvbox-dark-fg0">
                  {user.name}
                </h3>
                <p className="text-sm text-gruvbox-dark-fg2">@{user.username}</p>
              </div>
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                  {user.role.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <IconMail size={16} className="text-gruvbox-dark-fg3" />
                <span className="text-gruvbox-dark-fg1">{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <IconCalendar size={16} className="text-gruvbox-dark-fg3" />
                <span className="text-gruvbox-dark-fg1">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {user.isEmailVerified ? (
                  <IconCheck size={16} className="text-green-400" />
                ) : (
                  <IconX size={16} className="text-red-400" />
                )}
                <span className="text-gruvbox-dark-fg1">Email Verified</span>
              </div>
              <div className="flex items-center gap-2">
                {user.isActive ? (
                  <IconUserCheck size={16} className="text-green-400" />
                ) : (
                  <IconUserX size={16} className="text-red-400" />
                )}
                <span className="text-gruvbox-dark-fg1">
                  {user.isActive ? "Active" : user.deletedAt ? "Deleted" : "Banned"}
                </span>
              </div>
            </div>
          </div>

          {/* Role Management */}
          <div>
            <h4 className="text-sm font-semibold text-gruvbox-dark-fg2 mb-3 flex items-center gap-2">
              <IconShield size={16} />
              Role Management
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {["user", "staff", "admin"].map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleClick(role)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    user.role === role
                      ? "bg-gradient-to-r from-gruvbox-orange to-gruvbox-yellow text-white"
                      : "bg-gruvbox-dark-bg2 text-gruvbox-dark-fg1 hover:bg-gruvbox-dark-bg3"
                  }`}
                  disabled={user.role === role}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gruvbox-dark-bg3">
            <button
              onClick={() => window.open(`/admin/panel/user/${user.id}`, "_blank")}
              className="flex-1 flex items-center justify-center gap-2 bg-gruvbox-blue text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <IconEye size={18} />
              View Full Profile
            </button>
            <button
              onClick={handleBanClick}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors ${
                user.isActive
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
              }`}
            >
              {user.isActive ? <IconBan size={18} /> : <IconCheck size={18} />}
              {user.isActive ? "Ban" : user.deletedAt ? "Restore" : "Unban"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Ban Confirmation Modal */}
      <ConfirmationModal
        isOpen={showBanConfirm}
        onClose={() => setShowBanConfirm(false)}
        onConfirm={handleBanConfirm}
        title={user.isActive ? "Ban User" : "Unban User"}
        message={
          user.isActive
            ? `Are you sure you want to ban ${user.name}? They will no longer be able to access their account.`
            : user.deletedAt
            ? `Are you sure you want to restore ${user.name}'s account?`
            : `Are you sure you want to unban ${user.name}? They will regain access to their account.`
        }
        confirmText={user.isActive ? "Ban User" : "Unban User"}
        type={user.isActive ? "danger" : "warning"}
      />

      {/* Role Change Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!selectedRole}
        onClose={() => setSelectedRole(null)}
        onConfirm={handleRoleConfirm}
        title="Change User Role"
        message={`Are you sure you want to change ${user.name}'s role to ${selectedRole}?`}
        confirmText="Change Role"
        type="warning"
      />
    </>
  );
}

export default function UserSection() {
  const [users, setUsers] = useState<User[]>([]);
  const [admin, setAdmin] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Auth check
  useEffect(() => {
    fetch(API + "/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.user || !["admin", "staff"].includes(data.user.role)) {
          window.location.href = "/admin/signin";
        } else {
          setAdmin(data.user);
        }
      })
      .catch(() => (window.location.href = "/admin/signin"))
      .finally(() => setLoading(false));
  }, []);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API + "/admin/users?limit=100", {
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);
      } else {
        setError(data.message || "Failed to fetch users");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin) {
      fetchUsers();
    }
  }, [admin]);

  // Ban/Unban user
  const handleBanToggle = async (id: string, isActive: boolean) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    const action = isActive ? "ban" : "unban";

    try {
      const response = await fetch(`${API}/admin/users/${id}/${action}`, {
        method: "PATCH",
        credentials: "include",
      });

      if (response.ok) {
        setSuccess(`User ${action}ned successfully!`);
        fetchUsers();
        setModalOpen(false);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.message || `Failed to ${action} user`);
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${action} user`);
    }
  };

  // Change user role
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`${API}/users/role/${userId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        setSuccess("User role updated successfully!");
        fetchUsers();
        setModalOpen(false);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to update user role");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update user role");
    }
  };

  // Export users to CSV
  const handleExportCSV = () => {
    const csv = [
      ["Name", "Username", "Email", "Role", "Status", "Email Verified", "Created At"],
      ...filteredUsers.map((u) => [
        u.name,
        u.username,
        u.email,
        u.role,
        u.isActive ? "Active" : u.deletedAt ? "Deleted" : "Banned",
        u.isEmailVerified ? "Yes" : "No",
        u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Exclude current admin from list
      if (user.email === admin?.email) return false;

      // Search filter
      const matchesSearch =
        !searchTerm ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      // Role filter
      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.isActive) ||
        (statusFilter === "banned" && !user.isActive && !user.deletedAt) ||
        (statusFilter === "deleted" && user.deletedAt);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter, admin]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = users.filter((u) => u.email !== admin?.email).length;
    const active = users.filter((u) => u.isActive && u.email !== admin?.email).length;
    const banned = users.filter(
      (u) => !u.isActive && !u.deletedAt && u.email !== admin?.email
    ).length;
    const deleted = users.filter((u) => u.deletedAt && u.email !== admin?.email).length;

    return { total, active, banned, deleted };
  }, [users, admin]);

  if (loading) {
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
          <div className="p-2 bg-gradient-to-br from-gruvbox-blue to-gruvbox-purple rounded-lg">
            <IconUsers size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gruvbox-dark-fg0">User Management</h2>
            <p className="text-sm text-gruvbox-dark-fg2">
              Manage users, roles, and permissions
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
            onClick={fetchUsers}
          >
            <IconRefresh size={18} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<IconUsers size={24} className="text-gruvbox-blue-dark" />}
          label="Total Users"
          value={stats.total}
          color="gruvbox-blue"
        />
        <StatCard
          icon={<IconUserCheck size={24} className="text-green-400" />}
          label="Active Users"
          value={stats.active}
          trend={`${Math.round((stats.active / stats.total) * 100)}%`}
          color="green-500"
        />
        <StatCard
          icon={<IconBan size={24} className="text-red-400" />}
          label="Banned Users"
          value={stats.banned}
          color="red-500"
        />
        <StatCard
          icon={<IconUserX size={24} className="text-gruvbox-dark-fg3" />}
          label="Deleted Users"
          value={stats.deleted}
          color="gruvbox-dark-bg3"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2 relative">
          <IconSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gruvbox-dark-fg3"
          />
          <input
            className="w-full bg-gruvbox-dark-bg2 border border-gruvbox-dark-bg3 rounded-lg pl-10 pr-4 py-2.5 text-gruvbox-dark-fg1 placeholder-gruvbox-dark-fg3 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
            placeholder="Search by name, username, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="bg-gruvbox-dark-bg2 border border-gruvbox-dark-bg3 rounded-lg px-4 py-2.5 text-gruvbox-dark-fg1 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="user">👤 Users</option>
          <option value="staff">🛡️ Staff</option>
          <option value="admin">👑 Admins</option>
        </select>
        <select
          className="bg-gruvbox-dark-bg2 border border-gruvbox-dark-bg3 rounded-lg px-4 py-2.5 text-gruvbox-dark-fg1 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">✅ Active</option>
          <option value="banned">🚫 Banned</option>
          <option value="deleted">🗑️ Deleted</option>
        </select>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-gruvbox-dark-bg1 rounded-lg border border-gruvbox-dark-bg3">
          <IconUsers size={48} className="mx-auto mb-3 text-gruvbox-dark-fg3" />
          <p className="text-gruvbox-dark-fg2">No users found.</p>
        </div>
      ) : (
        <div className="bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg3 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gruvbox-dark-bg2 border-b border-gruvbox-dark-bg3">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gruvbox-dark-fg1">
                    User
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gruvbox-dark-fg1">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gruvbox-dark-fg1">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gruvbox-dark-fg1">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gruvbox-dark-fg1">
                    Verified
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gruvbox-dark-fg1">
                    Joined
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gruvbox-dark-fg1">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredUsers.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-gruvbox-dark-bg3 hover:bg-gruvbox-dark-bg2/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gruvbox-orange to-gruvbox-red flex items-center justify-center text-white font-bold">
                            {user.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-medium text-gruvbox-dark-fg0">{user.name}</p>
                            <p className="text-xs text-gruvbox-dark-fg3">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gruvbox-dark-fg1">
                        {user.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.role === "admin"
                              ? "bg-red-500/20 text-red-400"
                              : user.role === "staff"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-gruvbox-dark-bg3 text-gruvbox-dark-fg2"
                          }`}
                        >
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {user.isActive ? (
                          <span className="flex items-center gap-1 text-sm text-green-400">
                            <IconUserCheck size={16} />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-sm text-red-400">
                            <IconUserX size={16} />
                            {user.deletedAt ? "Deleted" : "Banned"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {user.isEmailVerified ? (
                          <IconCheck size={18} className="text-green-400" />
                        ) : (
                          <IconX size={18} className="text-red-400" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gruvbox-dark-fg2">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2 hover:bg-gruvbox-dark-bg3 rounded-lg transition-colors text-gruvbox-blue"
                            onClick={() => {
                              setSelectedUser(user);
                              setModalOpen(true);
                            }}
                            title="View Details"
                          >
                            <IconEye size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedUser(null);
        }}
        onBanToggle={handleBanToggle}
        onRoleChange={handleRoleChange}
      />

      {/* Success/Error Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2 shadow-lg"
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
            className="fixed bottom-4 right-4 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2 shadow-lg"
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
