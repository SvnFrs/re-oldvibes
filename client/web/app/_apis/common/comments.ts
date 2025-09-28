// Comments API functions for web client

export interface CommentResponse {
  id: string;
  vibeId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    username: string;
    profilePicture?: string;
  };
  content: string;
  parentComment?: string;
  isActive: boolean;
  likesCount: number;
  repliesCount: number;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CommentsListResponse {
  comments: CommentResponse[];
  count: number;
}

export interface CreateCommentRequest {
  content: string;
  parentComment?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Get comments for a specific vibe
export async function getCommentsByVibeId(vibeId: string): Promise<CommentsListResponse> {
  const response = await fetch(`${API_BASE}/vibes/${vibeId}/comments`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  console.log('Get comments response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get comments error response:', errorText);
    throw new Error(`Failed to fetch comments: ${response.status} ${errorText}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const responseText = await response.text();
    console.error('Non-JSON response:', responseText);
    throw new Error('Server returned non-JSON response');
  }

  const data = await response.json();
  console.log('Get comments response data:', data);
  return data;
}

// Create a new comment
export async function createComment(vibeId: string, content: string, parentComment?: string): Promise<{ comment: CommentResponse }> {
  const requestBody: CreateCommentRequest = {
    content,
    ...(parentComment && { parentComment })
  };

  console.log('Creating comment for vibe:', vibeId, 'with content:', content);

  const response = await fetch(`${API_BASE}/vibes/${vibeId}/comments`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  console.log('Create comment response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create comment error response:', errorText);
    throw new Error(`Failed to create comment: ${response.status} ${errorText}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const responseText = await response.text();
    console.error('Non-JSON response:', responseText);
    throw new Error('Server returned non-JSON response');
  }

  const data = await response.json();
  console.log('Create comment response data:', data);
  return data;
}

// Like a comment
export async function likeComment(commentId: string): Promise<{ success: boolean; likesCount: number }> {
  const response = await fetch(`${API_BASE}/comments/${commentId}/like`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Like comment error response:', errorText);
    throw new Error(`Failed to like comment: ${response.status} ${errorText}`);
  }

  return response.json();
}

// Unlike a comment
export async function unlikeComment(commentId: string): Promise<{ success: boolean; likesCount: number }> {
  const response = await fetch(`${API_BASE}/comments/${commentId}/unlike`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Unlike comment error response:', errorText);
    throw new Error(`Failed to unlike comment: ${response.status} ${errorText}`);
  }

  return response.json();
}

// Delete a comment
export async function deleteComment(commentId: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/comments/${commentId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Delete comment error response:', errorText);
    throw new Error(`Failed to delete comment: ${response.status} ${errorText}`);
  }

  return response.json();
}

// Get replies to a comment
export async function getCommentReplies(commentId: string): Promise<CommentsListResponse> {
  const response = await fetch(`${API_BASE}/comments/${commentId}/replies`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get replies error response:', errorText);
    throw new Error(`Failed to fetch replies: ${response.status} ${errorText}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const responseText = await response.text();
    console.error('Non-JSON response:', responseText);
    throw new Error('Server returned non-JSON response');
  }

  return response.json();
}