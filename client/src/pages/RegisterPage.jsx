import { useState, useMemo } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api, { getApiError } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  idNumber: '',
  password: '',
  confirmPassword: '',
  desiredRoomId: '',
  note: '',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(0|\+84)\d{9}$/;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const rooms = useSelector((state) => state.app.rooms);

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const vacantRooms = useMemo(() => rooms.filter((r) => r.status === 'Trống'), [rooms]);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    const email = form.email.trim();

    if (!form.name.trim()) next.name = 'Vui lòng nhập họ tên.';

    if (!email) next.email = 'Vui lòng nhập email.';
    else if (!EMAIL_REGEX.test(email)) next.email = 'Email không hợp lệ.';

    if (!form.phone.trim()) next.phone = 'Vui lòng nhập số điện thoại.';
    else if (!PHONE_REGEX.test(form.phone.trim()))
      next.phone = 'Số điện thoại phải gồm 10 chữ số (VD: 0912345678).';

    if (form.idNumber.trim() && !/^\d{9}$|^\d{12}$/.test(form.idNumber.trim()))
      next.idNumber = 'CCCD/CMND phải gồm 9 hoặc 12 chữ số.';

    if (form.password.length < 6) next.password = 'Mật khẩu tối thiểu 6 ký tự.';
    if (form.confirmPassword !== form.password)
      next.confirmPassword = 'Mật khẩu xác nhận không khớp.';

    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        idNumber: form.idNumber,
        password: form.password,
        desiredRoomId: form.desiredRoomId,
        note: form.note,
      });
      navigate('/login', { replace: true, state: { registered: true } });
    } catch (err) {
      const apiError = getApiError(err);
      // Lỗi từng trường (VD: email trùng) hiện ngay dưới ô nhập; còn lại hiện chung
      setErrors({ ...apiError.errors, form: apiError.message });
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">
        Đăng ký tài khoản người thuê
      </h1>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Sau khi đăng ký, chủ trọ sẽ xem xét và duyệt tài khoản trước khi bạn đăng nhập được.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
        <InputField
          label="Họ và tên"
          name="name"
          value={form.name}
          error={errors.name}
          required
          onChange={handleChange}
        />
        <InputField
          label="Email"
          type="email"
          name="email"
          value={form.email}
          error={errors.email}
          required
          onChange={handleChange}
        />
        <InputField
          label="Số điện thoại"
          type="tel"
          name="phone"
          value={form.phone}
          error={errors.phone}
          required
          onChange={handleChange}
        />
        <InputField
          label="CCCD/CMND (không bắt buộc)"
          name="idNumber"
          value={form.idNumber}
          error={errors.idNumber}
          onChange={handleChange}
        />
        <InputField
          label="Mật khẩu"
          type="password"
          name="password"
          value={form.password}
          error={errors.password}
          required
          onChange={handleChange}
        />
        <InputField
          label="Nhập lại mật khẩu"
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          error={errors.confirmPassword}
          required
          onChange={handleChange}
        />

        <div className="flex flex-col gap-1">
          <label
            htmlFor="desiredRoomId"
            className="text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Phòng muốn thuê (không bắt buộc)
          </label>
          <select
            id="desiredRoomId"
            name="desiredRoomId"
            value={form.desiredRoomId}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          >
            <option value="">— Chưa chọn —</option>
            {vacantRooms.map((room) => (
              <option key={room.id} value={room.id}>
                {`${room.buildingName} — ${room.roomNumber} (${Number(room.price).toLocaleString()} đ/tháng)`}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="note"
            className="text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Ghi chú cho chủ trọ
          </label>
          <textarea
            id="note"
            name="note"
            rows={3}
            value={form.note}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {errors.form && !Object.keys(errors).some((k) => k !== 'form' && errors[k]) && (
          <p className="text-sm text-rose-500">{errors.form}</p>
        )}

        <Button type="submit" className="w-full" disabled={submitting}>
          Đăng ký
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
        Đã có tài khoản?{' '}
        <Link
          to="/login"
          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
