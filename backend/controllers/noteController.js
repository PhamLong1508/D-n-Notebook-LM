const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

exports.getNotes = async function (req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    let notes;
    if (user.role === 'admin') {
      notes = await prisma.note.findMany();
    } else {
      notes = await prisma.note.findMany({ where: { userId: req.userId } });
    }
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createNote = async function (req, res) {
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Thiếu title hoặc body' });
  try {
    const note = await prisma.note.create({ data: { title, body, userId: req.userId } });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateNote = async function (req, res) {
  const { id } = req.params;
  const { title, body } = req.body;
  try {
    const updated = await prisma.note.update({ where: { id: Number(id) }, data: { title, body } });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteNote = async function (req, res) {
  const { id } = req.params;
  try {
    await prisma.note.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 