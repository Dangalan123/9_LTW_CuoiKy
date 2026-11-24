const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Room = require('../models/Room');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireRole('landlord'));

const findTenant = async (id) => {
  if (!mongoose.isValidObjectId(id)) return null;
  return User.findOne({ _id: id, role: 'tenant' });
};

// GET /api/accounts?status=Chờ duyệt — danh sách tài khoản người thuê
router.get('/', async (req, res) => {
  const filter = { role: 'tenant' };
  if (req.query.status) filter.status = String(req.query.status);
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ accounts: users.map((u) => u.toPublic()) });
});

// POST /api/accounts/:id/approve  body: { roomId? } — duyệt, có thể gán luôn phòng trống
router.post('/:id/approve', async (req, res) => {
  const user = await findTenant(req.params.id);
  if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });

  if (user.status === 'Đã duyệt') {
    return res.status(409).json({ message: 'Tài khoản này đã được duyệt rồi.' });
  }

  const roomId = req.body.roomId ? String(req.body.roomId) : '';
  if (roomId && !mongoose.isValidObjectId(roomId)) {
    return res.status(400).json({ message: 'Phòng không hợp lệ.' });
  }

  let claimedRoom = null;
  if (roomId) {
    // Chiếm phòng nguyên tử: chỉ thành công nếu phòng vẫn còn "Trống"
    claimedRoom = await Room.findOneAndUpdate(
      { _id: roomId, status: 'Trống' },
      { status: 'Đang thuê', tenantName: user.name },
      { new: true }
    );
    if (!claimedRoom) {
      return res.status(409).json({ message: 'Phòng không tồn tại hoặc đã có người thuê.' });
    }
  }

  try {
    user.status = 'Đã duyệt';
    user.rejectReason = '';
    user.reviewedAt = new Date();
    user.roomId = claimedRoom ? claimedRoom._id : null;
    await user.save();
  } catch (err) {
    if (claimedRoom) await Room.findByIdAndUpdate(claimedRoom._id, { status: 'Trống', tenantName: '' });
    throw err;
  }

  res.json({ account: user.toPublic() });
});

// POST /api/accounts/:id/reject  body: { reason? }
router.post('/:id/reject', async (req, res) => {
  const user = await findTenant(req.params.id);
  if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });

  // Nếu tài khoản đang giữ phòng thì trả phòng về "Trống"
  if (user.roomId) {
    await Room.findByIdAndUpdate(user.roomId, { status: 'Trống', tenantName: '' });
  }

  user.status = 'Từ chối';
  user.rejectReason = typeof req.body.reason === 'string' ? req.body.reason.trim() : '';
  user.reviewedAt = new Date();
  user.roomId = null;
  await user.save();

  res.json({ account: user.toPublic() });
});

module.exports = router;
