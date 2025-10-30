"use client";

import { IconBan, IconAlertTriangle, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { useAuth } from "../../_contexts/AuthContext";

export default function BanStatusBanner() {
  const { user, isBanned } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if not banned or if user dismissed it
  if (!isBanned || isDismissed || !user) return null;

  const badBehaviorCount = user.badBehaviorCount || 0;
  const tempBanAt = user.tempBanAt ? new Date(user.tempBanAt) : null;

  return (
    <div className="bg-gruvbox-red-light/95 dark:bg-gruvbox-red-dark/95 border-b-2 border-gruvbox-red-dark dark:border-gruvbox-red-light backdrop-blur-sm sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 gap-4">
          {/* Icon & Message */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <IconBan size={24} className="text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-white font-bold text-sm sm:text-base">
                  Account Temporarily Banned
                </h3>
                <span className="text-xs sm:text-sm text-white/90 px-2 py-0.5 bg-white/20 rounded-full whitespace-nowrap">
                  {badBehaviorCount} violations
                </span>
              </div>
              
              <p className="text-white/90 text-xs sm:text-sm mt-1 line-clamp-2">
                {user.tempBanReason || "Your account has been temporarily banned due to repeated violations."}
              </p>
              
              {tempBanAt && (
                <p className="text-white/75 text-xs mt-1">
                  Banned on {tempBanAt.toLocaleDateString()} at {tempBanAt.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          {/* Strike Counter (visible on larger screens) */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-white/90 font-medium">Strikes:</span>
            <div className="flex gap-1">
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    num <= badBehaviorCount
                      ? "bg-white text-gruvbox-red-dark"
                      : "bg-white/30 text-white/60"
                  }`}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Admin Button */}
          <button
            onClick={() => {
              // Navigate to contact or show modal
              window.location.href = "/contact-admin";
            }}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-white text-gruvbox-red-dark font-medium rounded-lg hover:bg-white/90 transition-colors text-sm whitespace-nowrap flex-shrink-0"
          >
            <IconAlertTriangle size={16} />
            <span>Contact Admin</span>
          </button>

          {/* Dismiss Button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
            aria-label="Dismiss banner"
          >
            <IconX size={20} className="text-white" />
          </button>
        </div>

        {/* Mobile Contact Button */}
        <div className="md:hidden pb-3">
          <button
            onClick={() => {
              window.location.href = "/contact-admin";
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-gruvbox-red-dark font-medium rounded-lg hover:bg-white/90 transition-colors text-sm"
          >
            <IconAlertTriangle size={16} />
            <span>Contact Admin to Appeal Ban</span>
          </button>
        </div>
      </div>
    </div>
  );
}
