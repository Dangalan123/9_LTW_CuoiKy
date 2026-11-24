const express = require('express');
const mongoose = require('mongoose');
const Repair = require('../models/Repair');
const Room = require('../models/Room');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const STATUSES = ['Mới', 'Đang xử lý', 'Xong'];
const MAX_IMAGE_LENGTH = 2.5 * 1024 * 1024; // ký tự của chuỗi data URL

// GET /api/repairs — chủ trọ thấy tất cả, người thuê chỉ thấy của phòng mình
router.get('/', async (req, res) => {
  let filter = {};
  if (req.user.role !== 'landlord') {
    if (!req.user.roomId) return res.json({ repairs: [] });
    filter = { roomId: req.user.roomId };
  }
  const repairs = await Repair.find(filter).sort({ createdAt: -1 });
  res.json({ repairs });
});

// POST /api/repairs  body: { title, imageUrl? } — người thuê gửi yêu cầu cho phòng của mình
router.post('/', requireRole('tenant'), async (req, res) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const imageUrl = typeof req.body.imageUrl === 'string' ? req.body.imageUrl : '';

  if (!title || title.length > 200) {
    return res.status(400).json({ message: 'Nội dung sửa chữa phải từ 1 đến 200 ký tự.' });
  }
  if (imageUrl && (!imageUrl.startsWith('data:image/') || imageUrl.length > MAX_IMAGE_LENGTH)) {
    return res.status(400).json({ message: 'Ảnh không hợp lệ hoặc quá lớn (tối đa khoảng 1.8MB).' });
  }
  if (!req.user.roomId) {
    return res.status(403).json({ message: 'Bạn chưa được gán phòng nên chưa thể gửi yêu cầu.' });
  }

  const room = await Room.findById(req.user.roomId);
  if (!room) return res.status(403).json({ message: 'Phòng của bạn không còn tồn tại.' });

  const repair = await Repair.create({
    roomId: room._id,
    roomNumber: room.roomNumber,
    tenantId: req.user._id,
    tenantName: req.user.name,
    title,
    imageUrl,
  });
  res.status(201).json({ repair });
});

// PATCH /api/repairs/:id/status  body: { status }
router.patch('/:id/status', requireRole('landlord'), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Không tìm thấy yêu cầu.' });
  if (!STATUSES.includes(req.body.status)) return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
  const repair = await Repair.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!repair) return res.status(404).json({ message: 'Không tìm thấy yêu cầu.' });
  res.json({ repair });
});

module.exports = router;
