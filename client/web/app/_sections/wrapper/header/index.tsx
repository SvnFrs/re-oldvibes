import Image from "next/image";
import Link from "next/link";
import UserMenu from "../../../_components/auth/UserMenu";

export default function Header() {
  return (
    <header className="bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 border-b border-gruvbox-gray sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and tagline */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition">
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
              href="/upload"
              className="text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 hover:text-gruvbox-orange transition-colors font-medium"
            >
              Upload Vibe
            </Link>
            <Link
              href="/settings"
              className="text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 hover:text-gruvbox-orange transition-colors font-medium"
            >
              Settings
            </Link>

            <div className="ml-4">
              <UserMenu />
            </div>
          </nav>
          <div className="md:hidden">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
