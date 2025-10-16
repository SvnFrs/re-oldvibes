#!/usr/bin/env bun

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { User } from '../schema/user.schema';
import { Vibe } from '../schema/vibe.schema';
import { Comment } from '../schema/comment.schema';

// Load environment variables
dotenv.config();

// Sample data arrays
const sampleNames = [
  'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Minh Cường', 'Phạm Thị Dung', 'Hoàng Văn Em',
  'Vũ Thị Phương', 'Đặng Minh Giang', 'Bùi Thị Hương', 'Phan Văn Ích', 'Võ Thị Kim',
  'Lý Minh Long', 'Đinh Thị Mai', 'Ngô Văn Nam', 'Dương Thị Oanh', 'Tôn Minh Phúc',
  'Hồ Thị Quỳnh', 'Nguyễn Văn Sơn', 'Trần Thị Tâm', 'Lê Minh Uyên', 'Phạm Thị Vân'
];

const sampleUsernames = [
  'nguyenvanan', 'tranthibinh', 'leminhcuong', 'phamthidung', 'hoangvanem',
  'vuthiphuong', 'dangminhgiang', 'buithihuong', 'phanvanich', 'vothikim',
  'lyminhlong', 'dinhthimai', 'ngovannam', 'duongthioanh', 'tonminhphuc',
  'hothiquynh', 'nguyenvanson', 'tranthitam', 'leminhuyen', 'phamthivan'
];

const sampleEmails = sampleUsernames.map(username => `${username}@example.com`);

const categories = [
  'Electronics', 'Fashion', 'Books', 'Toys', 'Home', 'Sports', 'Beauty', 'Other'
];

const conditions = ['new', 'like-new', 'good', 'fair', 'poor'];

const locations = [
  'Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Biên Hòa', 'Huế', 'Nha Trang',
  'Vũng Tàu', 'Qui Nhơn', 'Thanh Hóa', 'Nam Định', 'Thái Nguyên', 'Vinh', 'Hải Dương'
];

// Sample items data
const sampleItems = [
  // Electronics
  { name: 'iPhone 13 Pro Max', description: 'Điện thoại iPhone 13 Pro Max 128GB, còn bảo hành 8 tháng, máy đẹp như mới', category: 'Electronics', price: 18500000, tags: ['iphone', 'apple', 'smartphone'] },
  { name: 'MacBook Air M1', description: 'Laptop MacBook Air M1 8GB RAM, 256GB SSD, máy còn bảo hành', category: 'Electronics', price: 22500000, tags: ['macbook', 'apple', 'laptop'] },
  { name: 'Samsung Galaxy S22', description: 'Điện thoại Samsung Galaxy S22 256GB, màu đen, máy đẹp', category: 'Electronics', price: 16500000, tags: ['samsung', 'android', 'smartphone'] },
  { name: 'iPad Pro 11 inch', description: 'Máy tính bảng iPad Pro 11 inch 128GB, kèm bút Apple Pencil', category: 'Electronics', price: 19500000, tags: ['ipad', 'apple', 'tablet'] },
  { name: 'AirPods Pro 2', description: 'Tai nghe AirPods Pro thế hệ 2, chống ồn chủ động', category: 'Electronics', price: 5500000, tags: ['airpods', 'apple', 'headphone'] },
  
  // Fashion
  { name: 'Áo khoác jean nam', description: 'Áo khoác jean nam size L, màu xanh đậm, chất liệu cotton cao cấp', category: 'Fashion', price: 450000, tags: ['áo khoác', 'jean', 'nam'] },
  { name: 'Váy liền nữ', description: 'Váy liền nữ size M, màu đen, thiết kế sang trọng', category: 'Fashion', price: 380000, tags: ['váy', 'nữ', 'công sở'] },
  { name: 'Giày sneaker Adidas', description: 'Giày sneaker Adidas size 42, màu trắng, còn mới 90%', category: 'Fashion', price: 850000, tags: ['giày', 'sneaker', 'adidas'] },
  { name: 'Túi xách nữ da', description: 'Túi xách nữ da bò thật, màu nâu, thiết kế vintage', category: 'Fashion', price: 1200000, tags: ['túi xách', 'da', 'nữ'] },
  { name: 'Đồng hồ nam Rolex', description: 'Đồng hồ nam Rolex Datejust, máy cơ, dây da', category: 'Fashion', price: 85000000, tags: ['đồng hồ', 'rolex', 'luxury'] },
  
  // Books
  { name: 'Sách "Đắc Nhân Tâm"', description: 'Sách Đắc Nhân Tâm bản tiếng Việt, sách cũ nhưng còn đẹp', category: 'Books', price: 85000, tags: ['sách', 'self-help', 'đắc nhân tâm'] },
  { name: 'Truyện tranh One Piece', description: 'Bộ truyện tranh One Piece tập 1-50, bản tiếng Nhật', category: 'Books', price: 250000, tags: ['manga', 'one piece', 'truyện tranh'] },
  { name: 'Sách học tiếng Anh', description: 'Sách học tiếng Anh TOEIC, kèm CD, sách mới 100%', category: 'Books', price: 120000, tags: ['sách', 'tiếng anh', 'toeic'] },
  { name: 'Từ điển Anh-Việt', description: 'Từ điển Anh-Việt Oxford, bản mới nhất, sách còn mới', category: 'Books', price: 180000, tags: ['từ điển', 'anh-việt', 'oxford'] },
  { name: 'Sách nấu ăn', description: 'Sách dạy nấu ăn món Việt Nam, nhiều hình ảnh minh họa', category: 'Books', price: 95000, tags: ['sách', 'nấu ăn', 'ẩm thực'] },
  
  // Toys
  { name: 'Lego Creator', description: 'Bộ lắp ráp Lego Creator, 1000 mảnh, dành cho trẻ em 8+', category: 'Toys', price: 850000, tags: ['lego', 'lắp ráp', 'trẻ em'] },
  { name: 'Xe điều khiển từ xa', description: 'Xe ô tô điều khiển từ xa, pin sạc, tốc độ cao', category: 'Toys', price: 450000, tags: ['xe', 'điều khiển', 'từ xa'] },
  { name: 'Búp bê Barbie', description: 'Búp bê Barbie có nhiều phụ kiện, đồ chơi mới', category: 'Toys', price: 320000, tags: ['búp bê', 'barbie', 'trẻ em'] },
  { name: 'Bộ cờ vua', description: 'Bộ cờ vua gỗ cao cấp, quân cờ điêu khắc đẹp', category: 'Toys', price: 180000, tags: ['cờ vua', 'gỗ', 'trò chơi'] },
  { name: 'Puzzle 1000 mảnh', description: 'Bộ ghép hình puzzle 1000 mảnh, hình phong cảnh', category: 'Toys', price: 120000, tags: ['puzzle', 'ghép hình', '1000 mảnh'] },
  
  // Home
  { name: 'Bàn làm việc gỗ', description: 'Bàn làm việc gỗ sồi, thiết kế hiện đại, kích thước 120x60cm', category: 'Home', price: 1200000, tags: ['bàn', 'gỗ', 'làm việc'] },
  { name: 'Ghế sofa 3 chỗ', description: 'Ghế sofa 3 chỗ ngồi, vải bố, màu xám, còn mới 95%', category: 'Home', price: 2500000, tags: ['sofa', 'ghế', 'phòng khách'] },
  { name: 'Tủ lạnh Samsung', description: 'Tủ lạnh Samsung 300L, inverter, tiết kiệm điện', category: 'Home', price: 8500000, tags: ['tủ lạnh', 'samsung', 'inverter'] },
  { name: 'Máy lọc nước', description: 'Máy lọc nước RO 7 cấp, lõi lọc còn mới', category: 'Home', price: 1800000, tags: ['máy lọc', 'nước', 'ro'] },
  { name: 'Bình nước nóng', description: 'Bình nước nóng Ariston 15L, tiết kiệm điện', category: 'Home', price: 1200000, tags: ['bình nước nóng', 'ariston', '15L'] },
  
  // Sports
  { name: 'Xe đạp thể thao', description: 'Xe đạp thể thao 21 tốc độ, khung nhôm, còn mới 90%', category: 'Sports', price: 1800000, tags: ['xe đạp', 'thể thao', '21 tốc độ'] },
  { name: 'Gậy golf bộ', description: 'Bộ gậy golf 14 gậy, thương hiệu Callaway, còn mới', category: 'Sports', price: 15000000, tags: ['golf', 'gậy', 'callaway'] },
  { name: 'Giày chạy bộ Nike', description: 'Giày chạy bộ Nike Air Max, size 42, màu đen trắng', category: 'Sports', price: 1200000, tags: ['giày', 'chạy bộ', 'nike'] },
  { name: 'Vợt tennis Wilson', description: 'Vợt tennis Wilson Pro Staff, còn mới 95%', category: 'Sports', price: 850000, tags: ['vợt', 'tennis', 'wilson'] },
  { name: 'Bóng đá Adidas', description: 'Bóng đá Adidas Champions League, size 5', category: 'Sports', price: 450000, tags: ['bóng đá', 'adidas', 'champions league'] },
  
  // Beauty
  { name: 'Son MAC Ruby Woo', description: 'Son MAC Ruby Woo, màu đỏ classic, còn mới 90%', category: 'Beauty', price: 380000, tags: ['son', 'mac', 'ruby woo'] },
  { name: 'Kem dưỡng ẩm La Mer', description: 'Kem dưỡng ẩm La Mer 30ml, hàng chính hãng', category: 'Beauty', price: 2800000, tags: ['kem dưỡng', 'la mer', 'luxury'] },
  { name: 'Nước hoa Chanel No.5', description: 'Nước hoa Chanel No.5 50ml, hàng chính hãng', category: 'Beauty', price: 2200000, tags: ['nước hoa', 'chanel', 'no.5'] },
  { name: 'Mặt nạ đất sét', description: 'Mặt nạ đất sét Innisfree, 100ml, còn mới', category: 'Beauty', price: 180000, tags: ['mặt nạ', 'đất sét', 'innisfree'] },
  { name: 'Serum vitamin C', description: 'Serum vitamin C The Ordinary, 30ml, hàng chính hãng', category: 'Beauty', price: 280000, tags: ['serum', 'vitamin c', 'the ordinary'] },
  
  // Other
  { name: 'Máy ảnh Canon', description: 'Máy ảnh Canon EOS 200D, kèm ống kính 18-55mm', category: 'Other', price: 8500000, tags: ['máy ảnh', 'canon', 'eos'] },
  { name: 'Đàn guitar acoustic', description: 'Đàn guitar acoustic Yamaha, gỗ cây thông, âm thanh hay', category: 'Other', price: 3200000, tags: ['đàn guitar', 'acoustic', 'yamaha'] },
  { name: 'Đồng hồ thông minh', description: 'Đồng hồ thông minh Apple Watch Series 7, GPS', category: 'Other', price: 6500000, tags: ['apple watch', 'thông minh', 'gps'] },
  { name: 'Máy massage', description: 'Máy massage cầm tay, nhiều chế độ, pin sạc', category: 'Other', price: 450000, tags: ['máy massage', 'cầm tay', 'sạc'] },
  { name: 'Thảm yoga', description: 'Thảm yoga cao cấp, chống trượt, dày 6mm', category: 'Other', price: 280000, tags: ['thảm yoga', 'chống trượt', '6mm'] }
];

// Sample comment texts
const sampleComments = [
  'Sản phẩm này còn mới không bạn?',
  'Giá có thể thương lượng được không?',
  'Mình quan tâm, có thể gặp xem hàng được không?',
  'Sản phẩm này còn bảo hành không?',
  'Bạn có ship không? Phí ship bao nhiêu?',
  'Mình muốn mua, khi nào có thể giao hàng?',
  'Sản phẩm này có phụ kiện gì kèm theo không?',
  'Mình ở xa, có thể ship COD không?',
  'Sản phẩm này đã sử dụng bao lâu rồi?',
  'Có thể đổi trả nếu không vừa ý không?',
  'Giá này có thể giảm thêm được không?',
  'Mình rất thích sản phẩm này, mong bạn phản hồi',
  'Có thể xem thêm hình ảnh được không?',
  'Sản phẩm này còn nguyên tem không?',
  'Mình muốn mua ngay, bạn có online không?'
];

// Sample image URLs (using placeholder images)
const sampleImageUrls = [
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop'
];

// Connect to MongoDB
async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017/oldvibes?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Clear existing data
async function clearData() {
  try {
    await Promise.all([
      User.deleteMany({}),
      Vibe.deleteMany({}),
      Comment.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
}

// Create sample users
async function createUsers() {
  const users = [];
  const hashedPassword = await bcrypt.hash('123456', 10);

  for (let i = 0; i < sampleNames.length; i++) {
    const user = new User({
      email: sampleEmails[i],
      password: hashedPassword,
      name: sampleNames[i],
      username: sampleUsernames[i],
      role: i === 0 ? 'admin' : i < 3 ? 'staff' : 'user',
      bio: `Xin chào! Mình là ${sampleNames[i]}, rất vui được làm quen với mọi người.`,
      isVerified: Math.random() > 0.3,
      isEmailVerified: true,
      isActive: true
    });
    users.push(user);
  }

  await User.insertMany(users);
  console.log(`👥 Created ${users.length} users`);
  return users;
}

// Create sample vibes
async function createVibes(users: any[]) {
  const vibes = [];
  const userCount = users.length;

  for (let i = 0; i < sampleItems.length * 3; i++) {
    const item = sampleItems[i % sampleItems.length];
    if (!item) continue;
    
    const user = users[Math.floor(Math.random() * userCount)];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    // Generate random price variation (±20%)
    const priceVariation = 0.8 + Math.random() * 0.4;
    const finalPrice = Math.round(item.price * priceVariation / 1000) * 1000;
    
    // Generate random views and likes
    const views = Math.floor(Math.random() * 500) + 10;
    const likesCount = Math.floor(Math.random() * views * 0.3);
    const commentsCount = Math.floor(Math.random() * 15);
    
    // Generate random media files (1-3 images)
    const mediaCount = Math.floor(Math.random() * 3) + 1;
    const mediaFiles = [];
    for (let j = 0; j < mediaCount; j++) {
      mediaFiles.push({
        type: 'image' as const,
        url: sampleImageUrls[Math.floor(Math.random() * sampleImageUrls.length)]
      });
    }
    
    // Random status (mostly approved)
    const statusRand = Math.random();
    let status = 'approved';
    if (statusRand < 0.05) status = 'pending';
    else if (statusRand < 0.08) status = 'sold';
    else if (statusRand < 0.1) status = 'rejected';
    
    // Random expiry date (some expired, some future)
    const now = new Date();
    const expiryDays = Math.random() < 0.3 ? -Math.floor(Math.random() * 7) : Math.floor(Math.random() * 7);
    const expiresAt = new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000);
    
    const vibe = new Vibe({
      userId: user._id,
      itemName: item.name,
      description: item.description,
      price: finalPrice,
      tags: item.tags,
      mediaFiles,
      status,
      category: item.category,
      condition,
      location,
      likes: [], // Will be populated separately
      comments: [], // Will be populated separately
      commentsCount,
      views,
      expiresAt,
      createdAt: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
    });
    
    vibes.push(vibe);
  }

  await Vibe.insertMany(vibes);
  console.log(`📱 Created ${vibes.length} vibes`);
  return vibes;
}

// Create sample comments
async function createComments(users: any[], vibes: any[]) {
  const comments = [];
  const userCount = users.length;
  const vibeCount = vibes.length;

  // Create comments for each vibe
  for (const vibe of vibes) {
    const commentCount = Math.floor(Math.random() * 8) + 1; // 1-8 comments per vibe
    
    for (let i = 0; i < commentCount; i++) {
      const user = users[Math.floor(Math.random() * userCount)];
      const commentText = sampleComments[Math.floor(Math.random() * sampleComments.length)];
      
      const comment = new Comment({
        vibeId: vibe._id,
        userId: user._id,
        content: commentText,
        likesCount: Math.floor(Math.random() * 5),
        repliesCount: 0,
        likes: [],
        createdAt: new Date(vibe.createdAt.getTime() + Math.random() * (Date.now() - vibe.createdAt.getTime()))
      });
      
      comments.push(comment);
    }
  }

  await Comment.insertMany(comments);
  console.log(`💬 Created ${comments.length} comments`);
  return comments;
}

// Update vibes with actual comments and likes
async function updateVibesWithInteractions(users: any[], vibes: any[], comments: any[]) {
  for (const vibe of vibes) {
    // Get comments for this vibe
    const vibeComments = comments.filter(c => c.vibeId.toString() === vibe._id.toString());
    
    // Get random users who liked this vibe
    const likeCount = Math.floor(Math.random() * 20) + 1;
    const likedUsers: mongoose.Types.ObjectId[] = [];
    for (let i = 0; i < likeCount && i < users.length; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      if (!likedUsers.find(u => u.toString() === randomUser._id.toString())) {
        likedUsers.push(randomUser._id);
      }
    }
    
    // Update vibe
    await Vibe.findByIdAndUpdate(vibe._id, {
      likes: likedUsers,
      comments: vibeComments.map(c => c._id),
      commentsCount: vibeComments.length,
      likesCount: likedUsers.length
    });
  }
  
  console.log('🔄 Updated vibes with interactions');
}

// Main seeding function
async function seedData() {
  try {
    console.log('🌱 Starting data seeding...');
    
    await connectDB();
    await clearData();
    
    const users = await createUsers();
    const vibes = await createVibes(users);
    const comments = await createComments(users, vibes);
    await updateVibesWithInteractions(users, vibes, comments);
    
    console.log('✅ Data seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   📱 Vibes: ${vibes.length}`);
    console.log(`   💬 Comments: ${comments.length}`);
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seeding
seedData();
