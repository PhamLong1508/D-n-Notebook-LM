# TakeNoteLM - NotebookLM Clone

Ứng dụng ghi chú thông minh với AI, lấy cảm hứng từ Google NotebookLM.

## Tính năng chính

### 🎯 Quản lý Notebooks

- Tạo và quản lý nhiều notebooks
- Mỗi notebook có thể chứa nhiều nguồn tài liệu và ghi chú
- Giao diện trực quan giống NotebookLM

### 📚 Nguồn tài liệu đa dạng

- Thêm văn bản, tài liệu, URL
- Hỗ trợ nhiều định dạng: PDF, văn bản, trang web
- Tổ chức nguồn tài liệu theo notebook

### 🤖 AI Assistant thông minh

- Chat với AI về nội dung tài liệu
- Tạo tóm tắt tự động từ nguồn tài liệu
- Tạo outline có cấu trúc
- Tạo câu hỏi và trả lời (Q&A)
- AI có context về toàn bộ notebook

### 📝 Ghi chú đa dạng

- Ghi chú văn bản thường
- Ghi chú AI (tóm tắt, outline, Q&A)
- Chỉnh sửa và quản lý ghi chú dễ dàng

### 🔐 Bảo mật

- Đăng ký/đăng nhập an toàn
- JWT authentication
- Mỗi user chỉ truy cập notebook của mình

## Công nghệ sử dụng

### Backend

- **Node.js + Express**: API server
- **Prisma ORM**: Database management
- **MySQL**: Database
- **Ollama**: Local AI (Llama 3)
- **JWT**: Authentication
- **bcryptjs**: Password hashing

### Frontend

- **React 19**: UI framework
- **Vite**: Build tool
- **Ant Design**: UI components
- **Tailwind CSS**: Styling
- **React Router**: Navigation

## Cài đặt và chạy

### Yêu cầu

- Node.js 18+
- MySQL
- Ollama (để chạy AI local)

### 1. Clone repository

\`\`\`bash
git clone <repo-url>
cd takenotelm
\`\`\`

### 2. Cài đặt Backend

\`\`\`bash
cd backend
npm install

# Cấu hình database trong .env

cp .env.example .env

# Chỉnh sửa DATABASE_URL trong .env

# Chạy migrations

npx prisma migrate dev

# Khởi chạy server

npm start
\`\`\`

### 3. Cài đặt Frontend

\`\`\`bash
cd frontend
npm install

# Khởi chạy development server

npm run dev
\`\`\`

### 4. Cài đặt Ollama (AI)

\`\`\`bash

# Cài đặt Ollama

curl -fsSL https://ollama.com/install.sh | sh

# Tải model Llama 3

ollama pull llama3

# Ollama sẽ chạy trên port 11434

\`\`\`

### 5. Truy cập ứng dụng

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Cấu trúc Database

### User

- id, username, password, role, createdAt

### Notebook

- id, title, description, userId, createdAt, updatedAt

### Note

- id, title, content, type, notebookId, createdAt, updatedAt

### Source

- id, title, content, url, type, notebookId, createdAt

## API Endpoints

### Authentication

- POST /api/register - Đăng ký
- POST /api/login - Đăng nhập
- GET /api/user - Thông tin user

### Notebooks

- GET /api/notebooks - Danh sách notebooks
- POST /api/notebooks - Tạo notebook mới
- GET /api/notebooks/:id - Chi tiết notebook
- PUT /api/notebooks/:id - Cập nhật notebook
- DELETE /api/notebooks/:id - Xóa notebook

### Notes

- GET /api/notebooks/:id/notes - Danh sách notes
- POST /api/notebooks/:id/notes - Tạo note mới
- PUT /api/notebooks/:id/notes/:noteId - Cập nhật note
- DELETE /api/notebooks/:id/notes/:noteId - Xóa note

### Sources

- GET /api/notebooks/:id/sources - Danh sách sources
- POST /api/notebooks/:id/sources - Thêm source
- DELETE /api/notebooks/:id/sources/:sourceId - Xóa source

### AI

- POST /api/notebooks/:id/chat - Chat với AI
- POST /api/notebooks/:id/generate - Tạo ghi chú AI

## Workflow sử dụng

1. **Đăng ký/Đăng nhập** vào hệ thống
2. **Tạo Notebook** mới với tiêu đề và mô tả
3. **Thêm nguồn tài liệu** vào notebook (văn bản, PDF, URL)
4. **Chat với AI** để được tư vấn về nội dung
5. **Tạo ghi chú AI** (tóm tắt, outline, Q&A) từ nguồn tài liệu
6. **Quản lý và chỉnh sửa** ghi chú theo nhu cầu

## Hướng phát triển

- [ ] Upload file PDF/Word
- [ ] Import từ Google Drive/Dropbox
- [ ] Export ghi chú ra PDF/Word
- [ ] Chia sẻ notebook với người khác
- [ ] Search toàn văn trong notebook
- [ ] Mobile app
- [ ] Tích hợp thêm AI models khác

## License

MIT License

## Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo issue hoặc pull request.
