"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteConversation } from "../../_apis/chat/chat";
import { getSocket } from "../../_libs/socket";

interface ConversationActionsProps {
  conversationId: string;
  onConversationDelete: (conversationId: string) => void;
}

export default function ConversationActions({ 
  conversationId, 
  onConversationDelete 
}: ConversationActionsProps) {
  const [showActions, setShowActions] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    try {
      const socket = await getSocket();
      if (socket) {
        // Use socket for real-time delete
        socket.emit('deleteConversation', conversationId);
        onConversationDelete(conversationId);
        router.push('/chat');
      } else {
        // Fallback to REST API
        await deleteConversation(conversationId);
        onConversationDelete(conversationId);
        router.push('/chat');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowActions(!showActions)}
        className="p-2 hover:bg-gruvbox-gray/20 rounded-full transition-colors"
      >
        <svg className="w-5 h-5 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {showActions && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowActions(false)}
          />
          
          {/* Actions Menu */}
          <div className="absolute right-0 top-12 z-20 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border border-gruvbox-gray/20 rounded-lg shadow-lg py-1 min-w-[160px]">
            <button
              onClick={() => {
                handleDelete();
                setShowActions(false);
              }}
              disabled={loading}
              className="w-full px-3 py-2 text-left text-sm text-gruvbox-red hover:bg-gruvbox-red/10 transition-colors disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete Conversation'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
