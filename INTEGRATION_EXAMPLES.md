# Integration Examples - Adding Tracking to Existing Components

This document provides concrete examples of how to add interaction tracking to existing components in the Old Vibes web app.

## Example 1: Feed Page with TrendingVibes Sidebar

**File**: `/client/web/app/feed/page.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";
import Wrapper from "../_sections/wrapper";
import { useAuth } from "../_contexts/AuthContext";
import { getVibes } from "../_apis/common/vibes";
import TrendingVibes from "../_components/recommendations/TrendingVibes"; // ADD THIS
import FeedVibeCard from "./FeedVibeCard"; // Assume extracted to separate component

export default function FeedPage() {
  const { user } = useAuth();
  const [vibes, setVibes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVibes = async () => {
      try {
        const data = await getVibes();
        setVibes(data.vibes || []);
      } catch (error) {
        console.error("Error fetching vibes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVibes();
  }, []);

  return (
    <Wrapper>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Feed - 3 columns */}
          <div className="lg:col-span-3">
            <h1 className="text-3xl font-bold mb-6">Feed</h1>

            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="space-y-4">
                {vibes.map((vibe) => (
                  <FeedVibeCard key={vibe.id} vibe={vibe} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - 1 column - ADD THIS SECTION */}
          <aside className="lg:col-span-1 space-y-4">
            <TrendingVibes limit={5} />

            {/* You can add more widgets here */}
            {user && (
              <div className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 rounded-lg p-4">
                <h3 className="font-bold mb-2">Quick Actions</h3>
                <a
                  href="/upload"
                  className="block text-sm text-gruvbox-orange hover:underline"
                >
                  Upload New Vibe
                </a>
                <a
                  href="/recommendations"
                  className="block text-sm text-gruvbox-orange hover:underline mt-2"
                >
                  View All Recommendations
                </a>
              </div>
            )}
          </aside>
        </div>
      </div>
    </Wrapper>
  );
}
```

## Example 2: Vibe Detail Page with View Tracking

**File**: `/client/web/app/vibes/[id]/page.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTrackView } from "../../_hooks/useTrackInteraction"; // ADD THIS
import VibeDetails from "./VibeDetails";

export default function VibeDetailPage() {
  const params = useParams();
  const vibeId = params.id as string;
  const [vibe, setVibe] = useState(null);

  // ADD THIS - Track view duration
  const { start, stop } = useTrackView(vibeId);

  useEffect(() => {
    // Start tracking when page loads
    start();

    // Fetch vibe data
    fetchVibe();

    // Stop tracking when page unloads
    return () => {
      stop();
    };
  }, [vibeId]);

  const fetchVibe = async () => {
    // ... existing fetch logic
  };

  if (!vibe) return <div>Loading...</div>;

  return (
    <div>
      <VibeDetails vibe={vibe} />
    </div>
  );
}
```

## Example 3: Like Button with Tracking

**File**: `/client/web/app/_components/vibe/LikeButton.tsx`

```tsx
"use client";

import { useState } from "react";
import { IconHeart } from "@tabler/icons-react";
import { useTrackLike } from "../../_hooks/useTrackInteraction"; // ADD THIS

interface LikeButtonProps {
  vibeId: string;
  initialLiked: boolean;
  initialCount: number;
}

export default function LikeButton({
  vibeId,
  initialLiked,
  initialCount,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  // ADD THIS
  const trackLike = useTrackLike();

  const handleLike = async () => {
    if (loading) return;

    setLoading(true);
    const newLiked = !isLiked;

    // Optimistic update
    setIsLiked(newLiked);
    setLikesCount((prev) => (newLiked ? prev + 1 : prev - 1));

    try {
      // ADD THIS - Track the interaction
      trackLike(vibeId, newLiked);

      // Existing API call
      const response = await fetch(`/api/vibes/${vibeId}/like`, {
        method: newLiked ? "POST" : "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        // Revert on error
        setIsLiked(!newLiked);
        setLikesCount((prev) => (newLiked ? prev - 1 : prev + 1));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert on error
      setIsLiked(!newLiked);
      setLikesCount((prev) => (newLiked ? prev - 1 : prev + 1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
        isLiked
          ? "bg-gruvbox-red-light text-white"
          : "bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2"
      }`}
    >
      <IconHeart size={20} className={isLiked ? "fill-current" : ""} />
      <span>{likesCount}</span>
    </button>
  );
}
```

## Example 4: Comment Form with Tracking

**File**: `/client/web/app/_components/vibe/CommentForm.tsx`

```tsx
"use client";

import { useState } from "react";
import { IconSend } from "@tabler/icons-react";
import { useTrackComment } from "../../_hooks/useTrackInteraction"; // ADD THIS

interface CommentFormProps {
  vibeId: string;
  onCommentAdded: (comment: any) => void;
}

export default function CommentForm({
  vibeId,
  onCommentAdded,
}: CommentFormProps) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ADD THIS
  const trackComment = useTrackComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || submitting) return;

    setSubmitting(true);

    try {
      // ADD THIS - Track the comment interaction
      trackComment(vibeId, comment.length);

      // Existing API call
      const response = await fetch(`/api/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vibeId,
          content: comment.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onCommentAdded(data.comment);
        setComment("");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment..."
        className="flex-1 px-4 py-2 rounded-lg bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2"
        disabled={submitting}
      />
      <button
        type="submit"
        disabled={!comment.trim() || submitting}
        className="px-4 py-2 bg-gruvbox-orange text-white rounded-lg hover:bg-gruvbox-yellow transition disabled:opacity-50"
      >
        <IconSend size={20} />
      </button>
    </form>
  );
}
```

## Example 5: Share Button with Tracking

**File**: `/client/web/app/_components/vibe/ShareButton.tsx`

```tsx
"use client";

import { useState } from "react";
import { IconShare } from "@tabler/icons-react";
import { useTrackShare } from "../../_hooks/useTrackInteraction"; // ADD THIS

interface ShareButtonProps {
  vibeId: string;
  vibeTitle: string;
  vibeUrl: string;
}

export default function ShareButton({
  vibeId,
  vibeTitle,
  vibeUrl,
}: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);

  // ADD THIS
  const trackShare = useTrackShare();

  const handleShare = (platform: string) => {
    // ADD THIS - Track the share interaction
    trackShare(vibeId, platform);

    // Existing share logic
    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          vibeUrl
        )}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          vibeTitle
        )}&url=${encodeURIComponent(vibeUrl)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(vibeUrl);
        alert("Link copied to clipboard!");
        setShowMenu(false);
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }

    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2 rounded-lg hover:bg-gruvbox-light-bg3 dark:hover:bg-gruvbox-dark-bg3 transition"
      >
        <IconShare size={20} />
        <span>Share</span>
      </button>

      {showMenu && (
        <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gruvbox-dark-bg1 rounded-lg shadow-lg p-2 z-10">
          <button
            onClick={() => handleShare("facebook")}
            className="block w-full text-left px-4 py-2 hover:bg-gruvbox-light-bg2 dark:hover:bg-gruvbox-dark-bg2 rounded"
          >
            Facebook
          </button>
          <button
            onClick={() => handleShare("twitter")}
            className="block w-full text-left px-4 py-2 hover:bg-gruvbox-light-bg2 dark:hover:bg-gruvbox-dark-bg2 rounded"
          >
            Twitter
          </button>
          <button
            onClick={() => handleShare("copy")}
            className="block w-full text-left px-4 py-2 hover:bg-gruvbox-light-bg2 dark:hover:bg-gruvbox-dark-bg2 rounded"
          >
            Copy Link
          </button>
        </div>
      )}
    </div>
  );
}
```

## Example 6: Wishlist Button with Tracking

**File**: `/client/web/app/_components/vibe/WishlistButton.tsx`

```tsx
"use client";

import { useState } from "react";
import { IconHeart } from "@tabler/icons-react";
import { useTrackWishlist } from "../../_hooks/useTrackInteraction"; // ADD THIS

interface WishlistButtonProps {
  vibeId: string;
  initialInWishlist: boolean;
}

export default function WishlistButton({
  vibeId,
  initialInWishlist,
}: WishlistButtonProps) {
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [loading, setLoading] = useState(false);

  // ADD THIS
  const trackWishlist = useTrackWishlist();

  const handleToggleWishlist = async () => {
    if (loading) return;

    setLoading(true);
    const newInWishlist = !inWishlist;

    // Optimistic update
    setInWishlist(newInWishlist);

    try {
      // ADD THIS - Track the interaction
      trackWishlist(vibeId, newInWishlist);

      // Existing API call
      const response = await fetch(`/api/wishlist`, {
        method: newInWishlist ? "POST" : "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibeId }),
      });

      if (!response.ok) {
        // Revert on error
        setInWishlist(!newInWishlist);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      setInWishlist(!newInWishlist);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={loading}
      className={`px-4 py-2 rounded-lg transition ${
        inWishlist
          ? "bg-gruvbox-yellow text-white"
          : "bg-gruvbox-light-bg2 dark:bg-gruvbox-dark-bg2"
      }`}
    >
      {inWishlist ? "In Wishlist" : "Add to Wishlist"}
    </button>
  );
}
```

## Example 7: Chat Button with Tracking

**File**: `/client/web/app/_components/vibe/ChatButton.tsx`

```tsx
"use client";

import { useRouter } from "next/navigation";
import { IconMessage } from "@tabler/icons-react";
import { useTrackChat } from "../../_hooks/useTrackInteraction"; // ADD THIS

interface ChatButtonProps {
  vibeId: string;
  sellerId: string;
}

export default function ChatButton({ vibeId, sellerId }: ChatButtonProps) {
  const router = useRouter();

  // ADD THIS
  const trackChat = useTrackChat();

  const handleStartChat = () => {
    // ADD THIS - Track the chat interaction
    trackChat(vibeId);

    // Existing navigation logic
    router.push(`/chat?userId=${sellerId}&vibeId=${vibeId}`);
  };

  return (
    <button
      onClick={handleStartChat}
      className="flex items-center gap-2 px-4 py-2 bg-gruvbox-blue-dark text-white rounded-lg hover:bg-gruvbox-blue-light transition"
    >
      <IconMessage size={20} />
      <span>Chat with Seller</span>
    </button>
  );
}
```

## Example 8: Navigation with Recommendations Link

**File**: `/client/web/app/_sections/navbar.tsx`

```tsx
"use client";

import Link from "next/link";
import {
  IconSparkles,
  IconHome,
  IconUpload,
  IconUser,
} from "@tabler/icons-react";

export default function Navbar() {
  return (
    <nav className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-gruvbox-orange">
              Old Vibes
            </Link>

            <div className="flex gap-4">
              <Link
                href="/feed"
                className="flex items-center gap-2 hover:text-gruvbox-orange transition"
              >
                <IconHome size={20} />
                <span>Feed</span>
              </Link>

              {/* ADD THIS */}
              <Link
                href="/recommendations"
                className="flex items-center gap-2 hover:text-gruvbox-orange transition"
              >
                <IconSparkles size={20} />
                <span>For You</span>
              </Link>

              <Link
                href="/upload"
                className="flex items-center gap-2 hover:text-gruvbox-orange transition"
              >
                <IconUpload size={20} />
                <span>Upload</span>
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-2 hover:text-gruvbox-orange transition"
              >
                <IconUser size={20} />
                <span>Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

## Testing the Integration

### 1. Check Network Tab

After adding tracking, open DevTools > Network tab and filter by "track". You should see POST requests to `/api/recommendations/track` when:

- Viewing a vibe
- Liking/unliking
- Commenting
- Sharing
- Adding to wishlist
- Starting a chat

### 2. Check Console

If tracking fails, it will log to console but NOT break the UI:

```
Failed to track interaction: [error message]
```

### 3. Verify Data

Check the backend interaction collection:

```bash
# In server directory
bun run scripts/check-interactions.ts  # Create this if needed
```

Or query MongoDB directly:

```javascript
db.interactions
  .find({ userId: "YOUR_USER_ID" })
  .sort({ timestamp: -1 })
  .limit(10);
```

### 4. Test Recommendations

After generating interactions:

1. Go to `/recommendations`
2. You should see personalized vibes
3. Filter by category/price
4. Check that scores and reasons are displayed

## Common Issues

### Issue: "Property 'token' does not exist"

**Solution**: Web app uses cookies, not tokens. Use `credentials: 'include'` in fetch.

### Issue: Tracking not working

**Check**:

- User is authenticated (`isAuthenticated` is true)
- Network tab shows POST requests
- Backend server is running
- API endpoint is correct

### Issue: Recommendations empty

**Possible causes**:

- No interactions yet (need at least a few)
- No approved vibes in database
- User location not set
- Backend recommendation job not running

### Issue: Admin panel not showing pending vibes

**Check**:

- User role is 'staff' or 'admin'
- Backend server running
- MongoDB has vibes with status: 'pending'
- API endpoint `/vibes/pending` accessible

## Performance Tips

1. **Debounce tracking**: For view tracking, use debounce to avoid too many requests
2. **Batch interactions**: Consider batching multiple interactions into one request
3. **Cache recommendations**: Cache client-side for 5-10 minutes
4. **Lazy load images**: Use Next.js Image component with priority={false}
5. **Infinite scroll**: Implement pagination for long lists

## Next Steps

After integrating tracking:

1. Monitor interaction data in MongoDB
2. Check recommendation quality
3. Adjust scoring weights if needed (backend)
4. Add more metadata to track (scroll depth, time on page, etc.)
5. Create analytics dashboard for admins

---

**Remember**: All tracking is optional and silent. If it fails, the user experience continues uninterrupted!
