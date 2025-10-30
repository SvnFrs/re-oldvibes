"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconUser,
  IconLogout,
  IconSettings,
  IconChevronDown,
  IconAlertTriangle,
  IconBan,
} from "@tabler/icons-react";
import { useAuth } from "../../_contexts/AuthContext";
import { ShoppingBasket } from "lucide-react";

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isLoading, isBanned } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/auth/login"
          className="text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 hover:text-gruvbox-orange font-medium transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/auth/signup"
          className="bg-gruvbox-orange text-gruvbox-light-bg0 px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  const badBehaviorCount = user.badBehaviorCount || 0;
  const hasViolations = badBehaviorCount > 0 && !isBanned;

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex flex-row items-center gap-4">
        <Link href="/wishlist" className="ml-0 relative">
          {/* <div className="absolute -top-[20%] -right-[30%] bg-red-500 text-white px-1.5 py-[1px] rounded-full text-xs">
            7
          </div> */}
          <ShoppingBasket />
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gruvbox-light-bg2 dark:hover:bg-gruvbox-dark-bg2 transition-colors relative"
          disabled={isLoading}
        >
          {/* Warning Badge for violations */}
          {hasViolations && (
            <div className="absolute -top-1 -right-1 bg-gruvbox-yellow-light dark:bg-gruvbox-yellow-dark text-gruvbox-dark-bg0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border-2 border-gruvbox-light-bg0 dark:border-gruvbox-dark-bg0 z-10">
              {badBehaviorCount}
            </div>
          )}
          
          {/* Ban Badge */}
          {isBanned && (
            <div className="absolute -top-1 -right-1 bg-gruvbox-red-light dark:bg-gruvbox-red-dark text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border-2 border-gruvbox-light-bg0 dark:border-gruvbox-dark-bg0 z-10">
              !
            </div>
          )}
          
          <div className="w-8 h-8 bg-gruvbox-orange rounded-full flex items-center justify-center">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <IconUser className="w-5 h-5 text-gruvbox-light-bg0" />
            )}
          </div>
          <span className="hidden md:block text-sm font-medium text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1">
            {user.name}
          </span>
          <IconChevronDown className="w-4 h-4 text-gruvbox-gray" />
        </button>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 rounded-lg shadow-lg border border-gruvbox-light-bg3 dark:border-gruvbox-dark-bg3 z-20">
            <div className="py-2">
              <div className="px-4 py-2 border-b border-gruvbox-light-bg3 dark:border-gruvbox-dark-bg3">
                <p className="text-sm font-medium text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1">
                  {user.name}
                </p>
                <p className="text-xs text-gruvbox-gray">{user.email}</p>
              </div>

              {/* Violation Warning */}
              {hasViolations && (
                <div className="mx-2 mt-2 p-2 bg-gruvbox-yellow-light/10 dark:bg-gruvbox-yellow-dark/10 border border-gruvbox-yellow-light dark:border-gruvbox-yellow-dark rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <IconAlertTriangle size={14} className="text-gruvbox-yellow-light dark:text-gruvbox-yellow-dark flex-shrink-0" />
                    <span className="text-xs font-bold text-gruvbox-yellow-light dark:text-gruvbox-yellow-dark">
                      Warning: {badBehaviorCount}/3 Strikes
                    </span>
                  </div>
                  <p className="text-xs text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2">
                    Follow community guidelines to avoid a ban.
                  </p>
                </div>
              )}

              {/* Ban Notice */}
              {isBanned && (
                <div className="mx-2 mt-2 p-2 bg-gruvbox-red-light/10 dark:bg-gruvbox-red-dark/10 border border-gruvbox-red-light dark:border-gruvbox-red-dark rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <IconBan size={14} className="text-gruvbox-red-light dark:text-gruvbox-red-dark flex-shrink-0" />
                    <span className="text-xs font-bold text-gruvbox-red-light dark:text-gruvbox-red-dark">
                      Account Banned
                    </span>
                  </div>
                  <p className="text-xs text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2 mb-2">
                    {user.tempBanReason || "Repeated violations"}
                  </p>
                  <Link
                    href="/contact-admin"
                    className="text-xs text-gruvbox-orange underline hover:no-underline"
                    onClick={() => setIsOpen(false)}
                  >
                    Contact admin to appeal
                  </Link>
                </div>
              )}

              <Link
                href="/profile"
                className="flex items-center px-4 py-2 text-sm text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 hover:bg-gruvbox-light-bg2 dark:hover:bg-gruvbox-dark-bg2 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <IconUser className="w-4 h-4 mr-3" />
                Profile
              </Link>

              <Link
                href="/settings"
                className="flex items-center px-4 py-2 text-sm text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1 hover:bg-gruvbox-light-bg2 dark:hover:bg-gruvbox-dark-bg2 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <IconSettings className="w-4 h-4 mr-3" />
                Settings
              </Link>

              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full flex items-center px-4 py-2 text-sm text-gruvbox-red hover:bg-gruvbox-red-light dark:hover:bg-gruvbox-red-dark transition-colors"
              >
                <IconLogout className="w-4 h-4 mr-3" />
                {isLoading ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
