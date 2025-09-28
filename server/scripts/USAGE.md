# Quick Usage Guide

## 🚀 Quick Start

### 1. Make sure MongoDB is running
```bash
# If using Docker
docker-compose -f compose.local.yaml up -d

# Or start your local MongoDB instance
mongod
```

### 2. Run the quick seed script
```bash
cd server
bun run seed:quick
```

### 3. Login with test accounts
- **Admin:** admin@example.com / 123456
- **Staff:** staff@example.com / 123456  
- **User:** user1@example.com / 123456

## 📊 What You Get

After running `bun run seed:quick`, you'll have:

- ✅ **5 users** (1 admin, 1 staff, 3 regular users)
- ✅ **12 vibes** across all categories
- ✅ **Realistic Vietnamese content**
- ✅ **Comments and interactions**
- ✅ **Various item conditions and prices**

## 🎯 Test the Website

1. Start the web server:
```bash
cd client/web
bun dev
```

2. Visit: http://localhost:3000
3. Login with test accounts
4. Browse vibes, search, comment, like!

## 🔄 Reset Data

To clear and reseed:
```bash
cd server
bun run seed:quick
```

## 📱 Test Mobile App

1. Start the mobile development server:
```bash
cd client/app
bun start
```

2. Use the same test accounts to login
3. Test vibe creation, browsing, and interactions

## 🛠️ Customize Data

Edit `server/scripts/quick-seed.ts` to:
- Add more test users
- Change item categories
- Modify prices and descriptions
- Add more realistic Vietnamese content
