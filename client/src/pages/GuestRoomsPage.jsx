import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RoomCard } from '../components/RoomCard';
import { RoomFilter } from '../components/RoomFilter';
import { Modal } from '../components/Modal';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import { useDebounce } from '../hooks/useDebounce';

const INITIAL_FILTERS = {
  maxPrice: '',
  minArea: '',
  buildingName: '',
  status: 'Trống',
};

export const GuestRoomsPage = () => {
  const rooms = useSelector((state) => state.app.rooms);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', note: '' });
  const [contactError, setContactError] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState('');

  const debouncedMaxPrice = useDebounce(filters.maxPrice, 300);
  const debouncedMinArea = useDebounce(filters.minArea, 300);

  const buildings = useMemo(() => {
    const unique = new Set(rooms.map((r) => r.buildingName));
    return Array.from(unique);
  }, [rooms]);

  const availableRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (room.status !== 'Trống') return false;
      if (filters.buildingName && room.buildingName !== filters.buildingName) return false;
      if (debouncedMaxPrice !== '' && Number(room.price) > Number(debouncedMaxPrice)) return false;
      if (debouncedMinArea !== '' && Number(room.area) < Number(debouncedMinArea)) return false;
      return true;
    });
  }, [rooms, filters.buildingName, debouncedMaxPrice, debouncedMinArea]);

  const handleChangeFilter = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const openContactModal = (room) => {
    setSelectedRoom(room);
    setContactForm({ name: '', phone: '', note: '' });
    setContactError('');
    setSubmittedSuccess('');
  };

  const handleSendContact = (e) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.phone.trim()) {
      setContactError('Vui lòng nhập họ tên và số điện thoại liên hệ.');
      return;
    }
    setSubmittedSuccess(
      `Đã gửi thông tin liên hệ cho phòng ${selectedRoom.roomNumber}. Chủ trọ sẽ gọi lại sớm.`
    );
    setContactForm({ name: '', phone: '', note: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Danh sách phòng trọ còn trống
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Lọc phòng theo mức giá, diện tích và để lại thông tin liên hệ trực tiếp.
        </p>
      </div>

      <RoomFilter
        filters={filters}
        buildings={buildings}
        onChangeFilter={handleChangeFilter}
        onReset={handleResetFilters}
      />

      {availableRooms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
          Không tìm thấy phòng trống phù hợp với bộ lọc hiện tại.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {availableRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              actionSlot={
                <Button onClick={() => openContactModal(room)}>Liên hệ xem phòng</Button>
              }
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={Boolean(selectedRoom)}
        title={selectedRoom ? `Liên hệ phòng ${selectedRoom.roomNumber}` : 'Liên hệ'}
        onClose={() => setSelectedRoom(null)}
      >
        {submittedSuccess ? (
          <div className="space-y-4">
            <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              {submittedSuccess}
            </p>
            <div className="flex justify-end">
              <Button onClick={() => setSelectedRoom(null)}>Hoàn tất</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendContact} className="space-y-4">
            <InputField
              label="Họ và tên"
              name="name"
              placeholder="Nguyễn Văn A"
              value={contactForm.name}
              error={contactError}
              required
              onChange={(e) => {
                setContactForm((prev) => ({ ...prev, name: e.target.value }));
                setContactError('');
              }}
            />
            <InputField
              label="Số điện thoại"
              name="phone"
              placeholder="0912345678"
              value={contactForm.phone}
              error={contactError}
              required
              onChange={(e) => {
                setContactForm((prev) => ({ ...prev, phone: e.target.value }));
                setContactError('');
              }}
            />
            <InputField
              label="Ghi chú thời gian xem phòng"
              name="note"
              placeholder="VD: Xem phòng khoảng 18h chiều nay"
              value={contactForm.note}
              onChange={(e) =>
                setContactForm((prev) => ({ ...prev, note: e.target.value }))
              }
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setSelectedRoom(null)}>
                Hủy
              </Button>
              <Button type="submit">Gửi liên hệ</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};