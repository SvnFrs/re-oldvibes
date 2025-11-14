"use client";

import { useState } from "react";
import { IconTrash, IconLoader2, IconAlertTriangle, IconX } from "@tabler/icons-react";
import Cookies from "js-cookie";
import { deleteAccount } from "../../_apis/common/user";
import { useAuth } from "../../_contexts/AuthContext";

export default function DeleteAccountButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [confirmationText, setConfirmationText] = useState("");
  const { logout } = useAuth();

  const handleDelete = async () => {
    if (confirmationText !== "DELETE") {
      setError("Please type 'DELETE' to confirm");
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      await deleteAccount();
      Cookies.remove("userId");
      Cookies.remove("tokenSession");
      localStorage.removeItem("user");
      await logout();
      window.location.href = "/auth/login?deleted=true";
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete account. Please try again."
      );
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-gruvbox-red to-gruvbox-red-dark text-white py-4 px-6 rounded-xl font-semibold hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-gruvbox-red/50 transition-all duration-200 flex items-center justify-center gap-3 group"
      >
        <IconTrash className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <span>Delete Account Permanently</span>
      </button>

      {/* Enhanced Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              if (!isDeleting) {
                setIsOpen(false);
                setConfirmationText("");
                setError("");
              }
            }}
          />

          {/* Modal */}
          <div className="relative bg-gruvbox-dark-bg1 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gruvbox-dark-bg3 animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => {
                if (!isDeleting) {
                  setIsOpen(false);
                  setConfirmationText("");
                  setError("");
                }
              }}
              disabled={isDeleting}
              className="absolute top-4 right-4 p-2 hover:bg-gruvbox-dark-bg2 rounded-lg transition-colors disabled:opacity-50"
            >
              <IconX className="w-5 h-5 text-gruvbox-gray" />
            </button>

            {/* Icon and Header */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-gruvbox-red to-gruvbox-red-dark rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <IconAlertTriangle className="w-10 h-10 text-white animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-gruvbox-dark-fg0 mb-2">
                Delete Account?
              </h2>
              <p className="text-gruvbox-gray leading-relaxed">
                This action is <span className="text-gruvbox-red font-semibold">permanent</span> and cannot be undone. All your data will be permanently deleted.
              </p>
            </div>

            {/* What will be deleted */}
            <div className="mb-6 p-4 bg-gruvbox-red/5 border border-gruvbox-red/20 rounded-xl">
              <p className="text-sm text-gruvbox-gray mb-3 font-medium">
                The following will be permanently deleted:
              </p>
              <ul className="text-sm text-gruvbox-dark-fg2 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-gruvbox-red mt-0.5">•</span>
                  <span>Your profile and personal information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gruvbox-red mt-0.5">•</span>
                  <span>All your vibes and listings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gruvbox-red mt-0.5">•</span>
                  <span>Comments, likes, and interactions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gruvbox-red mt-0.5">•</span>
                  <span>Your wishlist and saved items</span>
                </li>
              </ul>
            </div>

            {/* Confirmation Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gruvbox-dark-fg0 mb-2">
                Type <span className="font-mono font-bold text-gruvbox-red">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => {
                  setConfirmationText(e.target.value);
                  setError("");
                }}
                placeholder="Type DELETE here"
                className="w-full px-4 py-3 border border-gruvbox-gray/20 rounded-xl focus:ring-2 focus:ring-gruvbox-red/50 focus:border-gruvbox-red bg-gruvbox-dark-bg0 text-gruvbox-dark-fg0 transition-colors font-mono"
                disabled={isDeleting}
                autoFocus
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-gruvbox-red/10 border border-gruvbox-red/30 rounded-xl animate-in slide-in-from-top-2 duration-200">
                <p className="text-gruvbox-red text-sm flex items-center gap-2">
                  <IconAlertTriangle size={16} />
                  {error}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setConfirmationText("");
                  setError("");
                }}
                disabled={isDeleting}
                className="flex-1 bg-gruvbox-dark-bg2 text-gruvbox-dark-fg0 py-3 px-4 rounded-xl font-semibold hover:bg-gruvbox-dark-bg3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting || confirmationText !== "DELETE"}
                className="flex-1 bg-gradient-to-r from-gruvbox-red to-gruvbox-red-dark text-white py-3 px-4 rounded-xl font-semibold hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-gruvbox-red/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <IconLoader2 className="animate-spin h-5 w-5" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <IconTrash className="w-5 h-5" />
                    <span>Delete Forever</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
