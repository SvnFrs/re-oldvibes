"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../_contexts/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true = cần đăng nhập, false = cần chưa đăng nhập
  redirectTo?: string; // trang redirect nếu không đúng điều kiện
}

export default function AuthGuard({ 
  children, 
  requireAuth = false, 
  redirectTo 
}: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Chờ loading xong
    if (isLoading) return;

    // Nếu cần đăng nhập nhưng chưa đăng nhập
    if (requireAuth && !user) {
      router.push(redirectTo || "/auth/login");
      return;
    }

    // Nếu cần chưa đăng nhập nhưng đã đăng nhập (redirect về home)
    if (!requireAuth && user) {
      router.push(redirectTo || "/");
      return;
    }
  }, [user, isLoading, requireAuth, redirectTo, router]);

  // Hiển thị loading khi đang kiểm tra auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gruvbox-orange mx-auto mb-4"></div>
          <p className="text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2">Loading...</p>
        </div>
      </div>
    );
  }

  // Nếu đang redirect, không hiển thị content
  if (requireAuth && !user) {
    return null;
  }

  if (!requireAuth && user) {
    return null;
  }

  return <>{children}</>;
}