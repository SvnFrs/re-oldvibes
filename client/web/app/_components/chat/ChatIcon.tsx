"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../_contexts/AuthContext";
import { getConversations, type Conversation } from "../../_apis/chat/chat";
import { IconMessageChatbot } from "@tabler/icons-react";

interface ChatIconProps {
  className?: string;
}

export default function ChatIcon({ className = "" }: ChatIconProps) {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        setIsLoading(true);
        const response = await getConversations(20, 0);
        const totalUnread = response.conversations.reduce(
          (sum, conv) => sum + conv.unreadCount,
          0
        );
        setUnreadCount(totalUnread);
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
        setUnreadCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnreadCount();

    // Refresh unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Link
      href="/chat"
      className={`relative flex items-center justify-center p-2 rounded-lg hover:bg-gruvbox-gray/10 transition-colors ${className}`}
      title="Chat"
    >
      <IconMessageChatbot size={20} className="text-gruvbox-dark-fg0" />

      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-gruvbox-red text-gruvbox-light-bg0 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-gruvbox-yellow border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </Link>
  );
}
