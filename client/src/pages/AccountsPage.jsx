import { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { approveAccount, rejectAccount } from '../store/appSlice';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';

const TABS = ['Chờ duyệt', 'Đã duyệt', 'Từ chối'];

const BADGE = {
  'Chờ duyệt': 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  'Đã duyệt': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  'Từ chối': 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
};

export const AccountsPage = () => {
  const dispatch = useDispatch();
  const { accounts, rooms, loaded } = useSelector((state) => state.app);

  const [tab, setTab] = useState('Chờ duyệt');
  const [approving, setApproving] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);

  const tenants = useMemo(() => accounts.filter((acc) => acc.role === 'tenant'), [accounts]);
  const counts = useMemo(
    () =>
      TABS.reduce((acc, status) => {
        acc[status] = tenants.filter((t) => t.status === status).length;
        return acc;
      }, {}),
    [tenants]
  );
  const visible = tenants.filter((t) => t.status === tab);
  const vacantRooms = rooms.filter((r) => r.status === 'Trống');

  const roomLabel = (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? `${room.buildingName} — ${room.roomNumber}` : '—';
  };

  const openApprove = (account) => {
    const desiredIsVacant = vacantRooms.some((r) => r.id === account.desiredRoomId);
    setSelectedRoomId(desiredIsVacant ? account.desiredRoomId : '');
    setActionError('');
    setApproving(account);
  };

  const confirmApprove = async () => {
    setBusy(true);
    setActionError('');
    try {
      await dispatch(approveAccount({ id: approving.id, roomId: selectedRoomId })).unwrap();
      setApproving(null);
    } catch (err) {
      setActionError(err?.message || 'Không duyệt được tài khoản.');
    } finally {
      setBusy(false);
    }
  };

  const confirmReject = async () => {
    setBusy(true);
    setActionError('');
    try {
      await dispatch(rejectAccount({ id: rejecting.id, reason })).unwrap();
      setRejecting(null);
      setReason('');
    } catch (err) {
      setActionError(err?.message || 'Không từ chối được tài khoản.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Duyệt tài khoản người thuê</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Xem các đăng ký mới, duyệt hoặc từ chối, và gán phòng cho người thuê.
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Trạng thái tài khoản">
        {TABS.map((status) => (
          <button
            key={status}
            type="button"
            role="tab"
            aria-selected={tab === status}
            onClick={() => setTab(status)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              tab === status
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {`${status} (${counts[status]})`}
          </button>
        ))}
      </div>

      {!loaded && <p className="text-sm text-slate-500">Đang tải...</p>}

      {loaded && visible.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          Không có tài khoản nào ở mục này.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visible.map((acc) => (
            <div
              key={acc.id}
              className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{acc.name}</p>
                  <p className="text-xs text-slate-500">{acc.email}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${BADGE[acc.status]}`}
                >
                  {acc.status}
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                <dt className="text-slate-500">Điện thoại</dt>
                <dd>{acc.phone}</dd>
                <dt className="text-slate-500">CCCD/CMND</dt>
                <dd>{acc.idNumber || '—'}</dd>
                <dt className="text-slate-500">Phòng muốn thuê</dt>
                <dd>{acc.desiredRoomId ? roomLabel(acc.desiredRoomId) : '—'}</dd>
                <dt className="text-slate-500">Ngày đăng ký</dt>
                <dd>{String(acc.createdAt).slice(0, 10)}</dd>
                {acc.status === 'Đã duyệt' && (
                  <>
                    <dt className="text-slate-500">Phòng được gán</dt>
                    <dd>{acc.roomId ? roomLabel(acc.roomId) : 'Chưa gán'}</dd>
                  </>
                )}
              </dl>

              {acc.note && (
                <p className="rounded-lg bg-slate-50 p-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {`Ghi chú: ${acc.note}`}
                </p>
              )}
              {acc.status === 'Từ chối' && acc.rejectReason && (
                <p className="text-sm text-rose-600 dark:text-rose-400">
                  {`Lý do từ chối: ${acc.rejectReason}`}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {acc.status !== 'Đã duyệt' && (
                  <Button onClick={() => openApprove(acc)}>
                    {acc.status === 'Từ chối' ? 'Duyệt lại' : 'Duyệt'}
                  </Button>
                )}
                {acc.status === 'Chờ duyệt' && (
                  <Button
                    variant="danger"
                    onClick={() => {
                      setActionError('');
                      setRejecting(acc);
                    }}
                  >
                    Từ chối
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={Boolean(approving)}
        title={`Duyệt tài khoản — ${approving?.name || ''}`}
        onClose={() => setApproving(null)}
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="approve-room"
              className="text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Gán phòng (chỉ hiện phòng đang trống)
            </label>
            <select
              id="approve-room"
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              <option value="">Chưa gán phòng</option>
              {vacantRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {`${room.buildingName} — ${room.roomNumber}`}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">
              Gán phòng sẽ chuyển phòng sang &quot;Đang thuê&quot;. Có thể để trống và tạo hợp
              đồng sau.
            </p>
          </div>
          {actionError && <p className="text-sm text-rose-500">{actionError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setApproving(null)}>
              Hủy
            </Button>
            <Button onClick={confirmApprove} disabled={busy}>
              Xác nhận duyệt
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(rejecting)}
        title={`Từ chối tài khoản — ${rejecting?.name || ''}`}
        onClose={() => setRejecting(null)}
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="reject-reason"
              className="text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Lý do (người đăng ký sẽ thấy khi đăng nhập)
            </label>
            <textarea
              id="reject-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>
          {actionError && <p className="text-sm text-rose-500">{actionError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRejecting(null)}>
              Hủy
            </Button>
            <Button variant="danger" onClick={confirmReject} disabled={busy}>
              Xác nhận từ chối
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AccountsPage;
