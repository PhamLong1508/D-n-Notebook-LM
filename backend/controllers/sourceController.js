const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Thêm source vào notebook
exports.addSource = async (req, res) => {
    try {
        const { notebookId } = req.params;
        const { title, content, url, type } = req.body;

        if (!title || !content || !type) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        // Kiểm tra quyền truy cập notebook
        const notebook = await prisma.notebook.findFirst({
            where: { id: Number(notebookId), userId: req.userId }
        });

        if (!notebook) return res.status(404).json({ error: 'Không tìm thấy notebook' });

        const source = await prisma.source.create({
            data: {
                title,
                content,
                url,
                type,
                notebookId: Number(notebookId)
            }
        });

        res.status(201).json(source);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lấy sources của notebook
exports.getSources = async (req, res) => {
    try {
        const { notebookId } = req.params;

        // Kiểm tra quyền truy cập notebook
        const notebook = await prisma.notebook.findFirst({
            where: { id: Number(notebookId), userId: req.userId }
        });

        if (!notebook) return res.status(404).json({ error: 'Không tìm thấy notebook' });

        const sources = await prisma.source.findMany({
            where: { notebookId: Number(notebookId) },
            orderBy: { createdAt: 'desc' }
        });

        res.json(sources);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Xóa source
exports.deleteSource = async (req, res) => {
    try {
        const { notebookId, sourceId } = req.params;

        // Kiểm tra quyền truy cập notebook
        const notebook = await prisma.notebook.findFirst({
            where: { id: Number(notebookId), userId: req.userId }
        });

        if (!notebook) return res.status(404).json({ error: 'Không tìm thấy notebook' });

        const source = await prisma.source.findFirst({
            where: { id: Number(sourceId), notebookId: Number(notebookId) }
        });

        if (!source) return res.status(404).json({ error: 'Không tìm thấy source' });

        await prisma.source.delete({
            where: { id: Number(sourceId) }
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
