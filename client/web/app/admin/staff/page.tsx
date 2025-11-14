"use client";

import { useState, useEffect } from "react";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconShield,
  IconUser,
} from "@tabler/icons-react";
import { apiClient } from "../../_libs/api";

interface Staff {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  // Create form state
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    name: "",
    username: "",
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await apiClient.get("/admin/staff");
      setStaff((response.data as any).staff || []);
    } catch (err: any) {
      console.error("Error fetching staff:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await apiClient.post("/admin/staff", createForm);
      setSuccess("Staff member created successfully!");
      setShowCreateModal(false);
      setCreateForm({ email: "", password: "", name: "", username: "" });
      await fetchStaff();
    } catch (err: any) {
      setError(err.message || "Failed to create staff member");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await apiClient.put(`/admin/staff/${selectedStaff.id}`, editForm);
      setSuccess("Staff member updated successfully!");
      setShowEditModal(false);
      setSelectedStaff(null);
      await fetchStaff();
    } catch (err: any) {
      setError(err.message || "Failed to update staff member");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;

    try {
      await apiClient.delete(`/admin/staff/${staffId}`);
      setSuccess("Staff member deleted successfully!");
      await fetchStaff();
    } catch (err: any) {
      setError(err.message || "Failed to delete staff member");
    }
  };

  const openEditModal = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setEditForm({
      name: staffMember.name,
      username: staffMember.username,
    });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-lg mb-6 w-1/3"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
            Staff Management
          </h1>
          <p className="text-gruvbox-gray">
            Manage staff members and their permissions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gruvbox-orange text-white rounded-lg hover:bg-gruvbox-yellow transition-colors"
        >
          <IconPlus size={20} />
          Add Staff
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-gruvbox-green-light/10 dark:bg-gruvbox-green-dark/10 border-2 border-gruvbox-green-light dark:border-gruvbox-green-dark rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <IconCheck className="text-gruvbox-green-light dark:text-gruvbox-green-dark" size={20} />
            <span className="text-gruvbox-green-light dark:text-gruvbox-green-dark">{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-gruvbox-red-light/10 dark:bg-gruvbox-red-dark/10 border-2 border-gruvbox-red-light dark:border-gruvbox-red-dark rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <IconX className="text-gruvbox-red-light dark:text-gruvbox-red-dark" size={20} />
            <span className="text-gruvbox-red-light dark:text-gruvbox-red-dark">{error}</span>
          </div>
        </div>
      )}

      {/* Staff List */}
      <div className="bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 rounded-xl shadow-lg border border-gruvbox-light-bg2 dark:border-gruvbox-dark-bg2">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border-b border-gruvbox-light-bg2 dark:border-gruvbox-dark-bg2">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
                  Staff Member
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
                  Joined
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gruvbox-light-bg2 dark:divide-gruvbox-dark-bg2">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gruvbox-gray">
                    No staff members found. Add your first staff member above.
                  </td>
                </tr>
              ) : (
                staff.map((staffMember) => (
                  <tr key={staffMember.id} className="hover:bg-gruvbox-light-bg1 dark:hover:bg-gruvbox-dark-bg1 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gruvbox-orange rounded-full flex items-center justify-center">
                          <IconShield size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
                            {staffMember.name}
                          </p>
                          <p className="text-sm text-gruvbox-gray">@{staffMember.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2">
                      {staffMember.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gruvbox-blue-light/10 text-gruvbox-blue-light dark:bg-gruvbox-blue-dark/10 dark:text-gruvbox-blue-dark rounded-full text-xs font-medium capitalize">
                        {staffMember.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {staffMember.isActive ? (
                        <span className="px-2 py-1 bg-gruvbox-green-light/10 text-gruvbox-green-light dark:bg-gruvbox-green-dark/10 dark:text-gruvbox-green-dark rounded-full text-xs font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gruvbox-gray/10 text-gruvbox-gray rounded-full text-xs font-medium">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gruvbox-gray text-sm">
                      {new Date(staffMember.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(staffMember)}
                          className="p-2 text-gruvbox-blue-light dark:text-gruvbox-blue-dark hover:bg-gruvbox-blue-light/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <IconEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staffMember.id)}
                          className="p-2 text-gruvbox-red-light dark:text-gruvbox-red-dark hover:bg-gruvbox-red-light/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <IconTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Staff Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-4">
                Add New Staff Member
              </h2>

              <form onSubmit={handleCreateStaff} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border border-gruvbox-light-bg2 dark:border-gruvbox-dark-bg2 rounded-lg text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border border-gruvbox-light-bg2 dark:border-gruvbox-dark-bg2 rounded-lg text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange"
                    placeholder="johndoe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border border-gruvbox-light-bg2 dark:border-gruvbox-dark-bg2 rounded-lg text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    required
                    minLength={6}
                    className="w-full px-4 py-2 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border border-gruvbox-light-bg2 dark:border-gruvbox-dark-bg2 rounded-lg text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange"
                    placeholder="Minimum 6 characters"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateForm({ email: "", password: "", name: "", username: "" });
                      setError("");
                    }}
                    className="flex-1 px-4 py-2 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 rounded-lg hover:bg-gruvbox-light-bg1 dark:hover:bg-gruvbox-dark-bg1 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-gruvbox-orange text-white rounded-lg hover:bg-gruvbox-yellow transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Creating..." : "Create Staff"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-4">
                Edit Staff Member
              </h2>

              <form onSubmit={handleEditStaff} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border border-gruvbox-light-bg2 dark:border-gruvbox-dark-bg2 rounded-lg text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border border-gruvbox-light-bg2 dark:border-gruvbox-dark-bg2 rounded-lg text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedStaff(null);
                      setError("");
                    }}
                    className="flex-1 px-4 py-2 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 rounded-lg hover:bg-gruvbox-light-bg1 dark:hover:bg-gruvbox-dark-bg1 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-gruvbox-orange text-white rounded-lg hover:bg-gruvbox-yellow transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
