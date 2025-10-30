# Vibe Systems - Use Case Documentation (Standard Format)

---

## II.2.3.1 UC33_Get Personalized Recommendations

### a. Functionalities

**UC ID and Name:**  
UC33_Get Personalized Recommendations

**Created By:**  
System Analyst

**Date Created:**  
10/10/2025

**Primary Actor:**  
Authenticated Users

**Secondary Actors:**  
None

**Trigger:**  
The user requests personalized vibe recommendations

**Description:**  
As a user, I want to receive personalized vibe recommendations based on my preferences and interaction history so that I can discover relevant items that match my interests.

**Preconditions:**  
PRE-1: The user is logged in and authenticated  
PRE-2: The user has a valid JWT token  
PRE-3: The user has interaction history (views, likes, comments, etc.)

**Postconditions:**  
POST-1: Personalized recommendations are generated and returned  
POST-2: Recommendations are cached in Redis for 15 minutes  
POST-3: User receives vibes with recommendation scores and reasons  
POST-4: User interaction data is used to improve future recommendations

**Normal Flow:**  
1. User requests personalized recommendations via client interface  
2. Client sends GET request to `/api/recommendations` with filters  
3. System validates user authentication via JWT token  
4. System checks Redis cache for existing recommendations  
5. If cache miss, system fetches user profile and preferences  
6. System retrieves user interaction history from database  
7. System builds user preferences from interaction patterns  
8. System gets candidate vibes (top 200 by engagement score)  
9. System calculates recommendation scores for each vibe:
    - Location Score (30%): Geographic distance with exponential decay
    - Content Score (25%): Jaccard similarity on tags and categories
    - Collaborative Score (20%): Similar user interaction patterns
    - Behavioral Score (15%): Engagement score with recency decay
    - Social Score (10%): Followed users' activity  
10. System ranks vibes by total score and applies pagination  
11. System generates recommendation reasons for top results  
12. System stores results in Redis cache with 15-minute TTL  
13. System returns personalized recommendations with metadata  
14. Client displays recommendations with scores and reasons to user

**Alternative Flows:**  
AF-1: Cache hit scenario  
5. If cache hit, system uses cached recommendations  
6. System applies additional filters if needed  
7. Continue to step 13  

AF-2: No interaction history  
5. System returns trending vibes instead of personalized recommendations  
6. Continue to step 13  

AF-3: No candidate vibes found  
9. System returns empty result with explanation message  
10. Continue to step 13

**Exceptions:**  
EF-1: User not authenticated  
1. System returns HTTP 401 Unauthorized  

EF-2: Invalid JWT token  
1. System returns HTTP 401 Unauthorized  

EF-3: Cache service unavailable  
4. System falls back to real-time calculation without caching  

EF-4: Database connection error  
6. System returns HTTP 500 Internal Server Error  

EF-5: Invalid filter parameters  
2. System returns HTTP 400 Bad Request with validation errors

**Priority:**  
Must Have

**Frequency of Use:**  
High

**Business Rules:**  
BR31, BR32, BR33

**Other Information:**  
The recommendation system uses a hybrid algorithm combining multiple scoring factors. Cache TTL is set to 15 minutes to balance performance and data freshness. Maximum 200 candidate vibes are considered for performance optimization.

**Assumptions:**  
Users have sufficient interaction history to generate meaningful recommendations  
Redis cache is available for performance optimization  
Geographic data is available for location-based scoring

---

## II.2.3.2 UC34_Track User Interaction

### a. Functionalities

**UC ID and Name:**  
UC34_Track User Interaction

**Created By:**  
System Analyst

**Date Created:**  
10/10/2025

**Primary Actor:**  
Authenticated Users

**Secondary Actors:**  
None

**Trigger:**  
The user interacts with a vibe (view, like, comment, share, etc.)

**Description:**  
As a user, I want my interactions with vibes to be tracked so that the system can learn my preferences and provide better recommendations.

**Preconditions:**  
PRE-1: The user is logged in and authenticated  
PRE-2: The vibe exists and is accessible  
PRE-3: The interaction type is valid

**Postconditions:**  
POST-1: Interaction is recorded in the database  
POST-2: Vibe engagement score is updated  
POST-3: User's recommendation cache is invalidated  
POST-4: Interaction data is used for future recommendations

**Normal Flow:**  
1. User performs interaction with a vibe (view, like, comment, share, wishlist, chat, offer)  
2. Client sends POST request to `/api/recommendations/interactions/track`  
3. System validates user authentication  
4. System validates interaction type and vibe existence  
5. System enriches metadata with vibe information  
6. System records interaction in database with timestamp  
7. System updates vibe engagement score asynchronously  
8. System invalidates user's recommendation cache  
9. System returns success response immediately (fire-and-forget)

**Alternative Flows:**  
AF-1: Batch interaction tracking  
2. Client sends multiple interactions in single request  
6. System processes interactions in batch  

AF-2: Offline interaction tracking  
2. Client queues interactions when offline  
3. Client sends queued interactions when connection restored

**Exceptions:**  
EF-1: User not authenticated  
1. System returns HTTP 401 Unauthorized  

EF-2: Invalid interaction type  
4. System returns HTTP 400 Bad Request  

EF-3: Vibe not found  
4. System logs warning and continues processing  

EF-4: Database write error  
6. System logs error but doesn't fail user experience  

EF-5: Invalid user ID  
3. System returns HTTP 400 Bad Request

**Priority:**  
Must Have

**Frequency of Use:**  
Very High

**Business Rules:**  
BR34, BR35

**Other Information:**  
Interaction tracking is designed to be non-blocking and fault-tolerant. Failures in tracking should not impact user experience. Engagement scores are updated with weighted values based on interaction type.

**Assumptions:**  
Users perform various types of interactions with vibes  
Tracking failures should not disrupt user experience  
Interaction data is valuable for recommendation algorithms

---

## II.2.3.3 UC35_Create Pending Vibe

### a. Functionalities

**UC ID and Name:**  
UC35_Create Pending Vibe

**Created By:**  
System Analyst

**Date Created:**  
10/10/2025

**Primary Actor:**  
Authenticated Users

**Secondary Actors:**  
None

**Trigger:**  
The user submits a new vibe for sale

**Description:**  
As a user, I want to create a new vibe listing so that I can sell my items to other users after staff approval.

**Preconditions:**  
PRE-1: The user is logged in and email verified  
PRE-2: The user has completed required vibe information  
PRE-3: The user has uploaded at least one media file

**Postconditions:**  
POST-1: Vibe is created with "pending" status  
POST-2: Vibe has 24-hour expiry timestamp  
POST-3: Vibe is queued for staff moderation  
POST-4: User receives confirmation of submission

**Normal Flow:**  
1. User fills out vibe creation form with item details  
2. User uploads media files (images/videos)  
3. User sets price, category, condition, and location  
4. User submits the vibe creation form  
5. Client sends POST request to `/api/vibes` with vibe data  
6. System validates user authentication and email verification  
7. System validates required fields (itemName, description, price, category, condition)  
8. System validates price is greater than 0  
9. System validates description length (max 500 characters)  
10. System sets vibe status to "pending"  
11. System sets expiry time to 24 hours from creation  
12. System saves vibe to database with user ID  
13. System returns success response with vibe ID and status  
14. Client displays "Vibe submitted for review" message to user

**Alternative Flows:**  
AF-1: Premium user extended expiry  
11. If user has premium account, system sets expiry to 48 hours  

AF-2: Draft save functionality  
4. User clicks "Save as Draft" instead of submit  
5. System saves vibe with "draft" status (not queued for moderation)

**Exceptions:**  
EF-1: User not authenticated  
1. System returns HTTP 401 Unauthorized  

EF-2: Email not verified  
6. System returns HTTP 403 Forbidden with verification message  

EF-3: Missing required fields  
7. System returns HTTP 400 Bad Request with field-specific errors  

EF-4: Invalid price (negative or zero)  
8. System returns HTTP 400 Bad Request  

EF-5: Description too long  
9. System returns HTTP 400 Bad Request  

EF-6: Database save error  
12. System returns HTTP 500 Internal Server Error  

EF-7: Media upload failure  
2. System returns HTTP 400 Bad Request with upload error

**Priority:**  
Must Have

**Frequency of Use:**  
Medium

**Business Rules:**  
BR36, BR37, BR38

**Other Information:**  
All vibes start with "pending" status and require staff approval. Premium users get extended 48-hour expiry. MongoDB TTL index automatically archives expired vibes.

**Assumptions:**  
Users provide accurate and complete information  
Media files are uploaded successfully  
Staff moderation process is efficient

---

## II.2.3.4 UC36_View Pending Vibes

### a. Functionalities

**UC ID and Name:**  
UC36_View Pending Vibes

**Created By:**  
System Analyst

**Date Created:**  
10/10/2025

**Primary Actor:**  
Staff/Admin Users

**Secondary Actors:**  
None

**Trigger:**  
The staff member accesses the moderation interface

**Description:**  
As a staff member, I want to view all pending vibes that require moderation so that I can review and approve/reject them efficiently.

**Preconditions:**  
PRE-1: The staff member is logged in with staff/admin role  
PRE-2: The staff member has access to moderation interface  
PRE-3: There are pending vibes in the system

**Postconditions:**  
POST-1: Staff member sees list of pending vibes  
POST-2: Pending vibes are sorted by oldest first (FIFO)  
POST-3: User information is populated for each vibe  
POST-4: Staff can select vibes for detailed review

**Normal Flow:**  
1. Staff member accesses admin/moderation interface  
2. Staff member clicks "Pending Vibes" section  
3. Client sends GET request to `/api/vibes/pending`  
4. System validates staff authentication and role  
5. System queries database for vibes with status "pending"  
6. System sorts vibes by createdAt timestamp (oldest first)  
7. System populates user information for each vibe  
8. System formats vibe data for display  
9. System returns pending vibes list to client  
10. Client displays pending vibes with user details  
11. Staff member can see vibe count and oldest pending time

**Alternative Flows:**  
AF-1: Filter by category  
3. Staff member applies category filter  
5. System adds category filter to database query  

AF-2: Search by user  
3. Staff member searches by username  
5. System adds user filter to database query

**Exceptions:**  
EF-1: Staff not authenticated  
1. System redirects to login page  

EF-2: Insufficient permissions  
4. System returns HTTP 403 Forbidden  

EF-3: Database connection error  
5. System returns HTTP 500 Internal Server Error  

EF-4: No pending vibes found  
5. System returns empty list with appropriate message

**Priority:**  
Must Have

**Frequency of Use:**  
High

**Business Rules:**  
BR39, BR40

**Other Information:**  
Pending vibes are displayed in FIFO order to ensure fair moderation. User information is populated to help staff make informed decisions. The interface shows moderation statistics.

**Assumptions:**  
Staff members have proper role permissions  
Database queries are optimized for performance  
Staff members need user context for moderation decisions

---

## II.2.3.5 UC37_Approve Vibe

### a. Functionalities

**UC ID and Name:**  
UC37_Approve Vibe

**Created By:**  
System Analyst

**Date Created:**  
10/10/2025

**Primary Actor:**  
Staff/Admin Users

**Secondary Actors:**  
Vibe Owner (Notification)

**Trigger:**  
The staff member approves a pending vibe

**Description:**  
As a staff member, I want to approve vibes that meet platform guidelines so that they become visible to users and can generate sales.

**Preconditions:**  
PRE-1: The staff member is logged in with staff/admin role  
PRE-2: The vibe exists with "pending" status  
PRE-3: The staff member has reviewed the vibe content

**Postconditions:**  
POST-1: Vibe status is changed to "approved"  
POST-2: Vibe becomes visible to other users  
POST-3: Vibe owner receives approval notification  
POST-4: Moderation audit trail is created

**Normal Flow:**  
1. Staff member reviews vibe details (item, media, user info)  
2. Staff member determines vibe meets platform guidelines  
3. Staff member clicks "Approve" button  
4. Staff member optionally adds approval notes  
5. Client sends PATCH request to `/api/vibes/{vibeId}/moderate`  
6. System validates staff authentication and role  
7. System validates vibe exists and has "pending" status  
8. System updates vibe status to "approved"  
9. System records moderation details (staff ID, timestamp, notes)  
10. System sends notification to vibe owner via email/push  
11. System removes vibe from pending list  
12. System returns success response to client  
13. Client updates UI to show approval result  
14. Client removes vibe from pending list display

**Alternative Flows:**  
AF-1: Bulk approval  
3. Staff member selects multiple vibes for approval  
5. Client sends bulk approval request  
8. System processes multiple vibes in batch  

AF-2: Approval with minor notes  
4. Staff member adds notes for user awareness  
10. System includes notes in notification to vibe owner

**Exceptions:**  
EF-1: Staff not authenticated  
1. System returns HTTP 401 Unauthorized  

EF-2: Insufficient permissions  
6. System returns HTTP 403 Forbidden  

EF-3: Vibe not found  
7. System returns HTTP 404 Not Found  

EF-4: Vibe not in pending status  
7. System returns HTTP 400 Bad Request  

EF-5: Database update error  
8. System returns HTTP 500 Internal Server Error  

EF-6: Notification send failure  
10. System logs error but continues process

**Priority:**  
Must Have

**Frequency of Use:**  
High

**Business Rules:**  
BR41, BR42, BR43

**Other Information:**  
Approved vibes immediately become visible to users. Moderation notes are optional but recommended for transparency. Notification failures don't block the approval process.

**Assumptions:**  
Staff members make informed approval decisions  
Notification system is reliable  
Approved vibes meet platform quality standards

---

## II.2.3.6 UC38_Reject Vibe

### a. Functionalities

**UC ID and Name:**  
UC38_Reject Vibe

**Created By:**  
System Analyst

**Date Created:**  
10/10/2025

**Primary Actor:**  
Staff/Admin Users

**Secondary Actors:**  
Vibe Owner (Notification)

**Trigger:**  
The staff member rejects a pending vibe

**Description:**  
As a staff member, I want to reject vibes that violate platform guidelines so that inappropriate content is not visible to users.

**Preconditions:**  
PRE-1: The staff member is logged in with staff/admin role  
PRE-2: The vibe exists with "pending" status  
PRE-3: The staff member has identified guideline violations

**Postconditions:**  
POST-1: Vibe status is changed to "rejected"  
POST-2: Vibe is hidden from platform  
POST-3: Vibe owner receives rejection notification with reason  
POST-4: Moderation audit trail is created

**Normal Flow:**  
1. Staff member reviews vibe details  
2. Staff member identifies guideline violations or inappropriate content  
3. Staff member clicks "Reject" button  
4. Staff member enters required rejection reason  
5. Client sends PATCH request to `/api/vibes/{vibeId}/moderate`  
6. System validates staff authentication and role  
7. System validates rejection reason is provided  
8. System validates vibe exists and has "pending" status  
9. System updates vibe status to "rejected"  
10. System records moderation details (staff ID, timestamp, reason)  
11. System sends rejection notification to vibe owner with reason  
12. System removes vibe from pending list  
13. System returns success response to client  
14. Client updates UI to show rejection result  
15. Client removes vibe from pending list display

**Alternative Flows:**  
AF-1: Reject with resubmission guidance  
4. Staff member provides specific guidance for resubmission  
11. System includes resubmission guidance in notification  

AF-2: Bulk rejection  
3. Staff member selects multiple violating vibes  
5. Client sends bulk rejection request  
9. System processes multiple rejections in batch

**Exceptions:**  
EF-1: Staff not authenticated  
1. System returns HTTP 401 Unauthorized  

EF-2: Insufficient permissions  
6. System returns HTTP 403 Forbidden  

EF-3: Missing rejection reason  
7. System returns HTTP 400 Bad Request  

EF-4: Vibe not found  
8. System returns HTTP 404 Not Found  

EF-5: Vibe not in pending status  
8. System returns HTTP 400 Bad Request  

EF-6: Database update error  
9. System returns HTTP 500 Internal Server Error  

EF-7: Notification send failure  
11. System logs error but continues process

**Priority:**  
Must Have

**Frequency of Use:**  
Medium

**Business Rules:**  
BR44, BR45, BR46

**Other Information:**  
Rejection reasons are required to help users understand violations and improve future submissions. Rejected vibes are permanently hidden but audit trail is maintained.

**Assumptions:**  
Staff members provide constructive rejection feedback  
Users learn from rejection reasons  
Rejected content doesn't meet platform standards

---

## II.2.3.7 UC39_Automatic Vibe Expiry

### a. Functionalities

**UC ID and Name:**  
UC39_Automatic Vibe Expiry

**Created By:**  
System Analyst

**Date Created:**  
10/10/2025

**Primary Actor:**  
System (Cron Job)

**Secondary Actors:**  
Vibe Owner (Notification)

**Trigger:**  
Scheduled hourly cleanup job

**Description:**  
As a system administrator, I want expired pending vibes to be automatically archived so that the moderation queue stays current and users are notified of expired submissions.

**Preconditions:**  
PRE-1: Vibe exists with "pending" status  
PRE-2: Vibe has exceeded 24-hour expiry time  
PRE-3: Cron job is scheduled and running

**Postconditions:**  
POST-1: Expired vibes are archived  
POST-2: Vibe owners receive expiry notifications  
POST-3: Moderation queue is cleaned up  
POST-4: System logs cleanup statistics

**Normal Flow:**  
1. System runs hourly cleanup cron job  
2. System queries database for vibes past expiry time  
3. System identifies vibes with status "pending" and expiresAt < now  
4. System updates expired vibes status to "archived"  
5. System sends expiry notifications to vibe owners  
6. System logs cleanup statistics (count of archived vibes)  
7. System continues with other cleanup tasks

**Alternative Flows:**  
AF-1: Premium user extended expiry  
4. System checks for premium users with 48-hour expiry  
5. System only archives vibes past their extended expiry  

AF-2: Manual cleanup trigger  
1. Administrator triggers manual cleanup  
2. System processes cleanup immediately

**Exceptions:**  
EF-1: Database connection error  
2. System logs error and skips cleanup cycle  

EF-2: Notification service unavailable  
5. System logs warning but continues archiving process  

EF-3: Large batch processing  
4. System processes in smaller batches to avoid timeouts

**Priority:**  
Should Have

**Frequency of Use:**  
Low (automated)

**Business Rules:**  
BR47, BR48

**Other Information:**  
Automatic expiry prevents indefinite pending status. MongoDB TTL index provides additional backup for cleanup. Premium users get extended 48-hour expiry.

**Assumptions:**  
Cron job system is reliable  
Notification service is available  
Database performance can handle batch updates

---

## II.2.3.8 UC40_Update Engagement Scores

### a. Functionalities

**UC ID and Name:**  
UC40_Update Engagement Scores

**Created By:**  
System Analyst

**Date Created:**  
10/10/2025

**Primary Actor:**  
System (Background Job)

**Secondary Actors:**  
None

**Trigger:**  
Scheduled 15-minute background job

**Description:**  
As a system administrator, I want vibe engagement scores to be updated regularly so that the recommendation algorithm has current data for better suggestions.

**Preconditions:**  
PRE-1: Vibes exist with user interactions  
PRE-2: Background job is scheduled and running  
PRE-3: Interaction data is available in database

**Postconditions:**  
POST-1: Vibe engagement scores are recalculated  
POST-2: Updated scores are stored in database  
POST-3: Recommendation algorithm uses fresh data  
POST-4: System logs processing statistics

**Normal Flow:**  
1. System runs engagement update job every 15 minutes  
2. System retrieves all active vibes (approved, not expired)  
3. System queries interaction data for each vibe  
4. System calculates engagement scores using weighted interactions:
    - View: 1 point
    - Like: 5 points  
    - Comment: 8 points
    - Share: 10 points
    - Wishlist: 12 points
    - Chat: 7 points
    - Offer: 15 points
5. System updates vibe engagement scores in batches  
6. System logs processing statistics  
7. System schedules next update cycle

**Alternative Flows:**  
AF-1: Incremental updates  
3. System only processes vibes with new interactions since last update  

AF-2: Emergency recalculation  
1. Administrator triggers manual score recalculation  
2. System processes all vibes regardless of schedule

**Exceptions:**  
EF-1: Database connection error  
2. System logs error and skips update cycle  

EF-2: Large dataset processing  
4. System processes in batches to avoid memory issues  

EF-3: Job timeout  
4. System logs timeout and continues with next batch

**Priority:**  
Should Have

**Frequency of Use:**  
High (automated)

**Business Rules:**  
BR49, BR50

**Other Information:**  
Engagement scores directly impact recommendation quality. Processing is batched for performance. Job frequency balances data freshness with system load.

**Assumptions:**  
Interaction data is accurate and complete  
Background job system is reliable  
Database can handle batch updates efficiently

---

## b. Business Rules

| ID | Business Rule | Business Rule Description |
|---|---|---|
| BR31 | Recommendation Cache TTL | Recommendations are cached in Redis for 15 minutes to balance performance and data freshness. |
| BR32 | Recommendation Score Weights | Location (30%), Content (25%), Collaborative (20%), Behavioral (15%), Social (10%) weights are fixed for consistent scoring. |
| BR33 | Candidate Vibe Limit | Maximum 200 candidate vibes are considered for performance optimization in recommendation calculation. |
| BR34 | Interaction Weight Values | Different interaction types have fixed weights: View(1), Like(5), Comment(8), Share(10), Wishlist(12), Chat(7), Offer(15). |
| BR35 | Non-blocking Interaction Tracking | Interaction tracking failures must not impact user experience and should be logged for monitoring. |
| BR36 | Vibe Status Initialization | All new vibes start with "pending" status and require staff approval before becoming visible. |
| BR37 | Vibe Expiry Times | Default expiry is 24 hours, premium users get 48 hours. MongoDB TTL index provides automatic cleanup. |
| BR38 | Required Vibe Fields | itemName, description, price, category, condition are mandatory fields for vibe creation. |
| BR39 | FIFO Moderation Order | Pending vibes are moderated in First-In-First-Out order (oldest first) for fairness. |
| BR40 | Staff Role Requirements | Only users with "staff" or "admin" roles can access moderation functionality. |
| BR41 | Vibe Approval Visibility | Approved vibes immediately become visible to all users and appear in search results. |
| BR42 | Moderation Audit Trail | All moderation actions (approve/reject) must record staff ID, timestamp, and notes for audit purposes. |
| BR43 | Approval Notification | Vibe owners must receive notifications when their vibes are approved. |
| BR44 | Rejection Reason Requirement | Rejection actions must include a reason to help users understand violations and improve. |
| BR45 | Rejection Visibility | Rejected vibes are permanently hidden from platform but audit trail is maintained. |
| BR46 | Rejection Notification | Vibe owners must receive notifications with rejection reasons for transparency. |
| BR47 | Automatic Expiry Process | Pending vibes are automatically archived after expiry time to prevent indefinite pending status. |
| BR48 | Premium User Extended Expiry | Premium users receive 48-hour expiry instead of standard 24-hour expiry for pending vibes. |
| BR49 | Engagement Score Update Frequency | Engagement scores are updated every 15 minutes to maintain recommendation algorithm accuracy. |
| BR50 | Batch Processing | Engagement score updates are processed in batches to optimize database performance and avoid timeouts. |




