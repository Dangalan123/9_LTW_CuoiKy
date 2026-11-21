import { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addRoom,
  updateRoom,
  createContractForRoom,
  endContractForRoom,
  markInvoicePaid,
  updateRepairStatus,
} from '../store/appSlice';
import { RoomCard } from '../components/RoomCard';
import { RoomFilter } from '../components/RoomFilter';
import { RoomFormModal } from '../components/RoomFormModal';
import { ContractFormModal } from '../components/ContractFormModal';
import { InvoiceTable } from '../components/InvoiceTable';
import { InvoicePdfModal } from '../components/InvoicePdfModal';
import { Button } from '../components/Button';

const INITIAL_FILTERS = {
  maxPrice: '',
  minArea: '',
  buildingName: '',
  status: '',
};

export const LandlordPage = () => {
  const dispatch = useDispatch();
  const { rooms, invoices, repairs } = useSelector((state) => state.app);

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [contractRoom, setContractRoom] = useState(null);
  const [pdfInvoice, setPdfInvoice] = useState(null);

  const stats = useMemo(() => {
    const vacantCount = rooms.filter((r) => r.status === 'Trống').length;
    const unpaidInvoices = invoices.filter((i) => i.status !== 'Đã thu tiền');
    const unpaidDebt = unpaidInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const totalRevenue = invoices
      .filter((i) => i.status === 'Đã thu tiền')
      .reduce((sum, i) => sum + i.totalAmount, 0);

    return {
      vacantCount,
      unpaidRoomsCount: unpaidInvoices.length,
      unpaidDebt,
      totalRevenue,
    };
  }, [rooms, invoices]);

  const buildings = useMemo(
    () => Array.from(new Set(rooms.map((r) => r.buildingName))),
    [rooms]
  );

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (filters.buildingName && room.buildingName !== filters.buildingName) return false;
      if (filters.status && room.status !== filters.status) return false;
      if (filters.maxPrice !== '' && Number(room.price) > Number(filters.maxPrice)) return false;
      if (filters.minArea !== '' && Number(room.area) < Number(filters.minArea)) return false;
      return true;
    });
  }, [rooms, filters]);

  const handleSaveRoom = (roomData) => {
    if (editingRoom) {
      dispatch(updateRoom(roomData));
    } else {
      dispatch(addRoom(roomData));
    }
    setEditingRoom(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Bảng điều khiển Chủ trọ</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý phòng, hợp đồng thuê, trạng thái sửa chữa và hóa đơn.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingRoom(null);
            setRoomModalOpen(true);
          }}
        >
          + Thêm phòng mới
        </Button>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500">Phòng đang trống</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{stats.vacantCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500">Hóa đơn chưa thu</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{stats.unpaidRoomsCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500">Tổng tiền đang nợ</p>
          <p className="mt-1 text-xl font-bold text-rose-600">
            {`${stats.unpaidDebt.toLocaleString()} đ`}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500">Doanh thu đã thu</p>
          <p className="mt-1 text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {`${stats.totalRevenue.toLocaleString()} đ`}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Danh sách phòng & Hợp đồng</h2>
        <RoomFilter
          filters={filters}
          buildings={buildings}
          showStatus
          onChangeFilter={(field, val) => setFilters((prev) => ({ ...prev, [field]: val }))}
          onReset={() => setFilters(INITIAL_FILTERS)}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              actionSlot={
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditingRoom(room);
                      setRoomModalOpen(true);
                    }}
                  >
                    Sửa
                  </Button>
                  {room.status === 'Trống' ? (
                    <Button onClick={() => setContractRoom(room)}>Tạo HĐ</Button>
                  ) : (
                    room.status === 'Đang thuê' && (
                      <Button
                        variant="danger"
                        onClick={() => dispatch(endContractForRoom(room.id))}
                      >
                        Kết thúc HĐ
                      </Button>
                    )
                  )}
                </div>
              }
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Yêu cầu sửa chữa từ người thuê</h2>
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          {repairs.map((rep) => (
            <div
              key={rep.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2 last:border-b-0 dark:border-slate-800"
            >
              <div>
                <p className="font-medium">{`${rep.roomNumber}: ${rep.title}`}</p>
                <p className="text-xs text-slate-500">{`Ngày gửi: ${rep.createdAt}`}</p>
              </div>
              <select
                aria-label={`Trạng thái sửa chữa ${rep.roomNumber}`}
                value={rep.status}
                onChange={(e) =>
                  dispatch(updateRepairStatus({ id: rep.id, status: e.target.value }))
                }
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
              >
                <option value="Mới">Mới</option>
                <option value="Đang xử lý">Đang xử lý</option>
                <option value="Xong">Xong</option>
              </select>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Hóa đơn các phòng</h2>
        <InvoiceTable
          invoices={invoices}
          isLandlord
          onMarkPaid={(id) => dispatch(markInvoicePaid(id))}
          onOpenPdf={(inv) => setPdfInvoice(inv)}
        />
      </section>

      <RoomFormModal
        isOpen={roomModalOpen}
        initialRoom={editingRoom}
        onClose={() => {
          setRoomModalOpen(false);
          setEditingRoom(null);
        }}
        onSubmitRoom={handleSaveRoom}
      />

      <ContractFormModal
        isOpen={Boolean(contractRoom)}
        room={contractRoom}
        onClose={() => setContractRoom(null)}
        onCreateContract={(payload) => dispatch(createContractForRoom(payload))}
      />

      <InvoicePdfModal invoice={pdfInvoice} onClose={() => setPdfInvoice(null)} />
    </div>
  );
};

export default LandlordPage;
