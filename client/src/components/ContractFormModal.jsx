import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { InputField } from './InputField';
import { Button } from './Button';

export const ContractFormModal = ({ isOpen, room, onClose, onCreateContract }) => {
  const [tenantName, setTenantName] = useState('');
  const [phone, setPhone] = useState('');
  const [startDate, setStartDate] = useState('2026-11-20');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setTenantName('');
    setPhone('');
    setStartDate('2026-11-20');
    setError('');
  }, [isOpen, room]);

  if (!room) return null;

  const isOccupied = room.status !== 'Trống';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isOccupied) {
      setError('Phòng đang có hợp đồng hiệu lực, không thể tạo hợp đồng mới.');
      return;
    }

    if (!tenantName.trim()) {
      setError('Vui lòng nhập họ tên người thuê.');
      return;
    }

    try {
      await onCreateContract({
        roomId: room.id,
        tenantName: tenantName.trim(),
        phone: phone.trim(),
        startDate,
      });
      onClose();
    } catch (err) {
      setError(err?.message || 'Không tạo được hợp đồng.');
    }
  };

  return (
    <Modal isOpen={isOpen} title={`Tạo hợp đồng — ${room.roomNumber}`} onClose={onClose}>
      {isOccupied ? (
        <div className="space-y-4">
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
            {`Phòng ${room.roomNumber} hiện đang ở trạng thái "${room.status}"${
              room.tenantName ? ` (${room.tenantName})` : ''
            }. Cần kết thúc hợp đồng hiện tại trước khi tạo hợp đồng mới.`}
          </p>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Họ tên người thuê"
            name="tenantName"
            placeholder="Nguyễn Minh Khoa"
            value={tenantName}
            error={error}
            required
            onChange={(e) => {
              setTenantName(e.target.value);
              setError('');
            }}
          />
          <InputField
            label="Số điện thoại"
            name="phone"
            placeholder="0901234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <InputField
            label="Ngày bắt đầu hợp đồng"
            type="date"
            name="startDate"
            value={startDate}
            required
            onChange={(e) => setStartDate(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">Xác nhận hợp đồng</Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ContractFormModal;
