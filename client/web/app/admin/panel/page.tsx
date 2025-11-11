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
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center ">
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative !min-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
          onClick={onClose}
        >
          <IconX size={22} />
        </button>
        {title && (
          <h2 className="text-xl font-bold mb-4 text-gruvbox-orange">
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
    id: "staff",
    label: "Staff Management",
    icon: <IconUserCog size={20} />,
  },
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
  const [tab, setTab] = useState("staff");
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-gruvbox-orange font-mono">
            Old Vibes Admin Panel
          </span>
          <Link
            href="/admin/profile"
            className="ml-4 text-sm text-gray-500 font-mono"
          >
            {user.email} ({user.role})
          </Link>
        </div>
        <button
          className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded transition"
          onClick={handleLogout}
        >
          <IconLogout size={18} />
          Logout
        </button>
      </div>

      {/* Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <nav className="w-56 bg-white border-r flex flex-col py-6 px-2 gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-md transition-all
                ${
                  tab === t.id
                    ? "bg-gruvbox-orange text-white font-bold shadow"
                    : "text-gruvbox-gray hover:bg-gruvbox-orange/10"
                }
              `}
              onClick={() => setTab(t.id)}
            >
              {React.cloneElement(t.icon, {
                className: tab === t.id ? "text-white" : "text-gruvbox-orange",
              })}
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-gray-50">
          {error && (
            <div className="mb-4 text-red-600 bg-red-100 p-2 rounded">
              {error}
            </div>
          )}
          {tab === "staff" && <StaffSection isAdmin={user.role === "admin"} />}
          {tab === "users" && <UserSection />}
          {tab === "show-vibes" && <ShowVibesSection />}
          {tab === "vibes" && <VibeModerationSection />}
          {tab === "comments" && <CommentModerationSection />}
          {tab === "feedbacks" && <FeedbackSection />}
          {tab === "reports" && <ReportSection />}
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Feedback Management</h2>
        <button
          className="flex items-center gap-2 text-gruvbox-orange hover:underline"
          onClick={fetchFeedbacks}
        >
          <IconRefresh size={16} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <input
          className="flex-1 min-w-64 border rounded px-3 py-1 text-sm"
          placeholder="Search feedbacks by description, type, or user..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border rounded px-3 py-1 text-sm"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="bug">Bug</option>
          <option value="feature">Feature</option>
          <option value="suggestion">Suggestion</option>
          <option value="other">Other</option>
        </select>
        <select
          className="border rounded px-3 py-1 text-sm"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : sortedFeedbacks.length === 0 ? (
        <div className="text-gray-500">No feedbacks found.</div>
      ) : (
        <div className="space-y-4">
          {sortedFeedbacks.map((feedback) => {
            const userInfo = getUserInfo(feedback);
            return (
              <div key={feedback.id} className="border rounded p-4 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">
                        Feedback #{feedback.id.slice(-8)}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          feedback.feedbackType === "bug"
                            ? "bg-red-100 text-red-800"
                            : feedback.feedbackType === "feature"
                            ? "bg-blue-100 text-blue-800"
                            : feedback.feedbackType === "suggestion"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {feedback.feedbackType.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                      <div>
                        <span className="font-bold">User:</span>{" "}
                        {userInfo.username}
                      </div>
                      <div>
                        <span className="font-bold">Name:</span> {userInfo.name}
                      </div>
                      <div>
                        <span className="font-bold">User ID:</span>{" "}
                        {userInfo.id.slice(-8)}
                      </div>
                      <div>
                        <span className="font-bold">Images:</span>{" "}
                        {feedback.feedbackImages?.length || 0}
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 mb-2">
                      <span className="font-bold">Description:</span>{" "}
                      {feedback.feedbackDescription}
                    </div>
                    {feedback.feedbackImages &&
                      feedback.feedbackImages.length > 0 && (
                        <div className="flex gap-2 mb-2 flex-wrap">
                          {feedback.feedbackImages.map((img, i) => (
                            <Image
                              key={i}
                              src={img}
                              alt={`Feedback image ${i + 1}`}
                              width={80}
                              height={80}
                              className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-80"
                              onClick={() => window.open(img, "_blank")}
                            />
                          ))}
                        </div>
                      )}
                    <div className="text-xs text-gray-500 mt-2">
                      Created: {new Date(feedback.createdAt).toLocaleString()} |
                      Updated: {new Date(feedback.updatedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      className="text-gruvbox-blue hover:underline text-sm"
                      onClick={() => viewFeedbackDetails(feedback.id)}
                    >
                      View Details
                    </button>
                  </div>
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
          <div className="max-h-[80vh] overflow-y-auto ">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold">
                  Feedback #{selectedFeedback.id.slice(-8)}
                </h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    selectedFeedback.feedbackType === "bug"
                      ? "bg-red-100 text-red-800"
                      : selectedFeedback.feedbackType === "feature"
                      ? "bg-blue-100 text-blue-800"
                      : selectedFeedback.feedbackType === "suggestion"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedFeedback.feedbackType.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="font-bold">User ID:</span>{" "}
                {getUserInfo(selectedFeedback).id}
              </div>
              <div>
                <span className="font-bold">Username:</span>{" "}
                {getUserInfo(selectedFeedback).username}
              </div>
              <div>
                <span className="font-bold">Name:</span>{" "}
                {getUserInfo(selectedFeedback).name}
              </div>
              <div>
                <span className="font-bold">Images:</span>{" "}
                {selectedFeedback.feedbackImages?.length || 0}
              </div>
            </div>

            <div className="text-sm mb-4">
              <span className="font-bold">Description:</span>
              <p className="mt-1 text-gray-700">
                {selectedFeedback.feedbackDescription}
              </p>
            </div>

            {selectedFeedback.feedbackImages &&
              selectedFeedback.feedbackImages.length > 0 && (
                <div className="mb-4">
                  <span className="font-bold text-sm">Images:</span>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {selectedFeedback.feedbackImages.map((img, i) => (
                      <Image
                        key={i}
                        src={img}
                        alt={`Feedback image ${i + 1}`}
                        width={120}
                        height={120}
                        className="w-30 h-30 object-cover rounded border cursor-pointer hover:opacity-80"
                        onClick={() => window.open(img, "_blank")}
                      />
                    ))}
                  </div>
                </div>
              )}

            <div className="text-xs text-gray-500">
              <div>
                Created: {new Date(selectedFeedback.createdAt).toLocaleString()}
              </div>
              <div>
                Updated: {new Date(selectedFeedback.updatedAt).toLocaleString()}
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Report Management</h2>
        <button
          className="flex items-center gap-2 text-gruvbox-orange hover:underline"
          onClick={fetchReports}
        >
          <IconRefresh size={16} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <input
          className="flex-1 min-w-64 border rounded px-3 py-1 text-sm"
          placeholder="Search reports by description, type, user, or vibe..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border rounded px-3 py-1 text-sm"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="spam">Spam</option>
          <option value="inappropriate">Inappropriate</option>
          <option value="abusive">Abusive</option>
          <option value="other">Other</option>
        </select>
        <select
          className="border rounded px-3 py-1 text-sm"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : sortedReports.length === 0 ? (
        <div className="text-gray-500">No reports found.</div>
      ) : (
        <div className="space-y-4">
          {sortedReports.map((report) => {
            const userInfo = getUserInfo(report);
            const vibeInfo = getVibeInfo(report);
            const vibeOwnerInfo = getVibeOwnerInfo(report);
            return (
              <div key={report.id} className="border rounded p-4 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">
                        Report #{report.id.slice(-8)}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          report.reportType === "spam"
                            ? "bg-yellow-100 text-yellow-800"
                            : report.reportType === "inappropriate"
                            ? "bg-orange-100 text-orange-800"
                            : report.reportType === "abusive"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {report.reportType.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                      <div>
                        <span className="font-bold">Reported By:</span>{" "}
                        {userInfo.username}
                      </div>
                      <div>
                        <span className="font-bold">Report to:</span>{" "}
                        {vibeOwnerInfo.username}
                      </div>
                      <div>
                        <span className="font-bold">Vibe:</span>{" "}
                        {vibeInfo.itemName}
                      </div>
                      <div>
                        <span className="font-bold">Vibe ID:</span>{" "}
                        {vibeInfo.id.slice(-8)}
                      </div>
                      <div>
                        <span className="font-bold">Images:</span>{" "}
                        {report.reportImages?.length || 0}
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 mb-2">
                      <span className="font-bold">Description:</span>{" "}
                      {report.reportDescription}
                    </div>
                    {report.reportImages && report.reportImages.length > 0 && (
                      <div className="flex gap-2 mb-2 flex-wrap">
                        {report.reportImages.map((img, i) => (
                          <Image
                            key={i}
                            src={img}
                            alt={`Report image ${i + 1}`}
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-80"
                            onClick={() => window.open(img, "_blank")}
                          />
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      Created: {new Date(report.createdAt).toLocaleString()} |
                      Updated: {new Date(report.updatedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      className="text-gruvbox-blue hover:underline text-sm"
                      onClick={() => viewReportDetails(report.id)}
                    >
                      View Details
                    </button>
                  </div>
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
          <div className="max-h-96 overflow-y-auto">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold">
                  Report #{selectedReport.id.slice(-8)}
                </h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    selectedReport.reportType === "spam"
                      ? "bg-yellow-100 text-yellow-800"
                      : selectedReport.reportType === "inappropriate"
                      ? "bg-orange-100 text-orange-800"
                      : selectedReport.reportType === "abusive"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedReport.reportType.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="font-bold">Reported By (User ID):</span>{" "}
                {getUserInfo(selectedReport).id}
              </div>
              <div>
                <span className="font-bold">Reported By (Username):</span>{" "}
                {getUserInfo(selectedReport).username}
              </div>
              <div>
                <span className="font-bold">Reported By (Name):</span>{" "}
                {getUserInfo(selectedReport).name}
              </div>
              <div>
                <span className="font-bold">Report to (User ID):</span>{" "}
                {getVibeOwnerInfo(selectedReport).id}
              </div>
              <div>
                <span className="font-bold">Report to (Username):</span>{" "}
                {getVibeOwnerInfo(selectedReport).username}
              </div>
              <div>
                <span className="font-bold">Report to (Name):</span>{" "}
                {getVibeOwnerInfo(selectedReport).name}
              </div>
              <div>
                <span className="font-bold">Vibe ID:</span>{" "}
                {getVibeInfo(selectedReport).id}
              </div>
              <div>
                <span className="font-bold">Vibe Name:</span>{" "}
                {getVibeInfo(selectedReport).itemName}
              </div>
              <div>
                <span className="font-bold">Images:</span>{" "}
                {selectedReport.reportImages?.length || 0}
              </div>
            </div>

            <div className="text-sm mb-4">
              <span className="font-bold">Vibe Description:</span>
              <p className="mt-1 text-gray-700">
                {getVibeInfo(selectedReport).description}
              </p>
            </div>

            <div className="text-sm mb-4">
              <span className="font-bold">Report Description:</span>
              <p className="mt-1 text-gray-700">
                {selectedReport.reportDescription}
              </p>
            </div>

            {selectedReport.reportImages &&
              selectedReport.reportImages.length > 0 && (
                <div className="mb-4">
                  <span className="font-bold text-sm">Report Images:</span>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {selectedReport.reportImages.map((img, i) => (
                      <Image
                        key={i}
                        src={img}
                        alt={`Report image ${i + 1}`}
                        width={120}
                        height={120}
                        className="w-30 h-30 object-cover rounded border cursor-pointer hover:opacity-80"
                        onClick={() => window.open(img, "_blank")}
                      />
                    ))}
                  </div>
                </div>
              )}

            <div className="text-xs text-gray-500">
              <div>
                Created: {new Date(selectedReport.createdAt).toLocaleString()}
              </div>
              <div>
                Updated: {new Date(selectedReport.updatedAt).toLocaleString()}
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
