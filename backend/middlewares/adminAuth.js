const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

exports.adminAuth = async function (req, res, next) {
  if (!req.userId) {
    return res.status(401).json({ error: 'Không có quyền truy cập' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Chỉ quản trị viên mới có quyền truy cập' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};