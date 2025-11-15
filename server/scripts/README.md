# Seed Data Scripts

Scripts để tạo dữ liệu mẫu cho database.

## Cấu trúc

- `seed-data.ts` - Script chính để seed dữ liệu đầy đủ (có thể bật crawler qua env)
- `seed-chotot.ts` - Script chuyên dụng để crawl dữ liệu từ Chợ Tốt
- `quick-seed.ts` - Script nhanh để tạo dữ liệu test tối thiểu
- `clean-data.ts` - Script để xóa dữ liệu trong database
- `utils/chotot-crawler.ts` - Crawler utility để lấy dữ liệu thực từ Chợ Tốt

## Các script có sẵn

### Seed Data
```bash
# Seed dữ liệu đầy đủ (dữ liệu mẫu)
bun run seed

# Seed dữ liệu từ Chợ Tốt crawler (KHUYẾN NGHỊ)
bun run seed:chotot

# Seed dữ liệu nhanh (ít dữ liệu hơn)
bun run seed:quick
```

### Clean Data
```bash
# Xóa tất cả dữ liệu (users, vibes, comments)
bun run clean

# Xóa chỉ users
bun run clean:users

# Xóa chỉ vibes
bun run clean:vibes

# Xóa chỉ comments
bun run clean:comments
```

## Sử dụng Crawler từ Chợ Tốt

### Cách 1: Sử dụng script chuyên dụng (KHUYẾN NGHỊ)

Chạy trực tiếp script `seed-chotot.ts`:

```bash
bun run seed:chotot
```

Script này sẽ tự động:
- Crawl dữ liệu từ Chợ Tốt cho tất cả các categories
- Sử dụng 5 items mỗi category (có thể config qua env `CRAWL_ITEMS_PER_CATEGORY`)
- Tự động fallback về dữ liệu mẫu nếu crawler thất bại

### Cách 2: Sử dụng seed-data.ts với biến môi trường

Để sử dụng crawler với `seed-data.ts`, set biến môi trường:

```bash
# Bật crawler
export USE_CRAWLER=true
export CRAWL_ITEMS_PER_CATEGORY=3  # Số items mỗi category (mặc định: 3)

# Chạy seed
bun run seed
```

Hoặc tạo file `.env` trong thư mục `server/`:

```env
USE_CRAWLER=true
CRAWL_ITEMS_PER_CATEGORY=3
```

### Tắt crawler (sử dụng dữ liệu mẫu)

Nếu không set `USE_CRAWLER=true`, script `seed-data.ts` sẽ sử dụng dữ liệu mẫu fallback:

```bash
bun run seed
```

## Lưu ý

- Crawler có thể mất thời gian do phải crawl từng trang
- Crawler có delay giữa các request để tránh rate limiting
- Nếu crawler thất bại, script sẽ tự động fallback về dữ liệu mẫu
- Hình ảnh từ crawler sẽ được sử dụng trực tiếp từ URL của Chợ Tốt

## Cấu trúc dữ liệu

Crawler sẽ lấy các thông tin sau từ Chợ Tốt:
- Tên sản phẩm
- Mô tả
- Giá
- Category
- Condition (tình trạng)
- Location (địa điểm)
- Tags
- Hình ảnh (URL)
