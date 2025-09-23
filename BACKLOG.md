# Old Vibes – Project Backlog

**Project Start:** June 15th, 2025
**Current Date:** July 20th, 2025
**Team:**

- **Doan Vo Quoc Thai** (Leader, Architect, DevOps, Backend)

---

## Legend

- **Complexity:** Easy / Medium / Hard
- **Priority:** High / Medium / Low
- **Est. Time:** In days (1d = 8h focus)
- **Dependencies:** Task numbers (see `#` column)
- **Est. Start / Est. Complete:** Estimated dates (YYYY-MM-DD)

---

## 1. Architecture & Infrastructure

| #   | Task                                                           | Complexity | Priority | Est. Time | Assignee(s)       | Dependencies | Est. Start | Est. Complete | Notes        |
| --- | -------------------------------------------------------------- | ---------- | -------- | --------- | ----------------- | ------------ | ---------- | ------------- | ------------ |
| 1   | System Architecture & ERD (PlantUML, SDD, Flows)               | Hard       | High     | 1d        | Doan Vo Quoc Thai |              | 2025-06-15 | 2025-06-15    | Keep updated |
| 2   | Docker Compose (Dev/Prod: DB, Redis, App, Traefik, Cloudflare) | Hard       | High     | 1d        | Doan Vo Quoc Thai |              | 2025-06-15 | 2025-06-15    |              |
| 3   | CI/CD Pipeline (GitHub Actions: build, push, deploy)           | Hard       | High     | 1.5d      | Doan Vo Quoc Thai | 2            | 2025-06-16 | 2025-06-17    |              |
| 4   | AWS S3 Integration (media, avatars)                            | Medium     | High     | 0.5d      | Doan Vo Quoc Thai | 2            | 2025-06-16 | 2025-06-16    |              |
| 5   | Redis Setup (sessions, tokens, cache)                          | Medium     | High     | 0.5d      | Doan Vo Quoc Thai | 2            | 2025-06-16 | 2025-06-16    |              |
| 6   | Health Checks & Monitoring (Prometheus, Uptime)                | Medium     | Medium   | 0.5d      | Doan Vo Quoc Thai | 2,3          | 2025-06-18 | 2025-06-18    |              |
| 7   | Environment Variable Management (dotenv, secrets)              | Easy       | High     | 0.25d     | Doan Vo Quoc Thai | 2            | 2025-06-16 | 2025-06-16    |              |

---

## 2. Backend: Authentication & User

| #   | Task                                             | Complexity | Priority | Est. Time | Assignee(s)       | Dependencies | Est. Start | Est. Complete | Notes |
| --- | ------------------------------------------------ | ---------- | -------- | --------- | ----------------- | ------------ | ---------- | ------------- | ----- |
| 8   | User Registration & Login (JWT, bcrypt)          | Medium     | High     | 0.5d      | Doan Vo Quoc Thai | 1,2,7        | 2025-06-17 | 2025-06-17    |       |
| 9   | Email Verification (send, verify, resend)        | Medium     | High     | 0.5d      | Doan Vo Quoc Thai | 8            | 2025-06-18 | 2025-06-18    |       |
| 10  | Logout & Refresh Token                           | Easy       | Medium   | 0.25d     | Doan Vo Quoc Thai | 8            | 2025-06-18 | 2025-06-18    |       |
| 11  | Profile Management (view, update, upload avatar) | Medium     | High     | 0.5d      | Doan Vo Quoc Thai | 8            | 2025-06-18 | 2025-06-18    |       |
| 12  | Follow/Unfollow Users                            | Easy       | Medium   | 0.25d     | Doan Vo Quoc Thai | 8            | 2025-06-18 | 2025-06-18    |       |
| 13  | User Search                                      | Easy       | Low      | 0.25d     | Doan Vo Quoc Thai | 8            | 2025-06-18 | 2025-06-18    |       |
| 14  | Get Followers/Following Lists                    | Easy       | Low      | 0.25d     | Doan Vo Quoc Thai | 8            | 2025-06-18 | 2025-06-18    |       |

---

## 3. Backend: Vibes (Items)

| #   | Task                             | Complexity | Priority | Est. Time | Assignee(s)       | Dependencies | Est. Start | Est. Complete | Notes |
| --- | -------------------------------- | ---------- | -------- | --------- | ----------------- | ------------ | ---------- | ------------- | ----- |
| 15  | Create/Update/Delete Vibes       | Medium     | High     | 0.5d      | Doan Vo Quoc Thai | 8,9          | 2025-06-19 | 2025-06-19    |       |
| 16  | Upload Media Files (S3, Multer)  | Medium     | High     | 0.5d      | Doan Vo Quoc Thai | 4,15         | 2025-06-19 | 2025-06-19    |       |
| 17  | Get Vibes with Filters           | Medium     | High     | 0.5d      | Doan Vo Quoc Thai | 15           | 2025-06-19 | 2025-06-19    |       |
| 18  | Search Vibes                     | Easy       | Medium   | 0.25d     | Doan Vo Quoc Thai | 17           | 2025-06-20 | 2025-06-20    |       |
| 19  | Trending Vibes Algorithm         | Medium     | Medium   | 0.5d      | Doan Vo Quoc Thai | 17           | 2025-06-20 | 2025-06-20    |       |
| 20  | Mark Vibe as Sold                | Easy       | Medium   | 0.25d     | Doan Vo Quoc Thai | 15           | 2025-06-19 | 2025-06-19    |       |
| 21  | Moderate Vibes (approve/reject)  | Medium     | High     | 0.5d      | Doan Vo Quoc Thai | 15           | 2025-06-19 | 2025-06-19    |       |
| 22  | Archive Expired Vibes (cron job) | Medium     | Medium   | 0.5d      | Doan Vo Quoc Thai | 15           | 2025-06-19 | 2025-06-19    |       |

---

## 4. Backend: Comments

| #   | Task                          | Complexity | Priority | Est. Time | Assignee(s)       | Dependencies | Est. Start | Est. Complete | Notes |
| --- | ----------------------------- | ---------- | -------- | --------- | ----------------- | ------------ | ---------- | ------------- | ----- |
| 23  | Create/Update/Delete Comments | Medium     | High     | 0.5d      | Doan Vo Quoc Thai | 15           | 2025-06-20 | 2025-06-20    |       |
| 24  | Get Vibe Comments             | Easy       | High     | 0.25d     | Doan Vo Quoc Thai | 23           | 2025-06-21 | 2025-06-21    |       |
| 25  | Get Comment Replies           | Easy       | Medium   | 0.25d     | Doan Vo Quoc Thai | 24           | 2025-06-21 | 2025-06-21    |       |
| 26  | Like/Unlike Comments          | Easy       | Medium   | 0.25d     | Doan Vo Quoc Thai | 23           | 2025-06-21 | 2025-06-21    |       |
| 27  | Get User Comments             | Easy       | Low      | 0.25d     | Doan Vo Quoc Thai | 23           | 2025-06-21 | 2025-06-21    |       |

---

## 5. Backend: Chat

| #   | Task                                | Complexity | Priority | Est. Time | Assignee(s)       | Dependencies | Est. Start | Est. Complete | Notes |
| --- | ----------------------------------- | ---------- | -------- | --------- | ----------------- | ------------ | ---------- | ------------- | ----- |
| 28  | Start Conversation                  | Medium     | High     | 0.5d      | Doan Vo Quoc Thai | 15,8         | 2025-06-22 | 2025-06-22    |       |
| 29  | Send Messages (REST & Socket.io)    | Hard       | High     | 1d        | Doan Vo Quoc Thai | 28           | 2025-06-23 | 2025-06-23    |       |
| 30  | Get Conversation Messages           | Medium     | High     | 0.5d      | Doan Vo Quoc Thai | 29           | 2025-06-24 | 2025-06-24    |       |
| 31  | Mark Messages as Read               | Easy       | Medium   | 0.25d     | Doan Vo Quoc Thai | 29           | 2025-06-24 | 2025-06-24    |       |
| 32  | Update Offer Status (accept/reject) | Medium     | Medium   | 0.5d      | Doan Vo Quoc Thai | 29           | 2025-06-24 | 2025-06-24    |       |
| 33  | Typing Indicators (Socket.io)       | Medium     | Low      | 0.5d      | Doan Vo Quoc Thai | 29           | 2025-06-24 | 2025-06-24    |       |

---

## 6. Backend: Admin Panel

| #   | Task                       | Complexity | Priority | Est. Time | Assignee(s)       | Dependencies | Est. Start | Est. Complete | Notes |
| --- | -------------------------- | ---------- | -------- | --------- | ----------------- | ------------ | ---------- | ------------- | ----- |
| 34  | Add/Edit/Delete Staff      | Medium     | Medium   | 0.5d      | Doan Vo Quoc Thai | 8            | 2025-06-25 | 2025-06-25    |       |
| 35  | Ban/Unban Users            | Easy       | Medium   | 0.25d     | Doan Vo Quoc Thai | 8            | 2025-06-25 | 2025-06-25    |       |
| 36  | List All Users             | Easy       | Medium   | 0.25d     | Doan Vo Quoc Thai | 8            | 2025-06-25 | 2025-06-25    |       |
| 37  | List All Staff             | Easy       | Low      | 0.25d     | Doan Vo Quoc Thai | 8            | 2025-06-25 | 2025-06-25    |       |
| 38  | Get All Vibes (admin view) | Easy       | Low      | 0.25d     | Doan Vo Quoc Thai | 15           | 2025-06-25 | 2025-06-25    |       |

---

## 7. Frontend: Design & Components

| #   | Task                                                      | Complexity | Priority | Est. Time | Assignee(s)       | Dependencies | Est. Start | Est. Complete | Notes |
| --- | --------------------------------------------------------- | ---------- | -------- | --------- | ----------------- | ------------ | ---------- | ------------- | ----- |
| 39  | Design Wireframes & Mockups                               | Medium     | High     | 1d        | Doan Vo Quoc Thai |              | 2025-06-15 | 2025-06-15    |       |
| 40  | Create Reusable Components (Buttons, Modals, Cards, etc.) | Medium     | High     | 1d        | Doan Vo Quoc Thai | 39           | 2025-06-16 | 2025-06-16    |       |

---

## 8. Frontend: Authentication

| #   | Task                                          | Complexity | Priority | Est. Time | Assignee(s)       | Dependencies | Est. Start | Est. Complete | Notes |
| --- | --------------------------------------------- | ---------- | -------- | --------- | ----------------- | ------------ | ---------- | ------------- | ----- |
| 41  | Login, Registration, Email Verification Pages | Medium     | High     | 0.5d      | Doan Vo Quoc Thai | 8,9,39,40    | 2025-06-18 | 2025-06-18    |       |

---

## 9. Frontend: User Profile

| #   | Task                      | Complexity | Priority | Est. Time | Assignee(s)       | Dependencies | Est. Start | Est. Complete | Notes |
| --- | ------------------------- | ---------- | -------- | --------- | ----------------- | ------------ | ---------- | ------------- | ----- |
| 42  | Profile View & Edit Pages | Medium     | High     | 0.5d      | Doan Vo Quoc Thai | 11,39,40     | 2025-06-19 | 2025-06-19    |       |
| 43  | Followers/Following Lists | Easy       | Medium   | 0.25d     | Doan Vo Quoc Thai | 14,42        | 2025-06-20 | 2025-06-20    |       |

---

## 10. Frontend: Vibes

| #   | Task                          | Complexity | Priority | Est. Time | Assignee(s)       | Dependencies | Est. Start | Est. Complete | Notes |
| --- | ----------------------------- | ---------- | -------- | --------- | ----------------- | ------------ | ---------- | ------------- | ----- |
| 44  | Create/Update/Delete Vibes UI | Medium     | High     | 0.5d      | Doan Vo Quoc Thai | 15,39,40     | 2025-06-19 | 2025-06-19    |       |
| 45  | Vibe Details Page             | Medium     | High     | 0.5d      | Doan Vo Quoc Thai | 17,39,40     | 2025-06-20 | 2025-06-20    |       |
| 46  | Trending Vibes Page           | Easy       | Medium   | 0.25d     | Doan Vo Quoc Thai | 19,45        | 2025-06-21 | 2025-06-21    |       |
| 47  | Search Vibes Page             | Easy       | Medium   | 0.25d     | Doan Vo Quoc Thai | 18,45        | 2025-06-21 | 2025-06-21    |       |

---

## 11. Frontend: Comments

| #   | Task                    | Complexity | Priority | Est. Time | Assignee(s)       | Dependencies | Est. Start | Est. Complete | Notes |
| --- | ----------------------- | ---------- | -------- | --------- | ----------------- | ------------ | ---------- | ------------- | ----- |
| 48  | Comment & Reply UI      | Medium     | High     | 0.5d      | Doan Vo Quoc Thai | 23,39,40     | 2025-06-21 | 2025-06-21    |       |
| 49  | Like/Unlike Comments UI | Easy       | Medium   | 0.25d     | Doan Vo Quoc Thai | 26,48        | 2025-06-22 | 2025-06-22    |       |

---

## 12. Frontend: Chat

| #   | Task                                      | Complexity | Priority | Est. Time | Assignee(s)       | Dependencies | Est. Start | Est. Complete | Notes |
| --- | ----------------------------------------- | ---------- | -------- | --------- | ----------------- | ------------ | ---------- | ------------- | ----- |
| 50  | Chat Interface (list, room, send/receive) | Hard       | High     | 1d        | Doan Vo Quoc Thai | 29,39,40     | 2025-06-24 | 2025-06-24    |       |
| 51  | Typing Indicators                         | Medium     | Low      | 0.5d      | Doan Vo Quoc Thai | 33,50        | 2025-06-25 | 2025-06-25    |       |

---

## 13. Frontend: Admin Panel (Web)

| #   | Task                   | Complexity | Priority | Est. Time | Assignee(s)       | Dependencies | Est. Start | Est. Complete | Notes |
| --- | ---------------------- | ---------- | -------- | --------- | ----------------- | ------------ | ---------- | ------------- | ----- |
| 52  | Staff Management Pages | Medium     | Medium   | 0.5d      | Doan Vo Quoc Thai | 34,39,40     | 2025-06-26 | 2025-06-26    |       |
| 53  | User Management Pages  | Medium     | Medium   | 0.5d      | Doan Vo Quoc Thai | 35,36,39,40  | 2025-06-26 | 2025-06-26    |       |
| 54  | Vibe Moderation Pages  | Medium     | Medium   | 0.5d      | Doan Vo Quoc Thai | 21,39,40     | 2025-06-26 | 2025-06-26    |       |

---

## 14. Deployment & Monitoring

| #   | Task                                    | Complexity | Priority | Est. Time | Assignee(s)       | Dependencies | Est. Start | Est. Complete | Notes |
| --- | --------------------------------------- | ---------- | -------- | --------- | ----------------- | ------------ | ---------- | ------------- | ----- |
| 55  | Dockerfiles for Backend, Frontend, DB   | Medium     | High     | 0.5d      | Doan Vo Quoc Thai | 2            | 2025-06-17 | 2025-06-17    |       |
| 56  | Configure Docker Compose for Local/Prod | Medium     | High     | 0.5d      | Doan Vo Quoc Thai | 2,55         | 2025-06-18 | 2025-06-18    |       |
| 57  | Set up AWS S3 for Media Storage         | Medium     | High     | 0.5d      | Doan Vo Quoc Thai | 4            | 2025-06-18 | 2025-06-18    |       |
| 58  | Set up Redis for Caching & Tokens       | Medium     | High     | 0.5d      | Doan Vo Quoc Thai | 5            | 2025-06-18 | 2025-06-18    |       |
| 59  | Deploy Backend to Production Server     | Medium     | High     | 0.5d      | Doan Vo Quoc Thai | 3,55,56      | 2025-06-19 | 2025-06-19    |       |
| 60  | Set up Health Checks & Monitoring Tools | Medium     | Medium   | 0.5d      | Doan Vo Quoc Thai | 6,59         | 2025-06-20 | 2025-06-20    |       |

---

## 15. QA, Testing & Launch

| #   | Task                                                 | Complexity | Priority | Est. Time | Assignee(s)       | Dependencies | Est. Start | Est. Complete | Notes |
| --- | ---------------------------------------------------- | ---------- | -------- | --------- | ----------------- | ------------ | ---------- | ------------- | ----- |
| 61  | Manual QA: Core Flows (Auth, Post, Chat, Moderation) | Medium     | High     | 1d        | All               | 1-60         | 2025-07-21 |               |       |
| 62  | Bug Fixes & Polish                                   | Medium     | High     | 1d        | All               | 61           | 2025-07-22 |               |       |
| 63  | Prepare Release Notes & Documentation                | Easy       | Medium   | 0.5d      | Doan Vo Quoc Thai | 62           | 2025-07-23 |               |       |
| 64  | Launch MVP                                           | Hard       | High     | 0.5d      | Doan Vo Quoc Thai | 63           | 2025-07-23 |               |       |

---

## 16. Stretch Goals (Optional / Post-MVP)

| #   | Task                            | Complexity | Priority | Est. Time | Assignee(s)       | Dependencies | Est. Start | Est. Complete | Notes |
| --- | ------------------------------- | ---------- | -------- | --------- | ----------------- | ------------ | ---------- | ------------- | ----- |
| 65  | PWA Support for Web             | Medium     | Low      | 1d        | Doan Vo Quoc Thai | 64           | 2025-07-24 |               |       |
| 66  | Push Notifications (Mobile/Web) | Hard       | Low      | 1d        | Doan Vo Quoc Thai | 64           | 2025-07-24 |               |       |
| 67  | Analytics Dashboard             | Medium     | Low      | 1d        | Doan Vo Quoc Thai | 64           | 2025-07-24 |               |       |
| 68  | Multi-language Support          | Medium     | Low      | 1d        | Doan Vo Quoc Thai | 64           | 2025-07-24 |               |       |

---
