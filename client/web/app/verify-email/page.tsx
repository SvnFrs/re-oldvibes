import { Suspense } from "react";
import VerifyEmailContent from "./verify-email-content";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailFallback() {
  return (
    <div className="min-h-screen bg-gruvbox-dark-bg0 flex items-center justify-center p-4">
      <div className="bg-gruvbox-dark-bg1 rounded-2xl shadow-xl p-8 w-full max-w-md border border-gruvbox-dark-bg2">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gruvbox-orange rounded-xl flex items-center justify-center">
              <span className="text-gruvbox-dark-bg0 font-bold text-lg">🌊</span>
            </div>
            <h1 className="text-2xl font-bold text-gruvbox-orange">
              Old Vibes
            </h1>
          </div>
          <h2 className="text-xl font-semibold text-gruvbox-dark-fg0 mb-2">
            Email Verification
          </h2>
        </div>

        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gruvbox-orange mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-3 text-gruvbox-dark-fg1">
            Loading verification...
          </h3>
          <p className="text-gruvbox-dark-fg2 mb-6">
            Please wait while we prepare your verification.
          </p>
        </div>
      </div>
    </div>
  );
}
