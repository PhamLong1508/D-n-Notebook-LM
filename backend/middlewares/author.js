const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

exports.requireAdmin = async function (req, res, next) {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Chỉ admin mới được phép' });
  next();
};

exports.requireSelfOrAdmin = async function (req, res, next) {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(401).json({ error: 'Không xác thực được user' });
  if (user.role !== 'admin' && req.userId !== Number(req.params.id)) {
    return res.status(403).json({ error: 'Chỉ admin hoặc chính chủ mới được phép' });
  }
  next();
};

exports.requireNoteOwnerOrAdmin = async function (req, res, next) {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(401).json({ error: 'Không xác thực được user' });
  const note = await prisma.note.findUnique({ where: { id: Number(req.params.id) } });
  if (!note) return res.status(404).json({ error: 'Note không tồn tại' });
  if (user.role !== 'admin' && note.userId !== req.userId) {
    return res.status(403).json({ error: 'Chỉ admin hoặc chủ note mới được phép' });
  }
  req.note = note;
  next();
}; 