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

// Upload Vibe interfaces
export interface CreateVibeInput {
  itemName: string;
  description: string;
  price: number;
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  tags: string[];
  location: string;
}

export interface CreateVibeResponse {
  message: string;
  vibe: {
    id: string;
    status: string;
    expiresAt: string;
  };
}

export interface MediaFile {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:4000/api';

// Helper function to validate file
export function validateFile(file: File, index: number): void {
  // Check file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error(`File ${index + 1} exceeds 10MB limit`);
  }

  // Check file type
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File ${index + 1} has unsupported type: ${file.type}`);
  }
}

// Helper function to get file extension from MIME type
export function getFileExtension(mimeType: string): string {
  const extensions: { [key: string]: string } = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'video/mp4': '.mp4',
    'video/avi': '.avi',
    'video/mov': '.mov',
    'video/wmv': '.wmv'
  };
  
  return extensions[mimeType] || '.jpg';
}

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

// Create a new vibe
export async function createVibe(vibeData: CreateVibeInput): Promise<CreateVibeResponse> {
  const response = await fetch(`${API_BASE}/vibes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(vibeData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create vibe');
  }

  return response.json();
}

// Upload media files for a vibe
export async function uploadVibeMedia(vibeId: string, files: File[]): Promise<{ mediaFiles: MediaFile[] }> {
  if (!files || files.length === 0) {
    throw new Error('No files provided for upload');
  }

  if (files.length > 5) {
    throw new Error('Maximum 5 files allowed');
  }

  // Validate all files before processing
  files.forEach((file, idx) => {
    validateFile(file, idx);
  });

  const formData = new FormData();
  
  files.forEach((file, idx) => {
    // Use original filename or generate one if not available
    let fileName = file.name;
    if (!fileName) {
      const extension = getFileExtension(file.type);
      fileName = `media_${idx}${extension}`;
    }

    // Create a new File object with the proper name
    const fileWithName = new File([file], fileName, { type: file.type });
    formData.append('media', fileWithName);
  });

  const response = await fetch(`${API_BASE}/vibes/${vibeId}/media`, {
    method: 'POST',
    credentials: 'include',
    // Don't set Content-Type header - let browser set it for FormData
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = 'Failed to upload media';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// Upload media files with progress tracking
export async function uploadVibeMediaWithProgress(
  vibeId: string, 
  files: File[], 
  onProgress?: (progress: UploadProgress) => void
): Promise<{ mediaFiles: MediaFile[] }> {
  if (!files || files.length === 0) {
    throw new Error('No files provided for upload');
  }

  if (files.length > 5) {
    throw new Error('Maximum 5 files allowed');
  }

  // Validate all files before processing
  files.forEach((file, idx) => {
    validateFile(file, idx);
  });

  const formData = new FormData();
  
  files.forEach((file, idx) => {
    // Use original filename or generate one if not available
    let fileName = file.name;
    if (!fileName) {
      const extension = getFileExtension(file.type);
      fileName = `media_${idx}${extension}`;
    }

    // Create a new File object with the proper name
    const fileWithName = new File([file], fileName, { type: file.type });
    formData.append('media', fileWithName);
  });

  // Create XMLHttpRequest for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress: UploadProgress = {
          loaded: event.loaded,
          total: event.total,
          percentage: Math.round((event.loaded / event.total) * 100)
        };
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve(result);
        } catch (error) {
          reject(new Error('Invalid response format'));
        }
      } else {
        let errorMessage = 'Failed to upload media';
        try {
          const errorData = JSON.parse(xhr.responseText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = xhr.statusText || errorMessage;
        }
        reject(new Error(errorMessage));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.open('POST', `${API_BASE}/vibes/${vibeId}/media`);
    xhr.withCredentials = true;
    xhr.send(formData);
  });
}