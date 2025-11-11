"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { IconCheck } from "@tabler/icons-react";
import LoginForm from "../../_components/auth/LoginForm";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const deleted = searchParams.get("deleted");
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {deleted === "true" && (
          <div className="mb-6 p-4 bg-gruvbox-green-light dark:bg-gruvbox-green-dark border border-gruvbox-green rounded-lg">
            <div className="flex items-center gap-3">
              <IconCheck className="w-5 h-5 text-gruvbox-green flex-shrink-0" />
              <p className="text-gruvbox-green text-sm">
                Tài khoản của bạn đã được xóa thành công. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.
              </p>
            </div>
          </div>
        )}
        {error === "account_deleted" && (
          <div className="mb-6 p-4 bg-gruvbox-red-light dark:bg-gruvbox-red-dark border border-gruvbox-red rounded-lg">
            <p className="text-gruvbox-red text-sm">
              Tài khoản này đã bị xóa. Vui lòng liên hệ hỗ trợ nếu bạn cần khôi phục tài khoản.
            </p>
          </div>
        )}
        <LoginForm />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gruvbox-orange"></div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
