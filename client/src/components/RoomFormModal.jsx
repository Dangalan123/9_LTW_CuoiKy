import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { InputField } from './InputField';
import { Button } from './Button';

const EMPTY_FORM = {
  buildingName: 'Dãy A',
  roomNumber: '',
  area: '',
  price: '',
  status: 'Trống',
  oldElectric: 0,
  oldWater: 0,
  electricPrice: 3500,
  waterPrice: 20000,
  serviceFee: 150000,
  description: '',
};

export const RoomFormModal = ({ isOpen, initialRoom = null, onClose, onSubmitRoom }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    if (initialRoom) {
      setForm({ ...EMPTY_FORM, ...initialRoom });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [isOpen, initialRoom]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.buildingName.trim()) nextErrors.buildingName = 'Vui lòng nhập tên dãy trọ.';
    if (!form.roomNumber.trim()) nextErrors.roomNumber = 'Vui lòng nhập số/tên phòng.';
    if (!form.area || Number(form.area) <= 0) nextErrors.area = 'Diện tích phải lớn hơn 0.';
    if (!form.price || Number(form.price) <= 0) nextErrors.price = 'Giá thuê phải lớn hơn 0.';
    return nextErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmitRoom({
      ...form,
      id: initialRoom?.id || `R-${Date.now()}`,
      area: Number(form.area),
      price: Number(form.price),
      oldElectric: Number(form.oldElectric) || 0,
      oldWater: Number(form.oldWater) || 0,
      electricPrice: Number(form.electricPrice) || 3500,
      waterPrice: Number(form.waterPrice) || 20000,
      serviceFee: Number(form.serviceFee) || 0,
      tenantName: form.status === 'Trống' ? '' : form.tenantName || '',
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title={initialRoom ? `Cập nhật ${initialRoom.roomNumber}` : 'Thêm phòng mới'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField
            label="Dãy trọ"
            name="buildingName"
            value={form.buildingName}
            error={errors.buildingName}
            required
            onChange={(e) => handleChange('buildingName', e.target.value)}
          />
          <InputField
            label="Số / Tên phòng"
            name="roomNumber"
            placeholder="VD: P.103"
            value={form.roomNumber}
            error={errors.roomNumber}
            required
            onChange={(e) => handleChange('roomNumber', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField
            label="Diện tích (m²)"
            type="number"
            name="area"
            value={form.area}
            error={errors.area}
            required
            onChange={(e) => handleChange('area', e.target.value)}
          />
          <InputField
            label="Giá thuê (VNĐ/tháng)"
            type="number"
            name="price"
            value={form.price}
            error={errors.price}
            required
            onChange={(e) => handleChange('price', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="room-status" className="text-sm font-medium">
              Trạng thái
            </label>
            <select
              id="room-status"
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
            >
              <option value="Trống">Trống</option>
              <option value="Đang thuê">Đang thuê</option>
              <option value="Đang sửa">Đang sửa</option>
            </select>
          </div>
          <InputField
            label="Phí dịch vụ (VNĐ)"
            type="number"
            name="serviceFee"
            value={form.serviceFee}
            onChange={(e) => handleChange('serviceFee', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField
            label="Chỉ số điện hiện tại"
            type="number"
            name="oldElectric"
            value={form.oldElectric}
            onChange={(e) => handleChange('oldElectric', e.target.value)}
          />
          <InputField
            label="Chỉ số nước hiện tại"
            type="number"
            name="oldWater"
            value={form.oldWater}
            onChange={(e) => handleChange('oldWater', e.target.value)}
          />
        </div>

        <InputField
          label="Mô tả phòng"
          name="description"
          placeholder="Tiện nghi, vị trí, lưu ý..."
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit">{initialRoom ? 'Lưu thay đổi' : 'Tạo phòng'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default RoomFormModal;
