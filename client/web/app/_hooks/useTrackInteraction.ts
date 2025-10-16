"use client";

import { useCallback } from "react";
import { useAuth } from "../_contexts/AuthContext";

// API Base URL
const API_BASE = process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:4000/api";

type InteractionType = 'view' | 'like' | 'comment' | 'share' | 'wishlist' | 'chat' | 'offer';

interface TrackInteractionOptions {
  duration?: number;
  metadata?: Record<string, any>;
}

/**
 * Hook for tracking user interactions with vibes
 * Automatically tracks interactions for the recommendation system
 */
export function useTrackInteraction() {
  const { isAuthenticated } = useAuth();

  const trackInteraction = useCallback(async (
    vibeId: string,
    interactionType: InteractionType,
    options: TrackInteractionOptions = {}
  ) => {
    if (!isAuthenticated) return;

    try {
      await fetch(`${API_BASE}/recommendations/track`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vibeId,
          interactionType,
          duration: options.duration,
          metadata: options.metadata,
        }),
      });
    } catch (error) {
      // Silent fail - don't interrupt user experience
      console.error('Failed to track interaction:', error);
    }
  }, [isAuthenticated]);

  return trackInteraction;
}

/**
 * Hook for tracking vibe view with automatic timing
 * Call start() when vibe is viewed, stop() when leaving
 */
export function useTrackView(vibeId: string) {
  const trackInteraction = useTrackInteraction();
  let startTime: number | null = null;

  const start = useCallback(() => {
    startTime = Date.now();
  }, []);

  const stop = useCallback(() => {
    if (startTime) {
      const duration = Date.now() - startTime;
      trackInteraction(vibeId, 'view', { duration });
      startTime = null;
    }
  }, [vibeId, trackInteraction]);

  return { start, stop };
}

/**
 * Hook for tracking likes
 */
export function useTrackLike() {
  const trackInteraction = useTrackInteraction();

  const trackLike = useCallback((vibeId: string, liked: boolean) => {
    trackInteraction(vibeId, 'like', {
      metadata: { action: liked ? 'add' : 'remove' }
    });
  }, [trackInteraction]);

  return trackLike;
}

/**
 * Hook for tracking comments
 */
export function useTrackComment() {
  const trackInteraction = useTrackInteraction();

  const trackComment = useCallback((vibeId: string, commentLength: number) => {
    trackInteraction(vibeId, 'comment', {
      metadata: { commentLength }
    });
  }, [trackInteraction]);

  return trackComment;
}

/**
 * Hook for tracking shares
 */
export function useTrackShare() {
  const trackInteraction = useTrackInteraction();

  const trackShare = useCallback((vibeId: string, platform?: string) => {
    trackInteraction(vibeId, 'share', {
      metadata: platform ? { platform } : undefined
    });
  }, [trackInteraction]);

  return trackShare;
}

/**
 * Hook for tracking wishlist additions
 */
export function useTrackWishlist() {
  const trackInteraction = useTrackInteraction();

  const trackWishlist = useCallback((vibeId: string, added: boolean) => {
    trackInteraction(vibeId, 'wishlist', {
      metadata: { action: added ? 'add' : 'remove' }
    });
  }, [trackInteraction]);

  return trackWishlist;
}

/**
 * Hook for tracking chat initiation
 */
export function useTrackChat() {
  const trackInteraction = useTrackInteraction();

  const trackChat = useCallback((vibeId: string) => {
    trackInteraction(vibeId, 'chat');
  }, [trackInteraction]);

  return trackChat;
}

/**
 * Hook for tracking offer submission
 */
export function useTrackOffer() {
  const trackInteraction = useTrackInteraction();

  const trackOffer = useCallback((vibeId: string, offerAmount: number) => {
    trackInteraction(vibeId, 'offer', {
      metadata: { offerAmount }
    });
  }, [trackInteraction]);

  return trackOffer;
}
