"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconUser, IconLogout, IconSettings, IconChevronDown } from "@tabler/icons-react";
import { useAuth } from "../../_contexts/AuthContext";

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();
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

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gruvbox-light-bg2 dark:hover:bg-gruvbox-dark-bg2 transition-colors"
        disabled={isLoading}
      >
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

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 rounded-lg shadow-lg border border-gruvbox-light-bg3 dark:border-gruvbox-dark-bg3 z-20">
            <div className="py-2">
              <div className="px-4 py-2 border-b border-gruvbox-light-bg3 dark:border-gruvbox-dark-bg3">
                <p className="text-sm font-medium text-gruvbox-light-fg1 dark:text-gruvbox-dark-fg1">
                  {user.name}
                </p>
                <p className="text-xs text-gruvbox-gray">
                  {user.email}
                </p>
              </div>
              
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
