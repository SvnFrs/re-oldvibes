import ChangePasswordForm from "../_components/auth/ChangePasswordForm";
import ProfileInfo from "../_components/auth/ProfileInfo";
import AuthGuard from "../_components/auth/AuthGuard";
import MyVibesList from "../_components/vibes/MyVibesList";
import DeleteAccountButton from "../_components/auth/DeleteAccountButton";
import { Suspense } from "react";

export default function SettingsPage() {
  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mb-2">
              Cài đặt
            </h1>
            <p className="text-gruvbox-gray">
              Quản lý tài khoản và cài đặt của bạn
            </p>
          </div>

          {/* Settings Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-semibold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mb-4">
                  Tài khoản
                </h2>
                <nav className="space-y-2">
                  <a
                    href="#password"
                    className="block px-4 py-3 text-gruvbox-gray hover:bg-gruvbox-light-bg2 dark:hover:bg-gruvbox-dark-bg2 hover:text-gruvbox-light-fg1 dark:hover:text-gruvbox-dark-fg1 rounded-lg transition-colors"
                  >
                    🔒 Đổi mật khẩu
                  </a>
                  <a
                    href="#profile"
                    className="block px-4 py-3 text-gruvbox-gray hover:bg-gruvbox-light-bg2 dark:hover:bg-gruvbox-dark-bg2 hover:text-gruvbox-light-fg1 dark:hover:text-gruvbox-dark-fg1 rounded-lg transition-colors"
                  >
                    👤 Thông tin cá nhân
                  </a>
                  <a
                    href="#notifications"
                    className="block px-4 py-3 text-gruvbox-gray hover:bg-gruvbox-light-bg2 dark:hover:bg-gruvbox-dark-bg2 hover:text-gruvbox-light-fg1 dark:hover:text-gruvbox-dark-fg1 rounded-lg transition-colors"
                  >
                    🔔 Vibe của tôi
                  </a>
                  <a
                    href="#delete-account"
                    className="block px-4 py-3 text-gruvbox-red hover:bg-gruvbox-light-bg2 dark:hover:bg-gruvbox-dark-bg2 hover:text-gruvbox-red rounded-lg transition-colors"
                  >
                    🗑️ Xóa tài khoản
                  </a>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 rounded-2xl shadow-xl p-8">
                <div id="password">
                  <h2 className="text-2xl font-semibold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mb-6">
                    Đổi mật khẩu
                  </h2>
                  <Suspense
                    fallback={
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gruvbox-orange"></div>
                      </div>
                    }
                  >
                    <ChangePasswordForm />
                  </Suspense>
                </div>

                {/* Placeholder for other settings */}
                <div className="mt-12 pt-8 border-t border-gruvbox-light-bg3 dark:border-gruvbox-dark-bg3">
                  <div id="profile" className="mb-8">
                    <h2 className="text-2xl font-semibold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mb-6">
                      Thông tin cá nhân
                    </h2>
                    <ProfileInfo />
                  </div>

                  <div id="notifications" className="mb-8">
                    <h3 className="text-xl font-semibold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mb-4">
                      Vibe của tôi
                    </h3>
                    <MyVibesList />
                  </div>

                  <div
                    id="delete-account"
                    className="mt-12 pt-8 border-t border-gruvbox-light-bg3 dark:border-gruvbox-dark-bg3"
                  >
                    <h3 className="text-xl font-semibold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mb-4">
                      Xóa tài khoản
                    </h3>
                    <p className="text-gruvbox-gray mb-4 text-sm">
                      Xóa vĩnh viễn tài khoản của bạn và tất cả dữ liệu liên
                      quan. Hành động này không thể hoàn tác.
                    </p>
                    <DeleteAccountButton />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
