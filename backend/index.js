const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('../generated/prisma');
const mysql = require('mysql2');
const ollama = require('ollama');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

// MySQL connection test (optional, Prisma is main ORM)
const db = mysql.createConnection({
  host: 'localhost',
  user: 'user',
  password: 'password',
  database: 'dbname',
});
db.connect(err => {
  if (err) console.log('MySQL connection error:', err.message);
  else console.log('MySQL connected!');
});

// Sample API: Get all notes
app.get('/api/notes', async (req, res) => {
  try {
    const notes = await prisma.note.findMany();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sample API: Chat with Ollama
app.post('/api/ollama', async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await ollama.chat({
      model: 'llama3',
      messages: [{ role: 'user', content: prompt }],
    });
    res.json({ result: response.message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

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

// Middleware xác thực tùy chọn (cho phép req.userId nếu có token)
function authOptional(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.userId = payload.userId;
    } catch {}
  }
  next();
}

// Middleware kiểm tra quyền admin
function requireAdmin(req, res, next) {
  prisma.user.findUnique({ where: { id: req.userId } })
    .then(user => {
      if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Chỉ admin mới được phép' });
      next();
    })
    .catch(() => res.status(500).json({ error: 'Lỗi xác thực admin' }));
}

// Lấy thông tin user hiện tại
app.get('/api/user', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { id: true, username: true, createdAt: true } });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ví dụ logic author: chỉ admin hoặc chính chủ mới được sửa/xóa user
app.delete('/api/user/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const currentUser = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!currentUser) return res.status(401).json({ error: 'Không xác thực được user' });
    if (currentUser.role !== 'admin' && req.userId !== Number(id)) {
      return res.status(403).json({ error: 'Chỉ admin hoặc chính chủ mới được xóa user' });
    }
    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api', require('./routes/user'));
app.use('/api', require('./routes/note'));
app.use('/api', require('./routes/ollama'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
}); 