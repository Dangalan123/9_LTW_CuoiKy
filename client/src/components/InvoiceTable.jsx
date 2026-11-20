import { Button } from './Button';

export const InvoiceTable = ({
  invoices = [],
  isLandlord = false,
  onMarkPaid,
  onOpenPdf,
}) => {
  if (invoices.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700">
        Chưa có hóa đơn nào.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <tr>
            <th className="px-4 py-3">Mã HĐ</th>
            <th className="px-4 py-3">Phòng</th>
            <th className="px-4 py-3">Tháng</th>
            <th className="px-4 py-3 text-right">Tổng tiền</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {invoices.map((inv) => {
            const isPaid = inv.status === 'Đã thu tiền';
            return (
              <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3 font-medium">{inv.id}</td>
                <td className="px-4 py-3">{`${inv.roomNumber} - ${inv.tenantName}`}</td>
                <td className="px-4 py-3">{inv.month}</td>
                <td className="px-4 py-3 text-right font-semibold text-indigo-600 dark:text-indigo-400">
                  {`${inv.totalAmount.toLocaleString()} đ`}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      isPaid
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => onOpenPdf(inv)}>
                      Xuất PDF
                    </Button>
                    {isLandlord && !isPaid && (
                      <Button onClick={() => onMarkPaid(inv.id)}>
                        Đã thu tiền
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
export default InvoiceTable;