// Script để cập nhật role user thành admin
// Chạy trong MongoDB shell hoặc MongoDB Compass

// Cách 1: Cập nhật role thành admin
db.users.updateOne(
  { email: "cchinh0201@gmail.com" },
  { $set: { role: "admin" } }
)

// Cách 2: Cập nhật role thành staff
db.users.updateOne(
  { email: "cchinh0201@gmail.com" },
  { $set: { role: "staff" } }
)

// Kiểm tra kết quả
db.users.findOne(
  { email: "cchinh0201@gmail.com" },
  { email: 1, role: 1, username: 1, name: 1 }
)
