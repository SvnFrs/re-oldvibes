"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { IconX } from "@tabler/icons-react";
import Link from "next/link";

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "Đã xảy ra lỗi trong quá trình đăng nhập";

  return (
    <div className="min-h-screen bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 flex items-center justify-center p-4">
      <div className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center">
          <div className="w-16 h-16 bg-gruvbox-red-light dark:bg-gruvbox-red-dark rounded-full flex items-center justify-center mx-auto mb-4">
            <IconX className="w-8 h-8 text-gruvbox-red" />
          </div>
          
          <h2 className="text-2xl font-bold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mb-2">
            Đăng nhập thất bại
          </h2>
          
          <p className="text-gruvbox-gray mb-6">
            {message}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push("/auth/login")}
              className="w-full bg-gruvbox-orange text-gruvbox-light-bg0 py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
            >
              Thử lại
            </button>
            
            <Link
              href="/"
              className="block w-full border-2 border-gruvbox-orange text-gruvbox-orange py-3 px-4 rounded-lg font-semibold hover:bg-gruvbox-orange-light hover:text-gruvbox-light-bg0 transition-colors"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
