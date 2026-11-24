const express = require('express');
const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Room = require('../models/Room');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

// GET /api/invoices — chủ trọ thấy tất cả, người thuê chỉ thấy hóa đơn phòng của mình
router.get('/', async (req, res) => {
  let filter = {};
  if (req.user.role !== 'landlord') {
    if (!req.user.roomId) return res.json({ invoices: [] });
    filter = { roomId: req.user.roomId };
  }
  const invoices = await Invoice.find(filter).sort({ month: -1, roomNumber: 1 });
  res.json({ invoices });
});

// POST /api/invoices/monthly  body: { month, items: [{ roomId, newElectric, newWater }] }
router.post('/monthly', requireRole('landlord'), async (req, res) => {
  const { month, items } = req.body;
  if (typeof month !== 'string' || !MONTH_REGEX.test(month)) {
    return res.status(400).json({ message: 'Kỳ hóa đơn không hợp lệ (định dạng YYYY-MM).' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Chưa có chỉ số nào để phát hành hóa đơn.' });
  }

  const roomIds = items.map((i) => String(i?.roomId));
  if (roomIds.some((id) => !mongoose.isValidObjectId(id))) {
    return res.status(400).json({ message: 'Mã phòng không hợp lệ.' });
  }

  const rooms = await Room.find({ _id: { $in: roomIds } });
  const roomMap = new Map(rooms.map((r) => [String(r._id), r]));
  const existing = await Invoice.find({ month, roomId: { $in: roomIds } }).select('roomId');
  const alreadyInvoiced = new Set(existing.map((i) => String(i.roomId)));

  // 1) Kiểm tra toàn bộ trước, có lỗi thì không tạo gì cả
  const errors = {};
  const toCreate = [];
  const skipped = [];

  for (const item of items) {
    const roomId = String(item.roomId);
    const room = roomMap.get(roomId);
    const newElectric = Number(item.newElectric);
    const newWater = Number(item.newWater);

    if (!room || room.status !== 'Đang thuê') {
      errors[roomId] = { room: 'Phòng không tồn tại hoặc không có người thuê.' };
      continue;
    }
    if (alreadyInvoiced.has(roomId)) {
      skipped.push(room.roomNumber); // đã có hóa đơn tháng này, không ghi đè và không đổi chỉ số
      continue;
    }

    const rowErr = {};
    if (!Number.isFinite(newElectric) || newElectric < room.oldElectric)
      rowErr.newElectric = `Chỉ số mới phải >= cũ (${room.oldElectric})`;
    if (!Number.isFinite(newWater) || newWater < room.oldWater)
      rowErr.newWater = `Chỉ số mới phải >= cũ (${room.oldWater})`;
    if (Object.keys(rowErr).length) {
      errors[roomId] = rowErr;
      continue;
    }
    toCreate.push({ room, newElectric, newWater });
  }

  if (Object.keys(errors).length) {
    return res.status(400).json({ message: 'Có dòng chỉ số không hợp lệ.', errors });
  }

  // 2) Tạo hóa đơn, rồi chốt chỉ số cũ của phòng
  const created = [];
  for (const { room, newElectric, newWater } of toCreate) {
    const elecUsed = newElectric - room.oldElectric;
    const waterUsed = newWater - room.oldWater;
    try {
      const invoice = await Invoice.create({
        code: `HD-${month.replace('-', '')}-${room.roomNumber.replace(/[^A-Za-z0-9]/g, '')}`,
        roomId: room._id,
        roomNumber: room.roomNumber,
        tenantName: room.tenantName || 'Khách thuê',
        month,
        roomPrice: room.price,
        oldElectric: room.oldElectric,
        newElectric,
        electricPrice: room.electricPrice,
        oldWater: room.oldWater,
        newWater,
        waterPrice: room.waterPrice,
        serviceFee: room.serviceFee,
        totalAmount: room.price + elecUsed * room.electricPrice + waterUsed * room.waterPrice + room.serviceFee,
      });
      room.oldElectric = newElectric;
      room.oldWater = newWater;
      await room.save();
      created.push(invoice);
    } catch (err) {
      if (err.code === 11000) {
        skipped.push(room.roomNumber); // bị tạo trùng cùng lúc
        continue;
      }
      throw err;
    }
  }

  res.status(201).json({ invoices: created, skipped });
});

// POST /api/invoices/:id/pay
router.post('/:id/pay', requireRole('landlord'), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Không tìm thấy hóa đơn.' });
  const invoice = await Invoice.findByIdAndUpdate(req.params.id, { status: 'Đã thu tiền' }, { new: true });
  if (!invoice) return res.status(404).json({ message: 'Không tìm thấy hóa đơn.' });
  res.json({ invoice });
});

module.exports = router;
