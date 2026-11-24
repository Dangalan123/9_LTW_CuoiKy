const mongoose = require('mongoose');
const applyToJSON = require('./toJSON');

const roomSchema = new mongoose.Schema(
  {
    buildingName: { type: String, required: true, trim: true },
    roomNumber: { type: String, required: true, trim: true, unique: true },
    area: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['Trống', 'Đang thuê', 'Đang sửa'], default: 'Trống' },
    tenantName: { type: String, default: '' },
    oldElectric: { type: Number, default: 0 },
    oldWater: { type: Number, default: 0 },
    electricPrice: { type: Number, default: 3500 },
    waterPrice: { type: Number, default: 20000 },
    serviceFee: { type: Number, default: 0 },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

applyToJSON(roomSchema);

module.exports = mongoose.model('Room', roomSchema);
