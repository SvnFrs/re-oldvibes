"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  IconCheck,
  IconX,
  IconRefresh,
  IconEye,
  IconTrash,
  IconAlertCircle,
} from "@tabler/icons-react";
import { getPendingVibes, moderateVibe, deleteVibe, type PendingVibe } from "../../_apis/common/admin";

// Dummy token - in real app, get from auth context
const getAuthToken = () => {
  // For now, using cookies with credentials: include
  return "";
};

export default function PendingVibesPanel() {
  const [vibes, setVibes] = useState<PendingVibe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedVibe, setSelectedVibe] = useState<PendingVibe | null>(null);
  const [moderationNotes, setModerationNotes] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchPendingVibes = async () => {
    setLoading(true);
    setError("");

    try {
      const token = getAuthToken();
      const data = await getPendingVibes(token);
      setVibes(data.vibes);
    } catch (err: any) {
      setError(err.message || "Failed to load pending vibes");
      console.error("Error fetching pending vibes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVibes();
  }, []);

  const handleModerate = async (vibeId: string, action: 'approve' | 'reject') => {
    setProcessing(vibeId);
    setError("");
    setSuccess("");

    try {
      const token = getAuthToken();
      await moderateVibe(token, vibeId, {
        action,
        notes: moderationNotes || undefined,
      });

      setSuccess(`Vibe ${action}d successfully`);
      setSelectedVibe(null);
      setModerationNotes("");
      
      // Refresh list
      await fetchPendingVibes();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || `Failed to ${action} vibe`);
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (vibeId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this vibe?")) {
      return;
    }

    setProcessing(vibeId);
    setError("");

    try {
      const token = getAuthToken();
      await deleteVibe(token, vibeId);

      setSuccess("Vibe deleted successfully");
      setSelectedVibe(null);
      
      // Refresh list
      await fetchPendingVibes();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to delete vibe");
    } finally {
      setProcessing(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
            Pending Vibes
          </h2>
          <p className="text-sm text-gruvbox-gray mt-1">
            Review and moderate user-submitted vibes
          </p>
        </div>
        <button
          onClick={fetchPendingVibes}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gruvbox-orange text-white rounded-lg hover:bg-gruvbox-yellow transition disabled:opacity-50"
        >
          <IconRefresh size={18} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-3 bg-gruvbox-red-light/10 dark:bg-gruvbox-red-dark/10 text-gruvbox-red-dark rounded-lg flex items-center gap-2">
          <IconAlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-gruvbox-green-light/10 dark:bg-gruvbox-green-dark/10 text-gruvbox-green-dark rounded-lg flex items-center gap-2">
          <IconCheck size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-gruvbox-orange border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gruvbox-gray">Loading pending vibes...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && vibes.length === 0 && (
        <div className="text-center py-12">
          <IconEye className="w-16 h-16 mx-auto text-gruvbox-gray opacity-50 mb-4" />
          <p className="text-gruvbox-gray">No pending vibes to review</p>
        </div>
      )}

      {/* Vibes Grid */}
      {!loading && vibes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vibes.map((vibe) => (
            <div
              key={vibe._id}
              className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 rounded-lg overflow-hidden shadow hover:shadow-lg transition"
            >
              {/* Image */}
              <div className="relative aspect-square">
                {vibe.mediaFiles && vibe.mediaFiles.length > 0 ? (
                  <Image
                    src={vibe.mediaFiles[0].url}
                    alt={vibe.itemName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 flex items-center justify-center">
                    <IconEye className="w-12 h-12 text-gruvbox-gray" />
                  </div>
                )}
                {vibe.mediaFiles && vibe.mediaFiles.length > 1 && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                    +{vibe.mediaFiles.length - 1} more
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-1">
                  {vibe.itemName}
                </h3>
                <p className="text-xl font-bold text-gruvbox-orange mb-2">
                  {formatPrice(vibe.price)}
                </p>
                
                <div className="text-sm text-gruvbox-gray space-y-1 mb-3">
                  <p><strong>User:</strong> {vibe.user.username} ({vibe.user.name})</p>
                  <p><strong>Category:</strong> {vibe.category}</p>
                  <p><strong>Condition:</strong> {vibe.condition}</p>
                  {vibe.location && <p><strong>Location:</strong> {vibe.location}</p>}
                  <p><strong>Posted:</strong> {new Date(vibe.createdAt).toLocaleString()}</p>
                </div>

                {vibe.tags && vibe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {vibe.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-sm text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2 line-clamp-2 mb-4">
                  {vibe.description}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedVibe(vibe)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gruvbox-blue-dark text-white rounded hover:bg-gruvbox-blue-light transition"
                  >
                    <IconEye size={16} />
                    <span>Review</span>
                  </button>
                  <button
                    onClick={() => handleModerate(vibe._id, 'approve')}
                    disabled={processing === vibe._id}
                    className="px-3 py-2 bg-gruvbox-green-dark text-white rounded hover:bg-gruvbox-green-light transition disabled:opacity-50"
                    title="Quick Approve"
                  >
                    <IconCheck size={18} />
                  </button>
                  <button
                    onClick={() => handleModerate(vibe._id, 'reject')}
                    disabled={processing === vibe._id}
                    className="px-3 py-2 bg-gruvbox-red-dark text-white rounded hover:bg-gruvbox-red-light transition disabled:opacity-50"
                    title="Quick Reject"
                  >
                    <IconX size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedVibe && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gruvbox-dark-bg1 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gruvbox-dark-bg2">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Review Vibe</h3>
                <button
                  onClick={() => setSelectedVibe(null)}
                  className="text-gruvbox-gray hover:text-gruvbox-red-dark"
                >
                  <IconX size={24} />
                </button>
              </div>

              {/* Media Gallery */}
              {selectedVibe.mediaFiles && selectedVibe.mediaFiles.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {selectedVibe.mediaFiles.map((media, idx) => (
                    media.type === 'image' ? (
                      <div key={idx} className="relative aspect-square rounded overflow-hidden">
                        <Image
                          src={media.url}
                          alt={`Media ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <video
                        key={idx}
                        src={media.url}
                        controls
                        className="w-full aspect-square object-cover rounded"
                      />
                    )
                  ))}
                </div>
              )}

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div>
                  <h4 className="font-bold text-lg">{selectedVibe.itemName}</h4>
                  <p className="text-2xl font-bold text-gruvbox-orange">
                    {formatPrice(selectedVibe.price)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <strong>Category:</strong> {selectedVibe.category}
                  </div>
                  <div>
                    <strong>Condition:</strong> {selectedVibe.condition}
                  </div>
                  <div className="col-span-2">
                    <strong>User:</strong> {selectedVibe.user.username} ({selectedVibe.user.name})
                  </div>
                  {selectedVibe.location && (
                    <div className="col-span-2">
                      <strong>Location:</strong> {selectedVibe.location}
                    </div>
                  )}
                  <div className="col-span-2">
                    <strong>Posted:</strong> {new Date(selectedVibe.createdAt).toLocaleString()}
                  </div>
                </div>

                {selectedVibe.tags && selectedVibe.tags.length > 0 && (
                  <div>
                    <strong className="block mb-1">Tags:</strong>
                    <div className="flex flex-wrap gap-1">
                      {selectedVibe.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <strong className="block mb-1">Description:</strong>
                  <p className="text-sm text-gruvbox-gray">{selectedVibe.description}</p>
                </div>
              </div>

              {/* Moderation Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Moderation Notes (optional)
                </label>
                <textarea
                  value={moderationNotes}
                  onChange={(e) => setModerationNotes(e.target.value)}
                  placeholder="Add notes about this moderation decision..."
                  className="w-full px-3 py-2 border rounded-lg bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 min-h-[80px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleModerate(selectedVibe._id, 'approve')}
                  disabled={processing === selectedVibe._id}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gruvbox-green-dark text-white rounded-lg hover:bg-gruvbox-green-light transition disabled:opacity-50 font-medium"
                >
                  <IconCheck size={20} />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => handleModerate(selectedVibe._id, 'reject')}
                  disabled={processing === selectedVibe._id}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gruvbox-red-dark text-white rounded-lg hover:bg-gruvbox-red-light transition disabled:opacity-50 font-medium"
                >
                  <IconX size={20} />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => handleDelete(selectedVibe._id)}
                  disabled={processing === selectedVibe._id}
                  className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
                  title="Delete Permanently"
                >
                  <IconTrash size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
