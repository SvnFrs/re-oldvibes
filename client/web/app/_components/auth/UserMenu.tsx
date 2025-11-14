"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconUser,
  IconLogout,
  IconSettings,
  IconChevronDown,
  IconAlertTriangle,
  IconBan,
  IconInfoCircle,
  IconShoppingBag,
  IconHeart,
  IconPackage,
  IconBell,
} from "@tabler/icons-react";
import { useAuth } from "../../_contexts/AuthContext";

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isLoading, isBanned } = useAuth();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [router]);

  // Show loading skeleton while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gruvbox-dark-bg2 rounded-full animate-pulse"></div>
        <div className="hidden md:block w-20 h-4 bg-gruvbox-dark-bg2 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-3">
        <Link
          href="/auth/login"
          className="text-sm font-medium text-gruvbox-dark-fg1 hover:text-gruvbox-orange transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/auth/signup"
          className="px-4 py-2 bg-gruvbox-orange text-gruvbox-dark-bg0 rounded-lg text-sm font-medium hover:bg-gruvbox-yellow transition-all duration-200 shadow-md hover:shadow-lg"
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
    router.push("/");
  };

  const menuItems = [
    // {
    //   icon: IconUser,
    //   label: "My Profile",
    //   href: "/profile",
    //   color: "text-gruvbox-dark-fg1",
    // },
    {
      icon: IconShoppingBag,
      label: "My Listings",
      href: "/my-listings",
      color: "text-gruvbox-dark-fg1",
    },
    {
      icon: IconHeart,
      label: "Wishlist",
      href: "/wishlist",
      color: "text-gruvbox-dark-fg1",
    },
    // {
    //   icon: IconPackage,
    //   label: "Orders",
    //   href: "/orders",
    //   color: "text-gruvbox-dark-fg1",
    // },
    {
      icon: IconSettings,
      label: "Settings",
      href: "/settings",
      color: "text-gruvbox-dark-fg1",
    },
    {
      icon: IconInfoCircle,
      label: "Feedback",
      href: "/feedback",
      color: "text-gruvbox-dark-fg1",
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-gruvbox-dark-bg2 transition-all duration-200 relative group"
        disabled={isLoading}
      >
        {/* Warning Badge for violations */}
        {hasViolations && (
          <div className="absolute -top-1 -right-1 bg-gruvbox-yellow text-gruvbox-dark-bg0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border-2 border-gruvbox-dark-bg0 z-10 animate-pulse">
            {badBehaviorCount}
          </div>
        )}

        {/* Ban Badge */}
        {isBanned && (
          <div className="absolute -top-1 -right-1 bg-gruvbox-red text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border-2 border-gruvbox-dark-bg0 z-10">
            <IconBan size={12} />
          </div>
        )}

        {/* Avatar */}
        <div className="relative">
          <div className="w-9 h-9 bg-gradient-to-br from-gruvbox-orange to-gruvbox-yellow rounded-full flex items-center justify-center ring-2 ring-transparent group-hover:ring-gruvbox-orange/50 transition-all duration-200">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <IconUser className="w-5 h-5 text-gruvbox-dark-bg0" />
            )}
          </div>
        </div>

        {/* User Name - Desktop only */}
        <div className="hidden md:flex flex-col items-start">
          <span className="text-sm font-medium text-gruvbox-dark-fg0 truncate max-w-24">
            {user.name}
          </span>
          {user.username && (
            <span className="text-xs text-gruvbox-gray truncate max-w-24">
              @{user.username}
            </span>
          )}
        </div>

        <IconChevronDown
          className={`hidden md:block w-4 h-4 text-gruvbox-gray transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-gruvbox-dark-bg1 rounded-xl shadow-2xl border border-gruvbox-dark-bg3 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-br from-gruvbox-orange/10 to-gruvbox-yellow/10 border-b border-gruvbox-dark-bg2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-gruvbox-orange to-gruvbox-yellow rounded-full flex items-center justify-center flex-shrink-0">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <IconUser className="w-6 h-6 text-gruvbox-dark-bg0" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gruvbox-dark-fg0 truncate">
                  {user.name}
                </p>
                {user.username && (
                  <p className="text-xs text-gruvbox-gray truncate">
                    @{user.username}
                  </p>
                )}
                <p className="text-xs text-gruvbox-gray truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Violation Warning */}
          {hasViolations && (
            <div className="mx-3 mt-3 p-3 bg-gruvbox-yellow/10 border border-gruvbox-yellow/30 rounded-lg">
              <div className="flex items-start gap-2">
                <IconAlertTriangle
                  size={16}
                  className="text-gruvbox-yellow flex-shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gruvbox-yellow mb-1">
                    Warning: {badBehaviorCount}/3 Strikes
                  </p>
                  <p className="text-xs text-gruvbox-dark-fg2 leading-relaxed">
                    Follow community guidelines to avoid a ban.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ban Notice */}
          {isBanned && (
            <div className="mx-3 mt-3 p-3 bg-gruvbox-red/10 border border-gruvbox-red/30 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <IconBan
                  size={16}
                  className="text-gruvbox-red flex-shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gruvbox-red mb-1">
                    Account Banned
                  </p>
                  <p className="text-xs text-gruvbox-dark-fg2 leading-relaxed">
                    {user.tempBanReason || "Repeated violations of community guidelines"}
                  </p>
                </div>
              </div>
              <Link
                href="/contact-admin"
                className="text-xs text-gruvbox-orange hover:text-gruvbox-yellow underline transition-colors inline-block"
                onClick={() => setIsOpen(false)}
              >
                Contact admin to appeal →
              </Link>
            </div>
          )}

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gruvbox-dark-fg1 hover:bg-gruvbox-dark-bg2 transition-colors group"
                onClick={() => setIsOpen(false)}
              >
                <item.icon
                  className={`w-4 h-4 ${item.color} group-hover:text-gruvbox-orange transition-colors`}
                />
                <span className="group-hover:text-gruvbox-dark-fg0 transition-colors">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gruvbox-dark-bg2"></div>

          {/* Logout Button */}
          <div className="p-2">
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gruvbox-red hover:bg-gruvbox-red/10 rounded-lg transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconLogout className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              <span className="font-medium">
                {isLoading ? "Logging out..." : "Logout"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}