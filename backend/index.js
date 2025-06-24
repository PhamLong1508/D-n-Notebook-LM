const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('./generated/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

// Import middlewares
const { auth, authOptional } = require('./middlewares/auth');

// Đăng ký
app.post('/api/register', authOptional, async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Thiếu username hoặc password' });
  let userRole = 'user';
  if (role === 'admin') {
    // Chỉ admin mới tạo được user role admin
    if (!req.userId) return res.status(403).json({ error: 'Chỉ admin mới tạo được user admin' });
    const currentUser = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!currentUser || currentUser.role !== 'admin') return res.status(403).json({ error: 'Chỉ admin mới tạo được user admin' });
    userRole = 'admin';
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { username, password: hashed, role: userRole } });
    res.json({ id: user.id, username: user.username, role: user.role });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Username đã tồn tại' });
    res.status(500).json({ error: err.message });
  }
});

// Đăng nhập
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Thiếu username hoặc password' });
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ error: 'Sai username hoặc password' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Sai username hoặc password' });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy thông tin user hiện tại
app.get('/api/user', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, username: true, role: true, createdAt: true }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Routes
app.use('/api', require('./routes/user'));
app.use('/api', require('./routes/notebook'));
app.use('/api', require('./routes/note'));
app.use('/api', require('./routes/source'));
app.use('/api', require('./routes/ollama'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
}); 