const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Room = require('../models/Room');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(0|\+84)\d{9}$/;
const str = (v) => (typeof v === 'string' ? v.trim() : '');

// POST /api/auth/register — người thuê tự đăng ký, luôn ở trạng thái "Chờ duyệt"
router.post('/register', async (req, res) => {
  const name = str(req.body.name);
  const email = str(req.body.email).toLowerCase();
  const phone = str(req.body.phone);
  const idNumber = str(req.body.idNumber);
  const note = str(req.body.note);
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const desiredRoomId = str(req.body.desiredRoomId);

  const errors = {};
  if (!name) errors.name = 'Vui lòng nhập họ tên.';
  if (!EMAIL_REGEX.test(email)) errors.email = 'Email không hợp lệ.';
  if (!PHONE_REGEX.test(phone)) errors.phone = 'Số điện thoại phải gồm 10 chữ số.';
  if (idNumber && !/^\d{9}$|^\d{12}$/.test(idNumber))
    errors.idNumber = 'CCCD/CMND phải gồm 9 hoặc 12 chữ số.';
  if (password.length < 6) errors.password = 'Mật khẩu tối thiểu 6 ký tự.';
  if (desiredRoomId && !mongoose.isValidObjectId(desiredRoomId))
    errors.desiredRoomId = 'Phòng không hợp lệ.';
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Dữ liệu không hợp lệ.', errors });

  if (desiredRoomId && !(await Room.exists({ _id: desiredRoomId }))) {
    return res.status(400).json({ message: 'Dữ liệu không hợp lệ.', errors: { desiredRoomId: 'Phòng không tồn tại.' } });
  }

  try {
    const user = await User.create({
      name,
      email,
      phone,
      idNumber,
      note,
      passwordHash: await bcrypt.hash(password, 10),
      role: 'tenant', // không bao giờ nhận role từ client
      status: 'Chờ duyệt',
      desiredRoomId: desiredRoomId || null,
    });
    res.status(201).json({ message: 'Đăng ký thành công, vui lòng chờ chủ trọ duyệt.', user: user.toPublic() });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Dữ liệu không hợp lệ.', errors: { email: 'Email này đã được đăng ký.' } });
    }
    throw err;
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const email = str(req.body.email).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!email || !password) return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu.' });

  const user = await User.findOne({ email }).select('+passwordHash');
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });

  if (user.status === 'Chờ duyệt') {
    return res.status(403).json({ code: 'PENDING', message: 'Tài khoản đang chờ chủ trọ duyệt.' });
  }
  if (user.status === 'Từ chối') {
    return res.status(403).json({
      code: 'REJECTED',
      message: user.rejectReason ? `Tài khoản đã bị từ chối: ${user.rejectReason}` : 'Tài khoản đã bị từ chối.',
    });
  }

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
  res.json({ token, user: user.toPublic() });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user.toPublic() });
});

module.exports = router;
