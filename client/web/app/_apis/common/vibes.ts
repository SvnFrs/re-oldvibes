// Vibes API functions for web client

export interface VibeResponse {
  id: string;
  userId: string;
  user: {
    username: string;
    name: string;
    profilePicture?: string;
    isVerified: boolean;
  };
  itemName: string;
  description: string;
  price: number;
  tags: string[];
  mediaFiles: {
    type: "image" | "video";
    url: string;
    thumbnail?: string;
  }[];
  status: "pending" | "approved" | "rejected" | "sold" | "archived";
  category: string;
  condition: string;
  location?: string;
  likesCount: number;
  commentsCount: number;
  views: number;
  isLiked?: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface VibesListResponse {
  data: VibeResponse[];
  pagination: PaginationInfo;
}

// Legacy interface for backward compatibility
export interface LegacyVibesListResponse {
  vibes: VibeResponse[];
  count: number;
}

export interface SearchVibesParams {
  q?: string;
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:4000/api';

// Get all approved vibes with pagination
export async function getVibes(filters?: SearchVibesParams): Promise<VibesListResponse> {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else {
          params.append(key, value.toString());
        }
      }
    });
  }

  const response = await fetch(`${API_BASE}/vibes?${params}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch vibes');
  }

  return response.json();
}

// Get single vibe by ID
export async function getVibeById(vibeId: string): Promise<{ vibe: VibeResponse }> {
  const response = await fetch(`${API_BASE}/vibes/${vibeId}`, {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch vibe');
  }

  return response.json();
}

// Search vibes
export async function searchVibes(params: SearchVibesParams): Promise<VibesListResponse> {
  const searchParams = new URLSearchParams();
  
  // If there's a text search query, use search endpoint
  if (params.q && params.q.trim()) {
    searchParams.append('q', params.q.trim());
    
    // Add other filters to search endpoint
    Object.entries(params).forEach(([key, value]) => {
      if (key !== 'q' && value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          searchParams.append(key, value.join(','));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const url = `${API_BASE}/vibes/search?${searchParams}`;
    console.log('Text Search URL:', url);

    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Search Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Search Error Response:', errorText);
      throw new Error(`Failed to search vibes: ${response.status} ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error('Non-JSON response:', responseText);
      throw new Error('Server returned non-JSON response');
    }

    return response.json();
  } else {
    // No text search, use regular vibes endpoint with filters only
    Object.entries(params).forEach(([key, value]) => {
      if (key !== 'q' && value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          searchParams.append(key, value.join(','));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const url = `${API_BASE}/vibes?${searchParams}`;
    console.log('Filter Search URL:', url);

    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Filter Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Filter Error Response:', errorText);
      throw new Error(`Failed to fetch vibes: ${response.status} ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error('Non-JSON response:', responseText);
      throw new Error('Server returned non-JSON response');
    }

    return response.json();
  }
}

// Get trending vibes
export async function getTrendingVibes(): Promise<VibesListResponse> {
  const response = await fetch(`${API_BASE}/vibes/trending`, {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch trending vibes');
  }

  return response.json();
}

// Like a vibe
export async function likeVibe(vibeId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/vibes/${vibeId}/like`, {
    method: 'POST',
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to like vibe');
  }
}

// Unlike a vibe
export async function unlikeVibe(vibeId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/vibes/${vibeId}/like`, {
    method: 'DELETE',
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to unlike vibe');
  }
}

// Get user's vibes
export async function getUserVibes(userId: string): Promise<VibesListResponse> {
  const response = await fetch(`${API_BASE}/vibes/user/${userId}`, {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user vibes');
  }

  return response.json();
}

// Mark vibe as sold
export async function markVibeAsSold(vibeId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/vibes/${vibeId}/sold`, {
    method: 'PATCH',
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to mark vibe as sold');
  }
}
