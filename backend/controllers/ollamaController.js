const { PrismaClient } = require('../generated/prisma');
const fetch = require('node-fetch');
const prisma = new PrismaClient();

// Helper function to call Ollama API
const callOllama = async (messages, options = {}) => {
  try {
    // First check if Ollama is running
    const healthCheck = await fetch('http://127.0.0.1:11434/api/tags', {
      timeout: 5000 // 5 second timeout
    });
    
    if (!healthCheck.ok) {
      throw new Error('Ollama server is not responding');
    }

    // Check if model is available
    const tagsData = await healthCheck.json();
    console.log(tagsData);
    const hasLlama3 = tagsData.models.some(model => model.name.includes('llama3:latest'));
    
    if (!hasLlama3) {
      throw new Error('Model llama3 chưa được cài đặt. Chạy lệnh: ollama pull llama3');
    }

    const response = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3',
        messages,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          ...options
        }
      }),
 // 30 second timeout for chat
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama API error response:', errorText);
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.message.content;
  } catch (error) {
    console.error('Ollama API call failed:', error);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new Error('Ollama service không chạy. Vui lòng khởi động bằng lệnh: ollama serve');
    }
    
    if (error.name === 'FetchError' && error.type === 'request-timeout') {
      throw new Error('Ollama phản hồi quá chậm. Vui lòng thử lại.');
    }
    
    throw new Error(`Lỗi AI: ${error.message}`);
  }
};

// Chat với AI dựa trên sources và notes của notebook với lịch sử
exports.chatWithNotebook = async (req, res) => {
  try {
    const { notebookId } = req.params;
    const { prompt, type = 'chat', sessionId } = req.body;

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

    // Tìm hoặc tạo chat session
    let chatSession;
    if (sessionId) {
      chatSession = await prisma.chatSession.findFirst({
        where: { 
          id: Number(sessionId), 
          notebookId: Number(notebookId)
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });
    }

    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {
          title: `Chat - ${new Date().toLocaleDateString('vi-VN')}`,
          notebookId: Number(notebookId)
        },
        include: {
          messages: true
        }
      });
    }

    // Tạo context từ sources và notes (training context)
    let trainingContext = `=== THÔNG TIN NOTEBOOK ===\n`;
    trainingContext += `Tên: ${notebook.title}\n`;
    if (notebook.description) trainingContext += `Mô tả: ${notebook.description}\n`;

    trainingContext += '\n=== NGUỒN TÀI LIỆU (ĐÃ ĐƯỢC TRAINING) ===\n';
    notebook.sources.forEach((source, index) => {
      trainingContext += `[Nguồn ${index + 1}] ${source.title}\n`;
      trainingContext += `Loại: ${source.type}\n`;
      trainingContext += `Nội dung:\n${source.content}\n\n`;
    });

    trainingContext += '\n=== GHI CHÚ HIỆN CÓ ===\n';
    notebook.notes.forEach((note, index) => {
      trainingContext += `[Ghi chú ${index + 1}] ${note.title}\n`;
      trainingContext += `Loại: ${note.type}\n`;
      trainingContext += `Nội dung:\n${note.content}\n\n`;
    });

    // Tạo system prompt dựa trên type
    let systemPrompt = '';
    switch (type) {
      case 'summary':
        systemPrompt = `Bạn là một trợ lý AI chuyên tạo tóm tắt. Bạn đã được training về tất cả các nguồn tài liệu trong notebook này. 
Hãy tạo tóm tắt ngắn gọn và súc tích dựa trên kiến thức đã được training và lịch sử cuộc trò chuyện.`;
        break;
      case 'outline':
        systemPrompt = `Bạn là một trợ lý AI chuyên tạo outline. Bạn đã được training về tất cả các nguồn tài liệu trong notebook này.
Hãy tạo outline có cấu trúc rõ ràng dựa trên kiến thức đã được training và lịch sử cuộc trò chuyện.`;
        break;
      case 'qa':
        systemPrompt = `Bạn là một trợ lý AI chuyên trả lời câu hỏi. Bạn đã được training về tất cả các nguồn tài liệu trong notebook này.
Hãy trả lời câu hỏi dựa trên kiến thức đã được training và lịch sử cuộc trò chuyện. Nếu không có thông tin, hãy nói rõ.`;
        break;
      default:
        systemPrompt = `Bạn là một trợ lý AI thông minh. Bạn đã được training về tất cả các nguồn tài liệu và ghi chú trong notebook này.
Hãy trả lời dựa trên kiến thức đã được training và nhớ lại lịch sử cuộc trò chuyện để có câu trả lời tốt nhất.`;
    }

    // Tạo messages bao gồm training context và lịch sử
    const messages = [
      { 
        role: 'system', 
        content: `${systemPrompt}\n\n${trainingContext}\n\nHãy nhớ toàn bộ thông tin trên và sử dụng để trả lời các câu hỏi tiếp theo. Bạn có thể tham khảo lại lịch sử trò chuyện để hiểu context tốt hơn.` 
      },
      // Thêm lịch sử trò chuyện
      ...chatSession.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      // Thêm câu hỏi hiện tại
      { role: 'user', content: prompt }
    ];

    const aiResponse = await callOllama(messages);

    // Lưu user message và AI response vào database
    await prisma.chatMessage.createMany({
      data: [
        {
          role: 'user',
          content: prompt,
          chatSessionId: chatSession.id
        },
        {
          role: 'assistant',
          content: aiResponse,
          chatSessionId: chatSession.id
        }
      ]
    });

    res.json({
      result: aiResponse,
      type,
      sessionId: chatSession.id,
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

    const aiResponse = await callOllama(messages);

    // Tạo note từ AI response
    const note = await prisma.note.create({
      data: {
        title: noteTitle,
        content: aiResponse,
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
    const messages = [{ role: 'user', content: prompt }];
    const aiResponse = await callOllama(messages);
    res.json({ result: aiResponse });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Lấy danh sách chat sessions của notebook
exports.getChatSessions = async (req, res) => {
  try {
    const { notebookId } = req.params;

    // Kiểm tra quyền truy cập notebook
    const notebook = await prisma.notebook.findFirst({
      where: { id: Number(notebookId), userId: req.userId }
    });

    if (!notebook) return res.status(404).json({ error: 'Không tìm thấy notebook' });

    const sessions = await prisma.chatSession.findMany({
      where: { notebookId: Number(notebookId) },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1 // Chỉ lấy message cuối để hiển thị preview
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(sessions);
  } catch (err) {
    console.error('Get chat sessions error:', err);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách chat: ' + err.message });
  }
};

// Lấy chi tiết một chat session với tất cả messages
exports.getChatSession = async (req, res) => {
  try {
    const { notebookId, sessionId } = req.params;

    // Kiểm tra quyền truy cập notebook
    const notebook = await prisma.notebook.findFirst({
      where: { id: Number(notebookId), userId: req.userId }
    });

    if (!notebook) return res.status(404).json({ error: 'Không tìm thấy notebook' });

    const session = await prisma.chatSession.findFirst({
      where: { 
        id: Number(sessionId),
        notebookId: Number(notebookId)
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!session) return res.status(404).json({ error: 'Không tìm thấy phiên chat' });

    res.json(session);
  } catch (err) {
    console.error('Get chat session error:', err);
    res.status(500).json({ error: 'Lỗi khi lấy chi tiết chat: ' + err.message });
  }
};

// Xóa chat session
exports.deleteChatSession = async (req, res) => {
  try {
    const { notebookId, sessionId } = req.params;

    // Kiểm tra quyền truy cập notebook
    const notebook = await prisma.notebook.findFirst({
      where: { id: Number(notebookId), userId: req.userId }
    });

    if (!notebook) return res.status(404).json({ error: 'Không tìm thấy notebook' });

    const session = await prisma.chatSession.findFirst({
      where: { 
        id: Number(sessionId),
        notebookId: Number(notebookId)
      }
    });

    if (!session) return res.status(404).json({ error: 'Không tìm thấy phiên chat' });

    await prisma.chatSession.delete({
      where: { id: Number(sessionId) }
    });

    res.json({ message: 'Đã xóa phiên chat' });
  } catch (err) {
    console.error('Delete chat session error:', err);
    res.status(500).json({ error: 'Lỗi khi xóa phiên chat: ' + err.message });
  }
};