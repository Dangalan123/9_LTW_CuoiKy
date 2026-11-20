import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '../components/Button';

export const RoomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const room = useSelector((state) => state.app.rooms.find((r) => r.id === id));

  if (!room) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-xl font-bold">Không tìm thấy thông tin phòng</h1>
        <Button className="mt-4" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{room.buildingName}</p>
          <h1 className="text-2xl font-bold">{`Chi tiết phòng ${room.roomNumber}`}</h1>
        </div>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          ← Quay lại
        </Button>
      </div>

      <p className="text-slate-600 dark:text-slate-300">{room.description}</p>

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
          <dt className="text-xs text-slate-500">Giá thuê</dt>
          <dd className="mt-1 text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {`${Number(room.price).toLocaleString()} đ/tháng`}
          </dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
          <dt className="text-xs text-slate-500">Diện tích</dt>
          <dd className="mt-1 text-lg font-bold">{`${room.area} m²`}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
          <dt className="text-xs text-slate-500">Trạng thái</dt>
          <dd className="mt-1 text-lg font-bold">{room.status}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
          <dt className="text-xs text-slate-500">Đơn giá điện / nước</dt>
          <dd className="mt-1 text-sm font-semibold">
            {`${Number(room.electricPrice).toLocaleString()} đ/kWh · ${Number(room.waterPrice).toLocaleString()} đ/m³`}
          </dd>
        </div>
      </dl>
    </div>
  );
};