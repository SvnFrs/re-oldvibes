# Vibe Systems - Use Case Description

## 📋 Tổng quan hệ thống

Hệ thống Old Vibes bao gồm 3 module chính:
1. **Recommendation System** - Hệ thống gợi ý vibe cá nhân hóa
2. **Pending Vibe System** - Quản lý vibe chờ duyệt
3. **Moderation System** - Hệ thống kiểm duyệt vibe

---

## 1. 🎯 RECOMMENDATION SYSTEM

### UC-001: Get Personalized Vibe Recommendations

**Actor:** Authenticated User  
**Precondition:** 
- User đã đăng nhập và có JWT token hợp lệ
- User có ít nhất một interaction history

**Main Flow:**
1. User gửi request recommendations qua Client interface
2. Client gửi GET request tới `/api/recommendations` với filters (limit, category, price range)
3. Router xử lý request và gọi Auth middleware
4. Auth middleware verify JWT token và xác thực user
5. Router chuyển request tới Recommendation Controller
6. Controller extract userId từ req.user và build filters từ query params
7. Controller gọi Recommendation Service với userId và filters
8. Service check Redis cache cho user recommendations (TTL 15 phút)
9. Nếu cache miss:
    - Service gọi User Model để lấy user profile và preferences
    - Service gọi Interaction Model để lấy interaction history
    - Service build user preferences từ interaction patterns
    - Service gọi Vibe Model để lấy candidate vibes (top 200 by engagement)
    - Service tính toán recommendation scores cho từng vibe:
        - Location Score (30%): Khoảng cách địa lý với exponential decay
        - Content Score (25%): Jaccard similarity trên tags, category preferences
        - Collaborative Score (20%): Similar user interaction patterns
        - Behavioral Score (15%): Engagement score + recency decay
        - Social Score (10%): Followed users' activity
    - Service rank vibes theo total score và apply pagination
    - Service generate recommendation reasons
    - Service store results vào Redis cache với TTL 15 phút
10. Nếu cache hit: Service sử dụng cached recommendations và apply additional filters nếu cần
11. Service trả về RecommendationResult với vibes và metadata
12. Controller gửi response qua Router tới Client
13. Client hiển thị personalized vibes với scores cho User

**Alternative Flows:**
- **3a.** Nếu user chưa đăng nhập: Trả về HTTP 401 Unauthorized
- **9a.** Nếu không có interaction history: Trả về trending vibes thay vì personalized
- **9b.** Nếu không có candidate vibes: Trả về empty result với explanation

**Postcondition:** User nhận được danh sách vibe recommendations được cá nhân hóa

---

### UC-002: Track User Interaction

**Actor:** Authenticated User  
**Precondition:** User đang xem/tương tác với một vibe

**Main Flow:**
1. User thực hiện interaction (view, like, comment, share, wishlist, chat, offer)
2. Client gửi POST request tới `/api/recommendations/interactions/track`
3. Router xử lý request và gọi Auth middleware
4. Auth middleware verify JWT token
5. Router chuyển request tới Recommendation Controller
6. Controller validate interaction type và vibe existence
7. Controller gọi Interaction Service để track interaction
8. Service record interaction trong database với metadata
9. Service update vibe engagement score asynchronously
10. Service invalidate user's recommendation cache
11. Controller trả về success response immediately (fire-and-forget)

**Postcondition:** Interaction được track và ảnh hưởng tới future recommendations

---

## 2. ⏳ PENDING VIBE SYSTEM

### UC-003: Create New Vibe (Pending Status)

**Actor:** Authenticated User  
**Precondition:** 
- User đã verify email và đăng nhập
- User có đủ thông tin để tạo vibe

**Main Flow:**
1. User submit vibe creation form với required data
2. Client gửi POST request tới `/api/vibes` với vibeData
3. Router xử lý request và gọi Auth middleware
4. Auth middleware verify JWT token
5. Router chuyển request tới Vibe Controller
6. Controller extract userId từ req.user
7. Controller validate vibe data (required fields, price > 0, maxlength, etc.)
8. Controller gọi Vibe Model để create vibe
9. Model set status = "pending"
10. Model set expiresAt = now + 24 hours
11. Model tạo vibe document trong Database
12. Database validate schema (itemName, description, price, category, condition)
13. Database save vibe với pending status
14. Database trả về created vibe
15. Model trả về new vibe với pending status
16. Controller gửi response qua Router tới Client
17. Client hiển thị "Vibe submitted for review" message cho User

**Alternative Flows:**
- **7a.** Nếu validation fails: Trả về error với specific field issues
- **10a.** Nếu user có premium account: Extend expiry tới 48 hours

**Postcondition:** Vibe được tạo với status "pending", chờ staff moderation

---

### UC-004: View Pending Vibes (Staff)

**Actor:** Staff/Admin User  
**Precondition:** Staff đã đăng nhập với role "staff" hoặc "admin"

**Main Flow:**
1. Staff access moderation interface (web/mobile)
2. Client gửi GET request tới `/api/vibes/pending`
3. Router xử lý request và gọi Auth middleware
4. Auth middleware verify JWT token và check staff role
5. Router chuyển request tới Vibe Controller
6. Controller validate staff authentication
7. Controller gọi Vibe Model để getPendingVibes()
8. Model query Database cho vibes với status = "pending"
9. Database sort by createdAt (oldest first for fairness)
10. Database populate user information (username, name, profilePicture)
11. Database trả về pending vibes với user details
12. Model format và trả về pending vibes list
13. Controller gửi response qua Router tới Client
14. Client hiển thị pending vibes list với user info cho Staff

**Postcondition:** Staff có thể thấy tất cả pending vibes cần moderation

---

## 3. 👮 MODERATION SYSTEM

### UC-005: Approve Vibe

**Actor:** Staff/Admin User  
**Precondition:** Vibe tồn tại với status "pending"

**Main Flow:**
1. Staff review vibe details (item info, media, user profile)
2. Staff determine vibe meets platform guidelines
3. Staff select "approve" action với optional notes
4. Client gửi PATCH request tới `/api/vibes/{vibeId}/moderate`
5. Router xử lý request và gọi Auth middleware
6. Auth middleware verify JWT token và check staff role
7. Router chuyển request tới Vibe Controller
8. Controller extract vibeId từ params
9. Controller extract staffId từ req.user
10. Controller validate action ("approve" hoặc "reject")
11. Controller extract notes từ request body
12. Controller gọi Vibe Model để moderateVibe()
13. Model gọi Database để FindAndUpdate vibe với new status
14. Database update status = "approved"
15. Database set moderatedBy = staffId
16. Database set moderationNotes = notes
17. Database update updatedAt timestamp
18. Database trả về updated vibe
19. Model trả về moderated vibe result
20. Controller gọi Notification Service để notify vibe owner
21. Controller gửi response qua Router tới Client
22. Client hiển thị moderation success message cho Staff
23. Client remove moderated vibe từ pending list
24. Client update pending count

**Alternative Flows:**
- **2a.** Nếu vibe cần minor edits: Staff add notes cho user để resubmit
- **20a.** Nếu notification fails: Log error nhưng vẫn continue process

**Postcondition:** Vibe được approve và visible tới other users

---

### UC-006: Reject Vibe

**Actor:** Staff/Admin User  
**Precondition:** Vibe tồn tại với status "pending"

**Main Flow:**
1. Staff review vibe details
2. Staff determine vibe violates guidelines hoặc inappropriate
3. Staff select "reject" action với required reason notes
4. Client gửi PATCH request tới `/api/vibes/{vibeId}/moderate`
5. Router xử lý request và gọi Auth middleware
6. Auth middleware verify JWT token và check staff role
7. Router chuyển request tới Vibe Controller
8. Controller extract vibeId từ params
9. Controller extract staffId từ req.user
10. Controller validate action ("approve" hoặc "reject")
11. Controller extract notes từ request body
12. Controller gọi Vibe Model để moderateVibe()
13. Model gọi Database để FindAndUpdate vibe với new status
14. Database update status = "rejected"
15. Database set moderatedBy = staffId
16. Database set moderationNotes = notes
17. Database update updatedAt timestamp
18. Database trả về updated vibe
19. Model trả về moderated vibe result
20. Controller gọi Notification Service để notify vibe owner với rejection reason
21. Controller gửi response qua Router tới Client
22. Client hiển thị moderation success message cho Staff
23. Client remove moderated vibe từ pending list
24. Client update pending count

**Alternative Flows:**
- **3a.** Nếu không có rejection reason: Require staff để add notes
- **20a.** Nếu notification fails: Log error nhưng vẫn continue process

**Postcondition:** Vibe được reject và hidden từ platform

---

### UC-007: Automatic Vibe Expiry

**Actor:** System (Cron Job)  
**Precondition:** Vibe tồn tại với status "pending" và expiry time reached

**Main Flow:**
1. System chạy hourly cleanup job
2. System identify vibes past expiry time (24 hours)
3. System update expired vibes status tới "archived"
4. System log cleanup statistics

**Postcondition:** Expired vibes được automatically archived

---

## 4. 🔄 INTERACTION AND ANALYTICS

### UC-008: Update Engagement Scores

**Actor:** System (Background Job)  
**Precondition:** Vibes tồn tại với user interactions

**Main Flow:**
1. System chạy engagement update job mỗi 15 phút
2. System retrieve tất cả active vibes (approved, not expired)
3. System calculate engagement scores từ interaction history:
   - View: 1 point
   - Like: 5 points
   - Comment: 8 points
   - Share: 10 points
   - Wishlist: 12 points
   - Chat: 7 points
   - Offer: 15 points
4. System update vibe engagement scores trong batches
5. System log processing statistics

**Postcondition:** Vibe engagement scores được update cho recommendation algorithm

---

### UC-009: Update User Preferences

**Actor:** System (Background Job)  
**Precondition:** Users có interaction history

**Main Flow:**
1. System chạy preference update job mỗi hour
2. System identify users với recent interactions (last 7 days)
3. System analyze interaction patterns để build user preferences:
   - Extract preferred tags và categories
   - Weight preferences by interaction type
   - Limit tới top 20 tags và 10 categories
4. System update user preference profiles
5. System log processing statistics

**Postcondition:** User preference profiles được update cho better recommendations

---

## 5. 🚨 ERROR HANDLING AND EDGE CASES

### UC-010: Handle Recommendation Cache Failure

**Actor:** System  
**Precondition:** Redis cache unavailable

**Main Flow:**
1. System attempt để retrieve recommendations từ cache
2. Cache operation fails
3. System fall back tới real-time calculation
4. System return recommendations without caching
5. System log cache failure cho monitoring

**Postcondition:** Users vẫn receive recommendations despite cache failure

---

### UC-011: Handle Moderation Timeout

**Actor:** System  
**Precondition:** Vibe remains pending beyond 24 hours

**Main Flow:**
1. System detect expired pending vibes
2. System automatically archive vibes
3. System notify vibe owners của automatic archiving
4. System log moderation timeout statistics

**Postcondition:** No vibes remain trong pending state indefinitely

---

## 📊 BUSINESS RULES

### Recommendation System:
- Cache TTL: 15 phút
- Candidate vibes limit: 200
- Scoring weights: Location 30%, Content 25%, Collaborative 20%, Behavioral 15%, Social 10%
- Max recommendation reasons: 3

### Pending Vibe System:
- Default expiry: 24 hours
- Premium expiry: 48 hours
- Auto-archive after expiry
- FIFO moderation (oldest first)

### Moderation System:
- Required roles: "staff" hoặc "admin"
- Rejection requires reason notes
- Approval allows optional notes
- Notification sent to vibe owner
- Audit trail maintained

---

## 🔧 TECHNICAL CONSTRAINTS

### Performance:
- Recommendation response time: <100ms (with cache)
- Cache hit ratio target: >80%
- Background job processing: Batched operations
- Database queries: Optimized với proper indexing

### Security:
- JWT token validation required
- Role-based access control
- Input validation và sanitization
- Rate limiting cho API endpoints

### Scalability:
- Redis clustering cho cache
- Database sharding strategy
- Background job queue management
- CDN cho media files
