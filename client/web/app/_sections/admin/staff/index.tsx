import React, { useState, useEffect, useMemo } from "react";
import {
  IconShieldCheck,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconEdit,
  IconTrash,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconMail,
  IconUser,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import Modal from "@/app/_components/reusable/modal";
import { API } from "@/app/_libs/api";
import { Staff } from "@/app/_libs/types";
import { motion, AnimatePresence } from "framer-motion";

// Staff stats card component
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className={`bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg3 rounded-xl p-6 hover:border-${color}/50 transition-all`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 bg-${color}/20 rounded-lg`}>{icon}</div>
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
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${type === "danger"
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

// Staff Detail Modal Component
function StaffDetailModal({
  staff,
  isOpen,
  onClose,
  onDelete,
}: {
  staff: Staff | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!staff) return null;

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(staff.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Modal opened={isOpen} onClose={onClose} title="Staff Details">
        <div className="space-y-6">
          {/* Staff Info */}
          <div className="bg-gruvbox-dark-bg2 rounded-lg p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gruvbox-blue to-gruvbox-purple flex items-center justify-center text-white font-bold text-2xl">
                {staff.name?.[0]?.toUpperCase() || "S"}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gruvbox-dark-fg0">
                  {staff.name}
                </h3>
                <p className="text-sm text-gruvbox-dark-fg2">@{staff.username}</p>
              </div>
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                  {staff.role.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <IconMail size={16} className="text-gruvbox-dark-fg3" />
                <span className="text-gruvbox-dark-fg1">{staff.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <IconUser size={16} className="text-gruvbox-dark-fg3" />
                <span className="text-gruvbox-dark-fg1">@{staff.username}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gruvbox-dark-bg3">
            <button
              onClick={handleDeleteClick}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 text-red-400 px-4 py-2.5 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              <IconTrash size={18} />
              Delete Staff
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Staff Member"
        message={`Are you sure you want to delete ${staff.name}? This action cannot be undone.`}
        confirmText="Delete Staff"
        type="danger"
      />
    </>
  );
}

// Add/Edit Staff Modal Component
function StaffFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingStaff,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingStaff: Staff | null;
}) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    username: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingStaff) {
      setFormData({
        email: editingStaff.email,
        password: "",
        name: editingStaff.name,
        username: editingStaff.username,
      });
    } else {
      setFormData({
        email: "",
        password: "",
        name: "",
        username: "",
      });
    }
    setErrors({});
  }, [editingStaff, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!editingStaff && !formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gruvbox-dark-fg1 mb-2">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            className={`w-full bg-gruvbox-dark-bg2 border ${errors.name ? "border-red-500" : "border-gruvbox-dark-bg3"
              } rounded-lg px-4 py-2.5 text-gruvbox-dark-fg0 placeholder-gruvbox-dark-fg3 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50`}
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="Enter full name"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-400">{errors.name}</p>
          )}
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-semibold text-gruvbox-dark-fg1 mb-2">
            Username <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            className={`w-full bg-gruvbox-dark-bg2 border ${errors.username ? "border-red-500" : "border-gruvbox-dark-bg3"
              } rounded-lg px-4 py-2.5 text-gruvbox-dark-fg0 placeholder-gruvbox-dark-fg3 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50`}
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            placeholder="Enter username"
          />
          {errors.username && (
            <p className="mt-1 text-xs text-red-400">{errors.username}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gruvbox-dark-fg1 mb-2">
            Email Address <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            className={`w-full bg-gruvbox-dark-bg2 border ${errors.email ? "border-red-500" : "border-gruvbox-dark-bg3"
              } rounded-lg px-4 py-2.5 text-gruvbox-dark-fg0 placeholder-gruvbox-dark-fg3 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50`}
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-400">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-gruvbox-dark-fg1 mb-2">
            Password {!editingStaff && <span className="text-red-400">*</span>}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className={`w-full bg-gruvbox-dark-bg2 border ${errors.password ? "border-red-500" : "border-gruvbox-dark-bg3"
                } rounded-lg px-4 py-2.5 text-gruvbox-dark-fg0 placeholder-gruvbox-dark-fg3 focus:outline-none focus:ring-2 focus:ring-gruvbox-orange/50`}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder={
                editingStaff
                  ? "Leave blank to keep current password"
                  : "Enter password"
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gruvbox-dark-fg3 hover:text-gruvbox-dark-fg1 transition-colors"
            >
              {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-400">{errors.password}</p>
          )}
          {editingStaff && (
            <p className="mt-1 text-xs text-gruvbox-dark-fg3">
              Leave blank to keep the current password
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-gruvbox-orange to-gruvbox-yellow text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            {editingStaff ? "Update Staff" : "Add Staff"}
          </button>
          <button
            type="button"
            className="px-6 bg-gruvbox-dark-bg3 text-gruvbox-dark-fg1 py-3 rounded-lg font-semibold hover:bg-gruvbox-dark-bg2 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function StaffSection({ isAdmin }: { isAdmin: boolean }) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Fetch staff
  const fetchStaff = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API}/admin/staff`, {
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setStaff(data.staff || []);
      } else {
        setError(data.message || "Failed to fetch staff");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Add staff
  const handleAdd = async (formData: any) => {
    setError("");
    try {
      const response = await fetch(`${API}/admin/staff`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess("Staff added successfully!");
        setFormModalOpen(false);
        fetchStaff();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to add staff");
      }
    } catch (err: any) {
      setError(err.message || "Failed to add staff");
    }
  };

  // Delete staff
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API}/admin/staff/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setSuccess("Staff deleted successfully!");
        setModalOpen(false);
        fetchStaff();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to delete staff");
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete staff");
    }
  };

  // Filter staff
  const filteredStaff = useMemo(() => {
    return staff.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [staff, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = staff.length;
    const admins = staff.filter((s) => s.role === "admin").length;
    const staffMembers = staff.filter((s) => s.role === "staff").length;

    return { total, admins, staffMembers };
  }, [staff]);

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
            <IconShieldCheck size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gruvbox-dark-fg0">
              Staff Management
            </h2>
            <p className="text-sm text-gruvbox-dark-fg2">
              Manage staff members and permissions
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gruvbox-dark-bg2 hover:bg-gruvbox-dark-bg3 text-gruvbox-orange rounded-lg transition-colors"
            onClick={fetchStaff}
          >
            <IconRefresh size={18} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          {isAdmin && (
            <button
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gruvbox-orange to-gruvbox-yellow text-white rounded-lg hover:shadow-lg transition-all"
              onClick={() => {
                setEditingStaff(null);
                setFormModalOpen(true);
              }}
            >
              <IconPlus size={18} />
              <span>Add Staff</span>
            </button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={<IconShieldCheck size={24} className="text-gruvbox-blue-dark" />}
          label="Total Staff"
          value={stats.total}
          color="gruvbox-blue"
        />
        <StatCard
          icon={<IconShieldCheck size={24} className="text-red-400" />}
          label="Admins"
          value={stats.admins}
          color="red-500"
        />
        <StatCard
          icon={<IconShieldCheck size={24} className="text-blue-400" />}
          label="Staff Members"
          value={stats.staffMembers}
          color="blue-500"
        />
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
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
      </div>

      {/* Staff Table */}
      {filteredStaff.length === 0 ? (
        <div className="text-center py-12 bg-gruvbox-dark-bg1 rounded-lg border border-gruvbox-dark-bg3">
          <IconShieldCheck size={48} className="mx-auto mb-3 text-gruvbox-dark-fg3" />
          <p className="text-gruvbox-dark-fg2">No staff members found.</p>
        </div>
      ) : (
        <div className="bg-gruvbox-dark-bg1 border border-gruvbox-dark-bg3 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gruvbox-dark-bg2 border-b border-gruvbox-dark-bg3">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gruvbox-dark-fg1">
                    Staff Member
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gruvbox-dark-fg1">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gruvbox-dark-fg1">
                    Role
                  </th>
                  {isAdmin && (
                    <th className="text-right px-4 py-3 text-sm font-semibold text-gruvbox-dark-fg1">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredStaff.map((staffMember) => (
                    <motion.tr
                      key={staffMember.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-gruvbox-dark-bg3 hover:bg-gruvbox-dark-bg2/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gruvbox-blue to-gruvbox-purple flex items-center justify-center text-white font-bold">
                            {staffMember.name?.[0]?.toUpperCase() || "S"}
                          </div>
                          <div>
                            <p className="font-medium text-gruvbox-dark-fg0">
                              {staffMember.name}
                            </p>
                            <p className="text-xs text-gruvbox-dark-fg3">
                              @{staffMember.username}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gruvbox-dark-fg1">
                        {staffMember.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${staffMember.role === "admin"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-blue-500/20 text-blue-400"
                            }`}
                        >
                          {staffMember.role.toUpperCase()}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="p-2 hover:bg-gruvbox-dark-bg3 rounded-lg transition-colors text-gruvbox-blue"
                              onClick={() => {
                                setSelectedStaff(staffMember);
                                setModalOpen(true);
                              }}
                              title="View Details"
                            >
                              <IconEye size={18} />
                            </button>
                            <button
                              className="p-2 hover:bg-gruvbox-dark-bg3 rounded-lg transition-colors text-red-400"
                              onClick={() => {
                                setSelectedStaff(staffMember);
                                setModalOpen(true);
                              }}
                              title="Delete Staff"
                            >
                              <IconTrash size={18} />
                            </button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Staff Detail Modal */}
      <StaffDetailModal
        staff={selectedStaff}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedStaff(null);
        }}
        onDelete={handleDelete}
      />

      {/* Add/Edit Staff Modal */}
      <StaffFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingStaff(null);
        }}
        onSubmit={handleAdd}
        editingStaff={editingStaff}
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