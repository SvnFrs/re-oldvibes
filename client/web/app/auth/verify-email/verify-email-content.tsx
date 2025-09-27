"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { IconCheck, IconX, IconLoader2 } from "@tabler/icons-react";
import { authAPI } from "../../_apis/common/auth";

export default function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("No verification token provided");
        return;
      }

      try {
        const data = await authAPI.verifyEmail({ token });
        setStatus("success");
        setMessage(data.message || "Email verified successfully!");
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Verification failed");
        console.error("Verification error:", error);
      }
    };

    verifyEmail();
  }, [token]);

  const StatusIcon = () => {
    switch (status) {
      case "loading":
        return (
          <IconLoader2 className="animate-spin h-16 w-16 text-purple-600 mx-auto mb-4" />
        );
      case "success":
        return (
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        );
      case "error":
        return (
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconX className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">🌊</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Old Vibes
            </h1>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Email Verification
          </h2>
        </div>

        {/* Status Content */}
        <div className="text-center">
          <StatusIcon />

          <h3
            className={`text-lg font-semibold mb-3 ${
              status === "success"
                ? "text-green-600 dark:text-green-400"
                : status === "error"
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {status === "loading" && "Verifying your email..."}
            {status === "success" && "🎉 Email Verified!"}
            {status === "error" && "❌ Verification Failed"}
          </h3>

          <p
            className={`mb-6 ${
              status === "success"
                ? "text-green-600 dark:text-green-400"
                : status === "error"
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {message}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === "success" && (
              <>
                <Link
                  href="/auth/login"
                  className="block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                >
                  Đăng nhập ngay
                </Link>
                <Link
                  href="/"
                  className="block w-full border-2 border-purple-600 text-purple-600 py-3 px-4 rounded-lg font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                  Về trang chủ
                </Link>
              </>
            )}

            {status === "error" && (
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                >
                  Thử lại
                </button>
                <Link
                  href="/auth/signup"
                  className="block w-full border-2 border-purple-600 text-purple-600 py-3 px-4 rounded-lg font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                  Đăng ký lại
                </Link>
              </div>
            )}

            {status === "loading" && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                This may take a few seconds...
              </div>
            )}
          </div>
        </div>

        {/* Support Link */}
        <div className="text-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Need help?{" "}
            <a
              href="mailto:support@oldvibes.io.vn"
              className="text-purple-600 dark:text-purple-400 hover:text-purple-500 font-medium"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
