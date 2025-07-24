import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Tabs,
  Card,
  Typography,
  Space,
  Input,
  Modal,
  Form,
  Select,
  message,
  Spin,
  Empty,
  Badge,
  Avatar,
  List,
  Tooltip,
  Dropdown,
  Upload,
  Radio,
  Divider,
  App,
} from "antd";
import MDEditor, { commands } from '@uiw/react-md-editor';
import NotebookLMEditor from '../components/NotebookLMEditor';
import '../styles/md-editor.css';

const { confirm } = Modal;
import {
  ArrowLeftOutlined,
  PlusOutlined,
  FileTextOutlined,
  MessageOutlined,
  BulbOutlined,
  UnorderedListOutlined,
  QuestionCircleOutlined,
  BookOutlined,
  LinkOutlined,
  FilePdfOutlined,
  GlobalOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  RobotOutlined,
  UploadOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  InboxOutlined,
  SendOutlined,
  CheckOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function NotebookDetailPage() {
  const { modal } = App.useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const [notebook, setNotebook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("sources");

  // Modals
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editNoteModalOpen, setEditNoteModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [sourceType, setSourceType] = useState("text"); // 'text', 'file', 'url'
  const [fileList, setFileList] = useState([]);

  // Markdown content states
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editNoteContent, setEditNoteContent] = useState("");
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Word count helper
  const getWordCount = (text) => {
    if (!text) return 0;
    return text.replace(/[#*`>\-+]/g, '').split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCharCount = (text) => {
    if (!text) return 0;
    return text.length;
  };

  // Custom commands for MDEditor
  const customCommands = [
    // Text formatting group
    commands.bold,
    commands.italic, 
    commands.strikethrough,
    commands.divider,
    
    // Headers group
    commands.title1,
    commands.title2, 
    commands.title3,
    commands.title4,
    commands.title5,
    commands.title6,
    commands.divider,
    
    // Lists group
    commands.unorderedListCommand,
    commands.orderedListCommand,
    commands.checkedListCommand,
    commands.divider,
    
    // Media & Links group
    commands.quote,
    commands.hr,
    commands.link,
    commands.image,
    commands.divider,
    
    // Code group
    commands.code,
    commands.codeBlock,
    commands.divider,
    
    // Tables group
    commands.table,
    commands.divider,
    
    // Custom word count command
    {
      name: 'wordCount',
      keyCommand: 'wordCount',
      buttonProps: { 'aria-label': 'Word count', title: 'Word count' },
      icon: (
        <div style={{ fontSize: '11px', fontWeight: 500, color: '#5f6368', minWidth: '60px', textAlign: 'center' }}>
          📝 {getWordCount(newNoteContent)} từ
        </div>
      ),
      execute: () => {
        // Do nothing, just display count
      },
    },
    
    // View controls
    commands.divider,
    commands.fullscreen,
  ];

  // Markdown templates
  const markdownTemplates = {
    blank: "",
    meeting: `# Ghi chú cuộc họp

**Ngày:** ${new Date().toLocaleDateString('vi-VN')}
**Thời gian:** 
**Người tham gia:** 

## Chủ đề chính

## Các quyết định quan trọng
- [ ] 
- [ ] 
- [ ] 

## Hành động tiếp theo
- [ ] **Người phụ trách:** | **Deadline:** 
- [ ] **Người phụ trách:** | **Deadline:** 

## Ghi chú khác

`,
    study: `# Ghi chú học tập

## 📚 Chủ đề: 

### 🎯 Mục tiêu học tập
- 
- 
- 

### 📝 Nội dung chính

#### 1. 

#### 2. 

#### 3. 

### 💡 Điểm quan trọng
> 

### ❓ Câu hỏi cần giải đáp
- 
- 

### 📋 Tóm tắt
- **Khái niệm chính:** 
- **Ứng dụng:** 
- **Lưu ý:** 

`,
    todo: `# To-Do List

## 🎯 Mục tiêu hôm nay

### ⚡ Ưu tiên cao
- [ ] 
- [ ] 
- [ ] 

### 📋 Công việc thường
- [ ] 
- [ ] 
- [ ] 

### 💡 Ý tưởng
- [ ] 
- [ ] 

### ✅ Hoàn thành
- [x] 

---
**Ngày:** ${new Date().toLocaleDateString('vi-VN')}
`,
    research: `# Nghiên cứu: [Tiêu đề]

## 🔍 Mục tiêu nghiên cứu

## 📊 Dữ liệu & Nguồn

### Nguồn 1:
- **Link:** 
- **Tác giả:** 
- **Tóm tắt:** 

### Nguồn 2:
- **Link:** 
- **Tác giả:** 
- **Tóm tắt:** 

## 📝 Phân tích

### Điểm chính
1. 
2. 
3. 

### So sánh
| Tiêu chí | Nguồn 1 | Nguồn 2 |
|----------|---------|---------|
|          |         |         |
|          |         |         |

## 💭 Kết luận

## 🔗 Tài liệu tham khảo
1. 
2. 
3. 
`
  };

  // AI Chat
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);

  // Chat sessions
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Forms
  const [sourceForm] = Form.useForm();
  const [noteForm] = Form.useForm();
  const [editNoteForm] = Form.useForm();
  const [chatForm] = Form.useForm();

  // Chat-to-note states
  const [createNoteFromChatModalOpen, setCreateNoteFromChatModalOpen] = useState(false);
  const [chatNoteContent, setChatNoteContent] = useState("");
  const [chatNoteForm] = Form.useForm();

  useEffect(() => {
    fetchNotebook();
    fetchChatSessions();
  }, [id]);

  const fetchNotebook = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/notebooks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotebook(data);
      } else {
        message.error("Không thể tải notebook");
        navigate("/notebooks");
      }
    } catch (error) {
      message.error("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSource = async (values) => {
    try {
      const token = localStorage.getItem("token");
      let response;

      if (sourceType === "file" && fileList.length > 0) {
        // Upload file
        const formData = new FormData();
        formData.append("file", fileList[0].originFileObj);
        formData.append("title", values.title);
        formData.append("type", values.type || "document");

        response = await fetch(`/api/notebooks/${id}/sources/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      } else if (sourceType === "url") {
        // Add from URL
        response = await fetch(`/api/notebooks/${id}/sources/url`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: values.title,
            url: values.url,
          }),
        });
      } else {
        // Add text content
        response = await fetch(`/api/notebooks/${id}/sources`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        });
      }

      if (response.ok) {
        message.success("Thêm nguồn thành công");
        fetchNotebook();
        setSourceModalOpen(false);
        sourceForm.resetFields();
        setFileList([]);
        setSourceType("text");
      } else {
        message.error("Không thể thêm nguồn");
      }
    } catch (error) {
      message.error("Lỗi kết nối");
    }
  };

  const handleAddNote = async (values) => {
    // Validation cho markdown content
    if (!newNoteContent || newNoteContent.trim() === "") {
      message.error("Vui lòng nhập nội dung ghi chú");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const noteData = {
        ...values,
        content: newNoteContent
      };
      
      const response = await fetch(`/api/notebooks/${id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(noteData),
      });

      if (response.ok) {
        message.success("Thêm ghi chú thành công");
        fetchNotebook();
        setNoteModalOpen(false);
        noteForm.resetFields();
        setNewNoteContent("");
      } else {
        message.error("Không thể thêm ghi chú");
      }
    } catch (error) {
      message.error("Lỗi kết nối");
    }
  };

  const handleGenerateNote = async (values) => {
    try {
      setChatLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/notebooks/${id}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const newNote = await response.json();
        message.success("Tạo ghi chú AI thành công");
        fetchNotebook();
        setActiveTab("notes");
      } else {
        message.error("Không thể tạo ghi chú AI");
      }
    } catch (error) {
      message.error("Lỗi kết nối");
    } finally {
      setChatLoading(false);
    }
  };

  const handleChat = async (values) => {
    try {
      setChatLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`/api/notebooks/${id}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: values.prompt,
          sessionId: currentSessionId,
          type: "chat",
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Cập nhật session ID nếu có
        if (data.sessionId && !currentSessionId) {
          setCurrentSessionId(data.sessionId);
        }

        // Thêm tin nhắn vào UI
        setChatMessages((prev) => [
          ...prev,
          { role: "user", content: values.prompt },
          { role: "assistant", content: data.result },
        ]);

        // Reset form
        chatForm.resetFields();

        // Cập nhật danh sách sessions
        fetchChatSessions();

        message.success("AI đã trả lời");
      } else {
        const error = await response.json();
        message.error(error.error || "Không thể gửi tin nhắn");
      }
    } catch (error) {
      message.error("Lỗi kết nối");
    } finally {
      setChatLoading(false);
    }
  };

  const fetchChatSessions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/notebooks/${id}/chat-sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const sessions = await response.json();
        setChatSessions(sessions);
      }
    } catch (error) {
      console.error("Lỗi khi tải chat sessions:", error);
    }
  };

  const loadChatSession = async (sessionId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/notebooks/${id}/chat-sessions/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const session = await response.json();
        setCurrentSessionId(sessionId);
        setChatMessages(
          session.messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          }))
        );
        setSelectedMessages([]); // Reset selected messages
      }
    } catch (error) {
      message.error("Không thể tải lịch sử chat");
    }
  };

  const startNewChatSession = () => {
    setCurrentSessionId(null);
    setChatMessages([]);
    setSelectedMessages([]); // Reset selected messages
  };

  const handleDeleteConfirm = () => {
    if (sessionToDelete) {
      deleteChatSession(sessionToDelete);
      setDeleteModalOpen(false);
      setSessionToDelete(null);
    } else if (noteToDelete) {
      handleDeleteNote();
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSessionToDelete(null);
    setNoteToDelete(null);
  };

  const handleEditNote = (note) => {
    setNoteToEdit(note);
    editNoteForm.setFieldsValue({
      title: note.title,
      type: note.type,
    });
    setEditNoteContent(note.content || "");
    setEditNoteModalOpen(true);
  };

  const handleUpdateNote = async (values) => {
    // Validation cho markdown content
    if (!editNoteContent || editNoteContent.trim() === "") {
      message.error("Vui lòng nhập nội dung ghi chú");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const noteData = {
        ...values,
        content: editNoteContent
      };
      
      const response = await fetch(`/api/notebooks/${id}/notes/${noteToEdit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(noteData),
      });

      if (response.ok) {
        message.success("Cập nhật ghi chú thành công");
        fetchNotebook();
        setEditNoteModalOpen(false);
        setNoteToEdit(null);
        editNoteForm.resetFields();
        setEditNoteContent("");
      } else {
        message.error("Không thể cập nhật ghi chú");
      }
    } catch (error) {
      message.error("Lỗi kết nối");
    }
  };

  const handleDeleteNote = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/notebooks/${id}/notes/${noteToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        message.success("Đã xóa ghi chú");
        fetchNotebook();
        setDeleteModalOpen(false);
        setNoteToDelete(null);
      } else {
        message.error("Không thể xóa ghi chú");
      }
    } catch (error) {
      message.error("Lỗi kết nối");
    }
  };

  const handleMessageSelect = (messageIndex) => {
    setSelectedMessages(prev => {
      if (prev.includes(messageIndex)) {
        return prev.filter(idx => idx !== messageIndex);
      } else {
        return [...prev, messageIndex];
      }
    });
  };

  const handleCreateNoteFromChat = async () => {
    try {
      setChatLoading(true);
      
      const selectedChatContent = selectedMessages
        .sort((a, b) => a - b)
        .map(idx => {
          const msg = chatMessages[idx];
          return `${msg.role === 'user' ? 'Q' : 'A'}: ${msg.content}`;
        })
        .join('\n\n');

      // Gọi AI để format lại nội dung cho đẹp
      const token = localStorage.getItem("token");
      const formatResponse = await fetch(`/api/notebooks/${id}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: `Hãy format lại đoạn chat sau thành một ghi chú có cấu trúc đẹp, dễ đọc và chuyên nghiệp. Sử dụng Markdown để định dạng. Tạo tiêu đề, phần tóm tắt, và sắp xếp thông tin logic:\n\n${selectedChatContent}`,
          type: "format",
        }),
      });

      if (formatResponse.ok) {
        const formatData = await formatResponse.json();
        
        // Tạo tiêu đề từ nội dung đã format
        const lines = formatData.result.split('\n').filter(line => line.trim());
        const autoTitle = lines[0] || `Ghi chú chat - ${new Date().toLocaleDateString('vi-VN')}`;
        
        // Set content cho modal enhanced editor
        setChatNoteContent(formatData.result);
        chatNoteForm.setFieldsValue({
          title: autoTitle.replace(/^#+\s*/, '').substring(0, 100),
          type: 'text'
        });
        setCreateNoteFromChatModalOpen(true);
      } else {
        // Fallback to simple format if AI fails
        const firstMessage = chatMessages[selectedMessages.sort((a, b) => a - b)[0]];
        const autoTitle = `Ghi chú chat - ${firstMessage.content.substring(0, 50)}${firstMessage.content.length > 50 ? '...' : ''}`;
        
        setChatNoteContent(`# ${autoTitle}\n\n${selectedChatContent}`);
        chatNoteForm.setFieldsValue({
          title: autoTitle,
          type: 'text'
        });
        setCreateNoteFromChatModalOpen(true);
      }
    } catch (error) {
      message.error("Lỗi kết nối");
    } finally {
      setChatLoading(false);
    }
  };

  const deleteChatSession = async (sessionId) => {
    try {
      console.log("Deleting session:", sessionId);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/notebooks/${id}/chat-sessions/${sessionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Delete response:", response.status, response.ok);

      if (response.ok) {
        message.success("Đã xóa phiên chat");

        // Nếu đang xem session này thì chuyển về chat mới
        if (currentSessionId === sessionId) {
          startNewChatSession();
        }

        // Cập nhật danh sách sessions
        fetchChatSessions();
      } else {
        const errorData = await response.json();
        console.error("Delete error:", errorData);
        message.error(
          "Không thể xóa phiên chat: " + (errorData.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Delete chat session error:", error);
      message.error("Lỗi khi xóa phiên chat");
    }
  };

  const getSourceIcon = (source) => {
    if (source.fileName) {
      const ext = source.fileName.split(".").pop().toLowerCase();
      switch (ext) {
        case "pdf":
          return <FilePdfOutlined style={{ color: "#f40" }} />;
        case "doc":
        case "docx":
          return <FileWordOutlined style={{ color: "#1890ff" }} />;
        case "xls":
        case "xlsx":
          return <FileExcelOutlined style={{ color: "#52c41a" }} />;
        default:
          return <FileTextOutlined />;
      }
    }

    switch (source.type) {
      case "pdf":
        return <FilePdfOutlined style={{ color: "#f40" }} />;
      case "webpage":
        return <GlobalOutlined style={{ color: "#1890ff" }} />;
      case "document":
        return <FileTextOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  const getNoteTypeIcon = (type) => {
    switch (type) {
      case "summary":
        return <BulbOutlined />;
      case "outline":
        return <UnorderedListOutlined />;
      case "qa":
        return <QuestionCircleOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  const aiToolsItems = [
    {
      key: "summary",
      label: "Tạo tóm tắt",
      icon: <BulbOutlined />,
      onClick: () =>
        handleGenerateNote({
          type: "summary",
          prompt: "Tạo tóm tắt từ các nguồn tài liệu",
        }),
    },
    {
      key: "outline",
      label: "Tạo outline",
      icon: <UnorderedListOutlined />,
      onClick: () =>
        handleGenerateNote({
          type: "outline",
          prompt: "Tạo outline có cấu trúc từ các nguồn tài liệu",
        }),
    },
    {
      key: "qa",
      label: "Tạo Q&A",
      icon: <QuestionCircleOutlined />,
      onClick: () =>
        handleGenerateNote({
          type: "qa",
          prompt: "Tạo các câu hỏi và câu trả lời từ các nguồn tài liệu",
        }),
    },
  ];

  const handleDownloadFile = async (source) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/notebooks/${id}/sources/${source.id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = source.fileName || `${source.title}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        message.success("Tải file thành công");
      } else {
        message.error("Không thể tải file");
      }
    } catch (error) {
      message.error("Lỗi khi tải file");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!notebook) {
    return <div>Không tìm thấy notebook</div>;
  }

  const tabItems = [
    {
      key: "sources",
      label: (
        <Badge count={notebook.sources?.length || 0} offset={[10, 0]}>
          <span>Nguồn tài liệu</span>
        </Badge>
      ),
      children: (
        <div>
          <div className="flex justify-between items-center mb-4">
            <Text type="secondary">
              Thêm tài liệu để AI có thể hỗ trợ bạn tốt hơn
            </Text>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setSourceModalOpen(true)}
            >
              Thêm nguồn
            </Button>
          </div>

          {notebook.sources?.length === 0 ? (
            <Empty description="Chưa có nguồn tài liệu nào" />
          ) : (
            <List
              dataSource={notebook.sources}
              renderItem={(source) => (
                <List.Item
                  actions={[
                    <Tooltip title="Xóa">
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        danger
                        size="small"
                      />
                    </Tooltip>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={getSourceIcon(source)} />}
                    title={
                      <div className="flex items-center gap-2">
                        {source.fileName ? (
                          <Button
                            type="link"
                            className="p-0 h-auto text-left"
                            onClick={() => handleDownloadFile(source)}
                          >
                            <span className="text-blue-600 hover:text-blue-800">
                              {source.title}
                            </span>
                          </Button>
                        ) : (
                          <span>{source.title}</span>
                        )}
                        {source.fileName && (
                          <span className="text-xs text-gray-500">
                            ({Math.round(source.fileSize / 1024)} KB)
                          </span>
                        )}
                      </div>
                    }
                    description={
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {source.fileName
                            ? `File: ${source.fileName}`
                            : "Văn bản"}
                        </span>
                        {source.url && (
                          <Text type="secondary">
                            <LinkOutlined />{" "}
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Link
                            </a>
                          </Text>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      ),
    },
    {
      key: "notes",
      label: (
        <Badge count={notebook.notes?.length || 0} offset={[10, 0]}>
          <span>Ghi chú</span>
        </Badge>
      ),
      children: (
        <div>
          <div className="flex justify-between items-center mb-4">
            <Text type="secondary">Ghi chú của bạn và những gì AI tạo ra</Text>
            <Space>
              <Dropdown
                menu={{ items: aiToolsItems }}
                trigger={["click"]}
                disabled={!notebook.sources?.length}
              >
                <Button
                  icon={<RobotOutlined />}
                  loading={chatLoading}
                  disabled={!notebook.sources?.length}
                >
                  AI Tools
                </Button>
              </Dropdown>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setNoteModalOpen(true)}
              >
                Ghi chú mới
              </Button>
            </Space>
          </div>

          {notebook.notes?.length === 0 ? (
            <Empty description="Chưa có ghi chú nào" />
          ) : (
            <List
              dataSource={notebook.notes}
              renderItem={(note) => (
                <List.Item
                  actions={[
                    <Tooltip title="Sửa ghi chú">
                      <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        size="small"
                        onClick={() => handleEditNote(note)}
                      />
                    </Tooltip>,
                    <Tooltip title="Xóa ghi chú">
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        danger
                        size="small"
                        onClick={() => {
                          setNoteToDelete(note);
                          setDeleteModalOpen(true);
                        }}
                      />
                    </Tooltip>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={getNoteTypeIcon(note.type)} />}
                    title={note.title}
                    description={
                      <div 
                        className="prose prose-sm max-w-none"
                        style={{ maxHeight: '120px', overflow: 'hidden' }}
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html: note.content
                              .split('\n')
                              .slice(0, 4) // Show first 4 lines
                              .map(line => {
                                // Format headers
                                if (line.startsWith('#')) {
                                  const level = line.match(/^#+/)[0].length;
                                  const text = line.replace(/^#+\s*/, '');
                                  return `<h${Math.min(level, 6)} class="font-semibold text-gray-800 mb-1">${text}</h${Math.min(level, 6)}>`;
                                }
                                // Format bold text
                                line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                                // Format lists
                                if (line.match(/^\d+\./)) {
                                  return `<div class="ml-2">${line}</div>`;
                                }
                                if (line.match(/^[-*]/)) {
                                  return `<div class="ml-2">${line}</div>`;
                                }
                                return line ? `<div class="mb-1">${line}</div>` : '';
                              })
                              .join('')
                          }}
                        />
                        {note.content.split('\n').length > 4 && (
                          <div className="text-gray-400 text-xs mt-2">...</div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      ),
    },
    {
      key: "chat",
      label: "Chat với AI",
      children: (
        <div className="flex gap-4 h-96">
          {/* Chat Sessions Sidebar */}
          <div className="w-64 border-r pr-4">
            <div className="flex justify-between items-center mb-4">
              <Text strong>Lịch sử Chat</Text>
              <Button type="primary" size="small" onClick={startNewChatSession}>
                Chat mới
              </Button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {chatSessions.map((session) => (
                <Card
                  key={session.id}
                  size="small"
                  className={`cursor-pointer hover:bg-gray-50 ${
                    currentSessionId === session.id ? "border-blue-500" : ""
                  }`}
                  onClick={() => loadChatSession(session.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm">{session.title}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(session.updatedAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </div>
                      {session.messages?.length > 0 && (
                        <div className="text-xs text-gray-400 truncate mt-1">
                          {session.messages[0]?.content}
                        </div>
                      )}
                    </div>
                    <Tooltip title="Xóa phiên chat">
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        danger
                        className="ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSessionToDelete(session.id);
                          setDeleteModalOpen(true);
                        }}
                      />
                    </Tooltip>
                  </div>
                </Card>
              ))}

              {chatSessions.length === 0 && (
                <Empty
                  description="Chưa có cuộc trò chuyện nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Actions */}
            {chatMessages.length > 0 && (
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Text type="secondary">
                    {selectedMessages.length > 0 
                      ? `Đã chọn ${selectedMessages.length} tin nhắn`
                      : "Click để chọn tin nhắn và lưu vào ghi chú"
                    }
                  </Text>
                </div>
                <Space>
                  {selectedMessages.length > 0 && (
                    <>
                      <Button
                        size="small"
                        onClick={() => setSelectedMessages([])}
                      >
                        Bỏ chọn
                      </Button>
                      <Button
                        type="primary"
                        size="small"
                        icon={<FileTextOutlined />}
                        loading={chatLoading}
                        onClick={handleCreateNoteFromChat}
                      >
                        {chatLoading ? "Đang tạo..." : "Lưu vào ghi chú"}
                      </Button>
                    </>
                  )}
                </Space>
              </div>
            )}

            <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto">
              {chatMessages.length === 0 ? (
                <Empty
                  image={
                    <MessageOutlined style={{ fontSize: 48, color: "#ccc" }} />
                  }
                  description={
                    <div className="text-center">
                      <p>Bắt đầu cuộc trò chuyện với AI về notebook này</p>
                      <p className="text-sm text-gray-500 mt-2">
                        AI đã được training về tất cả nguồn tài liệu và sẽ nhớ
                        lịch sử cuộc trò chuyện
                      </p>
                    </div>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div 
                        className={`relative flex items-start gap-2 max-w-[80%] cursor-pointer rounded-lg p-2 transition-all duration-200 ${
                          selectedMessages.includes(index) 
                            ? "bg-blue-50 border-2 border-blue-300 shadow-md" 
                            : "hover:bg-gray-50 border-2 border-transparent"
                        }`}
                        onClick={() => handleMessageSelect(index)}
                      >
                        {selectedMessages.includes(index) && (
                          <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs z-10">
                            <CheckOutlined />
                          </div>
                        )}
                        {msg.role === "assistant" && (
                          <Avatar
                            icon={<RobotOutlined />}
                            size="small"
                            className="mt-1 flex-shrink-0"
                          />
                        )}
                        <div
                          className={`px-4 py-3 rounded-lg ${
                            msg.role === "user"
                              ? "bg-blue-500 text-white"
                              : "bg-white border shadow-sm"
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-left leading-relaxed">
                            {msg.role === "assistant" ? (
                              <div 
                                className="prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{
                                  __html: msg.content
                                    .split('\n')
                                    .map(line => {
                                      // Format lists
                                      if (line.match(/^\d+\./)) {
                                        return `<div class="mb-1 ml-4"><strong>${line}</strong></div>`;
                                      }
                                      // Format bold text
                                      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                                      // Format sections
                                      if (line.includes(':') && !line.includes('http')) {
                                        const [title, ...rest] = line.split(':');
                                        if (rest.length > 0) {
                                          return `<div class="mb-2"><strong>${title}:</strong> ${rest.join(':')}</div>`;
                                        }
                                      }
                                      return line ? `<div class="mb-1">${line}</div>` : '<br>';
                                    })
                                    .join('')
                                }}
                              />
                            ) : (
                              msg.content
                            )}
                          </div>
                        </div>
                        {msg.role === "user" && (
                          <Avatar
                            icon={<MessageOutlined />}
                            size="small"
                            className="mt-1 flex-shrink-0"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Form form={chatForm} onFinish={handleChat}>
              <Form.Item name="prompt" className="mb-2">
                <Input.Search
                  placeholder="Hỏi AI về nội dung notebook..."
                  enterButton={
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      loading={chatLoading}
                    >
                      Gửi
                    </Button>
                  }
                  loading={chatLoading}
                  disabled={!notebook.sources?.length || chatLoading}
                  size="large"
                  onSearch={() => {
                    const values = chatForm.getFieldsValue();
                    if (values.prompt) {
                      handleChat(values);
                    }
                  }}
                />
              </Form.Item>
              {!notebook.sources?.length && (
                <Text type="secondary" className="text-sm">
                  Thêm nguồn tài liệu để có thể chat với AI
                </Text>
              )}
            </Form>
          </div>
        </div>
      ),
    },
  ];

  const handleSaveChatNote = async (values) => {
    // Validation cho markdown content
    if (!chatNoteContent || chatNoteContent.trim() === "") {
      message.error("Vui lòng nhập nội dung ghi chú");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const noteData = {
        ...values,
        content: chatNoteContent
      };
      
      const response = await fetch(`/api/notebooks/${id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(noteData),
      });

      if (response.ok) {
        message.success("Đã tạo ghi chú từ chat");
        chatNoteForm.resetFields();
        setChatNoteContent("");
        setCreateNoteFromChatModalOpen(false);
        setSelectedMessages([]);
        fetchNotebook();
        setActiveTab("notes");
      } else {
        const errorData = await response.json();
        message.error(errorData.error || "Không thể tạo ghi chú");
      }
    } catch (error) {
      message.error("Lỗi kết nối");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/notebooks")}
        >
          Quay lại
        </Button>
        <div className="flex-1">
          <Title level={2} className="mb-1">
            {notebook.title}
          </Title>
          {notebook.description && (
            <Text type="secondary">{notebook.description}</Text>
          )}
        </div>
      </div>

      {/* Content */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
      />

      {/* Source Modal */}
      <Modal
        title="Thêm nguồn tài liệu"
        open={sourceModalOpen}
        onCancel={() => {
          setSourceModalOpen(false);
          setSourceType("text");
          setFileList([]);
          sourceForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <div className="mb-4">
          <Radio.Group
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
            className="w-full"
          >
            <Radio.Button value="text" className="flex-1 text-center">
              <FileTextOutlined /> Văn bản
            </Radio.Button>
            <Radio.Button value="file" className="flex-1 text-center">
              <UploadOutlined /> Upload File
            </Radio.Button>
            <Radio.Button value="url" className="flex-1 text-center">
              <GlobalOutlined /> Từ URL
            </Radio.Button>
          </Radio.Group>
        </div>

        <Form form={sourceForm} layout="vertical" onFinish={handleAddSource}>
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input placeholder="Tiêu đề nguồn tài liệu..." />
          </Form.Item>

          {sourceType === "file" && (
            <>
              <Form.Item
                name="type"
                label="Loại tài liệu"
                initialValue="document"
              >
                <Select>
                  <Select.Option value="document">Tài liệu</Select.Option>
                  <Select.Option value="pdf">PDF</Select.Option>
                  <Select.Option value="text">Văn bản thuần</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="Upload File">
                <Upload.Dragger
                  fileList={fileList}
                  onChange={({ fileList }) => setFileList(fileList)}
                  beforeUpload={() => false}
                  accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv"
                  maxCount={1}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Kéo thả file vào đây hoặc click để chọn
                  </p>
                  <p className="ant-upload-hint">
                    Hỗ trợ: PDF, Word, Excel, TXT, CSV (tối đa 10MB)
                  </p>
                </Upload.Dragger>
              </Form.Item>
            </>
          )}

          {sourceType === "url" && (
            <Form.Item
              name="url"
              label="URL"
              rules={[
                { required: true, message: "Vui lòng nhập URL" },
                { type: "url", message: "URL không hợp lệ" },
              ]}
            >
              <Input placeholder="https://example.com" />
            </Form.Item>
          )}

          {sourceType === "text" && (
            <>
              <Form.Item
                name="type"
                label="Loại"
                rules={[{ required: true, message: "Vui lòng chọn loại" }]}
                initialValue="text"
              >
                <Select placeholder="Chọn loại nguồn">
                  <Select.Option value="text">Văn bản</Select.Option>
                  <Select.Option value="document">Tài liệu</Select.Option>
                  <Select.Option value="webpage">Trang web</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="url" label="URL (tùy chọn)">
                <Input placeholder="https://..." />
              </Form.Item>

              <Form.Item
                name="content"
                label="Nội dung"
                rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
              >
                <TextArea rows={6} placeholder="Nội dung nguồn tài liệu..." />
              </Form.Item>
            </>
          )}

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button
                onClick={() => {
                  setSourceModalOpen(false);
                  setSourceType("text");
                  setFileList([]);
                  sourceForm.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={sourceType === "file" && fileList.length === 0}
              >
                Thêm
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Note Modal */}
      <Modal
        title="Thêm ghi chú"
        open={noteModalOpen}
        onCancel={() => {
          setNoteModalOpen(false);
          setNewNoteContent("");
          noteForm.resetFields();
        }}
        footer={null}
        width={1000}
        style={{ top: 20 }}
        centered={false}
      >
        <Form form={noteForm} layout="vertical" onFinish={handleAddNote}>
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input placeholder="Tiêu đề ghi chú..." />
          </Form.Item>

          <Form.Item name="type" label="Loại ghi chú" initialValue="text">
            <Select>
              <Select.Option value="text">Văn bản thường</Select.Option>
              <Select.Option value="summary">Tóm tắt</Select.Option>
              <Select.Option value="outline">Outline</Select.Option>
              <Select.Option value="qa">Hỏi đáp</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Template ghi chú">
            <Select
              placeholder="Chọn template để bắt đầu nhanh (tùy chọn)"
              allowClear
              onChange={(template) => {
                if (template && markdownTemplates[template]) {
                  setNewNoteContent(markdownTemplates[template]);
                }
              }}
            >
              <Select.Option value="blank">📄 Trống</Select.Option>
              <Select.Option value="meeting">🤝 Ghi chú cuộc họp</Select.Option>
              <Select.Option value="study">📚 Ghi chú học tập</Select.Option>
              <Select.Option value="todo">✅ To-Do List</Select.Option>
              <Select.Option value="research">🔍 Nghiên cứu</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label={
              <div className="flex items-center justify-between w-full">
                <span>Nội dung</span>
                <div className="text-xs text-gray-500 flex items-center gap-4">
                  <span>💡 Ctrl/Cmd + S = lưu</span>
                  <span>Ctrl/Cmd + F = tìm kiếm</span>
                  <span>F11 = toàn màn hình</span>
                </div>
              </div>
            }
          >
            <NotebookLMEditor
              value={newNoteContent}
              onChange={setNewNoteContent}
              height={500}
              autoSave={false}
              placeholder="✨ Viết ghi chú bằng Markdown...\n\n💡 Mẹo:\n• **in đậm** hoặc *in nghiêng*\n• # Tiêu đề lớn\n• ## Tiêu đề nhỏ\n• - Danh sách\n• 1. Danh sách số\n• [Link](https://example.com)\n• `code` hoặc ```code block```\n• > Trích dẫn\n• Kéo thả hình ảnh trực tiếp"
              title={noteForm.getFieldValue('title')}
              showStatusBar={true}
              collaborative={false}
            />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button 
                onClick={() => {
                  setNoteModalOpen(false);
                  setNewNoteContent("");
                  noteForm.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Thêm
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        title={sessionToDelete ? "Xóa phiên chat" : "Xóa ghi chú"}
        open={deleteModalOpen}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Xóa"
        cancelText="Hủy"
        okType="danger"
      >
        <p>
          {sessionToDelete 
            ? "Bạn có chắc muốn xóa phiên chat này?"
            : "Bạn có chắc muốn xóa ghi chú này?"
          }
        </p>
      </Modal>

      {/* Edit Note Modal */}
      <Modal
        title="Sửa ghi chú"
        open={editNoteModalOpen}
        onCancel={() => {
          setEditNoteModalOpen(false);
          setNoteToEdit(null);
          setEditNoteContent("");
          editNoteForm.resetFields();
        }}
        footer={null}
        width={1000}
        style={{ top: 20 }}
        centered={false}
      >
        <Form form={editNoteForm} layout="vertical" onFinish={handleUpdateNote}>
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input placeholder="Tiêu đề ghi chú..." />
          </Form.Item>

          <Form.Item name="type" label="Loại ghi chú">
            <Select>
              <Select.Option value="text">Văn bản thường</Select.Option>
              <Select.Option value="summary">Tóm tắt</Select.Option>
              <Select.Option value="outline">Outline</Select.Option>
              <Select.Option value="qa">Hỏi đáp</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung"
          >
            <NotebookLMEditor
              value={editNoteContent}
              onChange={setEditNoteContent}
              height={500}
              autoSave={false}
              placeholder="✨ Chỉnh sửa ghi chú bằng Markdown...\n\n💡 Mẹo:\n• **in đậm** hoặc *in nghiêng*\n• # Tiêu đề lớn\n• ## Tiêu đề nhỏ\n• - Danh sách\n• 1. Danh sách số\n• [Link](https://example.com)\n• `code` hoặc ```code block```\n• > Trích dẫn\n• Kéo thả hình ảnh trực tiếp"
              title={editNoteForm.getFieldValue('title')}
              showStatusBar={true}
              collaborative={false}
            />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button
                onClick={() => {
                  setEditNoteModalOpen(false);
                  setNoteToEdit(null);
                  editNoteForm.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Note from Chat Modal */}
      <Modal
        title="Tạo ghi chú từ chat"
        open={createNoteFromChatModalOpen}
        onCancel={() => {
          setCreateNoteFromChatModalOpen(false);
          setSelectedMessages([]);
        }}
        footer={null}
        width={800}
        centered
      >
        <div className="mb-4">
          <Text type="secondary">
            {selectedMessages.length} tin nhắn đã chọn
          </Text>
        </div>

        <Form form={chatNoteForm} layout="vertical" onFinish={handleSaveChatNote}>
          <Form.Item
            name="title"
            label="Tiêu đề ghi chú"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề ghi chú" }]}
          >
            <Input placeholder="Tiêu đề ghi chú từ chat..." />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung ghi chú"
            rules={[{ required: true, message: "Vui lòng nhập nội dung ghi chú" }]}
          >
            <TextArea
              rows={6}
              placeholder="Nội dung ghi chú được tạo từ tin nhắn đã chọn..."
              value={chatNoteContent}
              onChange={(e) => setChatNoteContent(e.target.value)}
            />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button
                onClick={() => {
                  setCreateNoteFromChatModalOpen(false);
                  setSelectedMessages([]);
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Tạo ghi chú
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
