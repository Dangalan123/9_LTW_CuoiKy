# 9_LTW_CuoiKy - Hệ thống Quản lý Nhà trọ

## 1. Cấu trúc thư mục
- `client/`: Frontend (React, Vite, Tailwind CSS, Redux Toolkit, Axios)
- `server/`: Backend (Node.js, Express, MongoDB + Mongoose, JWT)

## 2. Chạy dự án

### Backend (`server`)
```bash
cd server
npm install
cp .env.example .env      # rồi sửa MONGODB_URI và JWT_SECRET
npm run seed              # nạp dữ liệu mẫu (mật khẩu mọi tài khoản: 123456)
npm run dev               # http://localhost:5000
```

### Frontend (`client`)
```bash
cd client
npm install
npm run dev               # http://localhost:5173 (tự chuyển /api sang server :5000)
```

### Tài khoản mẫu (sau `npm run seed`)
| Vai trò | Email | Ghi chú |
|---|---|---|
| Chủ trọ | chutro@nhatro.vn | |
| Người thuê | nguyenvanan@nhatro.vn | P.101 |
| Người thuê | tranthibinh@nhatro.vn | P.201 |
| Người thuê | lehoangcuong@nhatro.vn | đang chờ duyệt |

Xem chi tiết các thay đổi và cách kiểm thử trong `HUONG_DAN.md`.
