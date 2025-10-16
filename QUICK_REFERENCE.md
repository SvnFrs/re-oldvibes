# 🚀 Quick Reference - Web Frontend Integration

## 1-Minute Setup

### Add Recommendations to Navigation

```tsx
// app/_sections/navbar.tsx
import { IconSparkles } from "@tabler/icons-react";

<Link href="/recommendations">
  <IconSparkles size={20} />
  <span>For You</span>
</Link>;
```

### Add Trending Widget to Sidebar

```tsx
// app/feed/page.tsx
import TrendingVibes from "../_components/recommendations/TrendingVibes";

<aside>
  <TrendingVibes limit={5} />
</aside>;
```

### Track User Interactions

```tsx
// Any component
import { useTrackLike } from "../_hooks/useTrackInteraction";

const trackLike = useTrackLike();

const handleLike = () => {
  trackLike(vibeId, true);
  // ... your existing code
};
```

---

## 📁 File Locations

### Components

```
app/_components/
├── recommendations/
│   ├── RecommendationFeed.tsx    → Main feed
│   └── TrendingVibes.tsx         → Sidebar widget
└── admin/
    └── PendingVibesPanel.tsx     → Admin moderation
```

### API Clients

```
app/_apis/common/
├── recommendations.ts    → 5 recommendation functions
└── admin.ts             → 6 admin functions
```

### Hooks

```
app/_hooks/
└── useTrackInteraction.ts    → 8 tracking hooks
```

### Pages

```
app/
└── recommendations/
    └── page.tsx    → Recommendations page
```

---

## 🎣 Hook Usage

### Track View

```tsx
import { useTrackView } from "../_hooks/useTrackInteraction";

const { start, stop } = useTrackView(vibeId);

useEffect(() => {
  start();
  return () => stop();
}, []);
```

### Track Like

```tsx
import { useTrackLike } from "../_hooks/useTrackInteraction";

const trackLike = useTrackLike();
trackLike(vibeId, true); // liked
trackLike(vibeId, false); // unliked
```

### Track Comment

```tsx
import { useTrackComment } from "../_hooks/useTrackInteraction";

const trackComment = useTrackComment();
trackComment(vibeId, comment.length);
```

### Track Share

```tsx
import { useTrackShare } from "../_hooks/useTrackInteraction";

const trackShare = useTrackShare();
trackShare(vibeId, "facebook");
```

### Track Wishlist

```tsx
import { useTrackWishlist } from "../_hooks/useTrackInteraction";

const trackWishlist = useTrackWishlist();
trackWishlist(vibeId, true); // added
trackWishlist(vibeId, false); // removed
```

### Track Chat

```tsx
import { useTrackChat } from "../_hooks/useTrackInteraction";

const trackChat = useTrackChat();
trackChat(vibeId);
```

### Track Offer

```tsx
import { useTrackOffer } from "../_hooks/useTrackInteraction";

const trackOffer = useTrackOffer();
trackOffer(vibeId, offerAmount);
```

---

## 🔌 API Functions

### Recommendations

```tsx
import {
  getRecommendations,
  trackInteraction,
  getInteractionHistory,
  getTrendingVibes,
  getVibeStats,
} from "../_apis/common/recommendations";

// Get recommendations
const data = await getRecommendations(token, {
  category: "electronics",
  minPrice: 100,
  maxPrice: 500,
  minScore: 0.5,
  limit: 20,
});

// Get trending
const trending = await getTrendingVibes(10);

// Get stats
const stats = await getVibeStats(vibeId);
```

### Admin

```tsx
import {
  getPendingVibes,
  moderateVibe,
  deleteVibe,
  getAllUsers,
  banUser,
  unbanUser,
} from "../_apis/common/admin";

// Get pending vibes
const { vibes } = await getPendingVibes(token);

// Moderate
await moderateVibe(token, vibeId, {
  action: "approve",
  notes: "Looks good!",
});

// Delete
await deleteVibe(token, vibeId);
```

---

## 🎨 Component Props

### RecommendationFeed

```tsx
<RecommendationFeed
  limit={20} // Number of vibes
  showFilters={true} // Show filter panel
/>
```

### TrendingVibes

```tsx
<TrendingVibes
  limit={5} // Number of trending vibes
/>
```

---

## 🌐 API Endpoints

### User Endpoints

- `GET /api/recommendations` - Personalized vibes
- `POST /api/recommendations/track` - Track interaction
- `GET /api/recommendations/history` - Interaction history
- `GET /api/recommendations/trending` - Trending vibes
- `GET /api/recommendations/stats/:id` - Vibe statistics

### Admin Endpoints

- `GET /api/vibes/pending` - Pending vibes (Staff+)
- `PATCH /api/vibes/:id/moderate` - Approve/reject (Staff+)
- `DELETE /api/vibes/:id` - Delete vibe (Admin only)
- `GET /api/admin/users` - All users (Admin only)
- `PATCH /api/admin/users/:id/ban` - Ban user (Admin only)
- `PATCH /api/admin/users/:id/unban` - Unban user (Admin only)

---

## 🔑 Authentication

All API calls use cookie-based auth:

```tsx
fetch(url, {
  method: "GET",
  credentials: "include", // Important!
  headers: {
    "Content-Type": "application/json",
  },
});
```

---

## 🧪 Testing

### Check Network Tab

Filter by "track" to see interaction tracking:

- `POST /api/recommendations/track`

### Check Console

Tracking errors are logged but don't break UI:

```
Failed to track interaction: [error]
```

### Test Flow

1. Sign in as user
2. Go to `/recommendations`
3. View vibes (check network for track POST)
4. Apply filters
5. Click vibe (view tracked)

### Admin Flow

1. Sign in as admin/staff
2. Go to `/admin/panel`
3. Click "Vibe Moderation" tab
4. Review pending vibes
5. Approve/reject

---

## 🐛 Troubleshooting

### "No recommendations"

- Generate some interactions first
- Check backend is running
- Verify approved vibes exist

### "Tracking not working"

- Check user is authenticated
- Check API_BASE environment variable
- Verify backend `/recommendations/track` endpoint

### "Admin shows empty"

- Check user role (staff/admin)
- Create vibes with status: 'pending'
- Check backend `/vibes/pending` endpoint

### TypeScript Errors

- All files should compile ✅
- Check import paths
- Ensure types are defined

---

## ⚙️ Environment

```bash
# client/web/.env.local
NEXT_PUBLIC_API_ENDPOINT=http://localhost:4000/api
```

---

## 📚 Full Documentation

- **Architecture**: `WEB_FRONTEND_INTEGRATION.md`
- **Examples**: `INTEGRATION_EXAMPLES.md`
- **Summary**: `FRONTEND_INTEGRATION_COMPLETE.md`
- **Diagram**: `WEB_FRONTEND_ARCHITECTURE.puml`

---

## 🎯 Integration Priority

### ⚡ 5 Minutes

1. Add TrendingVibes to feed
2. Test rendering

### 🚀 30 Minutes

1. Add useTrackView to vibe detail
2. Add useTrackLike to like button
3. Test tracking in network tab

### 🏗️ 1 Hour

1. Add all tracking hooks
2. Add recommendations to nav
3. Test full flow

### 🎨 2 Hours

1. Integrate admin panel
2. Polish UI
3. Mobile testing

---

## 💡 Pro Tips

1. **Silent Tracking**: All hooks fail gracefully
2. **Batch Updates**: Consider debouncing track calls
3. **Cache**: Recommendations cached 15 min server-side
4. **Mobile First**: Components are responsive by default
5. **Dark Mode**: Full support included

---

## 🎉 You're Ready!

All components are production-ready:

- ✅ Zero TypeScript errors
- ✅ Professional UI
- ✅ Full documentation
- ✅ Copy-paste examples

Start with the 5-minute integration and expand from there!

---

**Questions?** Check the full documentation files for detailed guides.

**Happy Coding! 🚀**
