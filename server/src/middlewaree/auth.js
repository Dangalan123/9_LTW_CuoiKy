const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Yêu cầu đăng nhập: đọc "Authorization: Bearer <token>"
const requireAuth = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Chưa đăng nhập.' });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
  }

  // Luôn đọc lại user từ DB để quyền/trạng thái luôn mới nhất
  const user = await User.findById(payload.id);
  if (!user || user.status !== 'Đã duyệt') {
    return res.status(401).json({ message: 'Tài khoản không còn hiệu lực.' });
  }

  req.user = user;
  next();
};

// Không bắt buộc đăng nhập; nếu có token hợp lệ thì gắn req.user (dùng cho API công khai)
const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.id);
      if (user && user.status === 'Đã duyệt') req.user = user;
    } catch {
      // token sai/hết hạn: coi như khách
    }
  }
  next();
};

const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này.' });
    }
    next();
  };

module.exports = { requireAuth, optionalAuth, requireRole };
