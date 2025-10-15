"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../_contexts/AuthContext";
import { getConversations, deleteConversation, type Conversation } from "../_apis/chat/chat";
import AuthGuard from "../_components/auth/AuthGuard";
import ConversationEmptyState from "../_components/chat/ConversationEmptyState";
import { getSocket } from "../_libs/socket";

function ConversationCard({ conversation, onDelete }: { conversation: Conversation; onDelete: (conversationId: string) => void }) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getLastMessagePreview = () => {
    if (!conversation.lastMessage) return "No messages yet";
    
    const { content, messageType, isFromMe } = conversation.lastMessage;
    
    if (messageType === 'offer') {
      return `💰 Offer: $${JSON.parse(content).amount || content}`;
    } else if (messageType === 'image') {
      return isFromMe ? "📷 You sent a photo" : "📷 Photo received";
    }
    
    return content.length > 50 ? `${content.substring(0, 50)}...` : content;
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteConversation(conversation.conversationId);
      onDelete(conversation.conversationId);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation');
    }
  };

  return (
    <Link href={`/chat/${conversation.conversationId}`}>
      <div className="flex items-center p-3 sm:p-4 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 rounded-lg hover:bg-gruvbox-gray/10 transition-colors border border-gruvbox-gray/20 group">
        {/* Vibe Image */}
        <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gruvbox-gray/20 flex-shrink-0">
          {conversation.vibe.mediaFiles?.[0] ? (
            <Image
              src={conversation.vibe.mediaFiles[0].url}
              alt={conversation.vibe.itemName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image
                src="/oldvibes-small.png"
                alt="Old Vibes"
                width={32}
                height={32}
                className="opacity-50"
              />
            </div>
          )}
        </div>

        {/* Conversation Info */}
        <div className="flex-1 ml-3 sm:ml-4 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-sm sm:text-base text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 truncate">
              {conversation.vibe.itemName}
            </h3>
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <span className="text-xs sm:text-sm font-medium text-gruvbox-yellow">
                ${conversation.vibe.price}
              </span>
              {conversation.unreadCount > 0 && (
                <span className="bg-gruvbox-red text-gruvbox-light-bg0 text-xs font-bold rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 min-w-[16px] sm:min-w-[20px] text-center">
                  {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                </span>
              )}
            </div>
          </div>
          
          <p className="text-xs sm:text-sm text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2 mb-1">
            with @{conversation.participant.username}
          </p>
          
          {conversation.lastMessage && (
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm text-gruvbox-light-fg3 dark:text-gruvbox-dark-fg3 truncate flex-1">
                <span className={`inline-flex items-center mr-1`}>
                  {conversation.lastMessage.isFromMe ? (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                {getLastMessagePreview()}
              </p>
              <span className="text-xs text-gruvbox-light-fg4 dark:text-gruvbox-dark-fg4 ml-1 sm:ml-2 flex-shrink-0">
                {formatTime(conversation.lastMessage.timestamp)}
              </span>
            </div>
          )}
        </div>
        
        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gruvbox-red/10 rounded-full transition-all ml-2"
          title="Delete conversation"
        >
          <svg className="w-4 h-4 text-gruvbox-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </Link>
  );
}


export default function ChatPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [socket, setSocket] = useState<any>(null);

  const fetchConversations = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const response = await getConversations(20, isRefresh ? 0 : offset);
      setConversations(isRefresh ? response.conversations : [...conversations, ...response.conversations]);
      setHasMore(response.pagination.hasMore);
      setOffset(isRefresh ? 20 : offset + 20);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setOffset(0);
    fetchConversations(true);
  };

  const handleConversationDelete = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.conversationId !== conversationId));
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchConversations();
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Socket.io setup for real-time updates
  useEffect(() => {
    let isMounted = true;

    const setupSocket = async () => {
      try {
        const socketInstance = await getSocket();
        if (!isMounted || !socketInstance) return;

        setSocket(socketInstance);

        // Listen for new messages to update conversation list
        const handleNewMessage = (message: any) => {
          if (!isMounted) return;
          
          // Update conversation list with new message
          setConversations(prev => prev.map(conv => 
            conv.conversationId === message.conversationId 
              ? { 
                  ...conv, 
                  lastMessage: {
                    content: message.content,
                    timestamp: message.createdAt,
                    isFromMe: message.sender.id === user?.id,
                    messageType: message.messageType || 'text'
                  },
                  unreadCount: message.sender.id !== user?.id ? conv.unreadCount + 1 : conv.unreadCount
                }
              : conv
          ));
        };

        socketInstance.on('newMessage', handleNewMessage);

        return () => {
          if (socketInstance) {
            socketInstance.off('newMessage', handleNewMessage);
          }
        };
      } catch (error) {
        console.error('Error setting up socket:', error);
      }
    };

    setupSocket();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 flex flex-col">
        {/* Fixed Header */}
        <div className="sticky top-0 z-50 bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 border-b border-gruvbox-gray/20 backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <Link
                  href="/"
                  className="p-2 hover:bg-gruvbox-gray/20 rounded-full transition-colors flex-shrink-0"
                >
                  <svg className="w-5 h-5 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
                    Messages
                  </h1>
                  <p className="text-xs sm:text-sm text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2">
                    Your conversations with other users
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center px-3 sm:px-4 py-2 bg-gruvbox-blue text-gruvbox-light-bg0 font-medium rounded-lg hover:bg-gruvbox-blue/90 transition-colors disabled:opacity-50 flex-shrink-0"
              >
                {refreshing ? (
                  <div className="w-4 h-4 border-2 border-gruvbox-light-bg0 border-t-transparent rounded-full animate-spin mr-1 sm:mr-2"></div>
                ) : (
                  <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-4xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6">
          {/* Conversations List */}
          {loading && conversations.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-gruvbox-yellow border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : conversations.length === 0 ? (
            <ConversationEmptyState />
          ) : (
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <ConversationCard 
                  key={conversation.conversationId} 
                  conversation={conversation} 
                  onDelete={handleConversationDelete}
                />
              ))}
              
              {hasMore && (
                <div className="text-center py-4">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-6 py-2 bg-gruvbox-gray/20 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 font-medium rounded-lg hover:bg-gruvbox-gray/30 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
