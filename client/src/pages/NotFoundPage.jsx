// src/pages/NotFoundPage.jsx
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

export const NotFoundPage = () => {
  return (
    <div className="py-16 text-center">
      <p className="text-5xl font-extrabold text-indigo-600">404</p>
      <h1 className="mt-2 text-xl font-bold">Không tìm thấy trang</h1>
      <p className="mt-1 text-sm text-slate-500">
        Đường dẫn bạn truy cập không tồn tại trong hệ thống.
      </p>
      <Link to="/" className="mt-5 inline-block">
        <Button>Về trang phòng trống</Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
