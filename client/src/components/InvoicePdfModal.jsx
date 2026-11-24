
import { useMemo } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useExportPdf } from '../hooks/useExportPdf';

export const InvoicePdfModal = ({ invoice, onClose }) => {
  const { pdfRef, exportToPdf } = useExportPdf();

  const summary = useMemo(() => {
    if (!invoice) return null;
    const elecUsed = Math.max(0, invoice.newElectric - invoice.oldElectric);
    const waterUsed = Math.max(0, invoice.newWater - invoice.oldWater);
    const elecCost = elecUsed * invoice.electricPrice;
    const waterCost = waterUsed * invoice.waterPrice;
    const grandTotal = invoice.roomPrice + elecCost + waterCost + invoice.serviceFee;

    return { elecUsed, waterUsed, elecCost, waterCost, grandTotal };
  }, [invoice]);

  if (!invoice || !summary) return null;

  return (
    <Modal
      isOpen={Boolean(invoice)}
      title={`Hóa đơn phòng ${invoice.roomNumber} (${invoice.month})`}
      onClose={onClose}
      maxWidth="max-w-2xl"
    >
      <div
        ref={pdfRef}
        className="rounded-lg border border-slate-200 bg-white p-6 text-slate-900"
      >
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-xl font-bold uppercase text-indigo-700">
              Hóa đơn thanh toán tiền trọ
            </h3>
            <p className="text-xs text-slate-500">{`Mã hóa đơn: ${invoice.code}`}</p>
            <p className="text-xs text-slate-500">{`Kỳ thanh toán: ${invoice.month}`}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">{`Phòng: ${invoice.roomNumber}`}</p>
            <p>{`Người thuê: ${invoice.tenantName}`}</p>
            <p className="text-xs text-slate-500">{`Trạng thái: ${invoice.status}`}</p>
          </div>
        </div>

        <table className="my-5 w-full border-collapse text-sm">
          <thead>
            <tr className="border-y border-slate-300 bg-slate-100">
              <th className="py-2 px-2 text-left">Khoản thu</th>
              <th className="py-2 px-2 text-right">Chỉ số / Số lượng</th>
              <th className="py-2 px-2 text-right">Đơn giá</th>
              <th className="py-2 px-2 text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="py-2 px-2">Tiền thuê phòng</td>
              <td className="py-2 px-2 text-right">1 tháng</td>
              <td className="py-2 px-2 text-right">{`${invoice.roomPrice.toLocaleString()} đ`}</td>
              <td className="py-2 px-2 text-right font-medium">
                {`${invoice.roomPrice.toLocaleString()} đ`}
              </td>
            </tr>
            <tr>
              <td className="py-2 px-2">Tiền điện</td>
              <td className="py-2 px-2 text-right">
                {`${invoice.oldElectric} → ${invoice.newElectric} (${summary.elecUsed} kWh)`}
              </td>
              <td className="py-2 px-2 text-right">{`${invoice.electricPrice.toLocaleString()} đ`}</td>
              <td className="py-2 px-2 text-right font-medium">
                {`${summary.elecCost.toLocaleString()} đ`}
              </td>
            </tr>
            <tr>
              <td className="py-2 px-2">Tiền nước</td>
              <td className="py-2 px-2 text-right">
                {`${invoice.oldWater} → ${invoice.newWater} (${summary.waterUsed} m³)`}
              </td>
              <td className="py-2 px-2 text-right">{`${invoice.waterPrice.toLocaleString()} đ`}</td>
              <td className="py-2 px-2 text-right font-medium">
                {`${summary.waterCost.toLocaleString()} đ`}
              </td>
            </tr>
            <tr>
              <td className="py-2 px-2">Phí dịch vụ</td>
              <td className="py-2 px-2 text-right">1 tháng</td>
              <td className="py-2 px-2 text-right">{`${invoice.serviceFee.toLocaleString()} đ`}</td>
              <td className="py-2 px-2 text-right font-medium">
                {`${invoice.serviceFee.toLocaleString()} đ`}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t-2 border-slate-800 pt-3 text-base font-bold">
          <span>Tổng cộng cần thanh toán:</span>
          <span className="text-lg text-indigo-700">
            {`${summary.grandTotal.toLocaleString()} VNĐ`}
          </span>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
        <Button
          onClick={() => exportToPdf(`HoaDon_${invoice.roomNumber}_${invoice.month}.pdf`)}
        >
          Tải file PDF
        </Button>
      </div>
    </Modal>
  );
};
export default InvoicePdfModal;