const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Lấy notes của một notebook
exports.getNotes = async function (req, res) {
  try {
    const { notebookId } = req.params;

    // Kiểm tra quyền truy cập notebook
    const notebook = await prisma.notebook.findFirst({
      where: { id: Number(notebookId), userId: req.userId }
    });

    if (!notebook) return res.status(404).json({ error: 'Không tìm thấy notebook' });

    const notes = await prisma.note.findMany({
      where: { notebookId: Number(notebookId) },
      orderBy: { createdAt: 'desc' }
    });

    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo note mới trong notebook
exports.createNote = async function (req, res) {
  try {
    const { notebookId } = req.params;
    const { title, content, type = 'text' } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Thiếu tiêu đề hoặc nội dung' });
    }

    // Kiểm tra quyền truy cập notebook
    const notebook = await prisma.notebook.findFirst({
      where: { id: Number(notebookId), userId: req.userId }
    });

    if (!notebook) return res.status(404).json({ error: 'Không tìm thấy notebook' });

    const note = await prisma.note.create({
      data: {
        title,
        content,
        type,
        notebookId: Number(notebookId)
      }
    });

    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật note
exports.updateNote = async function (req, res) {
  try {
    const { notebookId, noteId } = req.params;
    const { title, content, type } = req.body;

    // Kiểm tra quyền truy cập notebook
    const notebook = await prisma.notebook.findFirst({
      where: { id: Number(notebookId), userId: req.userId }
    });

    if (!notebook) return res.status(404).json({ error: 'Không tìm thấy notebook' });

    const note = await prisma.note.findFirst({
      where: { id: Number(noteId), notebookId: Number(notebookId) }
    });

    if (!note) return res.status(404).json({ error: 'Không tìm thấy note' });

    const updatedNote = await prisma.note.update({
      where: { id: Number(noteId) },
      data: { title, content, type }
    });

    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xóa note
exports.deleteNote = async function (req, res) {
  try {
    const { notebookId, noteId } = req.params;

    // Kiểm tra quyền truy cập notebook
    const notebook = await prisma.notebook.findFirst({
      where: { id: Number(notebookId), userId: req.userId }
    });

    if (!notebook) return res.status(404).json({ error: 'Không tìm thấy notebook' });

    const note = await prisma.note.findFirst({
      where: { id: Number(noteId), notebookId: Number(notebookId) }
    });

    if (!note) return res.status(404).json({ error: 'Không tìm thấy note' });

    await prisma.note.delete({
      where: { id: Number(noteId) }
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 

// Lấy note theo id
exports.getNoteById = async function (req, res) {
    try {
        const { notebookId, noteId } = req.params;

        const note = await prisma.note.findFirst({
            where: { id: Number(noteId), notebookId: Number(notebookId) },
            include: { notebook: true } // Include notebook to check userId
        });

        if (!note) {
            return res.status(404).json({ error: 'Không tìm thấy note' });
        }

        // If the note is public, allow access
        if (note.isPublic) {
            return res.json(note);
        }

        // If the note is private, check if the requesting user owns the notebook
        if (!note.notebook || note.notebook.userId !== req.userId) {
            return res.status(403).json({ error: 'Bạn không có quyền truy cập ghi chú này' });
        }

        res.json(note);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.toggleNotePublicStatus = async function (req, res) {
    try {
        const { notebookId, noteId } = req.params;

        // Verify notebook ownership
        const notebook = await prisma.notebook.findFirst({
            where: { id: Number(notebookId), userId: req.userId }
        });

        if (!notebook) {
            return res.status(404).json({ error: 'Không tìm thấy notebook' });
        }

        // Verify note ownership within the notebook
        const note = await prisma.note.findFirst({
            where: { id: Number(noteId), notebookId: Number(notebookId) }
        });

        if (!note) {
            return res.status(404).json({ error: 'Không tìm thấy note' });
        }

        const updatedNote = await prisma.note.update({
            where: { id: Number(noteId) },
            data: { isPublic: !note.isPublic }
        });

        res.json(updatedNote);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}; 