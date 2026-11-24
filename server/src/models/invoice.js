const mongoose = require('mongoose');
const applyToJSON = require('./toJSON');

const invoiceSchema = new mongoose.Schema(
  {
    code: { type: String, required: true }, // mã hiển thị, VD: HD-202611-P101
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    roomNumber: { type: String, required: true },
    tenantName: { type: String, default: 'Khách thuê' },
    month: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ },
    roomPrice: { type: Number, required: true },
    oldElectric: { type: Number, required: true },
    newElectric: { type: Number, required: true },
    electricPrice: { type: Number, required: true },
    oldWater: { type: Number, required: true },
    newWater: { type: Number, required: true },
    waterPrice: { type: Number, required: true },
    serviceFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['Chưa thanh toán', 'Đã thu tiền'], default: 'Chưa thanh toán' },
  },
  { timestamps: true }
);

// Mỗi phòng chỉ có 1 hóa đơn cho mỗi tháng
invoiceSchema.index({ roomId: 1, month: 1 }, { unique: true });

applyToJSON(invoiceSchema);

module.exports = mongoose.model('Invoice', invoiceSchema);
