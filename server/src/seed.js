require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Room = require('./models/Room');
const Invoice = require('./models/Invoice');
const Repair = require('./models/Repair');

const run = async () => {
  await connectDB();
  await Promise.all([User.deleteMany({}), Room.deleteMany({}), Invoice.deleteMany({}), Repair.deleteMany({})]);

  const [r101, r102, r201] = await Room.create([
    { buildingName: 'Dãy A', roomNumber: 'P.101', area: 28, price: 3500000, status: 'Đang thuê', tenantName: 'Nguyễn Văn An', oldElectric: 1200, oldWater: 45, serviceFee: 150000, description: 'Phòng có gác lửng, ban công thoáng mát, gần trường.' },
    { buildingName: 'Dãy A', roomNumber: 'P.102', area: 22, price: 2800000, status: 'Trống', oldElectric: 850, oldWater: 30, serviceFee: 120000, description: 'Phòng tiêu chuẩn, giờ giấc tự do, có chỗ để xe.' },
    { buildingName: 'Dãy B', roomNumber: 'P.201', area: 32, price: 4200000, status: 'Đang thuê', tenantName: 'Trần Thị Bình', oldElectric: 2100, oldWater: 78, serviceFee: 150000, description: 'Phòng rộng có cửa sổ lớn, điều hòa, nóng lạnh đầy đủ.' },
  ]);

  const passwordHash = await bcrypt.hash('123456', 10);
  const [, an] = await User.create([
    { name: 'Chủ Trọ Dãy A-B', email: 'chutro@nhatro.vn', phone: '0900000001', passwordHash, role: 'landlord', status: 'Đã duyệt' },
    { name: 'Nguyễn Văn An', email: 'nguyenvanan@nhatro.vn', phone: '0900000002', passwordHash, role: 'tenant', status: 'Đã duyệt', roomId: r101._id, desiredRoomId: r101._id },
    { name: 'Trần Thị Bình', email: 'tranthibinh@nhatro.vn', phone: '0900000003', passwordHash, role: 'tenant', status: 'Đã duyệt', roomId: r201._id, desiredRoomId: r201._id },
    { name: 'Lê Hoàng Cường', email: 'lehoangcuong@nhatro.vn', phone: '0900000004', passwordHash, role: 'tenant', status: 'Chờ duyệt', desiredRoomId: r102._id, note: 'Sinh viên năm 3.' },
  ]);

  await Invoice.create({
    code: 'HD-202610-P101', roomId: r101._id, roomNumber: 'P.101', tenantName: 'Nguyễn Văn An', month: '2026-10',
    roomPrice: 3500000, oldElectric: 1120, newElectric: 1200, electricPrice: 3500, oldWater: 40, newWater: 45,
    waterPrice: 20000, serviceFee: 150000, totalAmount: 3500000 + 80 * 3500 + 5 * 20000 + 150000,
  });
  await Repair.create({
    roomId: r101._id, roomNumber: 'P.101', tenantId: an._id, tenantName: 'Nguyễn Văn An',
    title: 'Rò rỉ vòi nước bồn rửa',
  });

  console.log('Đã nạp dữ liệu mẫu (mật khẩu tất cả tài khoản: 123456)');
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
