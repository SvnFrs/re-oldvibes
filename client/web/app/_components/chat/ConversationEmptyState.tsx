"use client";

import Link from "next/link";

export default function ConversationEmptyState() {
  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gruvbox-gray/20 flex items-center justify-center">
        <svg className="w-12 h-12 text-gruvbox-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 mb-2">
        No conversations yet
      </h3>
      <p className="text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2 mb-6 max-w-sm mx-auto">
        Start a conversation by viewing a vibe and clicking "Contact Seller" or "Ask Question".
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center px-4 py-2 bg-gruvbox-yellow text-gruvbox-dark-bg0 font-medium rounded-lg hover:bg-gruvbox-yellow/90 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Browse Vibes
        </Link>
        <Link
          href="/feed"
          className="inline-flex items-center justify-center px-4 py-2 bg-gruvbox-blue text-gruvbox-light-bg0 font-medium rounded-lg hover:bg-gruvbox-blue/90 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          View Feed
        </Link>
      </div>
    </div>
  );
}
