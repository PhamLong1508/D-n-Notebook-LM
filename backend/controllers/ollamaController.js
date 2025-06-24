const { PrismaClient } = require('../generated/prisma');
const ollama = require('ollama');
const prisma = new PrismaClient();

// Chat với AI dựa trên sources và notes của notebook
exports.chatWithNotebook = async (req, res) => {
  try {
    const { notebookId } = req.params;
    const { prompt, type = 'chat' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Thiếu câu hỏi' });
    }

    // Kiểm tra quyền truy cập notebook
    const notebook = await prisma.notebook.findFirst({
      where: { id: Number(notebookId), userId: req.userId },
      include: {
        sources: true,
        notes: true
      }
    });

    if (!notebook) return res.status(404).json({ error: 'Không tìm thấy notebook' });

    // Tạo context từ sources và notes
    let context = `Notebook: ${notebook.title}\n`;
    if (notebook.description) context += `Mô tả: ${notebook.description}\n`;

    context += '\n--- NGUỒN TÀI LIỆU ---\n';
    notebook.sources.forEach((source, index) => {
      context += `${index + 1}. ${source.title}\n${source.content}\n\n`;
    });

    context += '\n--- GHI CHÚ ĐÃ CÓ ---\n';
    notebook.notes.forEach((note, index) => {
      context += `${index + 1}. ${note.title}\n${note.content}\n\n`;
    });

    // Tạo system prompt dựa trên type
    let systemPrompt = '';
    switch (type) {
      case 'summary':
        systemPrompt = 'Bạn là một trợ lý AI chuyên tạo tóm tắt. Hãy tạo tóm tắt ngắn gọn và súc tích từ các nguồn tài liệu được cung cấp.';
        break;
      case 'outline':
        systemPrompt = 'Bạn là một trợ lý AI chuyên tạo outline. Hãy tạo một outline có cấu trúc rõ ràng từ các nguồn tài liệu được cung cấp.';
        break;
      case 'qa':
        systemPrompt = 'Bạn là một trợ lý AI chuyên trả lời câu hỏi. Hãy trả lời câu hỏi dựa trên các nguồn tài liệu và ghi chú được cung cấp. Nếu không có thông tin, hãy nói rõ.';
        break;
      default:
        systemPrompt = 'Bạn là một trợ lý AI thông minh. Hãy trả lời câu hỏi dựa trên context được cung cấp.';
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Context:\n${context}\n\nCâu hỏi: ${prompt}` }
    ];

    const response = await ollama.chat({
      model: 'llama3',
      messages,
      options: {
        temperature: 0.7,
        top_p: 0.9
      }
    });

    res.json({
      result: response.message.content,
      type,
      notebook: {
        id: notebook.id,
        title: notebook.title
      }
    });
  } catch (err) {
    console.error('Ollama error:', err);
    res.status(500).json({ error: 'Lỗi khi xử lý AI: ' + err.message });
  }
};

// Tạo ghi chú từ AI response
exports.generateNote = async (req, res) => {
  try {
    const { notebookId } = req.params;
    const { prompt, type = 'summary' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Thiếu yêu cầu' });
    }

    // Kiểm tra quyền truy cập notebook
    const notebook = await prisma.notebook.findFirst({
      where: { id: Number(notebookId), userId: req.userId },
      include: {
        sources: true
      }
    });

    if (!notebook) return res.status(404).json({ error: 'Không tìm thấy notebook' });

    // Tạo context từ sources
    let context = `Notebook: ${notebook.title}\n`;
    if (notebook.description) context += `Mô tả: ${notebook.description}\n`;

    context += '\n--- NGUỒN TÀI LIỆU ---\n';
    notebook.sources.forEach((source, index) => {
      context += `${index + 1}. ${source.title}\n${source.content}\n\n`;
    });

    // Tạo system prompt và title dựa trên type
    let systemPrompt = '';
    let noteTitle = '';

    switch (type) {
      case 'summary':
        systemPrompt = 'Bạn là một trợ lý AI chuyên tạo tóm tắt. Hãy tạo tóm tắt ngắn gọn, súc tích và có cấu trúc từ các nguồn tài liệu được cung cấp.';
        noteTitle = 'Tóm tắt - ' + new Date().toLocaleDateString('vi-VN');
        break;
      case 'outline':
        systemPrompt = 'Bạn là một trợ lý AI chuyên tạo outline. Hãy tạo một outline có cấu trúc rõ ràng, phân cấp hợp lý từ các nguồn tài liệu được cung cấp.';
        noteTitle = 'Outline - ' + new Date().toLocaleDateString('vi-VN');
        break;
      case 'qa':
        systemPrompt = 'Bạn là một trợ lý AI chuyên tạo câu hỏi và trả lời. Hãy tạo các câu hỏi quan trọng và câu trả lời tương ứng từ các nguồn tài liệu được cung cấp.';
        noteTitle = 'Q&A - ' + new Date().toLocaleDateString('vi-VN');
        break;
      default:
        systemPrompt = 'Bạn là một trợ lý AI thông minh. Hãy xử lý yêu cầu dựa trên context được cung cấp.';
        noteTitle = 'Ghi chú AI - ' + new Date().toLocaleDateString('vi-VN');
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Context:\n${context}\n\nYêu cầu: ${prompt}` }
    ];

    const response = await ollama.chat({
      model: 'llama3',
      messages,
      options: {
        temperature: 0.7,
        top_p: 0.9
      }
    });

    // Tạo note từ AI response
    const note = await prisma.note.create({
      data: {
        title: noteTitle,
        content: response.message.content,
        type,
        notebookId: Number(notebookId)
      }
    });

    res.json(note);
  } catch (err) {
    console.error('Generate note error:', err);
    res.status(500).json({ error: 'Lỗi khi tạo ghi chú: ' + err.message });
  }
};

// Chat đơn giản (giữ lại cho compatibility)
exports.chat = async function (req, res) {
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
}; 