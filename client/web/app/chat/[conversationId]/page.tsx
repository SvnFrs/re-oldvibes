/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../_contexts/AuthContext";
import {
  getConversationMessages,
  getConversations,
  sendMessage,
  markMessageAsRead,
  updateOfferStatus,
  type Message,
} from "../../_apis/chat/chat";
import MessageActions from "../../_components/chat/MessageActions";
import ConversationActions from "../../_components/chat/ConversationActions";
import AuthGuard from "../../_components/auth/AuthGuard";
import VibeInfoCard from "../../_components/chat/VibeInfoCard";
import MessageStatus from "../../_components/chat/MessageStatus";
import OfferMessage from "../../_components/chat/OfferMessage";
import { getSocket } from "../../_libs/socket";

function MessageBubble({
  message,
  isMe,
  showAvatar,
  participant,
  onOfferUpdate,
  onMessageUpdate,
  onMessageDelete,
}: {
  message: Message;
  isMe: boolean;
  showAvatar: boolean;
  participant: any;
  onOfferUpdate?: (messageId: string, status: "accepted" | "rejected") => void;
  onMessageUpdate?: (messageId: string, content: string) => void;
  onMessageDelete?: (messageId: string) => void;
}) {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`flex ${isMe ? "justify-end" : "justify-start"} mb-4 group`}
    >
      <div
        className={`flex max-w-xs lg:max-w-md ${
          isMe ? "flex-row-reverse" : "flex-row"
        } items-end`}
      >
        {/* Avatar */}
        {showAvatar && !isMe && (
          <div className="flex-shrink-0 mr-3 mb-1">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gruvbox-gray/20">
              {participant?.profilePicture ? (
                <Image
                  src={participant.profilePicture}
                  alt={participant?.name || "User"}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gruvbox-gray/30">
                  <span className="text-xs font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
                    {participant?.name?.[0] || "U"}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message Content */}
        <div className={`relative ${isMe ? "ml-3" : "mr-3"}`}>
          <div
            className={`px-4 py-3 rounded-2xl ${
              isMe
                ? "bg-gruvbox-yellow text-gruvbox-dark-bg0 rounded-br-md"
                : "bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 rounded-bl-md"
            }`}
          >
            {/* Message Content */}
            {message.messageType === "offer" && message.offerData ? (
              <OfferMessage
                offerData={message.offerData}
                messageId={message.id}
                isFromMe={isMe}
                onStatusUpdate={onOfferUpdate || (() => {})}
              />
            ) : (
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
                {message.isEdited && (
                  <span className="text-xs text-gruvbox-light-fg4 dark:text-gruvbox-dark-fg4 ml-1">
                    (edited)
                  </span>
                )}
              </p>
            )}

            {/* Time and Status */}
            <div className="flex items-center justify-between mt-1 px-2">
              <span className="text-xs text-gruvbox-light-fg4 dark:text-gruvbox-dark-fg4">
                {formatTime(message.createdAt)}
                {message.isEdited && message.editedAt && (
                  <span className="ml-1">
                    • edited {formatTime(message.editedAt)}
                  </span>
                )}
              </span>
              <MessageStatus isRead={message.isRead} isFromMe={isMe} />
            </div>
          </div>

          {/* Message Actions */}
          {isMe && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <MessageActions
                message={message}
                isMe={isMe}
                onMessageUpdate={onMessageUpdate || (() => {})}
                onMessageDelete={onMessageDelete || (() => {})}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageInput({
  onSendMessage,
  disabled,
}: {
  onSendMessage: (message: string) => void;
  disabled: boolean;
}) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gruvbox-gray/20 p-3 sm:p-4 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1"
    >
      <div className="flex items-end space-x-2 sm:space-x-3">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={disabled}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 border border-gruvbox-gray/20 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-gruvbox-yellow/50 focus:border-transparent text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 placeholder-gruvbox-light-fg3 dark:placeholder-gruvbox-dark-fg3 text-sm sm:text-base"
            rows={1}
            style={{ minHeight: "40px", maxHeight: "120px" }}
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gruvbox-yellow text-gruvbox-dark-bg0 rounded-xl hover:bg-gruvbox-yellow/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const conversationId = params.conversationId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [participant, setParticipant] = useState<any>(null);
  const [vibeId, setVibeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      console.log("Fetching messages for conversation:", conversationId);
      const response = await getConversationMessages(conversationId, 50, 0);

      console.log("Messages response:", response);
      setMessages(response.messages);

      // Extract participant from messages (the other user in the conversation)
      if (response.messages.length > 0) {
        const otherUser = response.messages.find(
          (msg) => msg.sender.id !== user?.id
        )?.sender;
        if (otherUser) {
          setParticipant(otherUser);
        }
      } else {
        // If no messages, try to get participant from conversation list
        try {
          const conversationsResponse = await getConversations(100, 0);
          const conversation = conversationsResponse.conversations.find(
            (conv) => conv.conversationId === conversationId
          );
          if (conversation) {
            setParticipant(conversation.participant);
          }
        } catch (error) {
          console.error("Error fetching conversation info:", error);
        }
      }

      // Extract vibeId from first message if available
      if (response.messages.length > 0 && response.messages[0].vibeId) {
        setVibeId(response.messages[0].vibeId);
      }

      // Mark messages as read
      response.messages.forEach((message) => {
        if (!message.isRead && message.sender.id !== user?.id) {
          markMessageAsRead(message.id).catch(console.error);
        }
      });

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Socket.io setup
  useEffect(() => {
    let isMounted = true;

    const setupSocket = async () => {
      try {
        const socketInstance = await getSocket();
        if (!isMounted || !socketInstance) {
          console.log("Socket not available or component unmounted");
          return;
        }

        console.log("Setting up socket for conversation:", conversationId);
        setSocket(socketInstance);

        // Join conversation
        socketInstance.emit("joinConversation", conversationId);

        // Listen for new messages
        const handleNewMessage = (message: Message) => {
          if (!isMounted) return;

          console.log("New message received:", message);
          setMessages((prev) => [...prev, message]);
          setTimeout(scrollToBottom, 100);

          // Mark as read if not from me
          if (message.sender.id !== user?.id) {
            markMessageAsRead(message.id).catch(console.error);
          }
        };

        // Listen for message updates
        const handleMessageUpdated = (updatedMessage: Message) => {
          if (!isMounted) return;

          console.log("Message updated:", updatedMessage);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
        };

        // Listen for message deletions
        const handleMessageDeleted = (data: {
          messageId: string;
          conversationId: string;
        }) => {
          if (!isMounted) return;

          console.log("Message deleted:", data);
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== data.messageId)
          );
        };

        // Listen for conversation deletions
        const handleConversationDeleted = (data: {
          conversationId: string;
          deletedBy: string;
        }) => {
          if (!isMounted) return;

          console.log("Conversation deleted:", data);
          if (data.conversationId === conversationId) {
            router.push("/chat");
          }
        };

        socketInstance.on("newMessage", handleNewMessage);
        socketInstance.on("messageUpdated", handleMessageUpdated);
        socketInstance.on("messageDeleted", handleMessageDeleted);
        socketInstance.on("conversationDeleted", handleConversationDeleted);

        return () => {
          if (socketInstance) {
            socketInstance.emit("leaveConversation", conversationId);
            socketInstance.off("newMessage", handleNewMessage);
            socketInstance.off("messageUpdated", handleMessageUpdated);
            socketInstance.off("messageDeleted", handleMessageDeleted);
            socketInstance.off(
              "conversationDeleted",
              handleConversationDeleted
            );
          }
        };
      } catch (error) {
        console.error("Error setting up socket:", error);
      }
    };

    setupSocket();

    return () => {
      isMounted = false;
    };
  }, [conversationId, user?.id]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);

  const handleSendMessage = async (content: string) => {
    if (sending) return;

    setSending(true);
    try {
      if (socket) {
        // Send via socket for real-time
        console.log("Sending message via socket:", content);
        socket.emit("sendMessage", {
          conversationId,
          content,
          messageType: "text",
        });
      } else {
        // Fallback to REST API if socket not available
        console.log("Sending message via REST API:", content);
        const response = await sendMessage(conversationId, {
          content,
          messageType: "text",
        });
        setMessages((prev) => [...prev, response.data as Message]);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleOfferUpdate = async (
    messageId: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      await updateOfferStatus(messageId, status);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                offerData: msg.offerData
                  ? { ...msg.offerData, status }
                  : undefined,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error updating offer status:", error);
    }
  };

  const handleMessageUpdate = (messageId: string, content: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              content,
              isEdited: true,
              editedAt: new Date().toISOString(),
            }
          : msg
      )
    );
  };

  const handleMessageDelete = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  };

  if (loading) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="min-h-screen bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gruvbox-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2">
              Loading conversation...
            </p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 flex flex-col">
        {/* Fixed Header */}
        <div className="sticky top-0 z-50 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border-b border-gruvbox-gray/20 backdrop-blur-md">
          <div className="flex items-center justify-between max-w-4xl mx-auto p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <Link
                href="/chat"
                className="p-2 hover:bg-gruvbox-gray/20 rounded-full transition-colors flex-shrink-0"
              >
                <svg
                  className="w-5 h-5 text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gruvbox-gray/20 flex-shrink-0">
                  {participant?.profilePicture ? (
                    <Image
                      src={participant.profilePicture}
                      alt={participant?.name || "User"}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gruvbox-gray/30">
                      <span className="text-xs sm:text-sm font-medium text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0">
                        {participant?.name?.[0] || "U"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="font-semibold text-sm sm:text-base text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 truncate">
                    {participant?.name || "Unknown User"}
                  </h1>
                  <p className="text-xs sm:text-sm text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2">
                    {socket?.connected ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
            </div>

            {/* Conversation Actions */}
            <ConversationActions
              conversationId={conversationId}
              onConversationDelete={() => {
                router.push("/chat");
              }}
            />
          </div>
        </div>

        {/* Vibe Info Card */}
        {vibeId && (
          <div className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border-b border-gruvbox-gray/20">
            <div className="max-w-4xl mx-auto p-4">
              <VibeInfoCard vibeId={vibeId} />
            </div>
          </div>
        )}

        {/* Messages Container - Scrollable */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-3 sm:p-4 max-w-4xl mx-auto w-full"
          style={{
            height: "calc(100vh - 120px)", // Adjust based on header and input height
            scrollBehavior: "smooth",
          }}
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gruvbox-light-fg2 dark:text-gruvbox-dark-fg2 mb-4">
                  No messages yet. Start the conversation!
                </p>
                <div className="text-xs text-gruvbox-light-fg3 dark:text-gruvbox-dark-fg3 space-y-1">
                  <p>Participant: {participant?.name || "Unknown"}</p>
                  <p>
                    Socket: {socket?.connected ? "Connected" : "Disconnected"}
                  </p>
                  <p>Conversation ID: {conversationId}</p>
                  <p>User ID: {user?.id}</p>
                  {participant && <p>Participant ID: {participant.id}</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((message, index) => {
                const isMe = message.sender.id === user?.id;
                const showAvatar =
                  index === 0 ||
                  messages[index - 1].sender.id !== message.sender.id;

                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isMe={isMe}
                    showAvatar={showAvatar}
                    participant={participant}
                    onOfferUpdate={handleOfferUpdate}
                    onMessageUpdate={handleMessageUpdate}
                    onMessageDelete={handleMessageDelete}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Fixed Message Input */}
        <div className="sticky bottom-0 bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 border-t border-gruvbox-gray/20">
          <div className="relative">
            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={sending}
            />
            {!socket && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-gruvbox-orange/20 text-gruvbox-orange text-xs rounded-full">
                Offline Mode
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
