# Guest User Screen Flow

## 🎯 Overview
This document outlines the complete user journey for guests (unauthenticated users) in the Old Vibes marketplace application.

## 📱 Screen Flow Diagram

```
┌─────────────────┐
│   Homepage      │ ← Landing page with marketplace layout
│   (Marketplace) │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   Browse Vibes  │ ← View latest vibes, categories
│   (No Auth)     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   Search Page   │ ← Search and filter vibes
│   (No Auth)     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   Feed Page     │ ← Facebook-like feed view
│   (No Auth)     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   About Page    │ ← Learn about the platform
│   (No Auth)     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   Auth Required │ ← Login/Signup prompts
│   (Interactions)│
└─────────────────┘
```

## 🔄 Detailed User Journey

### 1. **Homepage (Marketplace)**
**URL:** `/`
**Access:** Public (No authentication required)

**Features Available:**
- ✅ View hero banner with search box
- ✅ Browse categories with Tabler icons
- ✅ View latest vibes (12 items)
- ✅ Search functionality (redirects to search page)
- ✅ Navigation to other pages

**Restrictions:**
- ❌ Cannot like vibes
- ❌ Cannot comment on vibes
- ❌ Cannot view full vibe details
- ❌ Cannot create new vibes

**UI Elements:**
- Header with logo and navigation
- Search box in hero section
- Category grid (Electronics, Fashion, Books, etc.)
- Vibe cards with images, prices, conditions
- Call-to-action buttons

### 2. **Search Page**
**URL:** `/search`
**Access:** Public (No authentication required)

**Features Available:**
- ✅ Search vibes by text query
- ✅ Filter by category, condition, price range
- ✅ View search results as cards
- ✅ Sort and paginate results

**Restrictions:**
- ❌ Cannot like search results
- ❌ Cannot comment on results
- ❌ Cannot view detailed vibe pages

**UI Elements:**
- Search form with filters
- Results grid
- Filter sidebar
- Pagination controls

### 3. **Feed Page**
**URL:** `/feed`
**Access:** Public (No authentication required)

**Features Available:**
- ✅ View Facebook-like feed of vibes
- ✅ See full vibe descriptions
- ✅ View comments (read-only)
- ✅ Browse through feed pagination

**Restrictions:**
- ❌ Cannot like vibes
- ❌ Cannot add comments
- ❌ Cannot interact with other users

**UI Elements:**
- Feed layout with full vibe cards
- Comment sections (read-only)
- Like buttons (disabled)
- Share buttons (disabled)

### 4. **About Page**
**URL:** `/about`
**Access:** Public (No authentication required)

**Features Available:**
- ✅ Learn about the platform
- ✅ View features and benefits
- ✅ See community statistics
- ✅ FAQ section

**UI Elements:**
- Hero section
- Features grid
- Community stats
- FAQ accordion
- Call-to-action sections

## 🔐 Authentication Prompts

### When Guest Tries to Interact:

#### **Like a Vibe**
```
┌─────────────────────────┐
│   Login Required        │
│                         │
│   To like this vibe,    │
│   please login first.   │
│                         │
│   [Login] [Sign Up]     │
└─────────────────────────┘
```

#### **Comment on Vibe**
```
┌─────────────────────────┐
│   Login Required        │
│                         │
│   To comment on vibes,  │
│   please login first.   │
│                         │
│   [Login] [Sign Up]     │
└─────────────────────────┘
```

#### **View Full Vibe Details**
```
┌─────────────────────────┐
│   Login Required        │
│                         │
│   To view full details, │
│   please login first.   │
│                         │
│   [Login] [Sign Up]     │
└─────────────────────────┘
```

#### **Create New Vibe**
```
┌─────────────────────────┐
│   Login Required        │
│                         │
│   To create vibes,      │
│   please login first.   │
│                         │
│   [Login] [Sign Up]     │
└─────────────────────────┘
```

## 🎨 UI/UX Guidelines

### **Visual Indicators for Guest Users:**
- Disabled buttons with tooltips
- "Login to interact" messages
- Subtle visual cues for restricted actions
- Consistent Gruvbox theme throughout

### **Navigation Behavior:**
- All main navigation items accessible
- Login/Signup buttons prominently displayed
- Clear path to authentication
- No broken links or 404 errors

### **Performance Considerations:**
- Fast loading for public pages
- Optimized images and assets
- Efficient API calls for public data
- Cached static content

## 🔧 Technical Implementation

### **Authentication State:**
```typescript
// Guest user state
const { isAuthenticated, user } = useAuth();
const isGuest = !isAuthenticated;

// Conditional rendering
{isGuest ? (
  <GuestPrompt />
) : (
  <InteractiveElements />
)}
```

### **API Calls:**
```typescript
// Public endpoints (no auth required)
GET /api/vibes          // List approved vibes
GET /api/vibes/search   // Search vibes
GET /api/vibes/trending // Trending vibes

// Protected endpoints (auth required)
POST /api/vibes/:id/like    // Like vibe
POST /api/vibes/:id/comment // Add comment
GET /api/vibes/:id          // Full vibe details
```

### **Route Protection:**
```typescript
// Public routes
export const publicRoutes = [
  '/',
  '/search',
  '/feed',
  '/about',
  '/auth/login',
  '/auth/signup'
];

// Protected routes
export const protectedRoutes = [
  '/vibes/:id',
  '/profile',
  '/settings'
];
```

## 📊 Analytics & Tracking

### **Guest User Metrics:**
- Page views and session duration
- Search queries and filters used
- Click-through rates on vibe cards
- Conversion to authenticated users
- Most popular categories and vibes

### **Conversion Funnel:**
1. **Landing** → Homepage views
2. **Interest** → Vibe card clicks
3. **Engagement** → Search usage
4. **Intent** → Login/Signup clicks
5. **Conversion** → Account creation

## 🚀 Future Enhancements

### **Guest Features to Add:**
- Guest wishlist (localStorage)
- Share vibes via social media
- Guest notifications for price drops
- Guest email alerts for new items
- Guest feedback forms

### **Improved Onboarding:**
- Interactive product tours
- Progressive disclosure of features
- Social proof and testimonials
- Clear value propositions

---

## 🎯 Key Success Metrics

- **Engagement:** Time spent on site
- **Conversion:** Guest → Registered user rate
- **Discovery:** Search and filter usage
- **Retention:** Return visits from guests
- **Satisfaction:** User feedback and ratings

This guest user flow ensures a smooth, engaging experience while encouraging registration for full platform access.
