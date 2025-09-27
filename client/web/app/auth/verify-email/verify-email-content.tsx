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
          <IconLoader2 className="animate-spin h-16 w-16 text-gruvbox-orange mx-auto mb-4" />
        );
      case "success":
        return (
          <div className="w-16 h-16 bg-gruvbox-green-light dark:bg-gruvbox-green-dark rounded-full flex items-center justify-center mx-auto mb-4">
            <IconCheck className="w-8 h-8 text-gruvbox-green" />
          </div>
        );
      case "error":
        return (
          <div className="w-16 h-16 bg-gruvbox-red-light dark:bg-gruvbox-red-dark rounded-full flex items-center justify-center mx-auto mb-4">
            <IconX className="w-8 h-8 text-gruvbox-red" />
          </div>
        );
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
            Email Verification
          </h2>
        </div>

        {/* Status Content */}
        <div className="text-center">
          <StatusIcon />

          <h3
            className={`text-lg font-semibold mb-3 ${
              status === "success"
                ? "text-gruvbox-green"
                : status === "error"
                  ? "text-gruvbox-red"
                  : "text-gruvbox-gray"
            }`}
          >
            {status === "loading" && "Verifying your email..."}
            {status === "success" && "🎉 Email Verified!"}
            {status === "error" && "❌ Verification Failed"}
          </h3>

          <p
            className={`mb-6 ${
              status === "success"
                ? "text-gruvbox-green"
                : status === "error"
                  ? "text-gruvbox-red"
                  : "text-gruvbox-gray"
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
                  className="block w-full bg-gruvbox-orange text-gruvbox-light-bg0 py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Đăng nhập ngay
                </Link>
                <Link
                  href="/"
                  className="block w-full border-2 border-gruvbox-orange text-gruvbox-orange py-3 px-4 rounded-lg font-semibold hover:bg-gruvbox-orange-light hover:text-gruvbox-light-bg0 transition-colors"
                >
                  Về trang chủ
                </Link>
              </>
            )}

            {status === "error" && (
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gruvbox-orange text-gruvbox-light-bg0 py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Thử lại
                </button>
                <Link
                  href="/auth/signup"
                  className="block w-full border-2 border-gruvbox-orange text-gruvbox-orange py-3 px-4 rounded-lg font-semibold hover:bg-gruvbox-orange-light hover:text-gruvbox-light-bg0 transition-colors"
                >
                  Đăng ký lại
                </Link>
              </div>
            )}

            {status === "loading" && (
              <div className="text-sm text-gruvbox-gray">
                This may take a few seconds...
              </div>
            )}
          </div>
        </div>

        {/* Support Link */}
        <div className="text-center mt-6 pt-6 border-t border-gruvbox-light-bg3 dark:border-gruvbox-dark-bg3">
          <p className="text-sm text-gruvbox-gray">
            Need help?{" "}
            <a
              href="mailto:support@oldvibes.io.vn"
              className="text-gruvbox-orange hover:text-gruvbox-orange-dark font-medium"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
