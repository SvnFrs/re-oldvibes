"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconArrowLeft,
  IconUser,
  IconMail,
  IconCalendar,
  IconShield,
  IconCheck,
  IconX,
  IconRefresh,
  IconPhoto,
  IconEye,
  IconBan,
  IconUserCog,
} from "@tabler/icons-react";
import {
  getUserDetailsById,
  updateUserRole,
  getUserVibes,
} from "@/app/_apis/common/admin";
import Cookies from "js-cookie";
import { useParams } from "next/navigation";

// API endpoint
const API = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:4000/api";

// Types
interface User {
  _id: string;
  email: string;
  name: string;
  username: string;
  role: "admin" | "staff" | "user";
  profilePicture?: string;
  bio?: string;
  followers: string[];
  following: string[];
  isVerified: boolean;
  isEmailVerified: boolean;
  isActive: boolean;
  locationEnabled: boolean;
  preferences: any;
  createdAt: string;
  updatedAt: string;
}

interface Vibe {
  _id: string;
  itemName: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  status: string;
  mediaFiles: {
    type: "image" | "video";
    url: string;
    thumbnail?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// Reusable Modal Component
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
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gruvbox-orange">{title}</h2>
          <button
            className="text-gray-400 hover:text-red-500 transition"
            onClick={onClose}
          >
            <IconX size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

// Vibe List Dialog Component
function VibeListDialog({
  open,
  onClose,
  userId,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
}) {
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const params = useParams();

  const token = Cookies.get("tokenAuth");

  const fetchVibes = async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) {
        setError("Authentication required");
        return;
      }

      const response = await getUserVibes(token, userId);

      console.log("CHECK Response:", response);
      setVibes(response.vibes || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch vibes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchVibes();
    }
  }, [open, userId]);

  return (
    <Modal open={open} onClose={onClose} title="User's Vibes">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gruvbox-orange"></div>
          <span className="ml-2 text-gray-600">Loading vibes...</span>
        </div>
      ) : error ? (
        <div className="text-red-600 bg-red-100 p-4 rounded">{error}</div>
      ) : vibes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <IconPhoto size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No vibes found for this user.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vibes.map((vibe) => (
            <div
              key={vibe._id}
              className="border rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-lg">{vibe.itemName}</h3>
                <span className="text-gruvbox-orange font-bold">
                  ${vibe.price}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {vibe.description}
              </p>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {vibe.category}
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {vibe.condition}
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    vibe.status === "approved"
                      ? "bg-green-100 text-green-600"
                      : vibe.status === "pending"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {vibe.status}
                </span>
              </div>
              {vibe.mediaFiles && vibe.mediaFiles.length > 0 && (
                <div className="flex gap-2 mb-2">
                  {vibe.mediaFiles.slice(0, 3).map((media, index) => (
                    <div key={index} className="w-16 h-16 relative">
                      {media.type === "image" ? (
                        <Image
                          src={media.url}
                          alt="vibe media"
                          fill
                          className="object-cover rounded"
                        />
                      ) : (
                        <video
                          src={media.url}
                          className="w-full h-full object-cover rounded"
                        />
                      )}
                    </div>
                  ))}
                  {vibe.mediaFiles.length > 3 && (
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                      +{vibe.mediaFiles.length - 3}
                    </div>
                  )}
                </div>
              )}
              <div className="text-xs text-gray-500">
                Posted: {new Date(vibe.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

export default function UserDetailPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [roleLoading, setRoleLoading] = useState(false);
  const [vibeDialogOpen, setVibeDialogOpen] = useState(false);
  const params = useParams();

  const token = Cookies.get("tokenAuth");

  // Fetch user details
  const fetchUser = async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) {
        setError("Authentication required");
        return;
      }
      const response = await getUserDetailsById(token || "", String(params.id));

      setUser(response.profile);
    } catch (err: any) {
      setError(err.message || "Failed to fetch user details");
    } finally {
      setLoading(false);
    }
  };

  // Update user role
  const handleRoleUpdate = async (newRole: "admin" | "staff" | "user") => {
    if (!user) return;

    setRoleLoading(true);
    setSuccess("");
    try {
      if (!token) {
        setError("Authentication required");
        return;
      }

      await updateUserRole(token || "", String(params.id), newRole);
      setUser({ ...user, role: newRole });
      setSuccess(`User role updated to ${newRole}`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update user role");
    } finally {
      setRoleLoading(false);
    }
  };

  // Ban/Unban user
  const handleBanToggle = async () => {
    if (!user) return;

    const action = user.isActive ? "ban" : "unban";
    const confirmMessage = user.isActive
      ? "Are you sure you want to ban this user?"
      : "Are you sure you want to unban this user?";

    if (!window.confirm(confirmMessage)) return;

    try {
      if (!token) {
        setError("Authentication required");
        return;
      }

      const response = await fetch(`${API}/admin/users/${user._id}/${action}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token || ""}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} user`);
      }

      setUser({ ...user, isActive: !user.isActive });
      setSuccess(`User ${action}ned successfully`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || `Failed to ${action} user`);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gruvbox-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  // if (error && !user) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="text-red-600 bg-red-100 p-6 rounded-lg max-w-md">
  //           <IconX className="mx-auto mb-2" size={32} />
  //           <h2 className="text-lg font-bold mb-2">Error</h2>
  //           <p>{error}</p>
  //           <Link
  //             href="/admin/panel"
  //             className="inline-block mt-4 text-gruvbox-orange hover:underline"
  //           >
  //             ← Back to Admin Panel
  //           </Link>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/panel"
              className="text-gray-500 hover:text-gruvbox-orange transition"
            >
              <IconArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gruvbox-orange">
                User Details
              </h1>
              <p className="text-gray-600">
                {user.name} (@{user.username})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setVibeDialogOpen(true)}
              className="flex items-center gap-2 bg-gruvbox-blue text-white px-4 py-2 rounded font-semibold hover:bg-gruvbox-blue/90 transition"
            >
              <IconPhoto size={18} />
              View Vibes
            </button>
            <button
              onClick={handleBanToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded font-semibold transition ${
                user.isActive
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-green-100 text-green-600 hover:bg-green-200"
              }`}
            >
              {user.isActive ? <IconBan size={18} /> : <IconCheck size={18} />}
              {user.isActive ? "Ban User" : "Unban User"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 text-green-600 bg-green-100 p-3 rounded">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 text-red-600 bg-red-100 p-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {user.profilePicture ? (
                    <Image
                      src={user.profilePicture}
                      alt="Profile"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <IconUser size={48} className="text-gray-400" />
                  )}
                </div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-gray-600">@{user.username}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.role === "admin"
                        ? "bg-red-100 text-red-600"
                        : user.role === "staff"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {user.role.toUpperCase()}
                  </span>
                  {/* {user.isVerified && (
                    <IconCheck className="text-green-600" size={16} />
                  )} */}
                </div>
              </div>

              {/* Role Assignment */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <IconShield size={18} />
                  Role Assignment
                </h3>
                <div className="space-y-2">
                  {(["admin", "staff", "user"] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleUpdate(role)}
                      disabled={roleLoading || user.role === role}
                      className={`w-full text-left px-3 py-2 rounded transition ${
                        user.role === role
                          ? "bg-gruvbox-orange text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      } ${roleLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="capitalize">{role}</span>
                        {user.role === role && <IconCheck size={16} />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3">
                {/* <div className="flex justify-between">
                  <span className="text-gray-600">Followers</span>
                  <span className="font-semibold">{user.followers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Following</span>
                  <span className="font-semibold">{user.following.length}</span>
                </div> */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span
                    className={`font-semibold ${
                      user.isActive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {user.isActive ? "Active" : "Banned"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Personal Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <div className="flex items-center gap-2">
                      <IconMail size={16} className="text-gray-400" />
                      <span className="font-medium">{user.email}</span>
                      {/* {user.isEmailVerified ? (
                        <IconCheck className="text-green-600" size={16} />
                      ) : (
                        <IconX className="text-red-600" size={16} />
                      )} */}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Username</label>
                    <div className="flex items-center gap-2">
                      <IconUser size={16} className="text-gray-400" />
                      <span className="font-medium">@{user.username}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Full Name</label>
                    <div className="flex items-center gap-2">
                      <IconUserCog size={16} className="text-gray-400" />
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">
                      Member Since
                    </label>
                    <div className="flex items-center gap-2">
                      <IconCalendar size={16} className="text-gray-400" />
                      <span className="font-medium">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">Bio</label>
                    <p className="text-gray-800 mt-1">
                      {user.bio || "No bio provided"}
                    </p>
                  </div>

                  {/* <div>
                    <label className="text-sm text-gray-600">
                      Location Services
                    </label>
                    <div className="flex items-center gap-2">
                      {user.locationEnabled ? (
                        <IconCheck className="text-green-600" size={16} />
                      ) : (
                        <IconX className="text-red-600" size={16} />
                      )}
                      <span className="font-medium">
                        {user.locationEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div> */}

                  {/* <div>
                    <label className="text-sm text-gray-600">
                      Last Updated
                    </label>
                    <div className="flex items-center gap-2">
                      <IconCalendar size={16} className="text-gray-400" />
                      <span className="font-medium">
                        {new Date(user.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vibe List Dialog */}
      <VibeListDialog
        open={vibeDialogOpen}
        onClose={() => setVibeDialogOpen(false)}
        userId={String(params.id)}
      />
    </div>
  );
}
