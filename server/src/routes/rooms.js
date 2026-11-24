const express = require('express');
const mongoose = require('mongoose');
const Room = require('../models/Room');
const User = require('../models/User');
const { requireAuth, optionalAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

const STATUSES = ['Trống', 'Đang thuê', 'Đang sửa'];
const NUM_FIELDS = ['area', 'price', 'oldElectric', 'oldWater', 'electricPrice', 'waterPrice', 'serviceFee'];
const STR_FIELDS = ['buildingName', 'roomNumber', 'description'];

// Chỉ chủ trọ thấy tên người thuê và chỉ số điện nước hiện tại
const toClient = (room, user) => {
  const json = room.toJSON();
  if (user?.role !== 'landlord') {
    delete json.tenantName;
    delete json.oldElectric;
    delete json.oldWater;
  }
  return json;
};

// Lọc và kiểm tra dữ liệu phòng từ client (chỉ nhận các trường cho phép)
const parseRoomBody = (body, { partial }) => {
  const data = {};
  const errors = {};

  for (const f of STR_FIELDS) {
    if (body[f] !== undefined) data[f] = String(body[f]).trim();
  }
  for (const f of NUM_FIELDS) {
    if (body[f] !== undefined && body[f] !== '') {
      const n = Number(body[f]);
      if (!Number.isFinite(n) || n < 0) errors[f] = 'Giá trị phải là số không âm.';
      else data[f] = n;
    }
  }
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) errors.status = 'Trạng thái không hợp lệ.';
    else data.status = body.status;
  }

  if (!partial) {
    if (!data.buildingName) errors.buildingName = 'Vui lòng nhập tên dãy trọ.';
    if (!data.roomNumber) errors.roomNumber = 'Vui lòng nhập số/tên phòng.';
    if (!(data.area > 0)) errors.area = 'Diện tích phải lớn hơn 0.';
    if (!(data.price > 0)) errors.price = 'Giá thuê phải lớn hơn 0.';
  } else {
    if ('buildingName' in data && !data.buildingName) errors.buildingName = 'Không được để trống.';
    if ('roomNumber' in data && !data.roomNumber) errors.roomNumber = 'Không được để trống.';
    if ('area' in data && !(data.area > 0)) errors.area = 'Diện tích phải lớn hơn 0.';
    if ('price' in data && !(data.price > 0)) errors.price = 'Giá thuê phải lớn hơn 0.';
  }
  return { data, errors };
};

const sendInvalid = (res, errors) =>
  res.status(400).json({ message: 'Dữ liệu không hợp lệ.', errors });

// GET /api/rooms?status=Trống — công khai
router.get('/', optionalAuth, async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = String(req.query.status);
  const rooms = await Room.find(filter).sort({ buildingName: 1, roomNumber: 1 });
  res.json({ rooms: rooms.map((r) => toClient(r, req.user)) });
});

// GET /api/rooms/:id — công khai
router.get('/:id', optionalAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Không tìm thấy phòng.' });
  const room = await Room.findById(req.params.id);
  if (!room) return res.status(404).json({ message: 'Không tìm thấy phòng.' });
  res.json({ room: toClient(room, req.user) });
});

// Từ đây trở xuống: chỉ chủ trọ
router.use(requireAuth, requireRole('landlord'));

// POST /api/rooms
router.post('/', async (req, res) => {
  const { data, errors } = parseRoomBody(req.body, { partial: false });
  if (Object.keys(errors).length) return sendInvalid(res, errors);
  // Phòng mới chưa có người thuê nên không nhận tên người thuê từ client
  try {
    const room = await Room.create(data);
    res.status(201).json({ room });
  } catch (err) {
    if (err.code === 11000) return sendInvalid(res, { roomNumber: 'Số phòng này đã tồn tại.' });
    throw err;
  }
});

// PUT /api/rooms/:id
router.put('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Không tìm thấy phòng.' });
  const { data, errors } = parseRoomBody(req.body, { partial: true });
  if (Object.keys(errors).length) return sendInvalid(res, errors);

  if (data.status === 'Trống') data.tenantName = '';

  try {
    const room = await Room.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ message: 'Không tìm thấy phòng.' });
    // Phòng chuyển về "Trống" thì tài khoản người thuê không còn gắn với phòng
    if (data.status === 'Trống') await User.updateMany({ roomId: room._id }, { roomId: null });
    res.json({ room });
  } catch (err) {
    if (err.code === 11000) return sendInvalid(res, { roomNumber: 'Số phòng này đã tồn tại.' });
    throw err;
  }
});

// POST /api/rooms/:id/contract  body: { tenantName }
router.post('/:id/contract', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Không tìm thấy phòng.' });
  const tenantName = typeof req.body.tenantName === 'string' ? req.body.tenantName.trim() : '';
  if (!tenantName) return sendInvalid(res, { tenantName: 'Vui lòng nhập họ tên người thuê.' });

  // Nguyên tử: chỉ thành công nếu phòng vẫn đang "Trống"
  const room = await Room.findOneAndUpdate(
    { _id: req.params.id, status: 'Trống' },
    { status: 'Đang thuê', tenantName },
    { new: true }
  );
  if (!room) return res.status(409).json({ message: 'Phòng không tồn tại hoặc đang có hợp đồng.' });
  res.json({ room });
});

// POST /api/rooms/:id/end-contract
router.post('/:id/end-contract', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Không tìm thấy phòng.' });
  const room = await Room.findOneAndUpdate(
    { _id: req.params.id, status: 'Đang thuê' },
    { status: 'Trống', tenantName: '' },
    { new: true }
  );
  if (!room) return res.status(409).json({ message: 'Phòng không có hợp đồng đang hiệu lực.' });
  await User.updateMany({ roomId: room._id }, { roomId: null });
  res.json({ room });
});

module.exports = router;
