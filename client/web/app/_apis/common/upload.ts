interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * @deprecated Use uploadProfilePictureToBackend or uploadVibeMediaToBackend instead
 * Upload images to Cloudinary (legacy function)
 */
export const uploadToCloudinaryImage = async (
  files: File[]
): Promise<CloudinaryUploadResult[] | false> => {
  const results: CloudinaryUploadResult[] = [];
  try {
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "medicare");
      formData.append("folder", "oldvibes");

      const response = await fetch(process.env.NEXT_CLOUD_API_IMAGE || "", {
        method: "POST",
        body: formData,
        redirect: "follow",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to upload ${file.name}. Status: ${response.status}`
        );
      }

      const data: CloudinaryUploadResult = await response.json();
      results.push(data);
    }
    return results;
  } catch (error: any) {
    console.error("========= Error Uploading Files:", error);
    return false;
  }
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:4000/api";

/**
 * Upload profile picture to backend (AWS S3)
 * @param file - Image file to upload
 * @returns URL of uploaded image or null if failed
 */
export const uploadProfilePictureToBackend = async (
  file: File
): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await fetch(`${API_BASE}/users/me/avatar`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Upload failed" }));
      throw new Error(error.message || `Failed to upload profile picture. Status: ${response.status}`);
    }

    const data = await response.json();
    return data.profilePicture || null;
  } catch (error: any) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
};

/**
 * Upload vibe media to backend (AWS S3)
 * @param vibeId - Vibe ID
 * @param files - Array of image/video files to upload
 * @returns Array of media URLs or empty array if failed
 */
export const uploadVibeMediaToBackend = async (
  vibeId: string,
  files: File[]
): Promise<string[]> => {
  try {
    if (!files || files.length === 0) {
      return [];
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("media", file);
    });

    const response = await fetch(`${API_BASE}/vibes/${vibeId}/media`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Upload failed" }));
      throw new Error(error.message || `Failed to upload media. Status: ${response.status}`);
    }

    const data = await response.json();
    // Extract URLs from mediaFiles array
    if (data.mediaFiles && Array.isArray(data.mediaFiles)) {
      return data.mediaFiles.map((media: any) => media.url);
    }
    return [];
  } catch (error: any) {
    console.error("Error uploading vibe media:", error);
    throw error;
  }
};
