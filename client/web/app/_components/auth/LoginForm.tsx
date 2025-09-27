"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconEye, IconEyeOff, IconMail, IconLock, IconLoader2 } from "@tabler/icons-react";
import { useAuth } from "../../_contexts/AuthContext";

interface LoginFormProps {
  redirectTo?: string;
  onSuccess?: () => void;
}

export default function LoginForm({ redirectTo = "/", onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await login(email, password);

    if (result.success) {
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Default redirect behavior
        router.push(redirectTo);
        router.refresh();
      }
    } else {
      setError(result.error || "Đăng nhập thất bại");
    }
  };

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
            Đăng nhập
          </h2>
          <p className="text-gruvbox-gray">
            Chào mừng bạn quay trở lại!
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-gruvbox-red-light dark:bg-gruvbox-red-dark border border-gruvbox-red rounded-lg">
            <p className="text-gruvbox-red text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
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

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mb-2">
              Mật khẩu
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
                placeholder="Nhập mật khẩu"
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
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-gruvbox-orange hover:text-gruvbox-orange-dark font-medium transition-colors"
            >
              Quên mật khẩu?
            </Link>
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
                Đang đăng nhập...
              </>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gruvbox-gray">
            Chưa có tài khoản?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-gruvbox-orange hover:text-gruvbox-orange-dark transition-colors"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
