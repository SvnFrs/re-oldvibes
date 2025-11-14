import Image from "next/image";
import Link from "next/link";
import UserMenu from "../../../_components/auth/UserMenu";
import ChatIcon from "../../../_components/chat/ChatIcon";
import { useAuth } from "@/app/_contexts/AuthContext";

export default function Header() {
  const { user, logout, isLoading } = useAuth();
  return (
    <header className="bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 border-b border-gruvbox-gray sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="flex items-center space-x-3 hover:opacity-80 transition"
          >
            <div className="bg-gruvbox-yellow-light dark:bg-gruvbox-yellow-dark w-12 h-12 rounded-xl flex items-center justify-center shadow-md">
              <Image
                src="/oldvibes-small.png"
                alt="Meaningful logo"
                width={500}
                height={500}
                className="rounded-md object-contain"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-bold text-gruvbox-orange-light dark:text-gruvbox-orange-dark tracking-tight font-mono">
                Old Vibes
              </h1>
              <span className="block text-sm text-gruvbox-gray font-bold -mt-1">
                Share &amp; sell your vintage finds
              </span>
            </div>
          </Link>
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            <Link
              href="/"
              className="text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 hover:text-gruvbox-orange transition-colors font-medium"
            >
              Marketplace
            </Link>
            <Link
              href="/recommendations"
              className="text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 hover:text-gruvbox-orange transition-colors font-medium"
            >
              Recommendations
            </Link>
            <Link
              href="/feed"
              className="text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 hover:text-gruvbox-orange transition-colors font-medium"
            >
              Feed
            </Link>
            <Link
              href="/about"
              className="text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 hover:text-gruvbox-orange transition-colors font-medium"
            >
              About
            </Link>
            <Link
              href="/settings"
              className="text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 hover:text-gruvbox-orange transition-colors font-medium"
            >
              Settings
            </Link>

            <div className="ml-4 flex items-center space-x-2">
              {isLoading ? (
                <div className="w-24 h-9 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-lg animate-pulse"></div>
              ) : user ? (
                <Link
                  href="/upload"
                  className="flex items-center justify-center px-3 py-2 bg-gruvbox-yellow text-gruvbox-dark-bg0 font-medium rounded-lg hover:bg-gruvbox-yellow/90 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Upload
                </Link>
              ) : null}
              <ChatIcon />
              <UserMenu />
            </div>
          </nav>
          <div className="md:hidden flex items-center space-x-2">
            {isLoading ? (
              <div className="w-9 h-9 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-lg animate-pulse"></div>
            ) : user ? (
              <Link
                href="/upload"
                className="flex items-center justify-center p-2 bg-gruvbox-yellow text-gruvbox-dark-bg0 rounded-lg hover:bg-gruvbox-yellow/90 transition-colors"
                title="Upload Vibe"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </Link>
            ) : null}
            <ChatIcon />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
