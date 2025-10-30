# Show Vibes Feature - Admin Dashboard

## Tổng quan
Đã thêm tính năng **"Show Vibes"** vào admin dashboard, cho phép admin/staff xem danh sách vibe một cách trực quan và xem chi tiết từng vibe.

## ✅ Tính năng đã triển khai

### 1. **Tab "Show Vibes" mới**
- Thêm tab riêng biệt trong admin panel
- Tách biệt với "Vibe Moderation" để dễ sử dụng
- Icon: 📷 (IconPhoto)

### 2. **Giao diện Grid Layout**
- Hiển thị vibe dạng card grid (responsive)
- 1 cột trên mobile, 2 cột trên tablet, 3 cột trên desktop
- Hover effects và transitions mượt mà

### 3. **Thông tin hiển thị trên mỗi card**
- **Tên sản phẩm** (itemName)
- **Status badge** với màu sắc:
  - 🟢 Approved: Green
  - 🟡 Pending: Yellow  
  - 🔴 Rejected: Red
  - 🔵 Sold: Blue
  - ⚫ Archived: Gray
- **Thông tin cơ bản**: User, Price, Category
- **Thống kê**: Views, Likes, Comments
- **Mô tả** (truncated)
- **Nút "View Details"**

### 4. **Tính năng lọc và tìm kiếm**
- **Search**: Tìm kiếm theo tên, category, user
- **Status Filter**: All, Pending, Approved, Rejected, Sold, Archived
- **Sort Options**: 
  - Newest First
  - Oldest First
  - Price: Low to High
  - Price: High to Low
  - Most Liked
  - Most Viewed

### 5. **Pagination**
- 20 vibes per page
- Previous/Next buttons
- Page indicator
- Responsive pagination

### 6. **Modal chi tiết vibe**
- **Thông tin đầy đủ**:
  - Tên sản phẩm và giá
  - Status và user info
  - Category, Condition, Location
  - Mô tả chi tiết
  - Tags (nếu có)
  - Thống kê engagement
  - Timestamps (created, updated)
- **Responsive design**
- **Scrollable content** (max-height: 24rem)

### 7. **API Integration**
- Sử dụng `/api/admin/vibes` endpoint
- Hỗ trợ filtering và pagination
- Error handling và loading states
- Real-time refresh

## 🎨 UI/UX Features

### **Color Coding**
```css
Approved:   bg-green-100 text-green-800
Pending:    bg-yellow-100 text-yellow-800  
Rejected:   bg-red-100 text-red-800
Sold:       bg-blue-100 text-blue-800
Archived:   bg-gray-100 text-gray-800
```

### **Responsive Design**
- **Mobile**: 1 column grid
- **Tablet**: 2 columns grid  
- **Desktop**: 3 columns grid
- **Filters**: Wrap on smaller screens

### **Interactive Elements**
- **Hover effects**: Card shadow on hover
- **Button states**: Disabled states for pagination
- **Loading states**: Loading spinner
- **Error states**: Error messages with styling

## 🔧 Technical Implementation

### **State Management**
```typescript
const [vibes, setVibes] = useState<Vibe[]>([]);
const [loading, setLoading] = useState(true);
const [selectedVibe, setSelectedVibe] = useState<Vibe | null>(null);
const [modalOpen, setModalOpen] = useState(false);
const [statusFilter, setStatusFilter] = useState("all");
const [sortBy, setSortBy] = useState("newest");
const [searchTerm, setSearchTerm] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
```

### **API Calls**
```typescript
// Fetch vibes with filters
const fetchVibes = (page = 1) => {
  const params = new URLSearchParams({
    status: statusFilter,
    sortBy,
    limit: itemsPerPage.toString(),
    offset: offset.toString(),
  });
  
  fetch(API + `/admin/vibes?${params}`, { credentials: "include" })
    .then((r) => r.json())
    .then((d) => {
      setVibes(d.vibes || []);
      setTotalPages(Math.ceil((d.totalCount || 0) / itemsPerPage));
    });
};

// View vibe details
const viewVibeDetails = async (vibeId: string) => {
  const res = await fetch(API + `/admin/vibes/${vibeId}`, {
    credentials: "include",
  });
  const data = await res.json();
  setSelectedVibe(data.vibe);
  setModalOpen(true);
};
```

## 📱 Usage

### **Cách sử dụng:**
1. **Đăng nhập** với tài khoản admin/staff
2. **Truy cập** admin panel (`/admin/panel`)
3. **Chọn tab** "Show Vibes"
4. **Sử dụng filters** để tìm vibe cần xem
5. **Click "View Details"** để xem chi tiết
6. **Sử dụng pagination** để xem thêm vibe

### **Workflow:**
```
Admin Login → Admin Panel → Show Vibes Tab → 
Filter/Search → View Details → Close Modal → 
Continue Browsing
```

## 🚀 Benefits

### **Cho Admin:**
- **Dễ dàng browse** tất cả vibe trong hệ thống
- **Tìm kiếm nhanh** với filters và search
- **Xem chi tiết** mà không cần rời khỏi trang
- **Giao diện trực quan** với grid layout

### **Cho System:**
- **Tách biệt** với moderation workflow
- **Performance tốt** với pagination
- **Responsive** trên mọi thiết bị
- **Consistent** với design system

## 🔄 Future Enhancements

1. **Bulk Actions**: Select multiple vibes để thực hiện hành động hàng loạt
2. **Export**: Export danh sách vibe ra CSV/Excel
3. **Advanced Filters**: Filter theo date range, price range, location
4. **Real-time Updates**: WebSocket để update real-time
5. **Analytics**: Charts và statistics về vibe trends

## 📁 Files Modified

- `client/web/app/admin/panel/page.tsx`
  - Thêm tab "Show Vibes"
  - Thêm ShowVibesSection component
  - Cập nhật Vibe type definition
  - Thêm pagination và modal logic

## ✅ Testing Checklist

- [ ] Tab "Show Vibes" hiển thị đúng
- [ ] Grid layout responsive trên các screen sizes
- [ ] Filters hoạt động đúng (status, sort, search)
- [ ] Pagination hoạt động đúng
- [ ] Modal chi tiết hiển thị đầy đủ thông tin
- [ ] Error handling hoạt động
- [ ] Loading states hiển thị đúng
- [ ] API calls thành công
- [ ] Performance tốt với large datasets



