require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '3mb' })); 

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/repairs', require('./routes/repairs'));

app.use('/api', (req, res) => res.status(404).json({ message: 'Không tìm thấy API.' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Lỗi máy chủ.' });
});

const start = async () => {
  if (!process.env.JWT_SECRET) throw new Error('Thiếu JWT_SECRET trong file .env');
  await connectDB();
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server chạy tại http://localhost:${port}`));
};

start().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
