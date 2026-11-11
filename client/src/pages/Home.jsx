import Button from '@/components/Button.jsx';
import Input from '@/components/Input.jsx';

export default function Home() {
  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Trang Chủ - Quản Lý Phòng Trọ</h1>
      
      <div className="space-y-4 p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-gray-800">Kiểm tra Base Components</h2>
        
        <Input 
          label="Tài khoản / Email" 
          placeholder="Nhập email của bạn..." 
        />
        
        <Button variant="primary" onClick={() => alert('Đã bấm nút!')} className="w-full">
          Đăng Nhập Ngay
        </Button>
      </div>
    </div>
  );
}