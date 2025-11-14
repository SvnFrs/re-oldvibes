"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconHome,
  IconLayoutGrid,
  IconUpload,
  IconSearch,
} from "@tabler/icons-react";

import { cn } from "@/app/_libs/utils";
import { useAuth } from "@/app/_contexts/AuthContext";
import UserMenu from "../auth/UserMenu";
import ChatIcon from "../chat/ChatIcon";

const navItems = [
  { href: "/", label: "Home", icon: IconHome },
  { href: "/feed", label: "Feed", icon: IconLayoutGrid },
  { href: "/upload", label: "Upload", icon: IconUpload },
  { href: "/search", label: "Search", icon: IconSearch },
];

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-sm bg-gruvbox-dark-bg0/80 border-b border-gruvbox-dark-bg2">
      <div className="mx-auto max-w-6xl px-4 md:px-6 h-14 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-sm tracking-wide">
          <span className="inline-block px-2 py-1 rounded-md bg-gruvbox-orange text-gruvbox-dark-bg0 shadow-sm">OldVibes</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 rounded-md text-xs font-medium transition-colors",
                  active
                    ? "bg-gruvbox-dark-bg2 text-gruvbox-orange"
                    : "text-gruvbox-dark-fg2 hover:bg-gruvbox-dark-bg1"
                )}
              >
                <Icon size={14} /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {isLoading ? (
            <div className="w-24 h-9 bg-gruvbox-dark-bg2 rounded-lg animate-pulse"></div>
          ) : user ? (
            <>
              <ChatIcon />
              <UserMenu />
            </>
          ) : (
            <Link
              href="/auth/login"
              className="text-xs font-medium px-3 py-2 rounded-md border border-gruvbox-dark-bg2 hover:bg-gruvbox-dark-bg1 text-gruvbox-dark-fg1"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
