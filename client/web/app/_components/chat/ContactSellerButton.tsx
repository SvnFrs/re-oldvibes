"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../_contexts/AuthContext";
import { startConversation } from "../../_apis/chat/chat";

interface ContactSellerButtonProps {
  vibeId: string;
  sellerId: string;
  className?: string;
}

export default function ContactSellerButton({ 
  vibeId, 
  sellerId, 
  className = "" 
}: ContactSellerButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleContactSeller = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user?.id === sellerId) {
      // User is trying to contact themselves
      return;
    }

    setIsLoading(true);
    try {
      const response = await startConversation(vibeId);
      // Redirect to the conversation
      router.push(`/chat/${response.conversationId}`);
    } catch (error) {
      console.error("Failed to start conversation:", error);
      // You could show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button if user is the seller
  if (isAuthenticated && user?.id === sellerId) {
    return null;
  }

  return (
    <button
      onClick={handleContactSeller}
      disabled={isLoading}
      className={`flex items-center gap-2 px-6 py-3 bg-gruvbox-blue text-gruvbox-light-bg0 font-medium rounded-lg hover:bg-gruvbox-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-gruvbox-light-bg0 border-t-transparent rounded-full animate-spin"></div>
          Starting Chat...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Contact Seller
        </>
      )}
    </button>
  );
}
