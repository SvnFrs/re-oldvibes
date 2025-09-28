#!/usr/bin/env bun

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../schema/user.schema';
import { Vibe } from '../schema/vibe.schema';
import { Comment } from '../schema/comment.schema';

// Quick sample data
const quickUsers = [
  { name: 'Admin User', username: 'admin', email: 'admin@example.com', role: 'admin' },
  { name: 'Staff User', username: 'staff', email: 'staff@example.com', role: 'staff' },
  { name: 'Nguyễn Văn An', username: 'nguyenvanan', email: 'user1@example.com', role: 'user' },
  { name: 'Trần Thị Bình', username: 'tranthibinh', email: 'user2@example.com', role: 'user' },
  { name: 'Lê Minh Cường', username: 'leminhcuong', email: 'user3@example.com', role: 'user' }
];

const quickItems = [
  {
    name: 'iPhone 13 Pro Max',
    description: 'Điện thoại iPhone 13 Pro Max 128GB, còn bảo hành 8 tháng, máy đẹp như mới',
    category: 'Electronics',
    price: 18500000,
    tags: ['iphone', 'apple', 'smartphone'],
    condition: 'like-new',
    location: 'Hồ Chí Minh'
  },
  {
    name: 'MacBook Air M1',
    description: 'Laptop MacBook Air M1 8GB RAM, 256GB SSD, máy còn bảo hành',
    category: 'Electronics',
    price: 22500000,
    tags: ['macbook', 'apple', 'laptop'],
    condition: 'good',
    location: 'Hà Nội'
  },
  {
    name: 'Áo khoác jean nam',
    description: 'Áo khoác jean nam size L, màu xanh đậm, chất liệu cotton cao cấp',
    category: 'Fashion',
    price: 450000,
    tags: ['áo khoác', 'jean', 'nam'],
    condition: 'new',
    location: 'Đà Nẵng'
  },
  {
    name: 'Xe đạp thể thao',
    description: 'Xe đạp thể thao 21 tốc độ, khung nhôm, còn mới 90%',
    category: 'Sports',
    price: 1800000,
    tags: ['xe đạp', 'thể thao', '21 tốc độ'],
    condition: 'good',
    location: 'Hải Phòng'
  },
  {
    name: 'Bàn làm việc gỗ',
    description: 'Bàn làm việc gỗ sồi, thiết kế hiện đại, kích thước 120x60cm',
    category: 'Home',
    price: 1200000,
    tags: ['bàn', 'gỗ', 'làm việc'],
    condition: 'like-new',
    location: 'Cần Thơ'
  },
  {
    name: 'Sách "Đắc Nhân Tâm"',
    description: 'Sách Đắc Nhân Tâm bản tiếng Việt, sách cũ nhưng còn đẹp',
    category: 'Books',
    price: 85000,
    tags: ['sách', 'self-help', 'đắc nhân tâm'],
    condition: 'fair',
    location: 'Biên Hòa'
  }
];

const quickComments = [
  'Sản phẩm này còn mới không bạn?',
  'Giá có thể thương lượng được không?',
  'Mình quan tâm, có thể gặp xem hàng được không?',
  'Sản phẩm này còn bảo hành không?',
  'Bạn có ship không? Phí ship bao nhiêu?'
];

const sampleImageUrl = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop';

async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/oldvibes';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

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

async function createQuickData() {
  try {
    console.log('🌱 Creating quick test data...');
    
    await connectDB();
    await clearData();
    
    // Create users
    const hashedPassword = await bcrypt.hash('123456', 10);
    const users = [];
    
    for (const userData of quickUsers) {
      const user = new User({
        ...userData,
        password: hashedPassword,
        bio: `Xin chào! Mình là ${userData.name}`,
        isVerified: true,
        isEmailVerified: true,
        isActive: true
      });
      users.push(user);
    }
    
    await User.insertMany(users);
    console.log(`👥 Created ${users.length} users`);
    
    // Create vibes
    const vibes = [];
    for (let i = 0; i < quickItems.length * 2; i++) {
      const item = quickItems[i % quickItems.length];
      const user = users[Math.floor(Math.random() * users.length)];
      
      const vibe = new Vibe({
        userId: user._id,
        itemName: item.name,
        description: item.description,
        price: item.price,
        tags: item.tags,
        mediaFiles: [{
          type: 'image',
          url: sampleImageUrl
        }],
        status: 'approved',
        category: item.category,
        condition: item.condition,
        location: item.location,
        likes: [],
        comments: [],
        commentsCount: 0,
        views: Math.floor(Math.random() * 100) + 10,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      });
      
      vibes.push(vibe);
    }
    
    await Vibe.insertMany(vibes);
    console.log(`📱 Created ${vibes.length} vibes`);
    
    // Create comments
    const comments = [];
    for (const vibe of vibes) {
      const commentCount = Math.floor(Math.random() * 3) + 1; // 1-3 comments per vibe
      
      for (let i = 0; i < commentCount; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const commentText = quickComments[Math.floor(Math.random() * quickComments.length)];
        
        const comment = new Comment({
          vibeId: vibe._id,
          userId: user._id,
          content: commentText,
          likesCount: Math.floor(Math.random() * 3),
          repliesCount: 0,
          likes: []
        });
        
        comments.push(comment);
      }
    }
    
    await Comment.insertMany(comments);
    console.log(`💬 Created ${comments.length} comments`);
    
    // Update vibes with interactions
    for (const vibe of vibes) {
      const vibeComments = comments.filter(c => c.vibeId.toString() === vibe._id.toString());
      const likeCount = Math.floor(Math.random() * 10) + 1;
      const likedUsers = [];
      
      for (let i = 0; i < likeCount && i < users.length; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        if (!likedUsers.find(u => u.toString() === randomUser._id.toString())) {
          likedUsers.push(randomUser._id);
        }
      }
      
      await Vibe.findByIdAndUpdate(vibe._id, {
        likes: likedUsers,
        comments: vibeComments.map(c => c._id),
        commentsCount: vibeComments.length,
        likesCount: likedUsers.length
      });
    }
    
    console.log('✅ Quick data seeding completed!');
    console.log(`📊 Summary:`);
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   📱 Vibes: ${vibes.length}`);
    console.log(`   💬 Comments: ${comments.length}`);
    console.log('');
    console.log('🔐 Test accounts:');
    console.log('   Admin: admin@example.com / 123456');
    console.log('   Staff: staff@example.com / 123456');
    console.log('   User: user1@example.com / 123456');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

createQuickData();
