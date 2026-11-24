
const mongoose = require('mongoose');
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Thiếu MONGODB_URI trong file .env');
  }

  try {
    await mongoose.connect(uri);
    console.log('Đã kết nối MongoDB');
  } catch (error) {
    console.error('Lỗi kết nối MongoDB:', error);
    throw error;
  }
};

module.exports = connectDB;
