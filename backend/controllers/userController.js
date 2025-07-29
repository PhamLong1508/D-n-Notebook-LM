const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

exports.register = async function (req, res) {
  const { username, password, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Thiếu username hoặc password' });
  let userRole = 'user';
  if (role === 'admin') {
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
};

exports.login = async function (req, res) {
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
};

exports.getUser = async function (req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { id: true, username: true, role: true, createdAt: true } });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async function (req, res) {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Thiếu username' });
  try {
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { username },
      select: { id: true, username: true, role: true, createdAt: true },
    });
    res.json(user);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Username đã tồn tại' });
    res.status(500).json({ error: err.message });
  }
};

exports.changePassword = async function (req, res) {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Thiếu mật khẩu cũ hoặc mật khẩu mới' });
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'Người dùng không tồn tại' });
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(401).json({ error: 'Mật khẩu cũ không đúng' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.userId }, data: { password: hashed } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addUser = async function (req, res) {
  const { username, password, role } = req.body;
  if (!username || !password || !role) return res.status(400).json({ error: 'Thiếu username, password hoặc role' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { username, password: hashed, role } });
    res.json({ id: user.id, username: user.username, role: user.role });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Username đã tồn tại' });
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async function (req, res) {
  const { id } = req.params;
  const { username, role } = req.body;
  if (!username && !role) return res.status(400).json({ error: 'Thiếu thông tin cập nhật' });
  const data = {};
  if (username) data.username = username;
  if (role) {
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Vai trò không hợp lệ' });
    data.role = role;
  }
  try {
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data,
      select: { id: true, username: true, role: true, createdAt: true },
    });
    res.json(user);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Username đã tồn tại' });
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async function (req, res) {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllUsers = async function (req, res) {
  try {
    const users = await prisma.user.findMany({ select: { id: true, username: true, role: true, createdAt: true } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStatistics = async function (req, res) {
  try {
    const totalUsers = await prisma.user.count();
    const totalNotebooks = await prisma.notebook.count();
    const totalNotes = await prisma.note.count();
    const totalSources = await prisma.source.count();

    res.json({
      totalUsers,
      totalNotebooks,
      totalNotes,
      totalSources,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 