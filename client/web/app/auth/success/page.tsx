"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconCheck } from "@tabler/icons-react";
import { useAuth } from "../../_contexts/AuthContext";

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { refreshUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed.current) return;
    
    const handleSuccess = async () => {
      if (token) {
        hasProcessed.current = true;
        
        // Store token in localStorage for API client
        localStorage.setItem("auth_token", token);
        
        // Refresh user data
        await refreshUser();
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        hasProcessed.current = true;
        // No token, redirect to login
        router.push("/auth/login");
      }
    };

    handleSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Only depend on token, not refreshUser or router

  return (
    <div className="min-h-screen bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 flex items-center justify-center p-4">
      <div className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center">
          <div className="w-16 h-16 bg-gruvbox-green-light dark:bg-gruvbox-green-dark rounded-full flex items-center justify-center mx-auto mb-4">
            <IconCheck className="w-8 h-8 text-gruvbox-green" />
          </div>
          
          <h2 className="text-2xl font-bold text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 mb-2">
            Đăng nhập thành công! 🎉
          </h2>
          
          <p className="text-gruvbox-gray mb-6">
            Chào mừng bạn đến với Old Vibes! Đang chuyển hướng...
          </p>
          
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gruvbox-orange mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
