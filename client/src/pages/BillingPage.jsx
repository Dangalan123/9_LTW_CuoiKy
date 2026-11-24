import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createMonthlyInvoices, markInvoicePaid } from '../store/appSlice';
import { MeterReadingRow } from '../components/MeterReadingRow';
import { InvoiceTable } from '../components/InvoiceTable';
import { InvoicePdfModal } from '../components/InvoicePdfModal';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';

export const BillingPage = () => {
  const dispatch = useDispatch();
  const { rooms, invoices } = useSelector((state) => state.app);

  const activeRooms = useMemo(
    () => rooms.filter((r) => r.status === 'Đang thuê'),
    [rooms]
  );

  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [readings, setReadings] = useState({});
  const [rowErrors, setRowErrors] = useState({});
  const [feedback, setFeedback] = useState('');
  const [pdfInvoice, setPdfInvoice] = useState(null);

  useEffect(() => {
    const nextMap = {};
    activeRooms.forEach((room) => {
      nextMap[room.id] = {
        newElectric: '',
        newWater: '',
      };
    });
    setReadings(nextMap);
    setRowErrors({});
  }, [activeRooms]);

  const handleChangeField = (roomId, field, value) => {
    setReadings((prev) => ({
      ...prev,
      [roomId]: {
        ...(prev[roomId] || { newElectric: '', newWater: '' }),
        [field]: value,
      },
    }));
    setRowErrors((prev) => ({
      ...prev,
      [roomId]: {
        ...(prev[roomId] || {}),
        [field]: '',
      },
    }));
    setFeedback('');
  };

  const handleGenerateInvoices = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    let hasError = false;

    activeRooms.forEach((room) => {
      const entry = readings[room.id] || { newElectric: '', newWater: '' };
      const errs = {};

      if (entry.newElectric === '' || Number(entry.newElectric) < room.oldElectric) {
        errs.newElectric = `Chỉ số mới phải >= cũ (${room.oldElectric})`;
        hasError = true;
      }

      if (entry.newWater === '' || Number(entry.newWater) < room.oldWater) {
        errs.newWater = `Chỉ số mới phải >= cũ (${room.oldWater})`;
        hasError = true;
      }

      if (Object.keys(errs).length > 0) {
        nextErrors[room.id] = errs;
      }
    });

    if (hasError) {
      setRowErrors(nextErrors);
      setFeedback('Vui lòng sửa các dòng đang báo lỗi chỉ số trước khi phát hành hóa đơn.');
      return;
    }

    const payloadItems = activeRooms.map((room) => ({
      roomId: room.id,
      newElectric: Number(readings[room.id].newElectric),
      newWater: Number(readings[room.id].newWater),
    }));

    try {
      const result = await dispatch(createMonthlyInvoices({ month, items: payloadItems })).unwrap();
      const skipped = result.skipped?.length
        ? ` Bỏ qua ${result.skipped.join(', ')} vì đã có hóa đơn tháng này.`
        : '';
      setFeedback(`Đã phát hành ${result.invoices.length} hóa đơn tháng ${month}.${skipped}`);
    } catch (err) {
      // Server kiểm tra lại chỉ số và trả lỗi theo từng phòng (key là id phòng)
      const perRoom = {};
      Object.entries(err?.errors || {}).forEach(([roomId, rowErr]) => {
        if (rowErr && typeof rowErr === 'object') perRoom[roomId] = rowErr;
      });
      setRowErrors(perRoom);
      setFeedback(err?.message || 'Không phát hành được hóa đơn.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Nhập chỉ số điện nước & Phát hành hóa đơn</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Kiểm tra từng dòng chỉ số; chỉ số mới không được nhỏ hơn chỉ số cũ.
        </p>
      </div>

      <form
        onSubmit={handleGenerateInvoices}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="max-w-xs">
          <InputField
            label="Kỳ hóa đơn (Tháng)"
            type="month"
            name="month"
            value={month}
            required
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-700">
              <tr>
                <th className="py-2 pr-3">Phòng</th>
                <th className="py-2 px-2 text-right">Điện cũ</th>
                <th className="py-2 px-2">Điện mới</th>
                <th className="py-2 px-2 text-right">Nước cũ</th>
                <th className="py-2 px-2">Nước mới</th>
                <th className="py-2 pl-2 text-right">Tạm tính</th>
              </tr>
            </thead>
            <tbody>
              {activeRooms.map((room) => (
                <MeterReadingRow
                  key={room.id}
                  room={room}
                  reading={readings[room.id] || { newElectric: '', newWater: '' }}
                  errors={rowErrors[room.id] || {}}
                  onChangeField={handleChangeField}
                />
              ))}
            </tbody>
          </table>
        </div>

        {feedback && (
          <p className="rounded-lg bg-indigo-50 p-3 text-sm text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
            {feedback}
          </p>
        )}

        <div className="flex justify-end">
          <Button type="submit">Phát hành hóa đơn hàng loạt</Button>
        </div>
      </form>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Danh sách hóa đơn đã tạo</h2>
        <InvoiceTable
          invoices={invoices}
          isLandlord
          onMarkPaid={(id) => dispatch(markInvoicePaid(id))}
          onOpenPdf={(inv) => setPdfInvoice(inv)}
        />
      </section>

      <InvoicePdfModal invoice={pdfInvoice} onClose={() => setPdfInvoice(null)} />
    </div>
  );
};