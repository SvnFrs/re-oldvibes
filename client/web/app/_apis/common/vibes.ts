import { apiClient } from "../../_libs/api";

// Types
export interface CreateVibeInput {
  itemName: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  tags?: string[];
  location?: string;
}

export interface Vibe {
  id: string;
  itemName: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  tags: string[];
  location?: string;
  status: 'pending' | 'approved' | 'rejected';
  mediaFiles: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
    _id?: string;
  }[];
  user: {
    id: string;
    name: string;
    username: string;
    profilePicture?: string;
    isVerified?: boolean;
  };
  likesCount: number;
  views: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface CreateVibeResponse {
  message: string;
  vibe: {
    id: string;
    status: string;
    expiresAt?: string;
  };
}

export interface UploadMediaResponse {
  message: string;
  mediaFiles: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  }[];
}

// API Functions
export async function createVibe(vibeData: CreateVibeInput): Promise<CreateVibeResponse> {
  const response = await apiClient.post('/vibes', vibeData);
  return response as unknown as CreateVibeResponse;
}

// Types for search and response
export interface SearchVibesParams {
  q?: string;
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  location?: string;
  limit?: number;
  offset?: number;
}

export interface VibesListResponse {
  data: Vibe[];
  pagination?: any;
  vibes?: Vibe[];
  count?: number;
  query?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:4000/api';

export async function getVibes(params?: {
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<VibesListResponse> {
  const response = await apiClient.get('/vibes', params);
  return response as unknown as VibesListResponse;
}

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

    const result = await response.json();
    // Normalize response format - convert vibes to data if needed
    return {
      data: result.vibes || result.data || [],
      pagination: result.pagination,
      count: result.count,
      query: result.query
    };
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

    const result = await response.json();
    // Normalize response format
    return {
      data: result.data || result.vibes || [],
      pagination: result.pagination,
      count: result.count
    };
  }
}

export async function getVibeById(vibeId: string): Promise<{ vibe: Vibe }> {
  const response = await apiClient.get(`/vibes/${vibeId}`);
  return response as unknown as { vibe: Vibe };
}

export async function uploadVibeMedia(
  vibeId: string,
  files: File[]
): Promise<UploadMediaResponse> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('media', file);
  });

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:4000/api'}/vibes/${vibeId}/media`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload media');
  }

  return await response.json();
}


export async function deleteVibe(vibeId: string): Promise<any> {
  const response = await apiClient.delete(`/vibes/${vibeId}`);
  return response;
}

export async function getTrendingVibes(): Promise<VibesListResponse> {
  const response = await fetch(`${API_BASE}/vibes/trending`, {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch trending vibes');
  }

  const result = await response.json();
  return {
    data: result.data || result.vibes || [],
    pagination: result.pagination,
    count: result.count
  };
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

  const result = await response.json();
  return {
    data: result.data || result.vibes || [],
    pagination: result.pagination,
    count: result.count
  };
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