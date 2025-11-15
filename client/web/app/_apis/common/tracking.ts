const API_BASE =
  process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:4000/api";

export interface TrackInteractionParams {
  vibeId: string;
  interactionType: "view" | "like" | "comment" | "share" | "wishlist" | "chat" | "offer";
  duration?: number; // Duration in seconds (for view interactions)
  metadata?: {
    tags?: string[];
    category?: string;
    location?: string;
    [key: string]: any;
  };
}

/**
 * Track user interaction with a vibe
 * This is a fire-and-forget operation that doesn't block the UI
 */
export async function trackInteraction(params: TrackInteractionParams): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/recommendations/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(params),
    });

    // Don't throw errors - tracking failures shouldn't break user experience
    if (!response.ok) {
      console.warn("Failed to track interaction:", params.interactionType);
    }
  } catch (error) {
    console.warn("Error tracking interaction:", error);
    // Silently fail - tracking is non-critical
  }
}

/**
 * Track a view interaction with duration tracking
 */
export async function trackView(vibeId: string, duration?: number): Promise<void> {
  return trackInteraction({
    vibeId,
    interactionType: "view",
    duration,
  });
}

/**
 * Track a like interaction
 */
export async function trackLike(vibeId: string): Promise<void> {
  return trackInteraction({
    vibeId,
    interactionType: "like",
  });
}

/**
 * Track a wishlist interaction
 */
export async function trackWishlist(vibeId: string): Promise<void> {
  return trackInteraction({
    vibeId,
    interactionType: "wishlist",
  });
}

/**
 * Track a comment interaction
 */
export async function trackComment(vibeId: string): Promise<void> {
  return trackInteraction({
    vibeId,
    interactionType: "comment",
  });
}

/**
 * Track a share interaction
 */
export async function trackShare(vibeId: string): Promise<void> {
  return trackInteraction({
    vibeId,
    interactionType: "share",
  });
}

/**
 * Track a chat interaction
 */
export async function trackChat(vibeId: string): Promise<void> {
  return trackInteraction({
    vibeId,
    interactionType: "chat",
  });
}

/**
 * Track an offer interaction
 */
export async function trackOffer(vibeId: string): Promise<void> {
  return trackInteraction({
    vibeId,
    interactionType: "offer",
  });
}

/**
 * Get interaction history for the current user
 */
export async function getInteractionHistory(options?: {
  type?: string;
  limit?: number;
  offset?: number;
}): Promise<any> {
  try {
    const params = new URLSearchParams();
    if (options?.type) params.append("type", options.type);
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.offset) params.append("offset", options.offset.toString());

    const response = await fetch(
      `${API_BASE}/recommendations/history?${params.toString()}`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch interaction history");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching interaction history:", error);
    throw error;
  }
}

/**
 * Get interaction statistics for a specific vibe
 */
export async function getVibeStats(vibeId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/recommendations/stats/${vibeId}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch vibe stats");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching vibe stats:", error);
    throw error;
  }
}