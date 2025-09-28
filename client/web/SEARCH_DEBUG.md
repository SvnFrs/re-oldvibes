# Search Functionality Debug Guide

## 🔍 How to Test Search Functionality

### 1. **Check Browser Console**
Open Developer Tools (F12) and check the Console tab for any error messages.

### 2. **Test Steps**

#### **Step 1: Basic Search Test**
1. Go to `/search` page
2. Type something in the search box (e.g., "iPhone")
3. Press Enter or click Search button
4. Check console for these logs:
   ```
   Search form submitted with query: iPhone
   Filters: {category: "", condition: "", minPrice: "", maxPrice: ""}
   Fetching results with params: {q: "iPhone", category: undefined, ...}
   Using search API...
   Search URL: http://localhost:4000/api/vibes/search?q=iPhone
   Search Response Status: 200
   Search response: {vibes: [...], count: X}
   ```

#### **Step 2: Filter Test**
1. Select a category (e.g., "Electronics")
2. Click "Apply Filters"
3. Check console for filter parameters

#### **Step 3: Empty Search Test**
1. Clear search box
2. Don't select any filters
3. Click Search
4. Should fetch all vibes using `getVibes()` API

### 3. **Common Issues & Solutions**

#### **Issue: No console logs appear**
**Solution:** Check if JavaScript is enabled and no errors in console

#### **Issue: "Failed to fetch" error**
**Solution:** 
- Check if server is running on port 4000
- Test API directly: `curl http://localhost:4000/api/vibes`

#### **Issue: "Unexpected token '<'" error**
**Solution:** 
- Server returning HTML instead of JSON
- Check server CORS configuration
- Verify API endpoint URL

#### **Issue: Search returns no results**
**Solution:**
- Check if database has data
- Run seeding script: `cd server && bun run seed:quick`
- Verify search parameters in console

#### **Issue: Form doesn't submit**
**Solution:**
- Check if `onSubmit` handler is attached
- Verify button has `type="submit"`
- Check for JavaScript errors

### 4. **API Endpoints to Test**

#### **Direct API Tests:**
```bash
# Test basic vibes endpoint
curl http://localhost:4000/api/vibes

# Test search endpoint
curl "http://localhost:4000/api/vibes/search?q=iPhone"

# Test search with filters
curl "http://localhost:4000/api/vibes/search?category=Electronics&condition=new"
```

### 5. **Expected Behavior**

#### **Working Search Should:**
- ✅ Show loading state when searching
- ✅ Display results in grid layout
- ✅ Show result count
- ✅ Handle empty results gracefully
- ✅ Work with both Enter key and button click
- ✅ Apply filters correctly
- ✅ Clear filters when "Clear All" clicked

#### **Console Logs Should Show:**
- ✅ Form submission events
- ✅ API request parameters
- ✅ API response data
- ✅ Loading state changes

### 6. **Debug Checklist**

- [ ] Server running on port 4000
- [ ] Database has test data
- [ ] No CORS errors in console
- [ ] API endpoints responding correctly
- [ ] Search form has proper event handlers
- [ ] Loading states working
- [ ] Error handling in place

### 7. **Quick Fixes**

#### **If search doesn't work at all:**
1. Check server status: `curl http://localhost:4000/api/vibes`
2. Restart server: `cd server && bun start`
3. Check browser console for errors

#### **If search returns wrong results:**
1. Check search parameters in console
2. Verify API endpoint URL
3. Test API directly with curl

#### **If UI doesn't update:**
1. Check React state updates
2. Verify loading states
3. Check for JavaScript errors

---

## 🚀 Test Commands

```bash
# Start server
cd server && bun start

# Seed test data
cd server && bun run seed:quick

# Test API endpoints
curl http://localhost:4000/api/vibes
curl "http://localhost:4000/api/vibes/search?q=iPhone"
```
