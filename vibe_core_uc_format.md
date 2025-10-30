# Vibe Core Systems - Use Case Documentation

---

## II.2.3.1 UC33_Moderation Vibe

### a. Functionalities

**UC ID and Name:**  
UC33_Moderation Vibe

**Created By:**  
System Analyst

**Date Created:**  
10/10/2025

**Primary Actor:**  
Staff/Admin Users

**Secondary Actors:**  
Vibe Owner (Notification)

**Trigger:**  
The staff member needs to approve or reject a pending vibe

**Description:**  
As a staff member, I want to moderate pending vibes by approving or rejecting them so that only appropriate content becomes visible to users and inappropriate content is filtered out.

**Preconditions:**  
PRE-1: The staff member is logged in with staff/admin role  
PRE-2: The vibe exists with "pending" status  
PRE-3: The staff member has access to moderation interface

**Postconditions:**  
POST-1: Vibe status is changed to "approved" or "rejected"  
POST-2: Moderated vibe is removed from pending list  
POST-3: Vibe owner receives notification of moderation decision  
POST-4: Moderation audit trail is created with staff details and timestamp

**Normal Flow:**  
1. Staff member reviews pending vibe details (item, media, user info)  
2. Staff member determines if vibe meets platform guidelines  
3. Staff member selects approve or reject action  
4. Staff member enters moderation notes (required for reject, optional for approve)  
5. Client sends PATCH request to `/api/vibes/{vibeId}/moderate`  
6. System validates staff authentication and role permissions  
7. System validates vibe exists and has "pending" status  
8. System validates moderation notes for rejection actions  
9. System updates vibe status to "approved" or "rejected"  
10. System records moderation details (staff ID, timestamp, notes, action)  
11. System sends notification to vibe owner via email/push  
12. System removes vibe from pending queue  
13. System returns success response to client  
14. Client updates UI to show moderation result  
15. Client removes moderated vibe from pending list display

**Alternative Flows:**  
AF-1: Bulk moderation  
3. Staff member selects multiple vibes for batch moderation  
5. Client sends bulk moderation request  
9. System processes multiple vibes in batch operation  

AF-2: Approve with minor notes  
4. Staff member adds optional notes for user awareness  
11. System includes notes in approval notification to vibe owner  

AF-3: Reject with resubmission guidance  
4. Staff member provides specific guidance for resubmission  
11. System includes resubmission guidance in rejection notification

**Exceptions:**  
EF-1: Staff not authenticated  
1. System returns HTTP 401 Unauthorized  

EF-2: Insufficient permissions (not staff/admin)  
6. System returns HTTP 403 Forbidden  

EF-3: Vibe not found  
7. System returns HTTP 404 Not Found  

EF-4: Vibe not in pending status  
7. System returns HTTP 400 Bad Request  

EF-5: Missing rejection reason  
8. System returns HTTP 400 Bad Request for reject actions  

EF-6: Database update error  
9. System returns HTTP 500 Internal Server Error  

EF-7: Notification send failure  
11. System logs error but continues moderation process

**Priority:**  
Must Have

**Frequency of Use:**  
High

**Business Rules:**  
BR31, BR32, BR33

**Other Information:**  
Moderation decisions are final and immediately affect vibe visibility. Rejection reasons are mandatory to help users understand violations. Approved vibes become visible to all users, rejected vibes are permanently hidden.

**Assumptions:**  
Staff members make informed moderation decisions based on platform guidelines  
Notification system is reliable for user communication  
Moderation audit trail is maintained for compliance purposes

---

## II.2.3.2 UC34_Recommend Vibe

### a. Functionalities

**UC ID and Name:**  
UC34_Recommend Vibe

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
As a user, I want to receive personalized vibe recommendations based on my preferences and interaction history so that I can discover relevant items that match my interests and location.

**Preconditions:**  
PRE-1: The user is logged in and authenticated with valid JWT token  
PRE-2: The user has interaction history (views, likes, comments, etc.)  
PRE-3: There are approved vibes available in the system

**Postconditions:**  
POST-1: Personalized recommendations are generated and returned  
POST-2: Recommendations are cached in Redis for 15 minutes  
POST-3: User receives vibes with recommendation scores and reasons  
POST-4: User interaction data is used to improve future recommendations

**Normal Flow:**  
1. User requests personalized recommendations via client interface  
2. Client sends GET request to `/api/recommendations` with optional filters  
3. System validates user authentication via JWT token  
4. System checks Redis cache for existing recommendations (15min TTL)  
5. If cache miss, system fetches user profile and preferences  
6. System retrieves user interaction history from database  
7. System builds user preferences from interaction patterns  
8. System gets candidate vibes (top 200 by engagement score)  
9. System calculates recommendation scores for each vibe using hybrid algorithm:
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
6. System returns trending vibes instead of personalized recommendations  
7. Continue to step 13  

AF-3: No candidate vibes found  
9. System returns empty result with explanation message  
10. Continue to step 13

**Exceptions:**  
EF-1: User not authenticated  
1. System returns HTTP 401 Unauthorized  

EF-2: Invalid JWT token  
3. System returns HTTP 401 Unauthorized  

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
BR34, BR35, BR36

**Other Information:**  
The recommendation system uses a hybrid algorithm combining multiple scoring factors. Cache TTL is set to 15 minutes to balance performance and data freshness. Maximum 200 candidate vibes are considered for performance optimization.

**Assumptions:**  
Users have sufficient interaction history to generate meaningful recommendations  
Redis cache is available for performance optimization  
Geographic data is available for location-based scoring

---

## II.2.3.3 UC35_Show Vibe Pending

### a. Functionalities

**UC ID and Name:**  
UC35_Show Vibe Pending

**Created By:**  
System Analyst

**Date Created:**  
10/10/2025

**Primary Actor:**  
Staff/Admin Users

**Secondary Actors:**  
None

**Trigger:**  
The staff member accesses the moderation interface to view pending vibes

**Description:**  
As a staff member, I want to view all pending vibes that require moderation so that I can efficiently review and process them in order of submission.

**Preconditions:**  
PRE-1: The staff member is logged in with staff/admin role  
PRE-2: The staff member has access to moderation interface  
PRE-3: There are pending vibes in the system

**Postconditions:**  
POST-1: Staff member sees complete list of pending vibes  
POST-2: Pending vibes are sorted by oldest first (FIFO order)  
POST-3: User information is populated for each vibe  
POST-4: Staff can select individual vibes for detailed review

**Normal Flow:**  
1. Staff member accesses admin/moderation interface  
2. Staff member navigates to "Pending Vibes" section  
3. Client sends GET request to `/api/vibes/pending`  
4. System validates staff authentication and role permissions  
5. System queries database for vibes with status "pending"  
6. System sorts vibes by createdAt timestamp (oldest first for fairness)  
7. System populates user information for each vibe (username, name, profilePicture)  
8. System formats vibe data for display with moderation metadata  
9. System returns pending vibes list to client  
10. Client displays pending vibes with user details and moderation controls  
11. Staff member can see total pending count and oldest submission time

**Alternative Flows:**  
AF-1: Filter by category  
3. Staff member applies category filter to pending vibes  
5. System adds category filter to database query  

AF-2: Search by user  
3. Staff member searches pending vibes by username  
5. System adds user filter to database query  

AF-3: Sort by priority  
6. System sorts by priority flags or user verification status

**Exceptions:**  
EF-1: Staff not authenticated  
1. System redirects to login page  

EF-2: Insufficient permissions (not staff/admin)  
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
BR37, BR38

**Other Information:**  
Pending vibes are displayed in FIFO order to ensure fair moderation. User information is populated to help staff make informed decisions. The interface shows moderation statistics and queue status.

**Assumptions:**  
Staff members have proper role permissions for moderation access  
Database queries are optimized for performance  
Staff members need user context for moderation decisions

---

## b. Business Rules

| ID | Business Rule | Business Rule Description |
|---|---|---|
| BR31 | Moderation Authorization | Only users with "staff" or "admin" roles can access moderation functionality and moderate vibes. |
| BR32 | Rejection Reason Requirement | Rejection actions must include a reason to help users understand violations and improve future submissions. |
| BR33 | Moderation Audit Trail | All moderation actions (approve/reject) must record staff ID, timestamp, and notes for audit purposes. |
| BR34 | Recommendation Cache TTL | Recommendations are cached in Redis for 15 minutes to balance performance and data freshness. |
| BR35 | Recommendation Score Weights | Location (30%), Content (25%), Collaborative (20%), Behavioral (15%), Social (10%) weights are fixed for consistent scoring. |
| BR36 | Candidate Vibe Limit | Maximum 200 candidate vibes are considered for performance optimization in recommendation calculation. |
| BR37 | FIFO Moderation Order | Pending vibes are moderated in First-In-First-Out order (oldest first) for fairness. |
| BR38 | Staff Role Requirements | Only users with "staff" or "admin" roles can view pending vibes and access moderation interface. |
