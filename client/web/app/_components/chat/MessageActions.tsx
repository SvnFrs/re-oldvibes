"use client";

import { useState } from "react";
import { updateMessage, deleteMessage } from "../../_apis/chat/chat";
import { getSocket } from "../../_libs/socket";
import type { Message } from "../../_apis/chat/chat";

interface MessageActionsProps {
  message: Message;
  isMe: boolean;
  onMessageUpdate: (messageId: string, content: string) => void;
  onMessageDelete: (messageId: string) => void;
}

export default function MessageActions({ 
  message, 
  isMe, 
  onMessageUpdate, 
  onMessageDelete 
}: MessageActionsProps) {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [loading, setLoading] = useState(false);

  // Check if message can be edited (within 5 minutes from creation)
  const canEdit = isMe && !message.isDeleted && 
    (Date.now() - new Date(message.createdAt).getTime()) < (5 * 60 * 1000);

  // Check if message can be deleted (within 1 hour)
  const canDelete = isMe && !message.isDeleted && 
    (Date.now() - new Date(message.createdAt).getTime()) < (60 * 60 * 1000);

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    
    setLoading(true);
    try {
      const socket = await getSocket();
      if (socket) {
        // Use socket for real-time update
        socket.emit('updateMessage', {
          messageId: message.id,
          content: editContent.trim()
        });
        onMessageUpdate(message.id, editContent.trim());
        setIsEditing(false);
      } else {
        // Fallback to REST API
        await updateMessage(message.id, editContent.trim());
        onMessageUpdate(message.id, editContent.trim());
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating message:', error);
      alert('Failed to update message');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    setLoading(true);
    try {
      const socket = await getSocket();
      if (socket) {
        // Use socket for real-time delete
        socket.emit('deleteMessage', {
          messageId: message.id,
          conversationId: message.conversationId
        });
        onMessageDelete(message.id);
      } else {
        // Fallback to REST API
        await deleteMessage(message.id);
        onMessageDelete(message.id);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-lg p-3 border border-gruvbox-gray/20">
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full p-2 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border border-gruvbox-gray/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gruvbox-yellow/50 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0"
          rows={2}
          maxLength={1000}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gruvbox-light-fg3 dark:text-gruvbox-dark-fg3">
            {editContent.length}/1000
          </span>
          <div className="flex space-x-2">
            <button
              onClick={handleCancelEdit}
              disabled={loading}
              className="px-3 py-1 text-xs bg-gruvbox-gray/20 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 rounded hover:bg-gruvbox-gray/30 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              disabled={loading || !editContent.trim()}
              className="px-3 py-1 text-xs bg-gruvbox-yellow text-gruvbox-dark-bg0 rounded hover:bg-gruvbox-yellow/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isMe || (!canEdit && !canDelete)) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowActions(!showActions)}
        className="p-1 hover:bg-gruvbox-gray/20 rounded-full transition-colors"
      >
        <svg className="w-4 h-4 text-gruvbox-light-fg3 dark:text-gruvbox-dark-fg3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="absolute right-0 top-8 z-20 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border border-gruvbox-gray/20 rounded-lg shadow-lg py-1 min-w-[120px]">
            {canEdit && (
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowActions(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 hover:bg-gruvbox-gray/20 transition-colors"
              >
                Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => {
                  handleDelete();
                  setShowActions(false);
                }}
                disabled={loading}
                className="w-full px-3 py-2 text-left text-sm text-gruvbox-red hover:bg-gruvbox-red/10 transition-colors disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
