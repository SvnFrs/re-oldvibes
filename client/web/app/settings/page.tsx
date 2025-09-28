import ChangePasswordForm from "../_components/auth/ChangePasswordForm";
import AuthGuard from "../_components/auth/AuthGuard";
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
                  🔔 Thông báo
                </a>
                <a
                  href="#privacy"
                  className="block px-4 py-3 text-gruvbox-gray hover:bg-gruvbox-light-bg2 dark:hover:bg-gruvbox-dark-bg2 hover:text-gruvbox-light-fg1 dark:hover:text-gruvbox-dark-fg1 rounded-lg transition-colors"
                >
                  🛡️ Quyền riêng tư
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
                <Suspense fallback={
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gruvbox-orange"></div>
                  </div>
                }>
                  <ChangePasswordForm />
                </Suspense>
              </div>

              {/* Placeholder for other settings */}
              <div className="mt-12 pt-8 border-t border-gruvbox-light-bg3 dark:border-gruvbox-dark-bg3">
                <div id="profile" className="mb-8">
                  <h3 className="text-xl font-semibold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mb-4">
                    Thông tin cá nhân
                  </h3>
                  <div className="bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-lg p-4">
                    <p className="text-gruvbox-gray text-sm">
                      Tính năng đang được phát triển...
                    </p>
                  </div>
                </div>

                <div id="notifications" className="mb-8">
                  <h3 className="text-xl font-semibold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mb-4">
                    Thông báo
                  </h3>
                  <div className="bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-lg p-4">
                    <p className="text-gruvbox-gray text-sm">
                      Tính năng đang được phát triển...
                    </p>
                  </div>
                </div>

                <div id="privacy">
                  <h3 className="text-xl font-semibold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mb-4">
                    Quyền riêng tư
                  </h3>
                  <div className="bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-lg p-4">
                    <p className="text-gruvbox-gray text-sm">
                      Tính năng đang được phát triển...
                    </p>
                  </div>
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
