"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  IconUsers,
  IconUserCog,
  IconPhoto,
  IconMessageCircle,
  IconLogout,
  IconPlus,
  IconTrash,
  IconBan,
  IconCheck,
  IconX,
  IconRefresh,
  IconReport,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconSparkles,
  IconShieldCheck,
  IconSearch,
  IconClock,
  IconHeart,
  IconMapPin,
  IconAlertCircle,
  IconAlertTriangle,
  IconChevronRight,
  IconExternalLink,
  IconMessage,
} from "@tabler/icons-react";
import Link from "next/link";
import { CircleEllipsis, Flag, Info } from "lucide-react";

// API endpoint
const API = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:4000/api";

// --- Reusable Modal ---
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
      <div
        className="bg-gruvbox-dark-bg0 rounded-2xl shadow-2xl max-w-lg w-full p-6 relative border border-gruvbox-dark-bg2 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gruvbox-gray hover:text-gruvbox-red transition-colors rounded-full p-1 hover:bg-gruvbox-dark-bg1"
          onClick={onClose}
        >
          <IconX size={20} />
        </button>
        {title && (
          <h2 className="text-2xl font-bold mb-6 text-gruvbox-dark-fg0 flex items-center gap-2">
            <IconSparkles size={24} className="text-gruvbox-orange" />
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}

// --- Sidebar Tabs ---
const tabs = [
  {
    id: "users",
    label: "User Management",
    icon: <IconUsers size={20} />,
  },
  {
    id: "show-vibes",
    label: "Show Vibes",
    icon: <IconPhoto size={20} />,
  },
  {
    id: "vibes",
    label: "Vibe Moderation",
    icon: <IconPhoto size={20} />,
  },
  {
    id: "comments",
    label: "Comment Moderation",
    icon: <IconMessageCircle size={20} />,
  },
  {
    id: "feedbacks",
    label: "Feedbacks",
    icon: <Info size={20} />,
  },
  {
    id: "reports",
    label: "Reports",
    icon: <Flag size={20} />,
  },
  {
    id: "banners",
    label: "Banner Management",
    icon: <IconPhoto size={20} />,
  },
];

// --- Main Admin Panel ---
type User = {
  id: string;
  email: string;
  username: string;
  name: string;
  role: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  createdAt?: string;
  deletedAt?: string;
};

export default function AdminPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("users");
  const [error] = useState("");

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

  if (loading) return <div className="p-8 text-center">Loading...</div>;
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
      <div className="bg-gruvbox-dark-bg1 border-b border-gruvbox-dark-bg2 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
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
                  className="text-xs text-gruvbox-gray hover:text-gruvbox-dark-fg0 transition-colors"
                >
                  {user.email}
                </Link>
                <span className="px-2 py-0.5 bg-gruvbox-orange/20 text-gruvbox-orange text-xs rounded-full font-semibold border border-gruvbox-orange/30">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>
        <button
          className="flex items-center gap-2 text-gruvbox-red hover:bg-gruvbox-red/10 px-4 py-2 rounded-lg transition-all border border-gruvbox-red/30 hover:border-gruvbox-red hover:shadow-lg hover:shadow-gruvbox-red/20"
          onClick={handleLogout}
        >
          <IconLogout size={18} />
          <span className="font-medium">Logout</span>
        </button>
      </div>

      {/* Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <nav className="w-64 bg-gruvbox-dark-bg1 border-r border-gruvbox-dark-bg2 flex flex-col py-6 px-3 gap-1.5 shadow-xl">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden
                ${
                  tab === t.id
                    ? "bg-gradient-to-r from-gruvbox-orange to-gruvbox-yellow text-gruvbox-dark-bg0 font-bold shadow-lg shadow-gruvbox-orange/30 scale-[1.02]"
                    : "text-gruvbox-dark-fg2 hover:bg-gruvbox-dark-bg2 hover:text-gruvbox-dark-fg0"
                }
              `}
              onClick={() => setTab(t.id)}
            >
              {tab === t.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-gruvbox-orange/20 to-gruvbox-yellow/20 animate-pulse" />
              )}
              <div className="relative flex items-center gap-3 w-full">
                {React.cloneElement(t.icon, {
                  className: tab === t.id ? "text-gruvbox-dark-bg0" : "text-gruvbox-orange group-hover:scale-110 transition-transform",
                  size: 20,
                })}
                <span className="text-sm">{t.label}</span>
              </div>
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-gruvbox-dark-bg0 overflow-y-auto">
          {error && (
            <div className="mb-6 text-gruvbox-red bg-gruvbox-red/10 p-4 rounded-xl border border-gruvbox-red/30 animate-in slide-in-from-top duration-300">
              <div className="flex items-center gap-2">
                <IconX size={18} />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}
          <div className="animate-in fade-in duration-500">
            {tab === "users" && <UserSection />}
            {tab === "show-vibes" && <ShowVibesSection />}
            {tab === "vibes" && <VibeModerationSection />}
            {tab === "comments" && <CommentModerationSection />}
            {tab === "feedbacks" && <FeedbackSection />}
            {tab === "reports" && <ReportSection />}
            {tab === "banners" && <BannerSection />}
          </div>
        </main>
      </div>
    </div>
  );
}

// --- STAFF MANAGEMENT ---
type Staff = {
  id: string;
  email: string;
  username: string;
  name: string;
  role: string;
};

function StaffSection({ isAdmin }: { isAdmin: boolean }) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    username: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch staff
  const fetchStaff = () => {
    setLoading(true);
    fetch(API + "/admin/staff", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setStaff(d.staff || []))
      .catch(() => setStaff([]))
      .finally(() => setLoading(false));
  };
  useEffect(fetchStaff, []);

  // Add staff
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    try {
      const res = await fetch(API + "/admin/staff", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to add staff");
      } else {
        setSuccess("Staff added!");
        setModalOpen(false);
        setForm({ email: "", password: "", name: "", username: "" });
        fetchStaff();
      }
    } catch {
      setError("Network error");
    }
  };

  // Delete staff
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this staff member?")) return;
    await fetch(API + `/admin/staff/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchStaff();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Staff Management</h2>
        {isAdmin && (
          <button
            className="flex items-center gap-2 bg-gruvbox-orange text-white px-4 py-2 rounded font-semibold hover:bg-gruvbox-yellow transition"
            onClick={() => setModalOpen(true)}
          >
            <IconPlus size={18} /> Add Staff
          </button>
        )}
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : staff.length === 0 ? (
        <div className="text-gray-500">No staff found.</div>
      ) : (
        <table className="w-full border mt-2 text-sm">
          <thead>
            <tr className="bg-gruvbox-light-bg1">
              <th className="p-2">Name</th>
              <th>Email</th>
              <th>Username</th>
              <th>Role</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-2">{s.name}</td>
                <td>{s.email}</td>
                <td>{s.username}</td>
                <td>{s.role}</td>
                {isAdmin && (
                  <td>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(s.id)}
                    >
                      <IconTrash size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add Staff Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Staff"
      >
        <form onSubmit={handleAdd} className="space-y-3">
          <input
            className="w-full border p-2 rounded"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            className="w-full border p-2 rounded"
            placeholder="Username"
            value={form.username}
            onChange={(e) =>
              setForm((f) => ({ ...f, username: e.target.value }))
            }
            required
          />
          <input
            className="w-full border p-2 rounded"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <input
            className="w-full border p-2 rounded"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            required
          />
          {error && <div className="text-red-600">{error}</div>}
          <button
            type="submit"
            className="w-full bg-gruvbox-orange text-white py-2 rounded font-bold"
          >
            Add Staff
          </button>
        </form>
      </Modal>
      {success && (
        <div className="mt-2 text-green-600 bg-green-100 p-2 rounded">
          {success}
        </div>
      )}
    </div>
  );
}

// --- USER MANAGEMENT ---
function UserSection() {
  const [users, setUsers] = useState<User[]>([]);
  const [admin, setAdmin] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error] = useState("");
  const [success, setSuccess] = useState("");

  // Auth check
  useEffect(() => {
    fetch(API + "/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.user || !["admin", "staff"].includes(data.user.role)) {
          window.location.href = "/admin/signin";
        } else {
          setAdmin(data.user);
          console.log("admin", data.user);
        }
      })
      .catch(() => (window.location.href = "/admin/signin"))
      .finally(() => setLoading(false));
  }, []);

  // Fetch users
  const fetchUsers = () => {
    setLoading(true);
    fetch(API + "/admin/users?limit=50", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  // Ban/unban
  const handleBan = async (
    id: string,
    banned: boolean,
    checkDeleted: string | undefined
  ) => {
    if (
      !window.confirm(
        banned
          ? checkDeleted
            ? "Restore this user?"
            : "Unban this user?"
          : "Ban this user? They will not be able to login."
      )
    )
      return;
    await fetch(API + `/admin/users/${id}/${banned ? "unban" : "ban"}`, {
      method: "PATCH",
      credentials: "include",
    });
    fetchUsers();
    setSuccess(banned ? "User unbanned" : "User banned");
    setTimeout(() => setSuccess(""), 2000);
  };

  // Filtered users
  const filtered = users.filter(
    (u) =>
      u.email !== admin?.email &&
      (u.email.includes(search) ||
        u.username.includes(search) ||
        u.name?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">User Management</h2>
        <input
          className="border rounded px-3 py-1 text-sm"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500">No users found.</div>
      ) : (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gruvbox-light-bg1">
              <th className="py-2 w-56">Name</th>
              <th className="py-2 w-48">Username</th>
              <th className="py-2 w-56">Email</th>
              <th className="py-2 w-12">Role</th>
              <th className="py-2 w-14">Status</th>
              <th className="py-2 w-14">Email Verified</th>
              <th className="py-2 w-32">Created</th>
              <th className="py-2 w-44">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="py-2 w-56 text-center">{u.name}</td>
                <td className="py-2 w-48 text-center">{u.username}</td>
                <td className="py-2 w-56 text-center">{u.email}</td>
                <td className="py-2 w-12 text-center">{u.role}</td>
                <td className="py-2 w-14 text-center">
                  {u.isActive ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-red-500">
                      {u.deletedAt ? "Deleted" : "Banned"}
                    </span>
                  )}
                </td>
                <td className="py-2 w-14 text-center">
                  {u.isEmailVerified ? (
                    <IconCheck size={16} className="text-green-600 inline" />
                  ) : (
                    <IconX size={16} className="text-red-600 inline" />
                  )}
                </td>
                <td className="py-2 w-32 text-center">
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString()
                    : ""}
                </td>
                <td className="py-2 w-44 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        u.isActive
                          ? "bg-red-100 text-red-600 hover:bg-red-200"
                          : "bg-green-100 text-green-600 hover:bg-green-200"
                      }`}
                      onClick={() => handleBan(u.id, !u.isActive, u.deletedAt)}
                    >
                      {u.isActive ? (
                        <>
                          <IconBan size={14} className="inline" /> Ban
                        </>
                      ) : (
                        <>
                          <IconRefresh size={14} className="inline" />{" "}
                          {u.deletedAt ? "Restore" : "Unban"}
                        </>
                      )}
                    </button>
                    <Link
                      href={`/admin/panel/user/${u.id}`}
                      className="text-gruvbox-orange hover:underline text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {error && (
        <div className="mt-2 text-red-600 bg-red-100 p-2 rounded">{error}</div>
      )}
      {success && (
        <div className="mt-2 text-green-600 bg-green-100 p-2 rounded">
          {success}
        </div>
      )}
    </div>
  );
}

// --- VIBE MODERATION ---
type MediaFile = {
  url: string;
  type: string;
};

type Vibe = {
  id: string;
  itemName: string;
  user?: User;
  price: number;
  category: string;
  condition: string;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  tags?: string[];
  location?: string;
  mediaFiles?: MediaFile[];
  status: string;
  views?: number;
  likesCount?: number;
  commentsCount?: number;
};

function VibeModerationSection() {
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selected, setSelected] = useState<Vibe | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch vibes with filters
  const fetchVibes = () => {
    setLoading(true);
    const params = new URLSearchParams({
      status: statusFilter,
      sortBy,
      limit: "50",
      offset: "0",
    });

    fetch(API + `/admin/vibes?${params}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setVibes(d.vibes || []))
      .catch(() => {
        setVibes([]);
        setError("Failed to fetch vibes");
      })
      .finally(() => setLoading(false));
  };

  useEffect(fetchVibes, [statusFilter, sortBy]);

  // Approve/Reject
  const moderate = async (
    id: string,
    action: "approve" | "reject",
    notes = ""
  ) => {
    try {
      await fetch(API + `/vibes/${id}/moderate`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes }),
      });
      fetchVibes();
      setSuccess(`Vibe ${action}d`);
      setModalOpen(false);
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError("Failed to moderate vibe");
    }
  };

  // Filter vibes by search term
  const filteredVibes = vibes.filter(
    (v) =>
      v.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.user?.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Vibe Management</h2>
        <button
          className="flex items-center gap-2 text-gruvbox-orange hover:underline"
          onClick={fetchVibes}
        >
          <IconRefresh size={16} /> Refresh
        </button>
      </div>
      {/* Filters */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <input
          className="flex-1 min-w-64 border rounded px-3 py-1 text-sm"
          placeholder="Search vibes by name, category, or user..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border rounded px-3 py-1 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="sold">Sold</option>
          <option value="archived">Archived</option>
        </select>
        <select
          className="border rounded px-3 py-1 text-sm"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="likes">Most Liked</option>
          <option value="views">Most Viewed</option>
        </select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : filteredVibes.length === 0 ? (
        <div className="text-gray-500">No vibes found.</div>
      ) : (
        <div className="space-y-4">
          {filteredVibes.map((v) => (
            <div key={v.id} className="border rounded p-4 bg-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{v.itemName}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        v.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : v.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : v.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : v.status === "sold"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {v.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                    <div>
                      <span className="font-bold">User:</span>{" "}
                      {v.user?.username}
                    </div>
                    <div>
                      <span className="font-bold">Price:</span> ${v.price}
                    </div>
                    <div>
                      <span className="font-bold">Category:</span> {v.category}
                    </div>
                    <div>
                      <span className="font-bold">Condition:</span>{" "}
                      {v.condition}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs text-gray-500 mb-2">
                    <div>👀 {v.views || 0} views</div>
                    <div>👍 {v.likesCount || 0} likes</div>
                    <div>💬 {v.commentsCount || 0} comments</div>
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-bold">Description:</span>{" "}
                    {v.description}
                  </div>
                  {v.tags && v.tags.length > 0 && (
                    <div className="mt-2">
                      <span className="font-bold text-sm">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {v.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    Posted:{" "}
                    {v.createdAt ? new Date(v.createdAt).toLocaleString() : ""}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    className="text-gruvbox-blue hover:underline text-sm"
                    onClick={() => {
                      setSelected(v);
                      setModalOpen(true);
                    }}
                  >
                    View Details
                  </button>
                  {v.status === "pending" && (
                    <>
                      <button
                        className="text-green-600 hover:bg-green-50 px-2 py-1 rounded text-xs"
                        onClick={() => moderate(v.id, "approve")}
                      >
                        Approve
                      </button>
                      <button
                        className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs"
                        onClick={() => moderate(v.id, "reject")}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        open={modalOpen && !!selected}
        onClose={() => setModalOpen(false)}
        title="Review Vibe"
      >
        {selected && (
          <div>
            <div className="mb-2">
              <span className="font-bold">{selected.itemName}</span>
              <span className="ml-2 text-gray-500">${selected.price}</span>
            </div>
            <div className="mb-2 text-sm text-gray-700">
              <span className="font-bold">User:</span> {selected.user?.username}{" "}
              ({selected.user?.name})
            </div>
            <div className="mb-2 text-sm">
              <span className="font-bold">Description:</span>{" "}
              {selected.description}
            </div>
            <div className="mb-2 text-sm">
              <span className="font-bold">Category:</span> {selected.category} |{" "}
              <span className="font-bold">Condition:</span> {selected.condition}
            </div>
            <div className="mb-2 text-sm">
              <span className="font-bold">Tags:</span>{" "}
              {selected.tags?.join(", ")}
            </div>
            <div className="mb-2 text-sm">
              <span className="font-bold">Location:</span> {selected.location}
            </div>
            <div className="mb-2 flex gap-2">
              {selected.mediaFiles?.map((m, i) =>
                m.type === "image" ? (
                  <Image
                    key={i}
                    src={m.url}
                    alt="media"
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded border"
                  />
                ) : (
                  <video
                    key={i}
                    src={m.url}
                    controls
                    className="w-20 h-20 object-cover rounded border"
                  />
                )
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded font-bold"
                onClick={() => moderate(selected.id, "approve")}
              >
                <IconCheck size={16} className="inline" /> Approve
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded font-bold"
                onClick={() => moderate(selected.id, "reject")}
              >
                <IconX size={16} className="inline" /> Reject
              </button>
            </div>
          </div>
        )}
      </Modal>
      {error && (
        <div className="mt-2 text-red-600 bg-red-100 p-2 rounded">{error}</div>
      )}
      {success && (
        <div className="mt-2 text-green-600 bg-green-100 p-2 rounded">
          {success}
        </div>
      )}
    </div>
  );
}

// --- SHOW VIBES ---
function ShowVibesSection() {
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedVibe, setSelectedVibe] = useState<Vibe | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  // Fetch vibes with filters
  const fetchVibes = (page = 1) => {
    setLoading(true);
    const offset = (page - 1) * itemsPerPage;
    const params = new URLSearchParams({
      status: statusFilter,
      sortBy,
      limit: itemsPerPage.toString(),
      offset: offset.toString(),
    });

    fetch(API + `/admin/vibes?${params}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setVibes(d.vibes || []);
        setTotalPages(Math.ceil((d.totalCount || 0) / itemsPerPage));
        setCurrentPage(page);
      })
      .catch(() => {
        setVibes([]);
        setError("Failed to fetch vibes");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVibes(1);
  }, [statusFilter, sortBy]);

  // Filter vibes by search term
  const filteredVibes = vibes.filter(
    (v) =>
      v.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.user?.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // View vibe details
  const viewVibeDetails = async (vibeId: string) => {
    try {
      const res = await fetch(API + `/admin/vibes/${vibeId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedVibe(data.vibe);
        setModalOpen(true);
      } else {
        setError("Failed to fetch vibe details");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Show Vibes</h2>
        <button
          className="flex items-center gap-2 text-gruvbox-orange hover:underline"
          onClick={() => fetchVibes(currentPage)}
        >
          <IconRefresh size={16} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <input
          className="flex-1 min-w-64 border rounded px-3 py-1 text-sm"
          placeholder="Search vibes by name, category, or user..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border rounded px-3 py-1 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="sold">Sold</option>
          <option value="archived">Archived</option>
        </select>
        <select
          className="border rounded px-3 py-1 text-sm"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="likes">Most Liked</option>
          <option value="views">Most Viewed</option>
        </select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : filteredVibes.length === 0 ? (
        <div className="text-gray-500">No vibes found.</div>
      ) : (
        <>
          {/* Vibe Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {filteredVibes.map((v) => (
              <div
                key={v.id}
                className="border rounded p-4 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg truncate">{v.itemName}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      v.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : v.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : v.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : v.status === "sold"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {v.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mb-2">
                  <div>
                    <span className="font-bold">User:</span> {v.user?.username}
                  </div>
                  <div>
                    <span className="font-bold">Price:</span> ${v.price}
                  </div>
                  <div>
                    <span className="font-bold">Category:</span> {v.category}
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-3">
                  <div>
                    👀 {v.views || 0} views • 👍 {v.likesCount || 0} likes • 💬{" "}
                    {v.commentsCount || 0} comments
                  </div>
                </div>

                <div className="text-sm text-gray-700 mb-3 line-clamp-2">
                  {v.description}
                </div>

                <div className="flex gap-2">
                  <button
                    className="flex-1 bg-gruvbox-orange text-white px-3 py-2 rounded text-sm font-semibold hover:bg-gruvbox-yellow transition"
                    onClick={() => viewVibeDetails(v.id)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => fetchVibes(currentPage - 1)}
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={() => fetchVibes(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Vibe Details Modal */}
      <Modal
        open={modalOpen && !!selectedVibe}
        onClose={() => setModalOpen(false)}
        title="Vibe Details"
      >
        {selectedVibe && (
          <div className="max-h-96 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2">
                {selectedVibe.itemName}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    selectedVibe.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : selectedVibe.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : selectedVibe.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : selectedVibe.status === "sold"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedVibe.status.toUpperCase()}
                </span>
                <span className="text-lg font-bold text-gruvbox-orange">
                  ${selectedVibe.price}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="font-bold">User:</span>{" "}
                {selectedVibe.user?.username}
              </div>
              <div>
                <span className="font-bold">Category:</span>{" "}
                {selectedVibe.category}
              </div>
              <div>
                <span className="font-bold">Condition:</span>{" "}
                {selectedVibe.condition}
              </div>
              <div>
                <span className="font-bold">Location:</span>{" "}
                {selectedVibe.location}
              </div>
            </div>

            <div className="text-sm mb-4">
              <span className="font-bold">Description:</span>
              <p className="mt-1 text-gray-700">{selectedVibe.description}</p>
            </div>

            {selectedVibe.tags && selectedVibe.tags.length > 0 && (
              <div className="mb-4">
                <span className="font-bold text-sm">Tags:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedVibe.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 text-sm text-gray-500 mb-4">
              <div>👀 {selectedVibe.views || 0} views</div>
              <div>👍 {selectedVibe.likesCount || 0} likes</div>
              <div>💬 {selectedVibe.commentsCount || 0} comments</div>
            </div>

            <div className="text-xs text-gray-500">
              <div>
                Created:{" "}
                {selectedVibe.createdAt
                  ? new Date(selectedVibe.createdAt).toLocaleString()
                  : ""}
              </div>
              <div>
                Updated:{" "}
                {selectedVibe.updatedAt
                  ? new Date(selectedVibe.updatedAt).toLocaleString()
                  : ""}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {error && (
        <div className="mt-4 text-red-600 bg-red-100 p-2 rounded">{error}</div>
      )}
      {success && (
        <div className="mt-4 text-green-600 bg-green-100 p-2 rounded">
          {success}
        </div>
      )}
    </div>
  );
}

// --- COMMENT MODERATION ---
type Comment = {
  id: string;
  content: string;
  user: {
    id: string;
    username: string;
    name: string;
    profilePicture?: string;
    isVerified: boolean;
  };
  vibeId: string;
  likesCount: number;
  createdAt: string;
  isActive: boolean;
};

function CommentModerationSection() {
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [selectedVibe, setSelectedVibe] = useState<Vibe | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch vibes for selection
  const fetchVibes = async () => {
    try {
      const res = await fetch(API + "/admin/vibes?limit=100", {
        credentials: "include",
      });
      const data = await res.json();
      setVibes(data.vibes || []);
    } catch (err) {
      setError("Failed to fetch vibes");
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments for selected vibe
  const fetchComments = async (vibeId: string) => {
    try {
      const params = new URLSearchParams({
        limit: "50",
        offset: "0",
        sortBy,
        search: searchTerm,
      });

      const res = await fetch(
        `${API}/admin/vibes/${vibeId}/comments?${params}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setComments(data.comments || []);
    } catch (err) {
      setError("Failed to fetch comments");
    }
  };

  // Ban user for bad comment
  const banUserForComment = async (userId: string, commentId: string) => {
    if (!window.confirm("Ban this user for inappropriate comment?")) return;

    try {
      const res = await fetch(API + "/admin/users/ban-for-comment", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          commentId,
          reason: "Inappropriate content detected",
        }),
      });

      if (res.ok) {
        setSuccess("User banned successfully");
        if (selectedVibe) fetchComments(selectedVibe.id);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to ban user");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  useEffect(() => {
    fetchVibes();
  }, []);

  useEffect(() => {
    if (selectedVibe) {
      fetchComments(selectedVibe.id);
    }
  }, [selectedVibe, searchTerm, sortBy]);

  const filteredVibes = vibes.filter(
    (v) =>
      v.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Comment Moderation</h2>
        <button
          className="flex items-center gap-2 text-gruvbox-orange hover:underline"
          onClick={fetchVibes}
        >
          <IconRefresh size={16} /> Refresh
        </button>
      </div>

      {/* Vibe Selection */}
      <div className="mb-6">
        <h3 className="font-bold mb-2">Select Vibe to Moderate Comments</h3>
        <div className="flex gap-4 mb-4">
          <input
            className="flex-1 border rounded px-3 py-1 text-sm"
            placeholder="Search vibes by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="border rounded px-3 py-1 text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="likes">Most Liked</option>
          </select>
        </div>

        {loading ? (
          <div>Loading vibes...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVibes.map((vibe) => (
              <div
                key={vibe.id}
                className={`border rounded p-3 cursor-pointer transition ${
                  selectedVibe?.id === vibe.id
                    ? "border-gruvbox-orange bg-gruvbox-orange/10"
                    : "hover:border-gruvbox-orange/50"
                }`}
                onClick={() => setSelectedVibe(vibe)}
              >
                <div className="font-bold text-sm">{vibe.itemName}</div>
                <div className="text-xs text-gray-600">
                  {vibe.user?.username} • ${vibe.price} • {vibe.category}
                </div>
                <div className="text-xs text-gray-500">
                  Status: {vibe.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comments for Selected Vibe */}
      {selectedVibe && (
        <div>
          <h3 className="font-bold mb-4">
            Comments for "{selectedVibe.itemName}" ({comments.length})
          </h3>

          {comments.length === 0 ? (
            <div className="text-gray-500">No comments found.</div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border rounded p-4 bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-sm">
                          {comment.user.username}
                        </span>
                        {comment.user.isVerified && (
                          <IconCheck size={14} className="text-blue-600" />
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{comment.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>👍 {comment.likesCount} likes</span>
                        <span>Vibe: {selectedVibe.itemName}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs"
                        onClick={() =>
                          banUserForComment(comment.user.id, comment.id)
                        }
                      >
                        <IconBan size={14} className="inline mr-1" />
                        Ban User
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 text-red-600 bg-red-100 p-2 rounded">{error}</div>
      )}
      {success && (
        <div className="mt-4 text-green-600 bg-green-100 p-2 rounded">
          {success}
        </div>
      )}
    </div>
  );
}

// --- FEEDBACK SECTION ---
type Feedback = {
  id: string;
  userId:
    | string
    | {
        _id: string;
        username?: string;
        name?: string;
        profilePicture?: string;
      };
  feedbackType: "bug" | "feature" | "suggestion" | "other";
  feedbackDescription: string;
  feedbackImages: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
};

type UserInfo = {
  id: string;
  username: string;
  name: string;
  profilePicture?: string;
};

function FeedbackSection() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [userInfoMap, setUserInfoMap] = useState<Record<string, UserInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch user information by userId
  const fetchUserInfo = async (userId: string): Promise<UserInfo | null> => {
    // Check if we already have this user's info
    if (userInfoMap[userId]) {
      return userInfoMap[userId];
    }

    try {
      const res = await fetch(API + `/users/${userId}`, {
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

  // Fetch feedbacks
  const fetchFeedbacks = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      limit: "50",
      offset: "0",
    });

    if (typeFilter !== "all") {
      params.append("feedbackType", typeFilter);
    }

    try {
      const res = await fetch(API + `/feedback?${params}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.feedbacks) {
        setFeedbacks(data.feedbacks);
        // Fetch user info for all feedbacks
        const userIds = new Set<string>();
        data.feedbacks.forEach((f: Feedback) => {
          if (typeof f.userId === "string") {
            userIds.add(f.userId);
          } else if (f.userId && typeof f.userId === "object") {
            userIds.add(f.userId._id);
          }
        });
        // Fetch user info for all unique user IDs
        await Promise.all(
          Array.from(userIds).map((userId) => fetchUserInfo(userId))
        );
      } else {
        setFeedbacks([]);
      }
    } catch (err) {
      setFeedbacks([]);
      setError("Failed to fetch feedbacks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [typeFilter]);

  // View feedback details
  const viewFeedbackDetails = async (feedbackId: string) => {
    try {
      const res = await fetch(API + `/feedback/${feedbackId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.feedback) {
        // Fetch user info if not populated
        if (typeof data.feedback.userId === "string") {
          await fetchUserInfo(data.feedback.userId);
        }
        setSelectedFeedback(data.feedback);
        setModalOpen(true);
      } else {
        setError("Failed to fetch feedback details");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  // Get user info from feedback
  const getUserInfo = (feedback: Feedback): UserInfo => {
    if (typeof feedback.userId === "object" && feedback.userId !== null) {
      return {
        id: feedback.userId._id,
        username: feedback.userId.username || "Unknown",
        name: feedback.userId.name || "Unknown",
        profilePicture: feedback.userId.profilePicture,
      };
    }
    // If userId is a string, try to get from userInfoMap
    const userId = feedback.userId as string;
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

  // Filter feedbacks by search term
  const filteredFeedbacks = feedbacks.filter((f) => {
    const userInfo = getUserInfo(f);
    return (
      f.feedbackDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.feedbackType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userInfo.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userInfo.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Sort feedbacks
  const sortedFeedbacks = [...filteredFeedbacks].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortBy === "newest" ? dateB - dateA : dateA - dateB;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-gruvbox-purple to-gruvbox-blue rounded-lg">
            <IconMessage size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gruvbox-fg">Feedback Management</h2>
            <p className="text-sm text-gruvbox-fg/60">Review and manage user feedback</p>
          </div>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-gruvbox-bg2 hover:bg-gruvbox-bg3 text-gruvbox-orange rounded-lg transition-colors"
          onClick={fetchFeedbacks}
        >
          <IconRefresh size={18} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative md:col-span-1">
          <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gruvbox-fg/40" />
          <input
            className="w-full bg-gruvbox-bg2 border border-gruvbox-bg3 rounded-lg pl-10 pr-4 py-2.5 text-gruvbox-fg placeholder-gruvbox-fg/40 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
            placeholder="Search feedbacks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="bg-gruvbox-bg2 border border-gruvbox-bg3 rounded-lg px-4 py-2.5 text-gruvbox-fg focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="bug">🐛 Bug Reports</option>
          <option value="feature">✨ Feature Requests</option>
          <option value="suggestion">💡 Suggestions</option>
          <option value="other">📝 Other</option>
        </select>
        <select
          className="bg-gruvbox-bg2 border border-gruvbox-bg3 rounded-lg px-4 py-2.5 text-gruvbox-fg focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gruvbox-orange"></div>
        </div>
      ) : sortedFeedbacks.length === 0 ? (
        <div className="text-center py-12 bg-gruvbox-bg1 rounded-lg border border-gruvbox-bg3">
          <IconMessage size={48} className="mx-auto mb-3 text-gruvbox-fg/20" />
          <p className="text-gruvbox-fg/60">No feedbacks found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedFeedbacks.map((feedback) => {
            const userInfo = getUserInfo(feedback);
            return (
              <div 
                key={feedback.id} 
                className="bg-gruvbox-bg1 border border-gruvbox-bg3 rounded-lg p-4 hover:border-gruvbox-orange/50 transition-all group"
              >
                {/* Type Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      feedback.feedbackType === "bug"
                        ? "bg-red-500/20 text-red-400"
                        : feedback.feedbackType === "feature"
                        ? "bg-blue-500/20 text-blue-400"
                        : feedback.feedbackType === "suggestion"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-gruvbox-bg3 text-gruvbox-fg/60"
                    }`}
                  >
                    {feedback.feedbackType === "bug" && "🐛 "}
                    {feedback.feedbackType === "feature" && "✨ "}
                    {feedback.feedbackType === "suggestion" && "💡 "}
                    {feedback.feedbackType === "other" && "📝 "}
                    {feedback.feedbackType.toUpperCase()}
                  </span>
                  <span className="text-xs text-gruvbox-fg/40">
                    #{feedback.id.slice(-8)}
                  </span>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gruvbox-bg3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gruvbox-orange to-gruvbox-red flex items-center justify-center text-white font-bold">
                    {userInfo.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gruvbox-fg truncate">
                      {userInfo.name}
                    </p>
                    <p className="text-xs text-gruvbox-fg/60 truncate">
                      @{userInfo.username}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gruvbox-fg/80 mb-3 line-clamp-3">
                  {feedback.feedbackDescription}
                </p>

                {/* Images Preview */}
                {feedback.feedbackImages && feedback.feedbackImages.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    {feedback.feedbackImages.slice(0, 3).map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-gruvbox-bg2">
                        <Image
                          src={img}
                          alt={`Feedback image ${i + 1}`}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.open(img, "_blank")}
                        />
                      </div>
                    ))}
                    {feedback.feedbackImages.length > 3 && (
                      <div className="w-16 h-16 rounded-lg bg-gruvbox-bg2 flex items-center justify-center text-xs text-gruvbox-fg/60">
                        +{feedback.feedbackImages.length - 3}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gruvbox-bg3">
                  <div className="flex items-center gap-1 text-xs text-gruvbox-fg/40">
                    <IconClock size={14} />
                    <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                  </div>
                  <button
                    className="flex items-center gap-1 text-xs text-gruvbox-orange hover:text-gruvbox-yellow transition-colors"
                    onClick={() => viewFeedbackDetails(feedback.id)}
                  >
                    <span>View Details</span>
                    <IconChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Feedback Details Modal */}
      <Modal
        open={modalOpen && !!selectedFeedback}
        onClose={() => setModalOpen(false)}
        title="Feedback Details"
      >
        {selectedFeedback && (
          <div className="max-h-[80vh] overflow-y-auto space-y-4">
            {/* Header with Type Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-gruvbox-bg3">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                    selectedFeedback.feedbackType === "bug"
                      ? "bg-red-500/20 text-red-400"
                      : selectedFeedback.feedbackType === "feature"
                      ? "bg-blue-500/20 text-blue-400"
                      : selectedFeedback.feedbackType === "suggestion"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-gruvbox-bg3 text-gruvbox-fg/60"
                  }`}
                >
                  {selectedFeedback.feedbackType === "bug" && "🐛 "}
                  {selectedFeedback.feedbackType === "feature" && "✨ "}
                  {selectedFeedback.feedbackType === "suggestion" && "💡 "}
                  {selectedFeedback.feedbackType === "other" && "📝 "}
                  {selectedFeedback.feedbackType.toUpperCase()}
                </span>
                <span className="text-sm text-gruvbox-fg/40">
                  ID: {selectedFeedback.id.slice(-12)}
                </span>
              </div>
            </div>

            {/* User Info */}
            <div className="bg-gruvbox-bg2 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gruvbox-fg/60 mb-3">Submitted By</h4>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gruvbox-orange to-gruvbox-red flex items-center justify-center text-white font-bold text-lg">
                  {getUserInfo(selectedFeedback).name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-semibold text-gruvbox-fg">
                    {getUserInfo(selectedFeedback).name}
                  </p>
                  <p className="text-sm text-gruvbox-fg/60">
                    @{getUserInfo(selectedFeedback).username}
                  </p>
                  <p className="text-xs text-gruvbox-fg/40 mt-0.5">
                    ID: {getUserInfo(selectedFeedback).id.slice(-12)}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-semibold text-gruvbox-fg/60 mb-2">Description</h4>
              <p className="text-sm text-gruvbox-fg/80 leading-relaxed bg-gruvbox-bg2 rounded-lg p-4">
                {selectedFeedback.feedbackDescription}
              </p>
            </div>

            {/* Images */}
            {selectedFeedback.feedbackImages && selectedFeedback.feedbackImages.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gruvbox-fg/60 mb-2">
                  Attached Images ({selectedFeedback.feedbackImages.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedFeedback.feedbackImages.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gruvbox-bg2 cursor-pointer hover:ring-2 hover:ring-gruvbox-orange transition-all group">
                      <Image
                        src={img}
                        alt={`Feedback image ${i + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                        onClick={() => window.open(img, "_blank")}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <IconExternalLink size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="flex items-center gap-6 text-xs text-gruvbox-fg/40 pt-4 border-t border-gruvbox-bg3">
              <div className="flex items-center gap-1">
                <IconClock size={14} />
                <span>Created: {new Date(selectedFeedback.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <IconClock size={14} />
                <span>Updated: {new Date(selectedFeedback.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2">
          <IconAlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mt-4 bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg flex items-center gap-2">
          <IconCheck size={18} />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}

// --- REPORT SECTION ---
type Report = {
  id: string;
  userId:
    | string
    | {
        _id: string;
        username?: string;
        name?: string;
        profilePicture?: string;
      };
  vibeId:
    | string
    | {
        _id: string;
        itemName?: string;
        description?: string;
        mediaFiles?: MediaFile[];
        userId?: string | { _id: string; username?: string; name?: string };
      };
  reportType: "spam" | "inappropriate" | "abusive" | "other";
  reportDescription: string;
  reportImages: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
};

type VibeInfo = {
  id: string;
  itemName: string;
  description: string;
  mediaFiles: MediaFile[];
  userId?: string | { _id: string; username?: string; name?: string };
};

function ReportSection() {
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

  // Fetch user information by userId
  const fetchUserInfo = async (userId: string): Promise<UserInfo | null> => {
    // Check if we already have this user's info
    if (userInfoMap[userId]) {
      return userInfoMap[userId];
    }

    try {
      const res = await fetch(API + `/users/${userId}`, {
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
    // Check if we already have this vibe's info
    if (vibeInfoMap[vibeId]) {
      return vibeInfoMap[vibeId];
    }

    try {
      const res = await fetch(API + `/vibes/${vibeId}`, {
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
    const params = new URLSearchParams({
      limit: "50",
      offset: "0",
    });

    if (typeFilter !== "all") {
      params.append("reportType", typeFilter);
    }

    try {
      const res = await fetch(API + `/report?${params}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.reports) {
        setReports(data.reports);
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
        // Fetch user and vibe info for all unique IDs
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
        setReports([]);
      }
    } catch (err) {
      setReports([]);
      setError("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [typeFilter]);

  // View report details
  const viewReportDetails = async (reportId: string) => {
    try {
      const res = await fetch(API + `/report/${reportId}`, {
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
    // If userId is a string, try to get from userInfoMap
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
    // If vibeId is a string, try to get from vibeInfoMap
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

  // Get vibe owner info (the user who posted the vibe)
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

    // If userId is an object with username/name, use it
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

  // Filter reports by search term
  const filteredReports = reports.filter((r) => {
    const userInfo = getUserInfo(r);
    const vibeInfo = getVibeInfo(r);
    const vibeOwnerInfo = getVibeOwnerInfo(r);
    return (
      r.reportDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reportType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userInfo.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vibeOwnerInfo.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vibeOwnerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vibeInfo.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Sort reports
  const sortedReports = [...filteredReports].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortBy === "newest" ? dateB - dateA : dateA - dateB;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-gruvbox-red to-gruvbox-orange rounded-lg">
            <IconAlertTriangle size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gruvbox-fg">Report Management</h2>
            <p className="text-sm text-gruvbox-fg/60">Review and handle user reports</p>
          </div>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-gruvbox-bg2 hover:bg-gruvbox-bg3 text-gruvbox-orange rounded-lg transition-colors"
          onClick={fetchReports}
        >
          <IconRefresh size={18} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative md:col-span-1">
          <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gruvbox-fg/40" />
          <input
            className="w-full bg-gruvbox-bg2 border border-gruvbox-bg3 rounded-lg pl-10 pr-4 py-2.5 text-gruvbox-fg placeholder-gruvbox-fg/40 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="bg-gruvbox-bg2 border border-gruvbox-bg3 rounded-lg px-4 py-2.5 text-gruvbox-fg focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
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
          className="bg-gruvbox-bg2 border border-gruvbox-bg3 rounded-lg px-4 py-2.5 text-gruvbox-fg focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gruvbox-orange"></div>
        </div>
      ) : sortedReports.length === 0 ? (
        <div className="text-center py-12 bg-gruvbox-bg1 rounded-lg border border-gruvbox-bg3">
          <IconAlertTriangle size={48} className="mx-auto mb-3 text-gruvbox-fg/20" />
          <p className="text-gruvbox-fg/60">No reports found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sortedReports.map((report) => {
            const userInfo = getUserInfo(report);
            const vibeInfo = getVibeInfo(report);
            const vibeOwnerInfo = getVibeOwnerInfo(report);
            return (
              <div 
                key={report.id} 
                className="bg-gruvbox-bg1 border border-gruvbox-bg3 rounded-lg p-4 hover:border-gruvbox-red/50 transition-all"
              >
                {/* Header with Type Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      report.reportType === "spam"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : report.reportType === "inappropriate"
                        ? "bg-orange-500/20 text-orange-400"
                        : report.reportType === "abusive"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gruvbox-bg3 text-gruvbox-fg/60"
                    }`}
                  >
                    {report.reportType === "spam" && "🚫 "}
                    {report.reportType === "inappropriate" && "⚠️ "}
                    {report.reportType === "abusive" && "🔴 "}
                    {report.reportType === "other" && "📋 "}
                    {report.reportType.toUpperCase()}
                  </span>
                  <span className="text-xs text-gruvbox-fg/40">
                    #{report.id.slice(-8)}
                  </span>
                </div>

                {/* Reporter & Reported User */}
                <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gruvbox-bg3">
                  <div>
                    <p className="text-xs text-gruvbox-fg/40 mb-2">Reported By</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gruvbox-blue to-gruvbox-purple flex items-center justify-center text-white text-xs font-bold">
                        {userInfo.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gruvbox-fg truncate">
                          {userInfo.username}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gruvbox-fg/40 mb-2">Vibe Owner</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gruvbox-orange to-gruvbox-red flex items-center justify-center text-white text-xs font-bold">
                        {vibeOwnerInfo.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gruvbox-fg truncate">
                          {vibeOwnerInfo.username}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vibe Info */}
                <div className="bg-gruvbox-bg2 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gruvbox-fg/40 mb-1">Reported Vibe</p>
                  <p className="text-sm font-semibold text-gruvbox-fg truncate">
                    {vibeInfo.itemName}
                  </p>
                  <p className="text-xs text-gruvbox-fg/60 mt-1 line-clamp-2">
                    {vibeInfo.description}
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm text-gruvbox-fg/80 mb-3 line-clamp-2">
                  {report.reportDescription}
                </p>

                {/* Images Preview */}
                {report.reportImages && report.reportImages.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    {report.reportImages.slice(0, 3).map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-gruvbox-bg2">
                        <Image
                          src={img}
                          alt={`Report image ${i + 1}`}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.open(img, "_blank")}
                        />
                      </div>
                    ))}
                    {report.reportImages.length > 3 && (
                      <div className="w-16 h-16 rounded-lg bg-gruvbox-bg2 flex items-center justify-center text-xs text-gruvbox-fg/60">
                        +{report.reportImages.length - 3}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gruvbox-bg3">
                  <div className="flex items-center gap-1 text-xs text-gruvbox-fg/40">
                    <IconClock size={14} />
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                  <button
                    className="flex items-center gap-1 text-xs text-gruvbox-orange hover:text-gruvbox-yellow transition-colors"
                    onClick={() => viewReportDetails(report.id)}
                  >
                    <span>View Details</span>
                    <IconChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Report Details Modal */}
      <Modal
        open={modalOpen && !!selectedReport}
        onClose={() => setModalOpen(false)}
        title="Report Details"
      >
        {selectedReport && (
          <div className="max-h-[80vh] overflow-y-auto space-y-4">
            {/* Header with Type Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-gruvbox-bg3">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                    selectedReport.reportType === "spam"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : selectedReport.reportType === "inappropriate"
                      ? "bg-orange-500/20 text-orange-400"
                      : selectedReport.reportType === "abusive"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-gruvbox-bg3 text-gruvbox-fg/60"
                  }`}
                >
                  {selectedReport.reportType === "spam" && "🚫 "}
                  {selectedReport.reportType === "inappropriate" && "⚠️ "}
                  {selectedReport.reportType === "abusive" && "🔴 "}
                  {selectedReport.reportType === "other" && "📋 "}
                  {selectedReport.reportType.toUpperCase()}
                </span>
                <span className="text-sm text-gruvbox-fg/40">
                  ID: {selectedReport.id.slice(-12)}
                </span>
              </div>
            </div>

            {/* Reporter Info */}
            <div className="bg-gruvbox-bg2 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gruvbox-fg/60 mb-3">Reported By</h4>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gruvbox-blue to-gruvbox-purple flex items-center justify-center text-white font-bold text-lg">
                  {getUserInfo(selectedReport).name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-semibold text-gruvbox-fg">
                    {getUserInfo(selectedReport).name}
                  </p>
                  <p className="text-sm text-gruvbox-fg/60">
                    @{getUserInfo(selectedReport).username}
                  </p>
                  <p className="text-xs text-gruvbox-fg/40 mt-0.5">
                    ID: {getUserInfo(selectedReport).id.slice(-12)}
                  </p>
                </div>
              </div>
            </div>

            {/* Vibe Owner Info */}
            <div className="bg-gruvbox-bg2 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gruvbox-fg/60 mb-3">Vibe Owner (Reported User)</h4>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gruvbox-orange to-gruvbox-red flex items-center justify-center text-white font-bold text-lg">
                  {getVibeOwnerInfo(selectedReport).name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-semibold text-gruvbox-fg">
                    {getVibeOwnerInfo(selectedReport).name}
                  </p>
                  <p className="text-sm text-gruvbox-fg/60">
                    @{getVibeOwnerInfo(selectedReport).username}
                  </p>
                  <p className="text-xs text-gruvbox-fg/40 mt-0.5">
                    ID: {getVibeOwnerInfo(selectedReport).id.slice(-12)}
                  </p>
                </div>
              </div>
            </div>

            {/* Reported Vibe Info */}
            <div>
              <h4 className="text-sm font-semibold text-gruvbox-fg/60 mb-2">Reported Vibe</h4>
              <div className="bg-gruvbox-bg2 rounded-lg p-4">
                <p className="font-semibold text-gruvbox-fg mb-2">
                  {getVibeInfo(selectedReport).itemName}
                </p>
                <p className="text-sm text-gruvbox-fg/80 leading-relaxed">
                  {getVibeInfo(selectedReport).description}
                </p>
                <p className="text-xs text-gruvbox-fg/40 mt-2">
                  Vibe ID: {getVibeInfo(selectedReport).id.slice(-12)}
                </p>
              </div>
            </div>

            {/* Report Description */}
            <div>
              <h4 className="text-sm font-semibold text-gruvbox-fg/60 mb-2">Report Reason</h4>
              <p className="text-sm text-gruvbox-fg/80 leading-relaxed bg-gruvbox-bg2 rounded-lg p-4">
                {selectedReport.reportDescription}
              </p>
            </div>

            {/* Report Images */}
            {selectedReport.reportImages && selectedReport.reportImages.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gruvbox-fg/60 mb-2">
                  Evidence Images ({selectedReport.reportImages.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedReport.reportImages.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gruvbox-bg2 cursor-pointer hover:ring-2 hover:ring-gruvbox-orange transition-all group">
                      <Image
                        src={img}
                        alt={`Report image ${i + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                        onClick={() => window.open(img, "_blank")}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <IconExternalLink size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="flex items-center gap-6 text-xs text-gruvbox-fg/40 pt-4 border-t border-gruvbox-bg3">
              <div className="flex items-center gap-1">
                <IconClock size={14} />
                <span>Created: {new Date(selectedReport.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <IconClock size={14} />
                <span>Updated: {new Date(selectedReport.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2">
          <IconAlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mt-4 bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg flex items-center gap-2">
          <IconCheck size={18} />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}

// --- BANNER SECTION ---
type BannerItem = {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: Date | string;
  endDate?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type BannerInputForm = {
  title: string;
  description?: string;
  imageUrl: string;
  displayOrder?: number;
  isActive?: boolean;
  startDate?: Date | string;
  endDate?: Date | string;
};

function BannerSection() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedBanner, setSelectedBanner] = useState<BannerItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState<BannerInputForm>({
    title: "",
    description: "",
    imageUrl: "",
    displayOrder: 0,
    isActive: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const fetchBanners = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (isActiveFilter !== undefined) {
        params.append("isActive", isActiveFilter.toString());
      }
      if (searchTerm) {
        params.append("search", searchTerm);
      }
      params.append("limit", "50");
      params.append("offset", "0");

      const res = await fetch(`${API}/banner?${params}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setBanners(data.banners || []);
      } else {
        setError(data.message || "Failed to fetch banners");
        setBanners([]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch banners");
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [isActiveFilter]);

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.title) {
      setError("Title is required");
      return;
    }
    if (!imageFile) {
      setError("Image file is required");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("title", form.title);
      if (form.description) {
        formData.append("description", form.description);
      }
      formData.append("isActive", form.isActive ? "true" : "false");
      if (form.startDate) {
        formData.append("startDate", new Date(form.startDate).toISOString());
      }
      if (form.endDate) {
        formData.append("endDate", new Date(form.endDate).toISOString());
      }

      const res = await fetch(`${API}/banner`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Banner created successfully!");
        setModalOpen(false);
        setForm({ title: "", description: "", imageUrl: "", displayOrder: 0, isActive: true });
        setImageFile(null);
        setImagePreview("");
        fetchBanners();
      } else {
        setError(data.message || "Failed to create banner");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create banner");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBanner) return;
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append("image", imageFile);
      }
      if (form.title) {
        formData.append("title", form.title);
      }
      if (form.description !== undefined) {
        formData.append("description", form.description || "");
      }
      if (form.isActive !== undefined) {
        formData.append("isActive", form.isActive ? "true" : "false");
      }
      if (form.startDate) {
        formData.append("startDate", new Date(form.startDate).toISOString());
      }
      if (form.endDate) {
        formData.append("endDate", new Date(form.endDate).toISOString());
      }

      const res = await fetch(`${API}/banner/${selectedBanner.id}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Banner updated successfully!");
        setModalOpen(false);
        setIsEditing(false);
        setSelectedBanner(null);
        setImageFile(null);
        setImagePreview("");
        fetchBanners();
      } else {
        setError(data.message || "Failed to update banner");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update banner");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    setError("");
    try {
      const res = await fetch(`${API}/banner/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Banner deleted successfully!");
        fetchBanners();
      } else {
        setError(data.message || "Failed to delete banner");
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete banner");
    }
  };

  const handleToggleActive = async (banner: BannerItem) => {
    setError("");
    try {
      const res = await fetch(`${API}/banner/${banner.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(`Banner ${banner.isActive ? "deactivated" : "activated"} successfully!`);
        fetchBanners();
      } else {
        setError(data.message || "Failed to update banner");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update banner");
    }
  };

  const openEditModal = (banner: BannerItem) => {
    setSelectedBanner(banner);
    setForm({
      title: banner.title,
      description: banner.description || "",
      imageUrl: banner.imageUrl,
      displayOrder: banner.displayOrder,
      isActive: banner.isActive,
      startDate: banner.startDate,
      endDate: banner.endDate,
    });
    setImageFile(null);
    setImagePreview(banner.imageUrl);
    setIsEditing(true);
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedBanner(null);
    setForm({ title: "", description: "", imageUrl: "", displayOrder: 0, isActive: true });
    setImageFile(null);
    setImagePreview("");
    setIsEditing(false);
    setModalOpen(true);
  };

  const filteredBanners = banners.filter((banner) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      banner.title.toLowerCase().includes(search) ||
      (banner.description && banner.description.toLowerCase().includes(search))
    );
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-gruvbox-yellow to-gruvbox-orange rounded-lg">
            <IconPhoto size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gruvbox-fg">Banner Management</h2>
            <p className="text-sm text-gruvbox-fg/60">Manage homepage banners and promotions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-gruvbox-bg2 hover:bg-gruvbox-bg3 text-gruvbox-orange rounded-lg transition-colors"
            onClick={fetchBanners}
          >
            <IconRefresh size={18} />
            <span>Refresh</span>
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gruvbox-orange to-gruvbox-yellow text-white rounded-lg hover:shadow-lg transition-all"
            onClick={openCreateModal}
          >
            <IconPlus size={18} />
            <span>Add Banner</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gruvbox-fg/40" />
          <input 
            className="w-full bg-gruvbox-bg2 border border-gruvbox-bg3 rounded-lg pl-10 pr-4 py-2.5 text-gruvbox-fg placeholder-gruvbox-fg/40 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
            placeholder="Search banners by title or description..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <select 
          className="bg-gruvbox-bg2 border border-gruvbox-bg3 rounded-lg px-4 py-2.5 text-gruvbox-fg focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50"
          value={isActiveFilter === undefined ? "all" : isActiveFilter ? "active" : "inactive"} 
          onChange={(e) => { if (e.target.value === "all") setIsActiveFilter(undefined); else setIsActiveFilter(e.target.value === "active"); }}
        >
          <option value="all">All Banners</option>
          <option value="active">✅ Active Only</option>
          <option value="inactive">❌ Inactive Only</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gruvbox-orange"></div>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="text-center py-12 bg-gruvbox-bg1 rounded-lg border border-gruvbox-bg3">
          <IconPhoto size={48} className="mx-auto mb-3 text-gruvbox-fg/20" />
          <p className="text-gruvbox-fg/60">No banners found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBanners.map((banner) => (
            <div 
              key={banner.id} 
              className={`bg-gruvbox-bg1 border border-gruvbox-bg3 rounded-lg overflow-hidden hover:border-gruvbox-orange/50 transition-all group ${!banner.isActive ? "opacity-60" : ""}`}
            >
              {/* Banner Image */}
              <div className="relative aspect-[2/1] bg-gruvbox-bg2 overflow-hidden">
                <Image 
                  src={banner.imageUrl} 
                  alt={banner.title} 
                  width={400} 
                  height={200} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                {!banner.isActive && (
                  <div className="absolute top-2 right-2 bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <IconEyeOff size={14} />
                    Inactive
                  </div>
                )}
                {banner.isActive && (
                  <div className="absolute top-2 left-2 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <IconEye size={14} />
                    Active
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gruvbox-fg mb-2 line-clamp-1">
                  {banner.title}
                </h3>
                {banner.description && (
                  <p className="text-sm text-gruvbox-fg/60 mb-3 line-clamp-2">
                    {banner.description}
                  </p>
                )}
                
                {/* Link */}
                {banner.linkUrl && (
                  <div className="flex items-center gap-1 text-xs text-gruvbox-blue mb-3">
                    <IconExternalLink size={14} />
                    <a 
                      href={banner.linkUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:underline truncate"
                    >
                      {banner.linkUrl}
                    </a>
                  </div>
                )}

                {/* Date Info */}
                {(banner.startDate || banner.endDate) && (
                  <div className="text-xs text-gruvbox-fg/40 mb-3 space-y-1">
                    {banner.startDate && (
                      <div className="flex items-center gap-1">
                        <IconClock size={12} />
                        <span>Starts: {new Date(banner.startDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {banner.endDate && (
                      <div className="flex items-center gap-1">
                        <IconClock size={12} />
                        <span>Ends: {new Date(banner.endDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gruvbox-bg3">
                  <button 
                    className="flex-1 flex items-center justify-center gap-1 bg-gruvbox-blue text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors" 
                    onClick={() => openEditModal(banner)}
                  >
                    <IconEdit size={16} /> Edit
                  </button>
                  <button 
                    className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${banner.isActive ? "bg-gruvbox-bg3 text-gruvbox-fg hover:bg-gruvbox-bg2" : "bg-green-500/20 text-green-400 hover:bg-green-500/30"}`}
                    onClick={() => handleToggleActive(banner)} 
                    title={banner.isActive ? "Deactivate" : "Activate"}
                  >
                    {banner.isActive ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                  </button>
                  <button 
                    className="flex items-center justify-center gap-1 bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-sm hover:bg-red-500/30 transition-colors" 
                    onClick={() => handleDelete(banner.id)}
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal 
        open={modalOpen} 
        onClose={() => { 
          setModalOpen(false); 
          setIsEditing(false); 
          setSelectedBanner(null); 
          setImageFile(null);
          setImagePreview("");
        }} 
        title={isEditing ? "Edit Banner" : "Create New Banner"}
      >
        <form onSubmit={isEditing ? handleUpdate : handleCreate} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gruvbox-fg mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input 
              type="text" 
              className="w-full bg-gruvbox-bg2 border border-gruvbox-bg3 rounded-lg px-4 py-2.5 text-gruvbox-fg focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50" 
              value={form.title} 
              onChange={(e) => setForm({ ...form, title: e.target.value })} 
              required 
              maxLength={200}
              placeholder="Enter banner title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gruvbox-fg mb-2">
              Description
            </label>
            <textarea 
              className="w-full bg-gruvbox-bg2 border border-gruvbox-bg3 rounded-lg px-4 py-2.5 text-gruvbox-fg focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50 resize-none" 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              maxLength={500} 
              rows={3}
              placeholder="Optional description"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gruvbox-fg mb-2">
              Banner Image <span className="text-red-400">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full bg-gruvbox-bg2 border border-gruvbox-bg3 rounded-lg px-4 py-2.5 text-gruvbox-fg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gruvbox-orange file:text-white hover:file:bg-orange-600 file:cursor-pointer cursor-pointer"
              onChange={handleImageChange}
              required={!isEditing}
            />
            
            {/* Image Preview */}
            {(imagePreview || (isEditing && form.imageUrl)) && (
              <div className="mt-3 relative aspect-[2/1] rounded-lg overflow-hidden bg-gruvbox-bg2 border border-gruvbox-bg3">
                <Image
                  src={imagePreview || form.imageUrl}
                  alt="Preview"
                  width={600}
                  height={300}
                  className="w-full h-full object-cover"
                  onError={() => setError("Failed to load image")}
                />
              </div>
            )}
            
            {isEditing && !imageFile && (
              <p className="text-xs text-gruvbox-fg/40 mt-2">
                💡 Leave empty to keep current image, or upload a new one to replace it.
              </p>
            )}
          </div>

          {/* Active Status */}
          <div>
            <label className="block text-sm font-semibold text-gruvbox-fg mb-2">
              Status
            </label>
            <select 
              className="w-full bg-gruvbox-bg2 border border-gruvbox-bg3 rounded-lg px-4 py-2.5 text-gruvbox-fg focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50" 
              value={form.isActive ? "true" : "false"} 
              onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}
            >
              <option value="true">✅ Active (visible to users)</option>
              <option value="false">❌ Inactive (hidden)</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gruvbox-fg mb-2">
                Start Date (optional)
              </label>
              <input 
                type="datetime-local" 
                className="w-full bg-gruvbox-bg2 border border-gruvbox-bg3 rounded-lg px-4 py-2.5 text-gruvbox-fg focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50" 
                value={form.startDate ? new Date(form.startDate).toISOString().slice(0, 16) : ""} 
                onChange={(e) => setForm({ ...form, startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })} 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gruvbox-fg mb-2">
                End Date (optional)
              </label>
              <input 
                type="datetime-local" 
                className="w-full bg-gruvbox-bg2 border border-gruvbox-bg3 rounded-lg px-4 py-2.5 text-gruvbox-fg focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50" 
                value={form.endDate ? new Date(form.endDate).toISOString().slice(0, 16) : ""} 
                onChange={(e) => setForm({ ...form, endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })} 
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-gruvbox-orange to-gruvbox-yellow text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              {isEditing ? "Update Banner" : "Create Banner"}
            </button>
            <button 
              type="button" 
              className="px-6 bg-gruvbox-bg3 text-gruvbox-fg py-3 rounded-lg font-semibold hover:bg-gruvbox-bg2 transition-colors" 
              onClick={() => { 
                setModalOpen(false); 
                setIsEditing(false); 
                setSelectedBanner(null); 
                setImageFile(null); 
                setImagePreview(""); 
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Error/Success Messages */}
      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2">
          <IconAlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mt-4 bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg flex items-center gap-2">
          <IconCheck size={18} />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}
