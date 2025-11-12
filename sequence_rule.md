# Sequence Diagram Numbering Rules & Banner Management Flow

## Quy tắc đánh số

- **Interaction numbering**  
  - Mọi interaction luôn có số thứ tự với dấu chấm (`1.`, `2.`, `3.`) theo thứ tự **tuần tự thời gian**.  
  - Số tuần tự **tiếp nối liên tục trong cùng một flow**, không reset giữa các layer.  

- **Alt block numbering**  
  - Khi vào alt block, **bước đầu tiên được đánh số dạng thập phân**, ví dụ: `11.1.` (tiếp nối số trước alt).  
  - Các step bên trong alt dùng **decimal tăng cấp**, ví dụ: `11.1.1.`, `11.1.2.`  
  - Nếu có nhánh `else` → đánh số **cùng cấp với alt**, ví dụ: `11.2.` và các bước con `11.2.1.`, `11.2.2.`  

- **Nested alt blocks**  
  - Sử dụng **decimal lồng nhau**, ví dụ: `11.1.1.1.`, `11.1.1.2.`  

- **Return messages**  
  - Cũng được đánh số theo quy tắc tuần tự hoặc thập phân trong alt.  

- **Activation bars**  
  - Mọi participant được `activate` **khi được gọi** và `deactivate` **sau khi trả lời xong**.  
  - Actor chính (`Guest`, `Admin`, …) được `activate` **tại đầu flow** và `deactivate` **cuối flow**.  

- **Title**  
  - Không chứa số thứ tự.  

---

## Architecture Layers

- **Client (Boundary)**: Client-side React/Next.js application  
- **Route (Boundary)**: Express routes, entry point for API requests  
- **Auth Middleware (Control)**: JWT token authentication  
- **Role Middleware (Control)**: Role-based authorization (admin, staff, user)  
- **Upload Middleware (Control)**: File upload validation + S3 upload  
- **Controller (Control)**: Business logic, request validation, response formatting  
- **Model (Entity)**: Data access layer, MongoDB queries, data transformation  
- **Database**: MongoDB database  
- **AWS S3**: Cloud storage for files  

---

## Flow Pattern

1. **Client → Route**: HTTP request  
2. **Route → Auth Middleware**: Authentication check  
3. **Route → Role Middleware**: Authorization check  
4. **Route → Upload Middleware** (nếu upload file): File validation + upload  
5. **Route → Controller**: Business logic  
6. **Controller → Model**: Data access  
7. **Model → Database**: MongoDB queries  
8. **Database → Model**: Return data  
9. **Model → Controller**: Formatted data  
10. **Controller → Route**: Response  
11. **Route → Client**: HTTP response  
12. **Client**: Update state & UI  

> Nếu trong flow có **alt/else**, số tiếp nối được áp dụng theo quy tắc **decimal** như trên.  

> tạm thời bỏ qua logic authentication và authorization check
---

## Ghi chú

- Tất cả flow có **error handling**, được biểu diễn bằng alt/else.  
- Authentication & authorization luôn kiểm tra qua **middleware**.  
- File uploads luôn qua **Upload Middleware** trước khi Controller.  
- MongoDB queries luôn qua **Model layer**, Controller không trực tiếp thao tác DB.  
- Client state management cập nhật **sau mỗi response API**.  
- Tất cả các interaction đều đánh số tuần tự và alt để dễ đọc & đồng nhất.  

---
