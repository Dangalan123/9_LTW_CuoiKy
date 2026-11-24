
import { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addRepairRequest } from '../store/appSlice';
import { InvoiceTable } from '../components/InvoiceTable';
import { InvoicePdfModal } from '../components/InvoicePdfModal';
import { RepairFormModal } from '../components/RepairFormModal';
import { Button } from '../components/Button';

export const TenantPage = () => {
  const dispatch = useDispatch();
  const { rooms, invoices, repairs, me, loaded } = useSelector((state) => state.app);

  const [repairModalOpen, setRepairModalOpen] = useState(false);
  const [pdfInvoice, setPdfInvoice] = useState(null);

  // Phòng của tôi theo dữ liệu mới nhất từ server (chủ trọ có thể vừa gán/đổi phòng).
  // Hóa đơn và yêu cầu sửa chữa đã được server lọc riêng cho phòng này.
  const myRoom = useMemo(() => rooms.find((r) => r.id === me?.roomId) || null, [rooms, me]);
  const myInvoices = invoices;
  const myRepairs = repairs;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {myRoom ? `Phòng của tôi — ${myRoom.roomNumber}` : 'Thông tin thuê trọ'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Xem hóa đơn hàng tháng, tải file PDF và gửi yêu cầu sửa chữa.
          </p>
        </div>
        <Button disabled={!myRoom} onClick={() => setRepairModalOpen(true)}>
          + Gửi yêu cầu sửa chữa
        </Button>
      </div>

      {loaded && !myRoom && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          Tài khoản của bạn đã được duyệt nhưng chưa được gán phòng. Vui lòng liên hệ chủ trọ.
        </p>
      )}

      {myRoom && (
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <p className="text-xs text-slate-500">Dãy & Số phòng</p>
            <p className="font-semibold">{`${myRoom.buildingName} — ${myRoom.roomNumber}`}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Tiền thuê cơ bản</p>
            <p className="font-semibold text-indigo-600 dark:text-indigo-400">
              {`${Number(myRoom.price).toLocaleString()} đ/tháng`}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Trạng thái hợp đồng</p>
            <p className="font-semibold">{myRoom.status}</p>
          </div>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Hóa đơn của phòng</h2>
        <InvoiceTable invoices={myInvoices} onOpenPdf={(inv) => setPdfInvoice(inv)} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Lịch sử yêu cầu sửa chữa</h2>
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          {myRepairs.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có yêu cầu sửa chữa nào.</p>
          ) : (
            myRepairs.map((rep) => (
              <div
                key={rep.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-b-0 dark:border-slate-800"
              >
                <div className="space-y-1">
                  <p className="font-medium">{rep.title}</p>
                  <p className="text-xs text-slate-500">{`Ngày gửi: ${rep.createdAt}`}</p>
                  {rep.imageUrl && (
                    <img
                      src={rep.imageUrl}
                      alt={`Ảnh sửa chữa ${rep.title}`}
                      className="mt-1 h-20 w-32 rounded object-cover"
                    />
                  )}
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold dark:bg-slate-800">
                  {rep.status}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <RepairFormModal
        isOpen={repairModalOpen}
        onClose={() => setRepairModalOpen(false)}
        onSubmitRepair={(item) => dispatch(addRepairRequest(item)).unwrap()}
      />

      <InvoicePdfModal invoice={pdfInvoice} onClose={() => setPdfInvoice(null)} />
    </div>
  );
};