// API Base URL
const API_BASE = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:4000/api";

// Types
export interface PendingVibe {
  _id: string;
  itemName: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  tags: string[];
  location?: string;
  status: 'pending';
  mediaFiles: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  }[];
  user: {
    _id: string;
    name: string;
    username: string;
    profilePicture?: string;
  };
  createdAt: string;
  expiresAt?: string;
}

export interface ModerationAction {
  action: 'approve' | 'reject';
  notes?: string;
}

/**
 * Get all pending vibes for moderation (Staff/Admin only)
 */
export async function getPendingVibes(token: string): Promise<{ vibes: PendingVibe[] }> {
  const response = await fetch(`${API_BASE}/vibes/pending`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch pending vibes' }));
    throw new Error(error.message || 'Failed to fetch pending vibes');
  }

  return await response.json();
}

/**
 * Moderate a vibe (approve or reject) - Staff/Admin only
 */
export async function moderateVibe(
  token: string,
  vibeId: string,
  action: ModerationAction
): Promise<{ message: string; vibe: any }> {
  const response = await fetch(`${API_BASE}/vibes/${vibeId}/moderate`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(action),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to moderate vibe' }));
    throw new Error(error.message || 'Failed to moderate vibe');
  }

  return await response.json();
}

/**
 * Delete a vibe - Admin only
 */
export async function deleteVibe(token: string, vibeId: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/vibes/${vibeId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete vibe' }));
    throw new Error(error.message || 'Failed to delete vibe');
  }

  return await response.json();
}

/**
 * Get all users (Admin only)
 */
export async function getAllUsers(
  token: string,
  options: { limit?: number; offset?: number } = {}
): Promise<{ users: any[]; total: number }> {
  const params = new URLSearchParams();
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.offset) params.append('offset', options.offset.toString());

  const response = await fetch(`${API_BASE}/admin/users?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return await response.json();
}

/**
 * Ban a user (Admin only)
 */
export async function banUser(token: string, userId: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/admin/users/${userId}/ban`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to ban user');
  }

  return await response.json();
}

/**
 * Unban a user (Admin only)
 */
export async function unbanUser(token: string, userId: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/admin/users/${userId}/unban`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to unban user');
  }

  return await response.json();
}
