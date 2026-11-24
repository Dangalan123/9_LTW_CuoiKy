const mongoose = require('mongoose');

const STATUSES = ['Chờ duyệt', 'Đã duyệt', 'Từ chối'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '', trim: true },
    idNumber: { type: String, default: '', trim: true }, // CCCD/CMND
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['landlord', 'tenant'], default: 'tenant' },
    status: { type: String, enum: STATUSES, default: 'Chờ duyệt' },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
    desiredRoomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
    note: { type: String, default: '' },
    rejectReason: { type: String, default: '' },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Dạng trả về cho client: không bao giờ chứa mật khẩu
userSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    idNumber: this.idNumber,
    role: this.role,
    status: this.status,
    roomId: this.roomId,
    desiredRoomId: this.desiredRoomId,
    note: this.note,
    rejectReason: this.rejectReason,
    createdAt: this.createdAt,
    reviewedAt: this.reviewedAt,
  };
};

module.exports = mongoose.model('User', userSchema);
module.exports.STATUSES = STATUSES;
