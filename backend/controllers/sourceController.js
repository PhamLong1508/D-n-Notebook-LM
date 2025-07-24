const { PrismaClient } = require('../generated/prisma');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const XLSX = require('xlsx');

const prisma = new PrismaClient();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'), false);
    }
  }
});

// Extract text from uploaded files
const extractTextFromFile = async (filePath, mimetype) => {
  try {
    const buffer = await fs.readFile(filePath);

    switch (mimetype) {
      case 'application/pdf':
        const pdfData = await pdfParse(buffer);
        return pdfData.text;

      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        const docData = await mammoth.extractRawText({ buffer });
        return docData.value;

      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        let text = '';
        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName];
          text += XLSX.utils.sheet_to_txt(sheet) + '\n';
        });
        return text;

      case 'text/plain':
      case 'text/csv':
        return buffer.toString('utf8');

      default:
        throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Error extracting text:', error);
    throw error;
  }
};

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

// Create source with file upload
exports.addSourceWithFile = async (req, res) => {
  try {
    const { notebookId } = req.params;
    const { title, type, url } = req.body;

    // Verify notebook ownership
    const notebook = await prisma.notebook.findFirst({
      where: { id: parseInt(notebookId), userId: req.userId }
    });

    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }

    let content = '';
    let fileName = null;
    let storedFileName = null;
    let fileSize = null;

    if (req.file) {
      // Extract text from uploaded file
      content = await extractTextFromFile(req.file.path, req.file.mimetype);
      fileName = req.file.originalname;
      storedFileName = req.file.filename;
      fileSize = req.file.size;
    } else if (req.body.content) {
      // Use provided text content
      content = req.body.content;
    } else {
      return res.status(400).json({ error: 'Content or file is required' });
    }

    const source = await prisma.source.create({
      data: {
        title: title || fileName || 'Untitled',
        type: type || 'document',
        content,
        url: url || null,
        fileName,
        storedFileName,
        fileSize,
        notebookId: parseInt(notebookId)
      }
    });

    res.json(source);
  } catch (error) {
    console.error('Error creating source:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create source from URL
exports.addSourceFromUrl = async (req, res) => {
  try {
    const { notebookId } = req.params;
    const { title, url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Verify notebook ownership
    const notebook = await prisma.notebook.findFirst({
      where: { id: parseInt(notebookId), userId: req.userId }
    });

    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }

    // Fetch content from URL (simplified - in production, use proper web scraping)
    let content = '';
    try {
      const fetch = require('node-fetch');
      const response = await fetch(url);
      const html = await response.text();

      // Simple HTML text extraction (in production, use cheerio or similar)
      content = html.replace(/<[^>]*>/g, '').trim();
      content = content.substring(0, 10000); // Limit content length
    } catch (fetchError) {
      console.error('Error fetching URL:', fetchError);
      content = 'Could not fetch content from URL';
    }

    const source = await prisma.source.create({
      data: {
        title: title || 'Web Content',
        type: 'webpage',
        content,
        url,
        notebookId: parseInt(notebookId)
      }
    });

    res.json(source);
  } catch (error) {
    console.error('Error creating source from URL:', error);
    res.status(500).json({ error: error.message });
  }
};

// Download source file
exports.downloadSourceFile = async (req, res) => {
  try {
    const { notebookId, sourceId } = req.params;

    // Kiểm tra quyền truy cập notebook
    const notebook = await prisma.notebook.findFirst({
      where: { id: Number(notebookId), userId: req.userId }
    });

    if (!notebook) return res.status(404).json({ error: 'Không tìm thấy notebook' });

    // Tìm source
    const source = await prisma.source.findFirst({
      where: {
        id: Number(sourceId),
        notebookId: Number(notebookId)
      }
    });

    if (!source) return res.status(404).json({ error: 'Không tìm thấy nguồn tài liệu' });

    // Chỉ cho phép tải file nếu có fileName
    if (!source.fileName || !source.storedFileName) {
      return res.status(400).json({ error: 'Nguồn này không phải là file' });
    }

    // Tìm file trong thư mục uploads
    const filePath = path.join('uploads', source.storedFileName);

    try {
      await fs.access(filePath);

      // Set headers để download
      res.setHeader('Content-Disposition', `attachment; filename="${source.fileName}"`);
      res.setHeader('Content-Type', 'application/octet-stream');

      // Send file
      res.sendFile(path.resolve(filePath));
    } catch (error) {
      res.status(404).json({ error: 'File không tồn tại' });
    }
  } catch (err) {
    console.error('Download file error:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Export multer upload configuration
exports.upload = upload;
