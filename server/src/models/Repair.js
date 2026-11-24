const mongoose = require('mongoose');
const applyToJSON = require('./toJSON');

const repairSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    roomNumber: { type: String, required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tenantName: { type: String, required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    imageUrl: { type: String, default: '' }, // data URL của ảnh (đã giới hạn dung lượng)
    status: { type: String, enum: ['Mới', 'Đang xử lý', 'Xong'], default: 'Mới' },
  },
  { timestamps: true }
);

// Client hiển thị createdAt dạng YYYY-MM-DD
applyToJSON(repairSchema, (ret) => {
  if (ret.createdAt) ret.createdAt = new Date(ret.createdAt).toISOString().slice(0, 10);
  return ret;
});

module.exports = mongoose.model('Repair', repairSchema);
