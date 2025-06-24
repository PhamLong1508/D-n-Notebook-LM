const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Lấy tất cả notebooks của user
exports.getNotebooks = async (req, res) => {
    try {
        const notebooks = await prisma.notebook.findMany({
            where: { userId: req.userId },
            include: {
                notes: { select: { id: true, title: true, createdAt: true } },
                sources: { select: { id: true, title: true, type: true } },
                _count: { select: { notes: true, sources: true } }
            },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(notebooks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Tạo notebook mới
exports.createNotebook = async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title) return res.status(400).json({ error: 'Tiêu đề không được để trống' });

        const notebook = await prisma.notebook.create({
            data: {
                title,
                description,
                userId: req.userId
            }
        });
        res.status(201).json(notebook);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lấy chi tiết notebook
exports.getNotebook = async (req, res) => {
    try {
        const { id } = req.params;
        const notebook = await prisma.notebook.findFirst({
            where: {
                id: Number(id),
                userId: req.userId
            },
            include: {
                notes: {
                    orderBy: { createdAt: 'desc' }
                },
                sources: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!notebook) return res.status(404).json({ error: 'Không tìm thấy notebook' });
        res.json(notebook);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Cập nhật notebook
exports.updateNotebook = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        const notebook = await prisma.notebook.findFirst({
            where: { id: Number(id), userId: req.userId }
        });

        if (!notebook) return res.status(404).json({ error: 'Không tìm thấy notebook' });

        const updatedNotebook = await prisma.notebook.update({
            where: { id: Number(id) },
            data: { title, description }
        });

        res.json(updatedNotebook);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Xóa notebook
exports.deleteNotebook = async (req, res) => {
    try {
        const { id } = req.params;

        const notebook = await prisma.notebook.findFirst({
            where: { id: Number(id), userId: req.userId }
        });

        if (!notebook) return res.status(404).json({ error: 'Không tìm thấy notebook' });

        await prisma.notebook.delete({
            where: { id: Number(id) }
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
