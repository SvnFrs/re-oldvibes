// API Base URL
const API_BASE =
  process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:4000/api";

/**
 * Update user profile information (using cookies for auth)
 */
export async function updateMyProfile(profileData: {
  name?: string;
  username?: string;
  email?: string;
  bio?: string;
  profilePicture?: string;
}): Promise<{ message: string; profile: any }> {
  const response = await fetch(`${API_BASE}/users/me`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to update profile" }));
    throw new Error(error.message || "Failed to update profile");
  }

  return await response.json();
}

/**
 * Update admin profile information
 */
export async function updateUserProfile(
  token: string,
  profileData: {
    name: string;
    username: string;
    email: string;
    bio?: string;
    profilePicture?: string;
  }
): Promise<{ message: string; profile: any }> {
  const response = await fetch(`${API_BASE}/users/me`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to update profile" }));
    throw new Error(error.message || "Failed to update profile");
  }

  return await response.json();
}

/**
 * Upload user profile picture
 */
export async function uploadUserProfilePicture(
  token: string,
  file: File
): Promise<{ message: string; profilePicture: string }> {
  const formData = new FormData();
  formData.append("profilePicture", file);

  const response = await fetch(`${API_BASE}/users/me/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to upload profile picture" }));
    throw new Error(error.message || "Failed to upload profile picture");
  }

  return await response.json();
}

/**
 * Delete user account (soft delete)
 */
export async function deleteAccount(): Promise<{ message: string; deletedAt: string }> {
  const response = await fetch(`${API_BASE}/users/me`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to delete account" }));
    throw new Error(error.message || "Failed to delete account");
  }

  return await response.json();
}
