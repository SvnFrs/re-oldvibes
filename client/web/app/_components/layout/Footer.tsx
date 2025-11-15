import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gruvbox-dark-bg2 bg-gruvbox-dark-bg1/80 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-10 grid gap-10 md:grid-cols-4 text-sm">
        <div className="space-y-3">
          <h3 className="font-semibold text-base text-gruvbox-dark-fg0">
            OldVibes
          </h3>
          <p className="text-gruvbox-dark-fg3 text-xs leading-relaxed max-w-xs">
            A community to share stories and discover unique secondhand goods
            with ephemeral reel-style posts.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="font-medium text-gruvbox-dark-fg1">
            Explore
          </h4>
          <ul className="space-y-2 text-gruvbox-dark-fg2 text-sm">
            <li>
              <Link
                href="/feed"
                className="hover:text-gruvbox-orange transition-colors"
              >
                Feed
              </Link>
            </li>
            <li>
              <Link
                href="/upload"
                className="hover:text-gruvbox-orange transition-colors"
              >
                Upload Vibe
              </Link>
            </li>
            <li>
              <Link
                href="/search"
                className="hover:text-gruvbox-orange transition-colors"
              >
                Search
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="font-medium text-gruvbox-dark-fg1">
            Platform
          </h4>
          <ul className="space-y-2 text-gruvbox-dark-fg2 text-sm">
            <li>
              <Link
                href="/about"
                className="hover:text-gruvbox-orange transition-colors"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/support"
                className="hover:text-gruvbox-orange transition-colors"
              >
                Support
              </Link>
            </li>
            <li>
              <Link
                href="/feedback"
                className="hover:text-gruvbox-orange transition-colors"
              >
                Feedback
              </Link>
            </li>
            <li>
              <Link
                href="/report"
                className="hover:text-gruvbox-orange transition-colors"
              >
                Report
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="font-medium text-gruvbox-dark-fg1">
            Legal
          </h4>
          <ul className="space-y-2 text-gruvbox-dark-fg2 text-sm">
            <li>
              <Link
                href="/terms"
                className="hover:text-gruvbox-orange transition-colors"
              >
                Terms
              </Link>
            </li>
            <li>
              <Link
                href="/privacy"
                className="hover:text-gruvbox-orange transition-colors"
              >
                Privacy
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gruvbox-dark-bg2 py-6 text-center">
        <p className="text-xs text-gruvbox-dark-fg3">
          © {new Date().getFullYear()} OldVibes. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
