import { apiClient } from "../../_libs/api";

// Types
export interface MediaFile {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  _id?: string;
}

export interface Vibe {
  id: string;
  itemName: string;
  price: number;
  status: string;
  mediaFiles: MediaFile[];
}

export interface Participant {
  id: string;
  username: string;
  name: string;
  profilePicture?: string;
  isVerified?: boolean;
}

export interface LastMessage {
  content: string;
  timestamp: string;
  messageType: string;
  isFromMe: boolean;
}

export interface Conversation {
  id: string;
  conversationId: string;
  vibe: Vibe;
  participant: Participant;
  lastMessage?: LastMessage;
  unreadCount: number;
  isActive: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  vibeId?: string;
  content: string;
  messageType: 'text' | 'image' | 'offer' | 'system';
  sender: Participant;
  receiver: Participant;
  attachments?: {
    type: 'image' | 'file';
    url: string;
    filename: string;
    size: number;
  }[];
  offerData?: {
    amount: number;
    message?: string;
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    expiresAt: string;
  };
  isRead: boolean;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetConversationsResponse {
  conversations: Conversation[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface GetMessagesResponse {
  messages: Message[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface SendMessageResponse {
  message: string;
  data: Message;
}

export interface CreateMessageInput {
  content: string;
  messageType?: 'text' | 'image' | 'offer' | 'system';
  offerData?: {
    amount: number;
    message?: string;
  };
}

// API Functions
export async function startConversation(vibeId: string) {
  const response = await apiClient.post(`/chat/vibes/${vibeId}/start`);
  return response;
}

export async function getConversations(limit = 20, offset = 0): Promise<GetConversationsResponse> {
  const response = await apiClient.get('/chat/conversations', { limit, offset });
  return response as unknown as GetConversationsResponse;
}

export async function getConversationMessages(
  conversationId: string,
  limit = 50,
  offset = 0
): Promise<GetMessagesResponse> {
  const response = await apiClient.get(`/chat/conversations/${conversationId}/messages`, {
    limit,
    offset,
  });
  return response as unknown as GetMessagesResponse;
}

export async function sendMessage(
  conversationId: string,
  messageData: CreateMessageInput
): Promise<SendMessageResponse> {
  const response = await apiClient.post(`/chat/conversations/${conversationId}/messages`, messageData);
  return response as unknown as SendMessageResponse;
}

export async function markMessageAsRead(messageId: string) {
  const response = await apiClient.patch(`/chat/messages/${messageId}/read`);
  return response;
}

export async function updateOfferStatus(
  messageId: string,
  status: 'accepted' | 'rejected'
) {
  const response = await apiClient.patch(`/chat/messages/${messageId}/offer-status`, { status });
  return response;
}

export async function updateMessage(messageId: string, content: string) {
  const response = await apiClient.put(`/chat/messages/${messageId}`, { content });
  return response;
}

export async function deleteMessage(messageId: string) {
  const response = await apiClient.delete(`/chat/messages/${messageId}`);
  return response;
}

export async function deleteConversation(conversationId: string) {
  const response = await apiClient.delete(`/chat/conversations/${conversationId}`);
  return response;
}