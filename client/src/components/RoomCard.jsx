import { Link } from 'react-router-dom';
import { Button } from './Button';

const STATUS_STYLE = {
  Trống: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'Đang thuê': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  'Đang sửa': 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
};

export const RoomCard = ({ room, actionSlot = null }) => {
  const badgeClass = STATUS_STYLE[room.status] || STATUS_STYLE.Trống;

  return (
    <article className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div>
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {room.buildingName}
            </p>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {room.roomNumber}
            </h3>
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}>
            {room.status}
          </span>
        </div>

        <p className="mb-4 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
          {room.description || 'Phòng sạch sẽ, đầy đủ tiện nghi cơ bản.'}
        </p>

        <dl className="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/70">
          <div>
            <dt className="text-xs text-slate-500 dark:text-slate-400">Giá thuê</dt>
            <dd className="font-semibold text-indigo-600 dark:text-indigo-400">
              {`${Number(room.price).toLocaleString()} đ/tháng`}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500 dark:text-slate-400">Diện tích</dt>
            <dd className="font-semibold text-slate-800 dark:text-slate-100">
              {`${room.area} m²`}
            </dd>
          </div>
        </dl>

        {room.tenantName && (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            {`Người thuê: ${room.tenantName}`}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        <Link to={`/rooms/${room.id}`}>
          <Button variant="secondary">Chi tiết</Button>
        </Link>
        {actionSlot}
      </div>
    </article>
  );
};
export default RoomCard
