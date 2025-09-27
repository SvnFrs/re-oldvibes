"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconMail, IconArrowLeft, IconLoader2, IconCheck } from "@tabler/icons-react";
import { authAPI } from "../../_apis/common/auth";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await authAPI.forgotPassword({ email });
      setSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gruvbox-green-light dark:bg-gruvbox-green-dark rounded-full flex items-center justify-center mx-auto mb-4">
              <IconCheck className="w-8 h-8 text-gruvbox-green" />
            </div>
            <h2 className="text-2xl font-bold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mb-2">
              Email đã được gửi! 📧
            </h2>
            <p className="text-gruvbox-gray mb-6">
              Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến <strong>{email}</strong>. 
              Vui lòng kiểm tra hộp thư và làm theo hướng dẫn trong email.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/auth/login")}
                className="w-full bg-gruvbox-orange text-gruvbox-light-bg0 py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
              >
                Quay lại đăng nhập
              </button>
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail("");
                }}
                className="w-full border-2 border-gruvbox-orange text-gruvbox-orange py-3 px-4 rounded-lg font-semibold hover:bg-gruvbox-orange-light hover:text-gruvbox-light-bg0 transition-colors"
              >
                Gửi lại email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gruvbox-orange-light dark:bg-gruvbox-orange-dark rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">🌊</span>
            </div>
            <h1 className="text-2xl font-bold text-gruvbox-orange-light dark:text-gruvbox-orange-dark">
              Old Vibes
            </h1>
          </div>
          <h2 className="text-xl font-semibold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mb-2">
            Quên mật khẩu
          </h2>
          <p className="text-gruvbox-gray">
            Nhập email của bạn để nhận liên kết đặt lại mật khẩu
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-gruvbox-red-light dark:bg-gruvbox-red-dark border border-gruvbox-red rounded-lg">
            <p className="text-gruvbox-red text-sm">{error}</p>
          </div>
        )}

        {/* Forgot Password Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconMail className="h-5 w-5 text-gruvbox-gray" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gruvbox-light-bg3 dark:border-gruvbox-dark-bg3 rounded-lg focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 transition-colors"
                placeholder="Nhập email của bạn"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gruvbox-orange text-gruvbox-light-bg0 py-3 px-4 rounded-lg font-semibold hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gruvbox-orange focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <IconLoader2 className="animate-spin h-5 w-5 mr-2" />
                Đang gửi email...
              </>
            ) : (
              "Gửi email đặt lại mật khẩu"
            )}
          </button>
        </form>

        {/* Back to Login Link */}
        <div className="mt-6 text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center text-sm text-gruvbox-orange hover:text-gruvbox-orange-dark font-medium transition-colors"
          >
            <IconArrowLeft className="h-4 w-4 mr-1" />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
