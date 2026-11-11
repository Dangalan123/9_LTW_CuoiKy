import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../redux/authSlice';
import Button from '../components/Button';
import Input from '../components/Input';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Giả lập đăng nhập thành công với dữ liệu mẫu
    const mockUser = { name: 'Người dùng mẫu', role: email.includes('landlord') ? 'landlord' : 'tenant' };
    const mockToken = 'fake-jwt-token-123456';

    dispatch(loginSuccess({ user: mockUser, token: mockToken }));

    // Điều hướng dựa theo quyền hạn
    if (mockUser.role === 'landlord') {
      navigate('/landlord-dashboard');
    } else {
      navigate('/tenant-dashboard');
    }
  };

  const handleQuickLogin = (role) => {
    const mockUser = { name: role === 'landlord' ? 'Chủ Trọ (Landlord)' : 'Người Thuê (Tenant)', role };
    const mockToken = 'fake-jwt-token-123456';
    dispatch(loginSuccess({ user: mockUser, token: mockToken }));
    navigate(role === 'landlord' ? '/landlord-dashboard' : '/tenant-dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-400">Đăng Nhập Hệ Thống</h2>
        
        <form onSubmit={handleLogin}>
          <Input 
            label="Email đăng nhập" 
            type="email" 
            placeholder="Nhập email..." 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input 
            label="Mật khẩu" 
            type="password" 
            placeholder="Nhập mật khẩu..." 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <Button type="submit" variant="primary" className="w-full mt-4">
            Đăng Nhập
          </Button>
        </form>

        <div className="mt-6 border-t border-gray-700 pt-4 flex gap-2">
          <Button variant="secondary" onClick={() => handleQuickLogin('landlord')} className="w-full text-xs">
            Test Chủ Trọ
          </Button>
          <Button variant="secondary" onClick={() => handleQuickLogin('tenant')} className="w-full text-xs">
            Test Người Thuê
          </Button>
        </div>
      </div>
    </div>
  );
}