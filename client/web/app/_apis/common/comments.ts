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
  replies?: CommentResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CommentsListResponse {
  comments: CommentResponse[];
  count: number;
}

export interface RepliesListResponse {
  replies: CommentResponse[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface CreateCommentRequest {
  content: string;
  parentComment?: string;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:4000/api";

// Get comments for a specific vibe
export async function getCommentsByVibeId(
  vibeId: string
): Promise<CommentsListResponse> {
  const response = await fetch(`${API_BASE}/vibes/${vibeId}/comments`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log("Get comments response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Get comments error response:", errorText);
    throw new Error(
      `Failed to fetch comments: ${response.status} ${errorText}`
    );
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const responseText = await response.text();
    console.error("Non-JSON response:", responseText);
    throw new Error("Server returned non-JSON response");
  }

  const data = await response.json();
  console.log("Get comments response data:", data);
  return data;
}

// Get comments with replies for a specific vibe
export async function getCommentsWithRepliesByVibeId(
  vibeId: string
): Promise<CommentsListResponse> {
  try {
    // First get the main comments
    const commentsResponse = await getCommentsByVibeId(vibeId);

    // For each comment, fetch its replies
    const commentsWithReplies = await Promise.all(
      commentsResponse.comments.map(async (comment) => {
        if (comment.repliesCount > 0) {
          try {
            const repliesResponse = await getCommentReplies(comment.id);
            return {
              ...comment,
              replies: repliesResponse.replies || [],
            };
          } catch (error) {
            console.error(
              `Error fetching replies for comment ${comment.id}:`,
              error
            );
            return {
              ...comment,
              replies: [],
            };
          }
        }
        return {
          ...comment,
          replies: [],
        };
      })
    );

    return {
      comments: commentsWithReplies,
      count: commentsResponse.count,
    };
  } catch (error) {
    console.error("Error fetching comments with replies:", error);
    throw error;
  }
}

// Create a new comment
export async function createComment(
  vibeId: string,
  content: string,
  parentCommentId?: string
): Promise<{ comment: CommentResponse }> {
  const requestBody: CreateCommentRequest = {
    content,
    ...(parentCommentId && { parentCommentId }),
  };

  // console.log("Creating comment for vibe:", vibeId, "with content:", content);
  // console.log("Request body:", requestBody);

  const response = await fetch(`${API_BASE}/vibes/${vibeId}/comments`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  // console.log("Create comment response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Create comment error response:", errorText);
    throw new Error(
      `Failed to create comment: ${response.status} ${errorText}`
    );
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const responseText = await response.text();
    console.error("Non-JSON response:", responseText);
    throw new Error("Server returned non-JSON response");
  }

  const data = await response.json();
  // console.log("Create comment response data:", data);
  return data;
}

// Like a comment
export async function likeComment(
  commentId: string,
  userId: string
): Promise<{ success: boolean; likesCount: number }> {
  const response = await fetch(
    `${API_BASE}/comments/${commentId}/${userId}/like`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Like comment error response:", errorText);
    throw new Error(`Failed to like comment: ${response.status} ${errorText}`);
  }

  return response.json();
}

// Unlike a comment
export async function unlikeComment(
  commentId: string,
  userId: string
): Promise<{ success: boolean; likesCount: number }> {
  const response = await fetch(
    `${API_BASE}/comments/${commentId}/${userId}/unlike`,
    {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Unlike comment error response:", errorText);
    throw new Error(
      `Failed to unlike comment: ${response.status} ${errorText}`
    );
  }

  return response.json();
}

// Update a comment
export async function updateComment(
  commentId: string,
  userId: string,
  content: string
): Promise<{ comment: CommentResponse }> {
  const response = await fetch(`${API_BASE}/comments/${commentId}/${userId}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  console.log("Update comment response:", response);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Update comment error response:", errorText);
    throw new Error(
      `Failed to update comment: ${response.status} ${errorText}`
    );
  }

  return response.json();
}

// Delete a comment
export async function deleteComment(
  commentId: string,
  userId: string
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/comments/${commentId}/${userId}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log("Delete comment response:", response);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Delete comment error response:", errorText);
    throw new Error(
      `Failed to delete comment: ${response.status} ${errorText}`
    );
  }

  return response.json();
}

// Get replies to a comment
export async function getCommentReplies(
  commentId: string
): Promise<RepliesListResponse> {
  const response = await fetch(`${API_BASE}/comments/${commentId}/replies`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Get replies error response:", errorText);
    throw new Error(`Failed to fetch replies: ${response.status} ${errorText}`);
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const responseText = await response.text();
    console.error("Non-JSON response:", responseText);
    throw new Error("Server returned non-JSON response");
  }

  return response.json();
}
