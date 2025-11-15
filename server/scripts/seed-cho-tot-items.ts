#!/usr/bin/env bun

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { User } from "../schema/user.schema";
import { Vibe } from "../schema/vibe.schema";

// Load environment variables
dotenv.config();

// Import items from the JS file
// Note: You need to convert the JS file or import it properly
const choTotItems = [
  {
    itemName: 'iPhone 16 Pro Max 256GB',
    description: [
      'Điện thoại iPhone 13 Pro Max 256GB, màu xanh dương, tình trạng mới 99%.',
      'Máy còn bảo hành 8 tháng, đầy đủ phụ kiện trong hộp.',
      'Màn hình 6.7 inch Super Retina XDR, chip A15 Bionic mạnh mẽ.',
      'Camera 3 lens với tính năng Cinematic Mode và Night Mode.',
      'Bao test, bảo hành đổi trả nếu lỗi.'
    ].join('\n'),
    price: 18500000,
    category: 'Electronics',
    condition: 'like-new',
    location: 'Tp Hồ Chí Minh',
    tags: ['iPhone', 'iPhone 13 Pro Max', 'Apple', '256GB', 'smartphone'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/Phone.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/Phone.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'Laptop Dell XPS 13 9310',
    description: [
      'Laptop Dell XPS 13 9310, Intel Core i7, RAM 16GB, SSD 512GB, màn hình 13.4 inch 4K.',
      'Máy còn bảo hành 6 tháng, thiết kế mỏng nhẹ, hiệu năng cao.',
      'Phù hợp cho công việc văn phòng, học tập và đồ họa.',
      'Bàn phím có đèn nền, touchpad chính xác.',
      'Đầy đủ phụ kiện, bao test trước khi mua.'
    ].join('\n'),
    price: 30000000,
    category: 'Electronics',
    condition: 'good',
    location: 'Hà Nội',
    tags: ['laptop', 'Dell', 'XPS 13', 'i7', '16GB', '512GB', '4K'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/Lap.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/Lap.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'AirPods Pro 2',
    description: [
      'Tai nghe không dây AirPods Pro thế hệ 2, chống ồn chủ động, hàng chính hãng.',
      'Mới 100%, còn nguyên tem, bảo hành Apple Store.',
      'Tính năng chống ồn chủ động cải tiến, thời lượng pin lên đến 6 giờ.',
      'Hộp sạc MagSafe, hỗ trợ sạc không dây.',
      'Phù hợp cho nghe nhạc, gọi điện và làm việc.'
    ].join('\n'),
    price: 5500000,
    category: 'Electronics',
    condition: 'new',
    location: 'Tp Hồ Chí Minh',
    tags: ['AirPods', 'AirPods Pro', 'Apple', 'tai nghe', 'wireless'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/Airpod.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/Airpod.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'Apple Watch Series 8 GPS 44mm',
    description: [
      'Đồng hồ thông minh Apple Watch Series 8, GPS, 44mm, dây silicone màu đen.',
      'Tình trạng mới 98%, còn bảo hành 10 tháng.',
      'Màn hình Always-On Retina, chống nước 50m.',
      'Tính năng đo nhịp tim, ECG, theo dõi giấc ngủ.',
      'Pin dùng cả ngày, sạc nhanh 45 phút đầy 80%.'
    ].join('\n'),
    price: 8000000,
    category: 'Electronics',
    condition: 'like-new',
    location: 'Đà Nẵng',
    tags: ['Apple Watch', 'Series 8', 'smartwatch', 'GPS', '44mm'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/AppleWatch.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/AppleWatch.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'Máy ảnh Sony Alpha A7 III',
    description: [
      'Máy ảnh Sony Alpha A7 III, cảm biến Full-frame 24.2MP, quay video 4K.',
      'Kèm ống kính 28-70mm F3.5-5.6 OSS, đầy đủ phụ kiện.',
      'Máy đã qua sử dụng nhưng còn rất tốt, không lỗi lầm.',
      'Hỗ trợ ổn định hình ảnh 5 trục, chụp liên tục 10 fps.',
      'Pin dùng tốt, thẻ nhớ 128GB, giá hợp lý.'
    ].join('\n'),
    price: 35000000,
    category: 'Electronics',
    condition: 'good',
    location: 'Tp Hồ Chí Minh',
    tags: ['máy ảnh', 'Sony', 'Alpha A7 III', 'full-frame', '4K'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/Mayanh.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/Mayanh.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'Áo khoác da nam Zara size L',
    description: [
      'Áo khoác da nam Zara, size L, màu đen, hàng chính hãng.',
      'Mới 100%, còn nguyên tem, chất liệu da bò thật.',
      'Thiết kế thời trang, form fit, có túi bên trong và ngoài.',
      'Phù hợp cho công việc và dạo phố, rất sang trọng.',
      'Giá tốt, ship toàn quốc.'
    ].join('\n'),
    price: 2000000,
    category: 'Fashion',
    condition: 'new',
    location: 'Hà Nội',
    tags: ['áo khoác', 'da', 'nam', 'Zara', 'size L', 'thời trang'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/Aokhacdanam.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/Aokhacdanam.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'Đầm dạ hội nữ size M',
    description: [
      'Đầm dạ hội nữ, size M, màu đỏ, chất liệu lụa cao cấp.',
      'Thiết kế sang trọng, phù hợp cho các buổi tiệc và sự kiện.',
      'Mới 100%, chưa mặc, form dáng đẹp, có đai thắt lưng.',
      'Chiều dài đến gót chân, tay dài, cổ tròn.',
      'Giá hợp lý, ship COD.'
    ].join('\n'),
    price: 1500000,
    category: 'Fashion',
    condition: 'new',
    location: 'Tp Hồ Chí Minh',
    tags: ['đầm', 'dạ hội', 'nữ', 'size M', 'lụa', 'sang trọng'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/damdahoi.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/damdahoi.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'Giày thể thao Adidas Ultraboost 22 size 42',
    description: [
      'Giày thể thao Adidas Ultraboost 22, size 42, màu trắng, hàng chính hãng.',
      'Mới 100%, còn nguyên hộp, công nghệ Boost độ đàn hồi cao.',
      'Phù hợp cho chạy bộ, đi bộ và tập thể thao.',
      'Đế giày có độ bám tốt, thoáng khí, êm chân.',
      'Giá tốt so với thị trường, ship toàn quốc.'
    ].join('\n'),
    price: 3000000,
    category: 'Fashion',
    condition: 'new',
    location: 'Tp Hồ Chí Minh',
    tags: ['giày', 'Adidas', 'Ultraboost', 'thể thao', 'size 42', 'chính hãng'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/Giaythetaho.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/Giaythetaho.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'Túi xách nữ Michael Kors',
    description: [
      'Túi xách nữ Michael Kors, chất liệu da thật.',
      'Hàng xách tay từ Mỹ, mới 95%, còn rất đẹp.',
      'Thiết kế sang trọng, có khóa kéo và túi nhỏ bên trong.',
      'Kích thước vừa phải, phù hợp cho công việc và đi chơi.',
      'Quai đeo vai và tay cầm, rất tiện lợi.'
    ].join('\n'),
    price: 4500000,
    category: 'Fashion',
    condition: 'like-new',
    location: 'Tp Hồ Chí Minh',
    tags: ['túi xách', 'Michael Kors', 'nữ', 'da', 'hàng hiệu'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/Tuixach.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/Tuixach.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'Đồng hồ nam Casio G-Shock GA-2100',
    description: [
      'Đồng hồ nam Casio G-Shock GA-2100, màu đen, chống nước 200m.',
      'Mới 100%, còn nguyên hộp, bảo hành chính hãng 1 năm.',
      'Chống sốc, chống nước, pin 3 năm, hiển thị analog và digital.',
      'Phù hợp cho thể thao, công việc ngoài trời.',
      'Thiết kế thể thao, rất bền và chắc chắn.'
    ].join('\n'),
    price: 2200000,
    category: 'Fashion',
    condition: 'new',
    location: 'Hà Nội',
    tags: ['đồng hồ', 'Casio', 'G-Shock', 'nam', 'thể thao', 'chống nước'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/donghonam.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/donghonam.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'Sách "Đắc Nhân Tâm" - Dale Carnegie',
    description: [
      'Sách "Đắc Nhân Tâm" của Dale Carnegie, bản dịch tiếng Việt, bìa mềm.',
      'Sách cũ nhưng còn đẹp, không rách nát, trang đầy đủ.',
      'Cuốn sách nổi tiếng về nghệ thuật giao tiếp và thu phục lòng người.',
      'Phù hợp cho những ai muốn phát triển kỹ năng giao tiếp.',
      'Giá rẻ, ship toàn quốc.'
    ].join('\n'),
    price: 85000,
    category: 'Books',
    condition: 'good',
    location: 'Hà Nội',
    tags: ['sách', 'Đắc Nhân Tâm', 'Dale Carnegie', 'self-help', 'giao tiếp'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/nhagiakim.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/nhagiakim.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'Sách "Nhà Giả Kim" - Paulo Coelho',
    description: [
      'Sách "Nhà Giả Kim" của Paulo Coelho, bản dịch tiếng Việt, bìa cứng.',
      'Sách còn mới 90%, không có dấu hiệu sử dụng nhiều.',
      'Cuốn tiểu thuyết nổi tiếng kể về hành trình tìm kiếm ước mơ của chàng trai Santiago.',
      'Tác phẩm truyền cảm hứng, ý nghĩa sâu sắc về cuộc sống.',
      'Phù hợp cho mọi lứa tuổi, đọc rất hay.'
    ].join('\n'),
    price: 120000,
    category: 'Books',
    condition: 'good',
    location: 'Tp Hồ Chí Minh',
    tags: ['sách', 'Nhà Giả Kim', 'Paulo Coelho', 'tiểu thuyết', 'văn học'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/nhagiakim.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/nhagiakim.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'Sách "Dịch Kinh Tường giải',
    description: [
      'Sách "Dịch Kinh Tường giải" của Đại Tử Tướng, bản dịch tiếng Việt, bìa mềm.',
      'Sách cũ nhưng còn đẹp, không mất trang, chất lượng tốt.',
    ].join('\n'),
    price: 150000,
    category: 'Books',
    condition: 'fair',
    location: 'Đà Nẵng',
    tags: ['sách', 'Dịch Kinh Tường giải', 'Đại Tử Tướng'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/dichkinh.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/dichkinh.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'Sách "Tâm lý: Thoát khỏi bẫy nhân cách" - Carl Jung',
    description: [
      'Sách "Tâm lý: Thoát khỏi bẫy nhân cách" của Carl Jung, bản dịch tiếng Việt, bìa cứng.',
    ].join('\n'),
    price: 200000,
    category: 'Books',
    condition: 'like-new',
    location: 'Tp Hồ Chí Minh',
    tags: ['sách', 'Tâm lý', 'Thoát khỏi bẫy nhân cách', 'Carl Jung'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/baynhancach.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/baynhancach.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'Sách "Cà Phê Cùng Tony" - Tony Buổi Sáng',
    description: [
      'Sách "Cà Phê Cùng Tony" của Tony Buổi Sáng, bìa mềm.',
      'Sách cũ nhưng còn đẹp, không rách, trang đầy đủ.',
      'Tập hợp những bài viết về cuộc sống, công việc và đạo đức.',
      'Phong cách viết gần gũi, dễ hiểu, có nhiều bài học hay.',
      'Phù hợp cho giới trẻ, rất thực tế và hữu ích.'
    ].join('\n'),
    price: 95000,
    category: 'Books',
    condition: 'good',
    location: 'Cần Thơ',
    tags: ['sách', 'Cà Phê Cùng Tony', 'Tony Buổi Sáng', 'self-help', 'cuộc sống'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/caphecunggotny.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/caphecunggotny.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'Bộ lego xếp hình tàu Titanic',
    description: [
      'Bộ xếp hình LEGO Xếp hình Tàu Titanic, 1000+ mảnh, dành cho trẻ em 7+.',
      'Đồ chơi mới 100%, còn nguyên hộp, đầy đủ hướng dẫn.',
    ].join('\n'),
    price: 850000,
    category: 'Toys',
    condition: 'new',
    location: 'Tp Hồ Chí Minh',
    tags: ['LEGO', 'xếp hình', 'Tàu Titanic', 'trẻ em', '1000+ mảnh'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/xephinhtitanic.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/xephinhtitanic.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'Đồ chơi lắp ráp LEGO 60243 Police Helicopter',
    description: [
      'Đồ chơi lắp ráp LEGO 60243 Police Helicopter, 1000+ mảnh, dành cho trẻ em 7+.',
    ].join('\n'),
    price: 450000,
    category: 'Toys',
    condition: 'like-new',
    location: 'Hà Nội',
    tags: ['LEGO', 'xếp hình', 'Police Helicopter', 'trẻ em', '1000+ mảnh'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/legohelicopter.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/legohelicopter.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'Búp bê Barbie với phụ kiện',
    description: [
      'Búp bê Barbie có nhiều phụ kiện, quần áo và giày dép.',
      'Đồ chơi mới 90%, còn rất đẹp, có nhiều bộ trang phục.',
      'Phù hợp cho trẻ em gái từ 5 tuổi trở lên.',
      'Búp bê có thể thay đổi quần áo, chải tóc.',
      'Rất phổ biến, trẻ em rất thích.'
    ].join('\n'),
    price: 320000,
    category: 'Toys',
    condition: 'good',
    location: 'Đà Nẵng',
    tags: ['búp bê', 'Barbie', 'trẻ em', 'phụ kiện', 'quần áo'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/bupbephukien.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/bupbephukien.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'Bộ cờ vua gỗ cao cấp',
    description: [
      'Bộ cờ vua gỗ cao cấp, quân cờ điêu khắc đẹp, bàn cờ gỗ.',
      'Đồ chơi trí tuệ, phù hợp cho mọi lứa tuổi.',
      'Chất liệu gỗ tốt, quân cờ chắc chắn, không dễ vỡ.',
      'Giúp phát triển tư duy chiến thuật và logic.',
      'Còn mới 95%, có hộp đựng, giá hợp lý.'
    ].join('\n'),
    price: 180000,
    category: 'Toys',
    condition: 'like-new',
    location: 'Tp Hồ Chí Minh',
    tags: ['cờ vua', 'gỗ', 'trò chơi', 'trí tuệ', 'chiến thuật'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/bocovua.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/bocovua.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'Đồ chơi bập bênh Ngựa vằn Gỗ',
    description: [
      'Đồ chơi bập bênh Ngựa vằn Gỗ, Đồ chơi ngựa gỗ bập bênh còn khá mới, phù hợp cho bé 2-4 tuổi.',
      'Thiết kế ngựa vằn màu trắng, đen, nâu.',
      'Chất liệu gỗ chắc chắn, an toàn cho bé.',
      'Giúp bé vận động, phát triển thể chất.',
      'Thanh lý tại mặt đường Hoàng Hoa Thám, Ba Đình, Hà Nội.',
    ].join('\n'),
    price: 120000,
    category: 'Toys',
    condition: 'new',
    location: 'Cần Thơ',
    tags: ['puzzle', 'ghép hình', '1000 mảnh', 'phong cảnh', 'giải trí'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/ngua.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/ngua.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'Xe đạp thể thao 21 tốc độ',
    description: [
      'Xe đạp thể thao 21 tốc độ, khung nhôm nhẹ, còn mới 90%.',
      'Phù hợp cho đi lại, tập thể dục và du lịch.',
      'Phanh đĩa, yên êm, bánh xe 26 inch, rất chắc chắn.',
      'Đã sử dụng nhưng còn rất tốt, không có lỗi.',
      'Giá hợp lý, ship toàn quốc, bao test.'
    ].join('\n'),
    price: 1800000,
    category: 'Sports',
    condition: 'good',
    location: 'Tp Hồ Chí Minh',
    tags: ['xe đạp', 'thể thao', '21 tốc độ', 'khung nhôm', 'du lịch'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/Giaythetaho.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/Giaythetaho.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'Giày chạy bộ Nike Air Max size 42',
    description: [
      'Giày chạy bộ Nike Air Max, size 42, màu đen trắng, hàng chính hãng.',
      'Còn mới 95%, đã đi thử nhưng rất ít, còn rất đẹp.',
      'Công nghệ Air Max êm chân, đế giày có độ bám tốt.',
      'Phù hợp cho chạy bộ, đi bộ và tập thể thao.',
      'Thoáng khí, nhẹ, rất thoải mái khi mang.'
    ].join('\n'),
    price: 1200000,
    category: 'Sports',
    condition: 'like-new',
    location: 'Tp Hồ Chí Minh',
    tags: ['giày', 'Nike', 'Air Max', 'chạy bộ', 'size 42', 'thể thao'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/nikeair.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/nikeair.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'Vợt tennis Wilson Pro Staff',
    description: [
      'Vợt tennis Wilson Pro Staff, còn mới 95%, rất nổi tiếng.',
      'Phù hợp cho người chơi tennis từ trình độ trung bình đến cao.',
      'Trọng lượng vừa phải, cầm chắc tay, đánh bóng mạnh.',
      'Có bao vợt và grip, còn rất tốt.',
      'Giá hợp lý, ship toàn quốc.'
    ].join('\n'),
    price: 850000,
    category: 'Sports',
    condition: 'like-new',
    location: 'Đà Nẵng',
    tags: ['vợt', 'tennis', 'Wilson', 'Pro Staff', 'thể thao'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/vottenis.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/vottenis.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'Bóng đá Adidas Champions League size 5',
    description: [
      'Bóng đá Adidas Champions League, size 5, hàng chính hãng.',
      'Bóng mới 100%, còn nguyên hộp, chất lượng tốt.',
      'Thiết kế chính thức của giải đấu Champions League.',
      'Phù hợp cho thi đấu và tập luyện bóng đá.',
      'Bền, bóng đẹp, giá hợp lý.'
    ].join('\n'),
    price: 450000,
    category: 'Sports',
    condition: 'new',
    location: 'Tp Hồ Chí Minh',
    tags: ['bóng đá', 'Adidas', 'Champions League', 'size 5', 'thể thao'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/bongda.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/bongda.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'Đàn guitar acoustic Yamaha',
    description: [
      'Đàn guitar acoustic Yamaha, gỗ cây thông, âm thanh hay.',
      'Đàn đã qua sử dụng nhưng còn rất tốt, không có lỗi.',
      'Phù hợp cho người mới học và người chơi chuyên nghiệp.',
      'Dây đàn còn tốt, âm thanh trong và rõ.',
      'Có bao đàn và dây đàn dự phòng, giá hợp lý.'
    ].join('\n'),
    price: 3200000,
    category: 'Other',
    condition: 'good',
    location: 'Tp Hồ Chí Minh',
    tags: ['đàn guitar', 'acoustic', 'Yamaha', 'nhạc cụ', 'gỗ'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/guitar.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/guitar.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'Máy massage cầm tay',
    description: [
      'Máy massage cầm tay, nhiều chế độ, pin sạc.',
      'Máy mới 90%, đã dùng thử nhưng rất ít, còn rất tốt.',
      'Nhiều chế độ massage: rung, nhiệt, áp lực.',
      'Pin sạc dùng lâu, sạc nhanh, rất tiện lợi.',
      'Phù hợp cho massage cổ, vai, lưng và chân.'
    ].join('\n'),
    price: 450000,
    category: 'Other',
    condition: 'like-new',
    location: 'Hà Nội',
    tags: ['máy massage', 'cầm tay', 'pin sạc', 'sức khỏe', 'thư giãn'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/maymatxa.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/maymatxa.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'Thảm yoga cao cấp 6mm',
    description: [
      'Thảm yoga cao cấp, chống trượt, dày 6mm, màu tím.',
      'Thảm mới 100%, còn nguyên bao, chất liệu TPE an toàn.',
      'Phù hợp cho tập yoga, pilates và thể dục.',
      'Chống trượt tốt, dễ vệ sinh, nhẹ và gọn.',
      'Giá hợp lý, ship toàn quốc.'
    ].join('\n'),
    price: 280000,
    category: 'Other',
    condition: 'new',
    location: 'Tp Hồ Chí Minh',
    tags: ['thảm yoga', '6mm', 'chống trượt', 'thể dục', 'sức khỏe'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/thamyoga.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/thamyoga.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'Bình giữ nhiệt Zojirushi 500ml',
    description: [
      'Bình giữ nhiệt Zojirushi 500ml, màu đen, hàng Nhật.',
      'Bình mới 95%, đã dùng thử nhưng rất ít, còn rất tốt.',
      'Giữ nhiệt lâu, cả nóng và lạnh, rất hiệu quả.',
      'Thiết kế đẹp, dễ vệ sinh, nhẹ và tiện lợi.',
      'Phù hợp cho đi làm, đi học, rất thực dụng.'
    ].join('\n'),
    price: 350000,
    category: 'Other',
    condition: 'like-new',
    location: 'Đà Nẵng',
    tags: ['bình giữ nhiệt', 'Zojirushi', '500ml', 'Nhật', 'giữ nhiệt'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/binhgiunhiet.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/binhgiunhiet.jpg'
      }
    ],
    status: 'approved',
  },
  {
    itemName: 'Balo ADIDAS Prime Unisex màu be',
    description: [
      'Balo ADIDAS Prime Unisex màu be, màu xanh navy, hàng chính hãng.',
      'Balo đã qua sử dụng nhưng còn rất tốt, không có lỗi.',
      'Thiết kế chuyên nghiệp, có nhiều túi và ngăn.',
      'Chất liệu chống nước, đai đeo êm, phù hợp cho du lịch dài ngày.',
      'Còn rất chắc chắn, giá tốt so với mới.'
    ].join('\n'),
    price: 1800000,
    category: 'Other',
    condition: 'good',
    location: 'Tp Hồ Chí Minh',
    tags: ['balo', 'du lịch', 'Osprey', '40L', 'hành lý'],
    mediaFiles: [
      {
        type: 'image',
        url: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/balo.jpg',
        thumbnail: 'https://oldvibes-media.s3.us-east-1.amazonaws.com/seed/balo.jpg'
      }
    ],
    status: 'approved',
  },
];

// Sample user names
const sampleNames = [
  "Nguyễn Văn An",
  "Trần Thị Bình",
  "Lê Minh Cường",
  "Phạm Thị Dung",
  "Hoàng Văn Em",
  "Vũ Thị Phương",
  "Đặng Minh Giang",
  "Bùi Thị Hương",
  "Phan Văn Ích",
  "Võ Thị Kim",
  "Lý Minh Long",
  "Đinh Thị Mai",
  "Ngô Văn Nam",
  "Dương Thị Oanh",
  "Tôn Minh Phúc",
  "Hồ Thị Quỳnh",
  "Nguyễn Văn Sơn",
  "Trần Thị Tâm",
  "Lê Minh Uyên",
  "Phạm Thị Vân",
  "Hoàng Văn Bảo",
  "Vũ Thị Linh",
  "Đặng Minh Đức",
  "Bùi Thị Lan",
  "Phan Văn Huy",
  "Võ Thị Nga",
  "Lý Minh Quang",
  "Đinh Thị Thảo",
  "Ngô Văn Tuấn",
  "Dương Thị Hoa",
];

// Connect to MongoDB
async function connectDB() {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      "mongodb://admin:password@localhost:27017/oldvibes?authSource=admin";

    console.log("🔗 Connecting to MongoDB...");

    await mongoose.connect(mongoUri, {
      dbName: process.env.DB_NAME || "oldvibes",
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

// Convert Vietnamese characters to non-accented characters
function removeVietnameseAccents(str: string): string {
  const vietnameseMap: { [key: string]: string } = {
    'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a', 'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
    'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
    'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
    'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o', 'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
    'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u', 'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
    'đ': 'd',
    'À': 'A', 'Á': 'A', 'Ạ': 'A', 'Ả': 'A', 'Ã': 'A', 'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ậ': 'A', 'Ẩ': 'A', 'Ẫ': 'A',
    'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ặ': 'A', 'Ẳ': 'A', 'Ẵ': 'A',
    'È': 'E', 'É': 'E', 'Ẹ': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ệ': 'E', 'Ể': 'E', 'Ễ': 'E',
    'Ì': 'I', 'Í': 'I', 'Ị': 'I', 'Ỉ': 'I', 'Ĩ': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ọ': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ộ': 'O', 'Ổ': 'O', 'Ỗ': 'O',
    'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ợ': 'O', 'Ở': 'O', 'Ỡ': 'O',
    'Ù': 'U', 'Ú': 'U', 'Ụ': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ự': 'U', 'Ử': 'U', 'Ữ': 'U',
    'Ỳ': 'Y', 'Ý': 'Y', 'Ỵ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y',
    'Đ': 'D',
  };

  return str
    .split('')
    .map(char => vietnameseMap[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, ''); // Remove all non-alphanumeric characters except underscore
}

// Get or create users (ensure we have enough users)
async function getOrCreateUsers(): Promise<any[]> {
  // Check if we have existing users
  const existingUsers = await User.find({ role: "user" }).limit(choTotItems.length);
  
  if (existingUsers.length >= choTotItems.length) {
    console.log(`✅ Found ${existingUsers.length} existing users, using them`);
    // Shuffle users for random assignment
    return existingUsers.sort(() => Math.random() - 0.5).slice(0, choTotItems.length);
  }

  // If not enough users, create new ones
  const usersNeeded = choTotItems.length - existingUsers.length;
  const hashedPassword = await bcrypt.hash("123456", 10);
  const newUsers = [];

  for (let i = 0; i < usersNeeded; i++) {
    const nameIndex = (existingUsers.length + i) % sampleNames.length;
    const name = sampleNames[nameIndex];
    if (!name) continue;
    const cleanName = removeVietnameseAccents(name).replace(/\s+/g, '');
    const username = cleanName + (existingUsers.length + i);

    const user = new User({
      email: `${username}@example.com`,
      password: hashedPassword,
      name: name,
      username: username,
      role: "user",
      bio: `Xin chào! Mình là ${name}, rất vui được làm quen với mọi người.`,
      isVerified: Math.random() > 0.3,
      isEmailVerified: true,
      isActive: true,
    });
    newUsers.push(user);
  }

  if (newUsers.length > 0) {
    await User.insertMany(newUsers);
    console.log(`👥 Created ${newUsers.length} new users`);
  }

  // Combine existing and new users, then shuffle for random assignment
  const allUsers = [...existingUsers, ...newUsers];
  return allUsers.sort(() => Math.random() - 0.5).slice(0, choTotItems.length);
}

// Create vibes from Cho Tot items - each item appears exactly once
async function createVibesFromChoTotItems(users: any[]) {
  if (users.length < choTotItems.length) {
    throw new Error(`Not enough users! Need ${choTotItems.length} users but only have ${users.length}`);
  }

  // Shuffle items to ensure random order
  const shuffledItems = [...choTotItems].sort(() => Math.random() - 0.5);
  
  // Shuffle users to ensure random assignment
  const shuffledUsers = [...users].sort(() => Math.random() - 0.5);

  const vibes = [];
  const now = new Date();

  for (let i = 0; i < shuffledItems.length; i++) {
    const item = shuffledItems[i];
    if (!item) continue;
    const user = shuffledUsers[i % shuffledUsers.length]; // Each item gets a different user

    // Random expiry date (24 hours from now)
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Random views
    const views = Math.floor(Math.random() * 200) + 10;

    const vibe = new Vibe({
      userId: user._id,
      itemName: item.itemName,
      description: item.description,
      price: item.price,
      tags: item.tags,
      mediaFiles: item.mediaFiles.map(mf => ({
        type: mf.type as "image" | "video",
        url: mf.url,
        thumbnail: mf.thumbnail,
      })),
      status: item.status as "pending" | "approved" | "rejected" | "sold" | "archived",
      category: item.category,
      condition: item.condition as "new" | "like-new" | "good" | "fair" | "poor",
      location: item.location,
      likes: [], // No likes initially
      comments: [], // No comments
      commentsCount: 0, // No comments
      views,
      expiresAt,
      createdAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last 7 days
    });

    vibes.push(vibe);
  }

  await Vibe.insertMany(vibes);
  console.log(`📱 Created ${vibes.length} vibes from Cho Tot items`);
  console.log(`   - Each item appears exactly once`);
  console.log(`   - Randomly assigned to users`);
  console.log(`   - No comments created`);
  return vibes;
}

// Main seeding function
async function seedChoTotItems() {
  try {
    console.log("🌱 Starting Cho Tot items seeding...");
    console.log(`   - Total items: ${choTotItems.length}`);
    console.log(`   - Each item will appear exactly once`);
    console.log(`   - No comments will be created`);

    await connectDB();

    const users = await getOrCreateUsers();
    console.log(`👥 Using ${users.length} users for item assignment`);

    const vibes = await createVibesFromChoTotItems(users);

    console.log("✅ Cho Tot items seeding completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   📱 Vibes: ${vibes.length}`);
    console.log(`   ✅ Each item appears exactly once`);
    console.log(`   ✅ No comments created`);
  } catch (error) {
    console.error("❌ Seeding error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run the seeding
seedChoTotItems();
