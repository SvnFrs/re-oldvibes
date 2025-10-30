# Admin Features - Use Case Descriptions

## Tổng quan
Tài liệu này mô tả các tính năng admin mới được thêm vào hệ thống Old Vibes, bao gồm quản lý comment, vibe và người dùng.

## 1. Filter Comment by Vibe

### Mô tả
Cho phép admin xem và lọc tất cả comment của một vibe cụ thể với các tùy chọn tìm kiếm và sắp xếp.

### Use Case
**Actor:** Admin/Staff  
**Goal:** Xem và quản lý comment của một vibe  
**Precondition:** Admin đã đăng nhập và có quyền truy cập

### Luồng chính
1. Admin chọn một vibe từ danh sách
2. Hệ thống hiển thị tất cả comment của vibe đó
3. Admin có thể:
   - Tìm kiếm comment theo nội dung
   - Sắp xếp theo: mới nhất, cũ nhất, nhiều like nhất
   - Phân trang để xem thêm comment
4. Admin có thể thực hiện các hành động trên comment

### API Endpoint
```
GET /api/admin/vibes/{vibeId}/comments
Query params: limit, offset, sortBy, search
```

### Response
```json
{
  "comments": [...],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## 2. Filter Vibe by Name, Category, Price

### Mô tả
Cho phép admin lọc và tìm kiếm vibe theo nhiều tiêu chí khác nhau.

### Use Case
**Actor:** Admin/Staff  
**Goal:** Tìm kiếm và lọc vibe theo các tiêu chí  
**Precondition:** Admin đã đăng nhập

### Luồng chính
1. Admin truy cập trang quản lý vibe
2. Admin nhập các tiêu chí lọc:
   - Tên sản phẩm (tìm kiếm mờ)
   - Danh mục
   - Khoảng giá (min, max)
   - Tình trạng sản phẩm
   - Trạng thái vibe (pending, approved, rejected, sold, archived)
3. Hệ thống trả về danh sách vibe phù hợp
4. Admin có thể xem chi tiết hoặc thực hiện hành động

### API Endpoint
```
GET /api/admin/vibes/filter
Query params: name, category, minPrice, maxPrice, condition, status, limit, offset
```

### Response
```json
{
  "vibes": [...],
  "pagination": {...},
  "filters": {
    "name": "iPhone",
    "category": "Electronics",
    "minPrice": 100,
    "maxPrice": 1000,
    "condition": "Good",
    "status": "approved"
  }
}
```

---

## 3. View Comment List by Vibe

### Mô tả
Admin có thể xem tất cả comment liên quan đến một vibe cụ thể để kiểm duyệt.

### Use Case
**Actor:** Admin/Staff  
**Goal:** Kiểm duyệt comment của một vibe  
**Precondition:** Admin đã đăng nhập

### Luồng chính
1. Admin chọn vibe cần kiểm duyệt
2. Hệ thống hiển thị danh sách comment của vibe
3. Admin xem xét từng comment:
   - Nội dung comment
   - Thông tin người comment
   - Thời gian comment
   - Số lượng like/reply
4. Admin có thể:
   - Xóa comment không phù hợp
   - Ban user nếu comment vi phạm nghiêm trọng
   - Gửi cảnh báo

### API Endpoint
```
GET /api/admin/vibes/{vibeId}/comments
```

---

## 4. Ban User with Bad Comment

### Mô tả
Hệ thống tự động phát hiện comment vi phạm và cho phép admin ban user.

### Use Case
**Actor:** Admin/Staff  
**Goal:** Ban user có comment vi phạm quy tắc cộng đồng  
**Precondition:** Admin đã đăng nhập, comment vi phạm được phát hiện

### Luồng chính
1. Hệ thống AI phát hiện comment có nội dung không phù hợp
2. Admin được thông báo về comment vi phạm
3. Admin xem xét comment và quyết định:
   - Ban user ngay lập tức
   - Cảnh báo trước
   - Bỏ qua nếu không vi phạm
4. Nếu ban user:
   - User bị vô hiệu hóa tài khoản
   - Tất cả comment của user bị ẩn
   - Gửi email thông báo cho user

### API Endpoint
```
POST /api/admin/users/ban-for-comment
Body: { userId, commentId, reason }
```

### AI Detection Keywords
- Spam, scam, fake
- Hate speech, abuse, harassment
- Inappropriate, offensive, vulgar
- Threat, violence

---

## 5. View Vibe List (Admin)

### Mô tả
Admin có thể xem tất cả vibe trong hệ thống với khả năng lọc và sắp xếp.

### Use Case
**Actor:** Admin/Staff  
**Goal:** Quản lý tất cả vibe trong hệ thống  
**Precondition:** Admin đã đăng nhập

### Luồng chính
1. Admin truy cập trang quản lý vibe
2. Hệ thống hiển thị danh sách tất cả vibe
3. Admin có thể:
   - Lọc theo trạng thái (pending, approved, rejected, sold, archived)
   - Sắp xếp theo: ngày tạo, giá, lượt like, lượt xem
   - Tìm kiếm theo tên sản phẩm
   - Xem thống kê tổng quan
4. Admin có thể thực hiện hành động trên từng vibe

### API Endpoint
```
GET /api/admin/vibes
Query params: status, limit, offset, sortBy
```

### Response
```json
{
  "vibes": [...],
  "pagination": {...},
  "totalCount": 1500
}
```

---

## 6. View Detail Vibe (Admin)

### Mô tả
Admin có thể xem chi tiết đầy đủ của một vibe bao gồm thông tin và comment.

### Use Case
**Actor:** Admin/Staff  
**Goal:** Xem chi tiết vibe để kiểm duyệt hoặc hỗ trợ  
**Precondition:** Admin đã đăng nhập

### Luồng chính
1. Admin chọn vibe cần xem chi tiết
2. Hệ thống hiển thị:
   - Thông tin đầy đủ của vibe
   - Thông tin người đăng
   - Media files (ảnh/video)
   - Danh sách comment gần đây
   - Lịch sử thay đổi
3. Admin có thể:
   - Phê duyệt/từ chối vibe
   - Xem tất cả comment
   - Liên hệ với người đăng
   - Chỉnh sửa thông tin nếu cần

### API Endpoint
```
GET /api/admin/vibes/{vibeId}
```

### Response
```json
{
  "vibe": {...},
  "comments": [...],
  "commentsCount": 25
}
```

---

## 7. Admin Routing & Navigation

### Mô tả
Hệ thống điều hướng admin sau khi đăng nhập thành công.

### Use Case
**Actor:** Admin/Staff  
**Goal:** Truy cập admin panel sau khi đăng nhập  
**Precondition:** User có role admin hoặc staff

### Luồng chính
1. User đăng nhập với tài khoản admin/staff
2. Hệ thống kiểm tra role
3. Nếu là admin/staff:
   - Chuyển hướng đến `/admin/panel`
   - Hiển thị admin dashboard
4. Nếu là user thường:
   - Chuyển hướng đến trang chủ thông thường

### Implementation
- Cập nhật AuthContext để kiểm tra role
- Thêm logic redirect trong login component
- Tạo protected route cho admin panel

---

## Technical Implementation Notes

### Database Changes
- Không cần thay đổi schema hiện tại
- Sử dụng existing collections: vibes, comments, users

### Security
- Tất cả admin endpoints yêu cầu authentication
- Kiểm tra role (admin/staff) trước khi truy cập
- Log tất cả hành động admin để audit

### Performance
- Sử dụng pagination cho tất cả danh sách
- Index database cho các trường tìm kiếm
- Cache kết quả tìm kiếm phổ biến

### Error Handling
- Xử lý lỗi database gracefully
- Validate input parameters
- Trả về error messages rõ ràng

### Testing
- Unit tests cho tất cả controller functions
- Integration tests cho API endpoints
- E2E tests cho admin workflows

---

## Future Enhancements

1. **Advanced AI Detection**
   - Tích hợp AI service thực tế
   - Machine learning model cho content moderation
   - Sentiment analysis

2. **Bulk Operations**
   - Ban multiple users
   - Approve/reject multiple vibes
   - Bulk comment deletion

3. **Analytics Dashboard**
   - Thống kê comment vi phạm
   - Biểu đồ hoạt động user
   - Report generation

4. **Notification System**
   - Real-time notifications cho admin
   - Email alerts cho violations
   - Mobile push notifications

5. **Audit Logging**
   - Chi tiết log tất cả admin actions
   - User activity tracking
   - Compliance reporting
