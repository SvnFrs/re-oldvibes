# 🔧 MongoDB Authentication Fix

## Issue

MongoDB authentication errors when running the server and seed scripts:

```
error: Command find requires authentication
error: Command delete requires authentication
error: Command insert requires authentication
```

## Root Cause

- Docker Compose MongoDB container has authentication enabled (`MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD`)
- Application `.env` file and seed scripts were using connection string without credentials

## Solution Applied

### 1. Updated `.env` MongoDB Connection String

**Before:**

```env
MONGO_URI=mongodb://localhost:27017
DB_NAME=oldvibes
```

**After:**

```env
MONGO_URI=mongodb://admin:password@localhost:27017/oldvibes?authSource=admin
DB_NAME=oldvibes
```

### 2. Fixed Seed Scripts

#### `scripts/seed-data.ts`

- ✅ Added `import dotenv from 'dotenv';`
- ✅ Added `dotenv.config();`
- ✅ Changed env var from `MONGODB_URI` to `MONGO_URI`
- ✅ Updated fallback URI with authentication

#### `scripts/quick-seed.ts`

- ✅ Added `import dotenv from 'dotenv';`
- ✅ Added `dotenv.config();`
- ✅ Changed env var from `MONGODB_URI` to `MONGO_URI`
- ✅ Updated fallback URI with authentication

### 3. Updated Swagger Configuration

**For Recommendation System Visibility:**

- ✅ Added `"./controllers/*.ts"` to Swagger API scan paths
- ✅ Added Swagger tags for "Recommendations" and "Interactions"

## Connection String Format

```
mongodb://[username]:[password]@[host]:[port]/[database]?authSource=[authDB]
```

**Parameters:**

- `username`: `admin` (from docker-compose)
- `password`: `password` (from docker-compose)
- `host`: `localhost`
- `port`: `27017`
- `database`: `oldvibes`
- `authSource`: `admin` (where user credentials are stored)

## Testing

### 1. Start MongoDB Container

```bash
cd server
docker compose -f compose.local.yaml up -d
```

### 2. Run Server

```bash
bun run dev
```

Should see:

```
✅ Connected to MongoDB
🚀 Server running on port 4000
📚 API Documentation: http://localhost:4000/api-docs
```

### 3. Run Seed Scripts

```bash
# Quick seed (5 users, 10 vibes)
bun run quick-seed

# Full seed (20 users, 100+ vibes)
bun run seed
```

Should see:

```
✅ Connected to MongoDB
✅ Database cleared
✅ Created X users
✅ Created Y vibes
✅ Seeding completed successfully!
```

### 4. Check Swagger Documentation

Visit: `http://localhost:4000/api-docs`

Should see sections:

- ✅ Auth
- ✅ Vibes
- ✅ Users
- ✅ Comments
- ✅ Chat
- ✅ **Recommendations** ← NEW
- ✅ **Interactions** ← NEW

## Files Modified

1. ✅ `/server/.env` - MongoDB URI with authentication
2. ✅ `/server/scripts/seed-data.ts` - Added dotenv, fixed URI
3. ✅ `/server/scripts/quick-seed.ts` - Added dotenv, fixed URI
4. ✅ `/server/config/swagger.config.ts` - Added controllers scan
5. ✅ `/server/routes/recommendation.routes.ts` - Added Swagger tags

## Docker Compose Configuration

The MongoDB container is configured with:

```yaml
environment:
  MONGO_INITDB_ROOT_USERNAME: admin
  MONGO_INITDB_ROOT_PASSWORD: password
  MONGO_INITDB_DATABASE: oldvibes
```

## Summary

✅ All authentication issues resolved  
✅ Server connects to MongoDB successfully  
✅ Seed scripts work properly  
✅ Swagger documentation shows all endpoints including new Recommendation system

**Status:** 🎉 Ready to use!
