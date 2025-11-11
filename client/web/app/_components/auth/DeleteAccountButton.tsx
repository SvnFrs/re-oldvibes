"use client";

import { useState } from "react";
import { IconTrash, IconLoader2, IconAlertTriangle } from "@tabler/icons-react";
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
      // Clear user data and cookies
      Cookies.remove("userId");
      Cookies.remove("tokenSession");
      localStorage.removeItem("user");
      // Logout user after successful deletion
      await logout();
      // Redirect to login page with message
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
        className="w-full bg-gruvbox-red text-white py-3 px-4 rounded-lg font-semibold hover:bg-gruvbox-red-dark hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gruvbox-red focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <IconTrash className="w-5 h-5" />
        Xóa tài khoản
      </button>

      {/* Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 rounded-2xl shadow-xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gruvbox-red-light dark:bg-gruvbox-red-dark rounded-full flex items-center justify-center mx-auto mb-4">
                <IconAlertTriangle className="w-8 h-8 text-gruvbox-red" />
              </div>
              <h2 className="text-2xl font-bold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mb-2">
                Xóa tài khoản
              </h2>
              <p className="text-gruvbox-gray mb-4">
                Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
              </p>
              <p className="text-sm text-gruvbox-gray mb-6">
                Vui lòng nhập <strong className="text-gruvbox-red">DELETE</strong> để xác nhận:
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-gruvbox-red-light dark:bg-gruvbox-red-dark border border-gruvbox-red rounded-lg">
                <p className="text-gruvbox-red text-sm">{error}</p>
              </div>
            )}

            <div className="mb-6">
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => {
                  setConfirmationText(e.target.value);
                  setError("");
                }}
                placeholder="Nhập DELETE"
                className="w-full px-4 py-3 border border-gruvbox-light-bg3 dark:border-gruvbox-dark-bg3 rounded-lg focus:ring-2 focus:ring-gruvbox-red focus:border-transparent bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 transition-colors"
                disabled={isDeleting}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setConfirmationText("");
                  setError("");
                }}
                disabled={isDeleting}
                className="flex-1 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 py-3 px-4 rounded-lg font-semibold hover:bg-gruvbox-light-bg3 dark:hover:bg-gruvbox-dark-bg3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting || confirmationText !== "DELETE"}
                className="flex-1 bg-gruvbox-red text-white py-3 px-4 rounded-lg font-semibold hover:bg-gruvbox-red-dark hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gruvbox-red focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <IconLoader2 className="animate-spin h-5 w-5" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <IconTrash className="w-5 h-5" />
                    Xóa tài khoản
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

