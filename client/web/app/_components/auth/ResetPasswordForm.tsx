"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconEye, IconEyeOff, IconLock, IconLoader2, IconCheck } from "@tabler/icons-react";
import { authAPI } from "../../_apis/common/auth";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("Token không hợp lệ hoặc đã hết hạn");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (!token) {
      setError("Token không hợp lệ");
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.resetPassword({ token, password });
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
              Mật khẩu đã được đặt lại! 🎉
            </h2>
            <p className="text-gruvbox-gray mb-6">
              Mật khẩu của bạn đã được thay đổi thành công. 
              Bây giờ bạn có thể đăng nhập với mật khẩu mới.
            </p>
            <button
              onClick={() => router.push("/auth/login")}
              className="w-full bg-gruvbox-orange text-gruvbox-light-bg0 py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!token && error) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gruvbox-red-light dark:bg-gruvbox-red-dark rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gruvbox-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mb-2">
              Token không hợp lệ
            </h2>
            <p className="text-gruvbox-gray mb-6">
              Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. 
              Vui lòng yêu cầu đặt lại mật khẩu mới.
            </p>
            <button
              onClick={() => router.push("/auth/forgot-password")}
              className="w-full bg-gruvbox-orange text-gruvbox-light-bg0 py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
            >
              Yêu cầu đặt lại mật khẩu
            </button>
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
            Đặt lại mật khẩu
          </h2>
          <p className="text-gruvbox-gray">
            Nhập mật khẩu mới của bạn
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-gruvbox-red-light dark:bg-gruvbox-red-dark border border-gruvbox-red rounded-lg">
            <p className="text-gruvbox-red text-sm">{error}</p>
          </div>
        )}

        {/* Reset Password Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mb-2">
              Mật khẩu mới
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconLock className="h-5 w-5 text-gruvbox-gray" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-12 py-3 border border-gruvbox-light-bg3 dark:border-gruvbox-dark-bg3 rounded-lg focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 transition-colors"
                placeholder="Nhập mật khẩu mới"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={isLoading}
              >
                {showPassword ? (
                  <IconEyeOff className="h-5 w-5 text-gruvbox-gray hover:text-gruvbox-light-fg1 dark:hover:text-gruvbox-dark-fg1" />
                ) : (
                  <IconEye className="h-5 w-5 text-gruvbox-gray hover:text-gruvbox-light-fg1 dark:hover:text-gruvbox-dark-fg1" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gruvbox-gray">
              Tối thiểu 6 ký tự
            </p>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mb-2">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconLock className="h-5 w-5 text-gruvbox-gray" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full pl-10 pr-12 py-3 border border-gruvbox-light-bg3 dark:border-gruvbox-dark-bg3 rounded-lg focus:ring-2 focus:ring-gruvbox-orange focus:border-transparent bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 transition-colors"
                placeholder="Nhập lại mật khẩu mới"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <IconEyeOff className="h-5 w-5 text-gruvbox-gray hover:text-gruvbox-light-fg1 dark:hover:text-gruvbox-dark-fg1" />
                ) : (
                  <IconEye className="h-5 w-5 text-gruvbox-gray hover:text-gruvbox-light-fg1 dark:hover:text-gruvbox-dark-fg1" />
                )}
              </button>
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
                Đang đặt lại mật khẩu...
              </>
            ) : (
              "Đặt lại mật khẩu"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
