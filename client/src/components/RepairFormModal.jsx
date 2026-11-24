import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { InputField } from './InputField';
import { Button } from './Button';

const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;

export const RepairFormModal = ({ isOpen, onClose, onSubmitRepair }) => {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setTitle('');
    setImageUrl('');
    setError('');
  }, [isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setError('Ảnh quá lớn, vui lòng chọn ảnh dưới 1.5MB.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng mô tả vấn đề cần sửa chữa.');
      return;
    }

    try {
      await onSubmitRepair({ title: title.trim(), imageUrl });
      onClose();
    } catch (err) {
      setError(err?.message || 'Không gửi được yêu cầu.');
    }
  };

  return (
    <Modal isOpen={isOpen} title="Gửi yêu cầu sửa chữa" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Nội dung cần sửa chữa"
          name="title"
          placeholder="VD: Hỏng bóng đèn nhà vệ sinh, tắc đường ống..."
          value={title}
          error={error}
          required
          onChange={(e) => {
            setTitle(e.target.value);
            setError('');
          }}
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="repair-image" className="text-sm font-medium">
            Ảnh đính kèm
          </label>
          <input
            id="repair-image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-700 dark:text-slate-300"
          />
        </div>

        {imageUrl && (
          <img
            src={imageUrl}
            alt="Ảnh xem trước yêu cầu sửa chữa"
            className="max-h-44 w-full rounded-lg border border-slate-200 object-cover dark:border-slate-700"
          />
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit">Gửi yêu cầu</Button>
        </div>
      </form>
    </Modal>
  );
};
export default RepairFormModal;