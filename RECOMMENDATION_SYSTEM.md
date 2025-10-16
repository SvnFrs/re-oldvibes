# 🎯 Recommendation System Documentation

## Overview

The Old Vibes recommendation system provides **personalized vibe recommendations** using a hybrid algorithm that combines:

- **Location-based filtering** (30% weight)
- **Content-based filtering** (25% weight)
- **Collaborative filtering** (20% weight)
- **Behavioral analysis** (15% weight)
- **Social signals** (10% weight)

**Performance Targets:**

- Response time: <100ms (with Redis caching)
- Accuracy: High relevance through weighted scoring
- Scalability: Background jobs for heavy computation

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Request                          │
│              GET /api/recommendations?limit=20              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Recommendation Controller                       │
│          (recommendation.controllers.ts)                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│           Recommendation Service Layer                       │
│         (recommendation.services.ts)                         │
├─────────────────────┬───────────────────────────────────────┤
│  1. Check Redis Cache (15min TTL)                           │
│  2. If miss: Fetch user data + interactions                 │
│  3. Build user preferences from history                     │
│  4. Get candidate vibes (top 200 by engagement)             │
│  5. Score each vibe (5 components)                          │
│  6. Rank and paginate results                               │
│  7. Store in Redis cache                                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Scoring Components                          │
├──────────────────────┬──────────────────────────────────────┤
│ Location Score (30%) │ Haversine distance with exp decay    │
│ Content Score (25%)  │ Jaccard similarity on tags           │
│ Collaborative (20%)  │ Similar user patterns                │
│ Behavioral (15%)     │ Engagement + time decay              │
│ Social Score (10%)   │ Following network activity           │
└──────────────────────┴──────────────────────────────────────┘
```

---

## 🛠️ Components

### 1. **Schemas**

#### Interaction Schema (`schema/interaction.schema.ts`)

Tracks all user interactions with vibes:

```typescript
{
  userId: ObjectId,
  vibeId: ObjectId,
  interactionType: "view" | "like" | "comment" | "share" | "wishlist" | "chat" | "offer",
  duration?: number,  // For views
  metadata: {
    tags: string[],
    category: string,
    condition: string,
    price: number
  },
  timestamp: Date
}
```

**Indexes:**

- `(userId, interactionType, timestamp)` - User history queries
- `(vibeId, interactionType)` - Vibe statistics
- **TTL Index**: Auto-delete after 90 days

#### User Schema Updates

Added recommendation fields:

```typescript
{
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  locationEnabled: boolean,
  preferences: {
    tags: string[],
    categories: string[],
    conditions: string[]
  }
}
```

**New Index:** `2dsphere` on `location` for geospatial queries

#### Vibe Schema Updates

Added tracking fields:

```typescript
{
  locationData: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  engagementScore: number  // Cached for performance
}
```

**New Indexes:**

- `2dsphere` on `locationData`
- `(status, engagementScore)` - Sorted queries
- `(category, status)` - Filtered queries
- `(tags, status)` - Tag-based queries

---

### 2. **Services**

#### Recommendation Service (`services/recommendation.services.ts`)

**Main Methods:**

##### `getRecommendations(userId, filters)`

Returns personalized recommendations with scores and reasons.

**Filters:**

- `category?: string`
- `priceRange?: { min, max }`
- `minScore?: number`
- `limit?: number` (default: 20)
- `offset?: number` (default: 0)
- `excludeVibeIds?: string[]`

**Response:**

```typescript
{
  vibes: [{
    _id: string,
    itemName: string,
    price: number,
    category: string,
    tags: string[],
    score: number,  // 0-1
    reasons: string[]  // ["Very close to you", "Tags: vintage, retro"]
  }],
  metadata: {
    totalResults: number,
    hasMore: boolean,
    cacheHit: boolean,
    computedAt: Date
  }
}
```

##### `trackInteraction(data)`

Async tracking of user interactions. Invalidates user's cache.

**Usage:**

```typescript
await recommendationService.trackInteraction({
  userId: "...",
  vibeId: "...",
  interactionType: "like",
  duration: 30,
  metadata: {},
});
```

**Scoring Algorithm Details:**

1. **Location Score (30%)**

   - Formula: `e^(-distance/10km)`
   - 5km away = 0.61 score
   - 10km away = 0.37 score
   - 20km away = 0.14 score
   - Neutral (0.5) if no location data

2. **Content Score (25%)**

   - **Jaccard Similarity**: `intersection(tags) / union(tags)`
   - **Category preference**: Weighted by interaction frequency
   - **Condition preference**: Weighted by interaction frequency
   - Max contributions: tags (50%), category (30%), condition (20%)

3. **Collaborative Score (20%)**

   - Find users who liked this vibe
   - Calculate overlap with current user's liked items
   - Normalize by overlap count (max 5 similar users)

4. **Behavioral Score (15%)**

   - **Engagement**: Pre-computed score / 100 (60%)
   - **Recency**: `e^(-age_in_hours/12)` (40%)
   - Trending items get boosted

5. **Social Score (10%)**
   - Check if followed users interacted
   - Normalize by interaction count (max 3)

---

#### Interaction Service (`services/interaction.services.ts`)

**Main Methods:**

##### `trackInteraction(data)`

Records interaction + updates engagement score asynchronously.

##### `getUserInteractions(userId, options)`

Get user's interaction history with pagination.

##### `getVibeStats(vibeId)`

Returns:

```typescript
{
  views: number,
  likes: number,
  comments: number,
  shares: number,
  wishlists: number,
  offers: number,
  uniqueUsers: number
}
```

##### `getTrendingVibes(limit)`

Returns vibes with high recent activity (24h window).

**Engagement Weights:**

- View: 1 point
- Like: 5 points
- Comment: 8 points
- Share: 10 points
- Wishlist: 12 points
- Chat: 7 points
- Offer: 15 points

---

### 3. **Controllers** (`controllers/recommendation.controllers.ts`)

**Endpoints:**

| Method | Endpoint                        | Auth        | Description                      |
| ------ | ------------------------------- | ----------- | -------------------------------- |
| GET    | `/api/recommendations`          | ✅ Required | Get personalized recommendations |
| POST   | `/api/interactions/track`       | ✅ Required | Track user interaction           |
| GET    | `/api/interactions/history`     | ✅ Required | Get interaction history          |
| GET    | `/api/recommendations/trending` | ❌ Public   | Get trending vibes               |
| GET    | `/api/vibes/:vibeId/stats`      | ❌ Public   | Get vibe statistics              |

---

### 4. **Background Jobs** (`job/recommendation.job.ts`)

#### Engagement Score Job

- **Schedule**: Every 15 minutes
- **Purpose**: Update `engagementScore` for all active vibes
- **Process**:
  1. Fetch all approved, non-expired vibes
  2. Aggregate interactions with weights
  3. Bulk update `engagementScore` field
  4. Process in batches of 100

#### Preference Update Job

- **Schedule**: Every hour
- **Purpose**: Update user preference profiles
- **Process**:
  1. Find users with interactions in last 7 days
  2. Aggregate top tags/categories by weighted score
  3. Update `preferences` field
  4. Store top 20 tags, top 10 categories

---

## 🚀 Usage Examples

### Frontend Integration

#### 1. Get Recommendations

```typescript
// Fetch personalized recommendations
const response = await fetch(
  "/api/recommendations?limit=20&category=electronics",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

const data = await response.json();
// data.vibes = [{ _id, itemName, score, reasons, ... }]
// data.metadata = { totalResults, hasMore, cacheHit }
```

#### 2. Track User Interaction

```typescript
// Track when user views a vibe
await fetch("/api/interactions/track", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    vibeId: "...",
    interactionType: "view",
    duration: 30, // seconds
  }),
});
// Response: 202 Accepted (fire and forget)
```

#### 3. Get Trending Vibes

```typescript
// Public endpoint - no auth required
const response = await fetch("/api/recommendations/trending?limit=10");
const data = await response.json();
// data.vibes = [{ ..., trendingScore, trendingUsers }]
```

#### 4. Enable User Location

```typescript
// Update user profile with location
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(async (position) => {
    await fetch("/api/users/profile", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        location: {
          type: "Point",
          coordinates: [position.coords.longitude, position.coords.latitude],
        },
        locationEnabled: true,
      }),
    });
  });
}
```

---

## ⚡ Performance Optimization

### Redis Caching Strategy

**3-Layer Cache:**

1. **L1: Full Recommendations** (`recommendations:{userId}:{filters}`)

   - TTL: 15 minutes
   - Stores complete recommendation results
   - Invalidated on user interaction

2. **L2: User Preference Summaries** (Future)

   - TTL: 1 hour
   - Stores aggregated user preferences
   - Reduces database queries

3. **L3: Tag/Category Rankings** (Future)
   - TTL: 1 hour
   - Global trending tags/categories
   - Shared across all users

### Database Indexes

**Critical Indexes:**

- **User location**: `2dsphere` for proximity queries
- **Vibe location**: `2dsphere` for geospatial search
- **Engagement sorting**: `(status, engagementScore DESC)`
- **Category filtering**: `(category, status)`
- **Tag search**: `(tags, status)`
- **Interaction lookup**: `(userId, type, timestamp DESC)`

### Query Optimization

1. **Limit candidate pool**: Max 200 vibes (sorted by engagement)
2. **Batch processing**: Process scoring in parallel
3. **Pre-computed scores**: Engagement score cached in vibe document
4. **Async tracking**: Fire-and-forget interaction recording
5. **Background jobs**: Heavy computation moved to cron jobs

---

## 📈 Monitoring & Metrics

### Key Metrics to Track

1. **Performance:**

   - Average response time
   - Cache hit rate
   - Database query time
   - Job execution time

2. **Quality:**

   - Click-through rate (CTR)
   - Conversion rate (offers/purchases)
   - Dwell time per recommendation
   - User feedback (implicit)

3. **System Health:**
   - Job success rate
   - Error rate
   - Queue depth
   - Memory usage

### Logging

```typescript
// Example log output
🔄 Running engagement score update job...
📊 Processing 1,234 active vibes...
✅ Engagement score update complete. Updated 1,234 vibes.

🔄 Running user preference update job...
👥 Processing 456 active users...
✅ Preference update complete. Updated 456 user profiles.
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Recommendation Settings
RECOMMENDATION_CACHE_TTL=900  # 15 minutes
RECOMMENDATION_CANDIDATE_LIMIT=200
RECOMMENDATION_DEFAULT_LIMIT=20
```

### Tuning Weights

Adjust in `recommendation.services.ts`:

```typescript
private readonly WEIGHTS = {
  location: 0.3,      // 30% - Proximity importance
  content: 0.25,      // 25% - Tag/category matching
  collaborative: 0.2, // 20% - Similar user patterns
  behavioral: 0.15,   // 15% - Engagement & recency
  social: 0.1         // 10% - Following network
};
```

---

## 🧪 Testing

### Manual Testing

```bash
# 1. Track an interaction
curl -X POST http://localhost:4000/api/interactions/track \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vibeId": "...",
    "interactionType": "like"
  }'

# 2. Get recommendations
curl http://localhost:4000/api/recommendations?limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Get trending vibes
curl http://localhost:4000/api/recommendations/trending?limit=5
```

### Integration Tests (TODO)

```typescript
// Test recommendation quality
describe("Recommendation System", () => {
  it("should return higher scores for nearby vibes", async () => {
    // Create user at location A
    // Create vibes at locations B (near) and C (far)
    // Assert: Vibe B score > Vibe C score
  });

  it("should recommend vibes with similar tags", async () => {
    // User likes tags: ['vintage', 'retro']
    // Create vibes with various tags
    // Assert: Vibes with matching tags rank higher
  });
});
```

---

## 🚧 Future Enhancements

### Phase 1: Current Implementation ✅

- [x] Interaction tracking
- [x] Location-based filtering
- [x] Content-based filtering
- [x] Collaborative filtering
- [x] Behavioral analysis
- [x] Social signals
- [x] Redis caching
- [x] Background jobs

### Phase 2: Planned

- [ ] A/B testing framework
- [ ] User feedback collection ("Was this helpful?")
- [ ] Diversity score (avoid echo chamber)
- [ ] Freshness boost (new users/items)
- [ ] Seasonal/temporal patterns
- [ ] Price sensitivity scoring
- [ ] Multi-armed bandit exploration

### Phase 3: Advanced

- [ ] Deep learning embeddings (PyTorch)
- [ ] Image similarity (CV models)
- [ ] Real-time model updates
- [ ] Personalized weight tuning
- [ ] Cross-device tracking
- [ ] Explanation API (XAI)

---

## 🔍 Troubleshooting

### Issue: Low recommendation quality

**Symptoms:** Users getting irrelevant recommendations

**Solutions:**

1. Check interaction data: `db.interactions.countDocuments({ userId: '...' })`
2. Verify user preferences populated: Check `User.preferences` field
3. Adjust scoring weights in service
4. Increase candidate pool size (default: 200)
5. Check engagement scores are being updated by cron job

### Issue: Slow response times

**Symptoms:** Recommendations take >500ms

**Solutions:**

1. Check Redis cache hit rate
2. Verify indexes exist: `db.vibes.getIndexes()`
3. Reduce candidate pool size
4. Add more aggressive caching
5. Profile slow queries with MongoDB slow query log

### Issue: Cache not invalidating

**Symptoms:** Stale recommendations after interactions

**Solutions:**

1. Verify Redis connection: `redis.ping()`
2. Check cache key pattern: `recommendations:{userId}:*`
3. Ensure `trackInteraction` calls `invalidateUserCache`
4. Manually flush: `redis.del('recommendations:...')`

---

## 📚 References

- **Hybrid Recommender Systems**: [Wikipedia](https://en.wikipedia.org/wiki/Recommender_system#Hybrid_recommender_systems)
- **Collaborative Filtering**: User-based similarity scoring
- **Content-Based Filtering**: Jaccard similarity for tags
- **Haversine Formula**: Great-circle distance calculation
- **MongoDB Geospatial Queries**: [Docs](https://www.mongodb.com/docs/manual/geospatial-queries/)
- **Redis Caching Patterns**: [Best Practices](https://redis.io/docs/manual/patterns/)

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Status:** ✅ Production Ready (Backend Complete)
