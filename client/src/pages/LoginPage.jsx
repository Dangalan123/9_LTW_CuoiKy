import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [roleChoice, setRoleChoice] = useState('landlord');
  const [email, setEmail] = useState('chutro@nhatro.vn');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');

  const handleQuickRole = (nextRole) => {
    setRoleChoice(nextRole);
    setEmail(nextRole === 'landlord' ? 'chutro@nhatro.vn' : 'nguyenvanan@nhatro.vn');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    try {
      const mockUser =
        roleChoice === 'landlord'
          ? {
              id: 'U-LANDLORD-1',
              name: 'Chủ Trọ Dãy A-B',
              email,
              role: 'landlord',
              roomId: null,
            }
          : {
              id: 'U-TENANT-101',
              name: 'Nguyễn Văn An',
              email,
              role: 'tenant',
              roomId: 'R101',
            };

      login({ token: 'demo-jwt-token', user: mockUser });
      navigate(mockUser.role === 'landlord' ? '/landlord' : '/tenant', { replace: true });
    } catch {
      setError('Đăng nhập thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">Đăng nhập hệ thống</h1>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Chọn nhanh vai trò để kiểm thử luồng Chủ trọ hoặc Người thuê.
      </p>

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
        <Button type="submit" className="w-full">
          Đăng nhập
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;
