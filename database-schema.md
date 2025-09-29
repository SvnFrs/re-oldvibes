# Database Schema - OldVibes Backend

## ERD Diagram - PlantUML

```plantuml
@startuml OldVibes Database Schema

!define ENTITY class
!define PK <<PK>>
!define FK <<FK>>
!define UK <<UK>>

entity User {
  PK _id : ObjectId
  UK email : String
  password : String
  name : String
  UK username : String
  role : String
  profilePicture : String
  bio : String
  followers : ObjectId[]
  following : ObjectId[]
  isVerified : Boolean
  isEmailVerified : Boolean
  isActive : Boolean
  UK googleId : String
  createdAt : Date
  updatedAt : Date
}

entity Vibe {
  PK _id : ObjectId
  FK userId : ObjectId
  itemName : String
  description : String
  price : Number
  tags : String[]
  mediaFiles : Object[]
  status : String
  moderationNotes : String
  FK moderatedBy : ObjectId
  category : String
  condition : String
  location : String
  likes : ObjectId[]
  comments : ObjectId[]
  commentsCount : Number
  views : Number
  expiresAt : Date
  createdAt : Date
  updatedAt : Date
}

entity Comment {
  PK _id : ObjectId
  FK vibeId : ObjectId
  FK userId : ObjectId
  content : String
  FK parentComment : ObjectId
  isActive : Boolean
  likesCount : Number
  repliesCount : Number
  likes : ObjectId[]
  createdAt : Date
  updatedAt : Date
}

entity Conversation {
  PK _id : ObjectId
  UK conversationId : String
  FK vibeId : ObjectId
  FK sellerId : ObjectId
  FK buyerId : ObjectId
  lastMessage : Object
  unreadCount : Object
  isActive : Boolean
  isBlocked : Boolean
  FK blockedBy : ObjectId
  createdAt : Date
  updatedAt : Date
}

entity Message {
  PK _id : ObjectId
  FK conversationId : String
  FK senderId : ObjectId
  FK receiverId : ObjectId
  FK vibeId : ObjectId
  content : String
  messageType : String
  attachments : Object[]
  offerData : Object
  isRead : Boolean
  isEdited : Boolean
  editedAt : Date
  isDeleted : Boolean
  deletedAt : Date
  createdAt : Date
  updatedAt : Date
}

' Relationships
User ||--o{ Vibe : creates
User ||--o{ Comment : writes
User ||--o{ Conversation : participates
User ||--o{ Message : sends

Vibe ||--o{ Comment : has
Vibe ||--o{ Conversation : generates
Vibe ||--o{ Message : relates_to

Comment ||--o{ Comment : replies_to

Conversation ||--o{ Message : contains

User ||--o{ User : follows
User ||--o{ User : likes_vibes
User ||--o{ User : likes_comments

@enduml
```

## ERD Diagram - Mermaid (Alternative)

```mermaid
erDiagram
    User {
        ObjectId _id PK
        string email UK
        string password
        string name
        string username UK
        string role
        string profilePicture
        string bio
        ObjectId[] followers
        ObjectId[] following
        boolean isVerified
        boolean isEmailVerified
        boolean isActive
        string googleId UK
        Date createdAt
        Date updatedAt
    }

    Vibe {
        ObjectId _id PK
        ObjectId userId FK
        string itemName
        string description
        number price
        string[] tags
        object[] mediaFiles
        string status
        string moderationNotes
        ObjectId moderatedBy FK
        string category
        string condition
        string location
        ObjectId[] likes
        ObjectId[] comments
        number commentsCount
        number views
        Date expiresAt
        Date createdAt
        Date updatedAt
    }

    Comment {
        ObjectId _id PK
        ObjectId vibeId FK
        ObjectId userId FK
        string content
        ObjectId parentComment FK
        boolean isActive
        number likesCount
        number repliesCount
        ObjectId[] likes
        Date createdAt
        Date updatedAt
    }

    Conversation {
        ObjectId _id PK
        string conversationId UK
        ObjectId vibeId FK
        ObjectId sellerId FK
        ObjectId buyerId FK
        object lastMessage
        object unreadCount
        boolean isActive
        boolean isBlocked
        ObjectId blockedBy FK
        Date createdAt
        Date updatedAt
    }

    Message {
        ObjectId _id PK
        string conversationId FK
        ObjectId senderId FK
        ObjectId receiverId FK
        ObjectId vibeId FK
        string content
        string messageType
        object[] attachments
        object offerData
        boolean isRead
        boolean isEdited
        Date editedAt
        boolean isDeleted
        Date deletedAt
        Date createdAt
        Date updatedAt
    }

    %% Relationships
    User ||--o{ Vibe : "creates"
    User ||--o{ Comment : "writes"
    User ||--o{ Conversation : "participates"
    User ||--o{ Message : "sends"
    
    Vibe ||--o{ Comment : "has"
    Vibe ||--o{ Conversation : "generates"
    Vibe ||--o{ Message : "relates to"
    
    Comment ||--o{ Comment : "replies to"
    
    Conversation ||--o{ Message : "contains"
    
    User ||--o{ User : "follows"
    User ||--o{ User : "likes vibes"
    User ||--o{ User : "likes comments"
```

## Schema Details

### 1. User Collection
- **Primary Key**: `_id` (ObjectId)
- **Unique Fields**: `email`, `username`, `googleId`
- **Role Types**: admin, staff, user, guest
- **OAuth Support**: Google authentication with `googleId`
- **Social Features**: followers/following arrays
- **Verification**: email and account verification flags

### 2. Vibe Collection
- **Primary Key**: `_id` (ObjectId)
- **Foreign Keys**: `userId` → User, `moderatedBy` → User
- **Status Types**: pending, approved, rejected, sold, archived
- **Condition Types**: new, like-new, good, fair, poor
- **Media Support**: images and videos with thumbnails
- **Auto-expiry**: 24-hour TTL with `expiresAt` field
- **Engagement**: likes, comments, views tracking

### 3. Comment Collection
- **Primary Key**: `_id` (ObjectId)
- **Foreign Keys**: `vibeId` → Vibe, `userId` → User, `parentComment` → Comment
- **Hierarchical**: Supports nested replies via `parentComment`
- **Engagement**: likes tracking and counts
- **Soft Delete**: `isActive` flag for content moderation

### 4. Conversation Collection
- **Primary Key**: `_id` (ObjectId)
- **Unique Field**: `conversationId` (string)
- **Foreign Keys**: `vibeId` → Vibe, `sellerId` → User, `buyerId` → User, `blockedBy` → User
- **Compound Indexes**: Optimized for user conversations and active status
- **Unread Tracking**: Separate counters for seller and buyer
- **Blocking**: Support for conversation blocking

### 5. Message Collection
- **Primary Key**: `_id` (ObjectId)
- **Foreign Keys**: `senderId` → User, `receiverId` → User, `vibeId` → Vibe
- **Message Types**: text, image, offer, system
- **Attachments**: Support for files and images
- **Offer System**: Built-in offer/negotiation functionality
- **Message States**: read, edited, deleted tracking

## Key Features

### Authentication & Authorization
- Multi-role system (admin, staff, user, guest)
- OAuth integration (Google)
- Email verification system
- Account verification and activation

### Content Management
- Vibe posting with media support
- Comment system with nested replies
- Content moderation workflow
- Auto-expiry for vibes (24 hours)

### Social Features
- User following system
- Like system for vibes and comments
- View tracking
- User profiles with bio and pictures

### Messaging System
- Conversation-based messaging
- Offer/negotiation system
- File and image attachments
- Message states (read, edited, deleted)
- Conversation blocking

### Performance Optimizations
- Strategic indexing for queries
- Compound indexes for complex queries
- TTL indexes for auto-cleanup
- Efficient relationship modeling
