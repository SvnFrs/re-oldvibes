# Admin Login Test Guide

## Vấn đề đã sửa

### 1. **LoginForm override redirect logic**
- **Vấn đề**: LoginForm gọi `router.push("/")` sau khi AuthContext đã gọi `router.push("/admin/panel")`
- **Giải pháp**: Loại bỏ `router.push(redirectTo)` trong LoginForm, để AuthContext xử lý redirect

### 2. **Router.push() không hoạt động trong async context**
- **Vấn đề**: `router.push()` trong AuthContext không hoạt động ngay lập tức
- **Giải pháp**: Sử dụng `window.location.href` thay vì `router.push()`

### 3. **Admin signin page không sử dụng AuthContext**
- **Vấn đề**: Admin signin page có logic riêng, không nhất quán
- **Giải pháp**: Cập nhật admin signin để sử dụng AuthContext

## Cách test

### Option 1: Sử dụng trang login thông thường
1. Truy cập `http://localhost:3000/auth/login`
2. Đăng nhập với tài khoản admin/staff
3. **Kết quả mong đợi**: Tự động chuyển đến `/admin/panel`

### Option 2: Sử dụng trang admin signin
1. Truy cập `http://localhost:3000/admin/signin`
2. Đăng nhập với tài khoản admin/staff
3. **Kết quả mong đợi**: Tự động chuyển đến `/admin/panel`

### Option 3: Test với user thường
1. Đăng nhập với tài khoản user thường
2. **Kết quả mong đợi**: Chuyển đến `/feed`

## Debug logs

Khi đăng nhập, kiểm tra console để xem:
```
User role: admin (hoặc staff)
Redirecting to admin panel
```

Nếu thấy:
```
User role: user
Redirecting to feed
```
Thì tài khoản không phải admin/staff.

## Tạo tài khoản admin/staff

### Cách 1: Qua database
```javascript
// Trong MongoDB
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### Cách 2: Qua API (nếu có endpoint)
```bash
curl -X POST http://localhost:4000/api/admin/staff \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "name": "Admin User",
    "username": "admin"
  }'
```

## Kiểm tra role trong database

```javascript
// MongoDB query
db.users.find({ role: { $in: ["admin", "staff"] } }, { email: 1, role: 1, username: 1 })
```

## Troubleshooting

### Nếu vẫn không chuyển hướng:
1. Kiểm tra console logs
2. Kiểm tra user role trong database
3. Kiểm tra network tab để xem API response
4. Thử hard refresh (Ctrl+F5)

### Nếu bị lỗi 404:
1. Kiểm tra route `/admin/panel` có tồn tại không
2. Kiểm tra server có chạy không
3. Kiểm tra API endpoint có hoạt động không

### Nếu bị lỗi authentication:
1. Kiểm tra cookies có được set không
2. Kiểm tra JWT token có hợp lệ không
3. Kiểm tra CORS settings

## Files đã sửa

1. `client/web/app/_contexts/AuthContext.tsx`
   - Thêm debug logs
   - Sử dụng `window.location.href` thay vì `router.push()`

2. `client/web/app/_components/auth/LoginForm.tsx`
   - Loại bỏ `router.push(redirectTo)` để không override admin redirect

3. `client/web/app/admin/signin/page.tsx`
   - Sử dụng AuthContext thay vì logic riêng
   - Thêm loading state

## Kết quả mong đợi

Sau khi sửa, khi đăng nhập với tài khoản admin/staff:
- ✅ Tự động chuyển đến `/admin/panel`
- ✅ Hiển thị admin dashboard với 4 tabs
- ✅ Có đầy đủ tính năng quản lý vibe, comment, user
- ✅ Console hiển thị debug logs

Khi đăng nhập với user thường:
- ✅ Chuyển đến `/feed` như bình thường
