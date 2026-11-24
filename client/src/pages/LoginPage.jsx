import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { getApiError } from '../api/axiosClient';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';

const DEMO_ACCOUNTS = {
  landlord: 'chutro@nhatro.vn',
  tenant: 'nguyenvanan@nhatro.vn',
};

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [roleChoice, setRoleChoice] = useState('landlord');
  const [email, setEmail] = useState(DEMO_ACCOUNTS.landlord);
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const justRegistered = Boolean(location.state?.registered);

  const handleQuickRole = (nextRole) => {
    setRoleChoice(nextRole);
    setEmail(DEMO_ACCOUNTS[nextRole]);
    setPassword('123456');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/login', { email: email.trim(), password });
      login({ token: data.token, user: data.user });
      navigate(data.user.role === 'landlord' ? '/landlord' : '/tenant', { replace: true });
    } catch (err) {
      // Server trả lý do cụ thể: sai mật khẩu, đang chờ duyệt, bị từ chối...
      setError(getApiError(err).message);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">Đăng nhập hệ thống</h1>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Chọn nhanh vai trò để điền sẵn tài khoản mẫu (mật khẩu 123456).
      </p>

      {justRegistered && (
        <p
          role="status"
          className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          Đăng ký thành công! Tài khoản của bạn đang chờ chủ trọ duyệt.
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <Button
          type="button"
          variant={roleChoice === 'landlord' ? 'primary' : 'secondary'}
          onClick={() => handleQuickRole('landlord')}
          className="flex-1"
        >
          Chủ trọ
        </Button>
        <Button
          type="button"
          variant={roleChoice === 'tenant' ? 'primary' : 'secondary'}
          onClick={() => handleQuickRole('tenant')}
          className="flex-1"
        >
          Người thuê (P.101)
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <InputField
          label="Email"
          type="email"
          name="email"
          value={email}
          required
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
        />
        <InputField
          label="Mật khẩu"
          type="password"
          name="password"
          value={password}
          error={error}
          required
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
        />
        <Button type="submit" className="w-full" disabled={submitting}>
          Đăng nhập
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
        Chưa có tài khoản?{' '}
        <Link
          to="/register"
          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Đăng ký người thuê
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
