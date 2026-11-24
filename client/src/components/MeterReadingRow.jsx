export const MeterReadingRow = ({
  room,
  reading,
  errors = {},
  onChangeField,
}) => {
  const newElecNum = Number(reading.newElectric);
  const newWaterNum = Number(reading.newWater);

  const elecUsed =
    reading.newElectric !== '' && !Number.isNaN(newElecNum) && newElecNum >= room.oldElectric
      ? newElecNum - room.oldElectric
      : 0;

  const waterUsed =
    reading.newWater !== '' && !Number.isNaN(newWaterNum) && newWaterNum >= room.oldWater
      ? newWaterNum - room.oldWater
      : 0;

  const estimatedTotal =
    room.price +
    elecUsed * room.electricPrice +
    waterUsed * room.waterPrice +
    room.serviceFee;

  return (
    <tr className="align-top border-b border-slate-200 dark:border-slate-700">
      <td className="py-3 pr-3 font-medium">
        <div>{room.roomNumber}</div>
        <div className="text-xs text-slate-500">{room.tenantName || 'Chưa có khách'}</div>
      </td>

      <td className="py-3 px-2 text-right text-slate-600 dark:text-slate-300">
        {room.oldElectric}
      </td>

      <td className="py-3 px-2">
        <label htmlFor={`elec-${room.id}`} className="sr-only">
          {`Chỉ số điện mới phòng ${room.roomNumber}`}
        </label>
        <input
          id={`elec-${room.id}`}
          type="number"
          min={0}
          value={reading.newElectric}
          onChange={(e) => onChangeField(room.id, 'newElectric', e.target.value)}
          className={`w-28 rounded-lg border px-2.5 py-1.5 text-sm dark:bg-slate-800 ${
            errors.newElectric
              ? 'border-rose-500 text-rose-600'
              : 'border-slate-300 dark:border-slate-600'
          }`}
        />
        {errors.newElectric && (
          <p className="mt-1 text-xs text-rose-500">{errors.newElectric}</p>
        )}
      </td>

      <td className="py-3 px-2 text-right text-slate-600 dark:text-slate-300">
        {room.oldWater}
      </td>

      <td className="py-3 px-2">
        <label htmlFor={`water-${room.id}`} className="sr-only">
          {`Chỉ số nước mới phòng ${room.roomNumber}`}
        </label>
        <input
          id={`water-${room.id}`}
          type="number"
          min={0}
          value={reading.newWater}
          onChange={(e) => onChangeField(room.id, 'newWater', e.target.value)}
          className={`w-28 rounded-lg border px-2.5 py-1.5 text-sm dark:bg-slate-800 ${
            errors.newWater
              ? 'border-rose-500 text-rose-600'
              : 'border-slate-300 dark:border-slate-600'
          }`}
        />
        {errors.newWater && (
          <p className="mt-1 text-xs text-rose-500">{errors.newWater}</p>
        )}
      </td>

      <td className="py-3 pl-2 text-right font-semibold text-indigo-600 dark:text-indigo-400">
        {`${estimatedTotal.toLocaleString()} đ`}
      </td>
    </tr>
  );
};
export default MeterReadingRow;