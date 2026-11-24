import { InputField } from './InputField';
import { Button } from './Button';

export const RoomFilter = ({
  filters,
  buildings = [],
  showStatus = false,
  onChangeFilter,
  onReset,
}) => {
  return (
    <section
      aria-label="Bộ lọc phòng"
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InputField
          label="Giá tối đa (VNĐ)"
          type="number"
          name="maxPrice"
          min={0}
          step={100000}
          placeholder="VD: 4000000"
          value={filters.maxPrice}
          onChange={(e) => onChangeFilter('maxPrice', e.target.value)}
        />

        <InputField
          label="Diện tích tối thiểu (m²)"
          type="number"
          name="minArea"
          min={0}
          placeholder="VD: 20"
          value={filters.minArea}
          onChange={(e) => onChangeFilter('minArea', e.target.value)}
        />

        <div className="flex flex-col gap-1">
          <label
            htmlFor="filter-building"
            className="text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Dãy trọ
          </label>
          <select
            id="filter-building"
            value={filters.buildingName}
            onChange={(e) => onChangeFilter('buildingName', e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          >
            <option value="">Tất cả dãy</option>
            {buildings.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {showStatus ? (
          <div className="flex flex-col gap-1">
            <label
              htmlFor="filter-status"
              className="text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Trạng thái
            </label>
            <select
              id="filter-status"
              value={filters.status}
              onChange={(e) => onChangeFilter('status', e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              <option value="">Tất cả</option>
              <option value="Trống">Trống</option>
              <option value="Đang thuê">Đang thuê</option>
              <option value="Đang sửa">Đang sửa</option>
            </select>
          </div>
        ) : (
          <div className="flex items-end">
            <Button variant="secondary" onClick={onReset} className="w-full">
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </div>

      {showStatus && (
        <div className="mt-3 flex justify-end">
          <Button variant="secondary" onClick={onReset}>
            Xóa bộ lọc
          </Button>
        </div>
      )}
    </section>
  );
};

export default RoomFilter;