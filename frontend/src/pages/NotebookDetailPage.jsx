import { useState, useEffect, useCallback } from "react";
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
  Upload,
  Radio,
  Divider,
  App,
} from "antd";
import remarkGfm from "remark-gfm";

import { useContextMenu } from "../contexts/ContextPanelContext";
import { useNotebook } from "../contexts/NotebookContext";
import RichTextEditor from "../components/RichTextEditor";
import "../styles/rich-text-editor.css";

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
  EyeOutlined,
  MoreOutlined,
  RobotOutlined,
  UploadOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  InboxOutlined,
  SendOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function NotebookDetailPage() {
  const { modal } = App.useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addSnippet, registerNoteCreator, unregisterNoteCreator } =
    useContextMenu();
  const {
    setNotebookId,
    setNotebookSources,
    setChatLoading,
    setOpenNoteModal,
    setFetchNotebook,
  } = useNotebook();
  const [notebook, setNotebook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("sources");

  // Modals
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [renameSessionModalOpen, setRenameSessionModalOpen] = useState(false);
  const [sessionToRename, setSessionToRename] = useState(null);
  const [sourceType, setSourceType] = useState("text"); // 'text', 'file', 'url'
  const [fileList, setFileList] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [editSourceModalOpen, setEditSourceModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [noteForm] = Form.useForm();

  const openNoteModal = useCallback(
    (note = null) => {
      noteForm.resetFields();
      if (note) {
        setEditingNote(note);
        noteForm.setFieldsValue(note);
      } else {
        setEditingNote(null);
      }
      setNoteModalOpen(true);
    },
    [noteForm]
  );

  const closeNoteModal = useCallback(() => {
    setNoteModalOpen(false);
    setEditingNote(null);
    noteForm.resetFields();
  }, [noteForm]);

  // AI Chat
  const [chatMessages, setChatMessages] = useState([]);

  // Chat sessions
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Forms
  const [sourceForm] = Form.useForm();
  const [chatForm] = Form.useForm();
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
  useEffect(() => {
    fetchNotebook();
    fetchChatSessions();

    registerNoteCreator((content) => {
      openNoteModal({ content, title: "Ghi chú từ AI Context" });
    });

    return () => {
      unregisterNoteCreator();
    };
  }, [id, openNoteModal]);

  useEffect(() => {
    if (editingNote) {
      noteForm.setFieldsValue(editingNote);
    } else {
      noteForm.resetFields();
    }
  }, [editingNote, noteForm]);

  useEffect(() => {
    setNotebookId(id);
    if (notebook) {
      setNotebookSources(notebook.sources);
    }
  }, [id, notebook, setNotebookId, setNotebookSources]);

  useEffect(() => {
    setOpenNoteModal(() => openNoteModal);
    setFetchNotebook(() => fetchNotebook);
  }, [setOpenNoteModal, setFetchNotebook, openNoteModal, fetchNotebook]);

  const handleSourceSubmit = async (values) => {
    try {
      const token = localStorage.getItem("token");
      let response;
      let method = "POST";
      let url = `/api/notebooks/${id}/sources`;

      if (editingSource) {
        method = "PUT";
        url = `/api/notebooks/${id}/sources/${editingSource.id}`;
      }

      if (sourceType === "file" && fileList.length > 0) {
        // Upload file
        const formData = new FormData();
        formData.append("file", fileList[0].originFileObj);
        formData.append("title", values.title);
        formData.append("type", values.type || "document");

        response = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      } else if (sourceType === "url") {
        // Add from URL
        response = await fetch(url, {
          method,
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
        response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        });
      }

      if (response.ok) {
        message.success(
          `Nguồn đã được ${editingSource ? "cập nhật" : "thêm"} thành công`
        );
        fetchNotebook();
        setSourceModalOpen(false);
        setEditSourceModalOpen(false);
        sourceForm.resetFields();
        setFileList([]);
        setSourceType("text");
      } else {
        message.error(`Không thể ${editingSource ? "cập nhật" : "thêm"} nguồn`);
      }
    } catch (error) {
      message.error("Lỗi kết nối");
    }
  };

  const handleNoteSubmit = async (values) => {
    const token = localStorage.getItem("token");
    const method = editingNote && editingNote.id ? "PUT" : "POST";
    const url =
      editingNote && editingNote.id
        ? `/api/notebooks/${id}/notes/${editingNote.id}`
        : `/api/notebooks/${id}/notes`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success(
          `Ghi chú đã được ${
            editingNote && editingNote.id ? "cập nhật" : "tạo"
          } thành công`
        );
        fetchNotebook();
        closeNoteModal();
      } else {
        message.error("Không thể lưu ghi chú");
      }
    } catch (error) {
      message.error("Lỗi kết nối");
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
      } else {
        console.error("Không thể tải chat sessions");
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
      } else {
        message.error("Không thể tải lịch sử chat");
      }
    } catch (error) {
      message.error("Lỗi kết nối");
    }
  };

  const startNewChatSession = () => {
    setCurrentSessionId(null);
    setChatMessages([]);
  };

  const handleDeleteConfirm = () => {
    if (sessionToDelete) {
      deleteChatSession(sessionToDelete);
      setDeleteModalOpen(false);
      setSessionToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSessionToDelete(null);
  };

  const handleDeleteNote = async (noteId) => {
    modal.confirm({
      title: "Xác nhận xóa ghi chú",
      content: "Bạn có chắc chắn muốn xóa ghi chú này không?",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`/api/notebooks/${id}/notes/${noteId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            message.success("Đã xóa ghi chú thành công");
            fetchNotebook();
          } else {
            const errorData = await response.json();
            message.error(
              "Không thể xóa ghi chú: " + (errorData.error || "Unknown error")
            );
          }
        } catch (error) {
          message.error("Lỗi khi xóa ghi chú");
        }
      },
    });
  };

  const handleDeleteSource = async (sourceId) => {
    modal.confirm({
      title: "Xác nhận xóa nguồn tài liệu",
      content: "Bạn có chắc chắn muốn xóa nguồn tài liệu này không?",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `/api/notebooks/${id}/sources/${sourceId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            message.success("Đã xóa nguồn tài liệu thành công");
            fetchNotebook();
          } else {
            const errorData = await response.json();
            message.error(
              "Không thể xóa nguồn tài liệu: " +
                (errorData.error || "Unknown error")
            );
          }
        } catch (error) {
          message.error("Lỗi khi xóa nguồn tài liệu");
        }
      },
    });
  };

  const deleteChatSession = async (sessionId) => {
    try {
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

      if (response.ok) {
        message.success("Đã xóa phiên chat");
        if (currentSessionId === sessionId) {
          startNewChatSession();
        }
        fetchChatSessions();
      } else {
        const errorData = await response.json();
        message.error(
          "Không thể xóa phiên chat: " + (errorData.error || "Unknown error")
        );
      }
    } catch (error) {
      message.error("Lỗi khi xóa phiên chat");
    }
  };

  const handleRenameSession = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/notebooks/${id}/chat-sessions/${sessionToRename.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title: values.title }),
        }
      );

      if (response.ok) {
        message.success("Đã đổi tên phiên chat");
        fetchChatSessions();
        setRenameSessionModalOpen(false);
        setSessionToRename(null);
      } else {
        const errorData = await response.json();
        message.error(
          "Không thể đổi tên phiên chat: " +
            (errorData.error || "Unknown error")
        );
      }
    } catch (error) {
      message.error("Lỗi khi đổi tên phiên chat");
    }
  };

  const openEditSourceModal = (source) => {
    setEditingSource(source);
    setSourceType(source.url ? "url" : source.fileName ? "file" : "text");
    sourceForm.setFieldsValue(source);
    setEditSourceModalOpen(true);
  };

  const closeEditSourceModal = () => {
    setEditSourceModalOpen(false);
    setEditingSource(null);
    setSourceType("text");
    sourceForm.resetFields();
    setFileList([]);
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
      case "guide":
        return <BookOutlined />;
      case "timeline":
        return <UnorderedListOutlined />;
      case "faq":
        return <QuestionCircleOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notebook.sources.map((source) => (
                <Card
                  key={source.id}
                  hoverable
                  actions={[
                    <Tooltip title="Chỉnh sửa">
                      <EditOutlined
                        key="edit"
                        onClick={() => openEditSourceModal(source)}
                      />
                    </Tooltip>,
                    <Tooltip title="Xóa">
                      <DeleteOutlined
                        key="delete"
                        danger
                        onClick={() => handleDeleteSource(source.id)}
                      />
                    </Tooltip>,
                  ]}
                >
                  <Card.Meta
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
                </Card>
              ))}
            </div>
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
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openNoteModal(null)}
              >
                Ghi chú mới
              </Button>
            </Space>
          </div>

          {notebook.notes?.length === 0 ? (
            <Empty description="Chưa có ghi chú nào" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notebook.notes.map((note) => (
                <Card
                  key={note.id}
                  hoverable
                  actions={[
                    <Tooltip title="Xem chi tiết">
                      <EyeOutlined
                        key="view"
                        onClick={() => navigate(`/notebooks/${id}/notes/${note.id}`)}
                      />
                    </Tooltip>,
                    <Tooltip title="Chỉnh sửa">
                      <EditOutlined
                        key="edit"
                        onClick={() => openNoteModal(note)}
                      />
                    </Tooltip>,
                    <Tooltip title="Xóa">
                      <DeleteOutlined
                        key="delete"
                        danger
                        onClick={() => handleDeleteNote(note.id)}
                      />
                    </Tooltip>,
                  ]}
                >
                  <Card.Meta
                    avatar={<Avatar icon={getNoteTypeIcon(note.type)} />}
                    title={note.title}
                    description={
                      <div className="prose line-clamp-3">{note.content}</div>
                    }
                  />
                </Card>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "chat",
      label: "Chat với AI",
      children: (
        <div className="flex gap-4 h-[600px]">
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
                    <Tooltip title="Đổi tên phiên chat">
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        className="ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSessionToRename(session);
                          setRenameSessionModalOpen(true);
                        }}
                      />
                    </Tooltip>
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
            <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4  overflow-y-auto">
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
                      <div className="flex items-start gap-2 max-w-[80%]">
                        {msg.role === "assistant" && (
                          <Avatar
                            icon={<RobotOutlined />}
                            size="small"
                            className="mt-1"
                          />
                        )}
                        <div
                          className={`px-4 py-2 rounded-lg relative group ${
                            msg.role === "user"
                              ? "bg-blue-500 text-white"
                              : "bg-white border shadow-sm"
                          }`}
                        >
                          <div className="whitespace-pre-wrap">
                            {msg.content}
                          </div>
                          {msg.role === "assistant" && (
                            <Button
                              icon={<PlusOutlined />}
                              size="small"
                              type="text"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => addSnippet(msg.content)}
                            />
                          )}
                        </div>
                        {msg.role === "user" && (
                          <Avatar
                            icon={<MessageOutlined />}
                            size="small"
                            className="mt-1"
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
                    <Button type="primary" icon={<SendOutlined />}>
                      Gửi
                    </Button>
                  }
                  disabled={!notebook.sources?.length}
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

        <Form form={sourceForm} layout="vertical" onFinish={handleSourceSubmit}>
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

      {/* Edit Source Modal */}
      <Modal
        title="Chỉnh sửa nguồn tài liệu"
        open={editSourceModalOpen}
        onCancel={closeEditSourceModal}
        footer={null}
        width={600}
      >
        <div className="mb-4">
          <Radio.Group
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
            className="w-full"
            disabled={editingSource?.fileName}
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

        <Form form={sourceForm} layout="vertical" onFinish={handleSourceSubmit}>
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
              <Button onClick={closeEditSourceModal}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                disabled={sourceType === "file" && fileList.length === 0}
              >
                Lưu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Note Modal */}
      <Modal
        title={editingNote && editingNote.id ? "Sửa ghi chú" : "Thêm ghi chú"}
        open={noteModalOpen}
        onCancel={closeNoteModal}
        footer={null}
        width={800}
      >
        <Form
          form={noteForm}
          layout="vertical"
          onFinish={handleNoteSubmit}
          initialValues={{ content: "", type: "text" }}
        >
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
              <Select.Option value="guide">Hướng dẫn</Select.Option>
              <Select.Option value="timeline">Dòng thời gian</Select.Option>
              <Select.Option value="faq">Câu hỏi thường gặp</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
            getValueFromEvent={(e) => e}
          >
            <RichTextEditor
              value={editingNote?.content || ""}
              onChange={(content) => noteForm.setFieldsValue({ content })}
            />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={closeNoteModal}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingNote && editingNote.id ? "Lưu" : "Thêm"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Chat Session Modal */}
      <Modal
        title="Xóa phiên chat"
        open={deleteModalOpen}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Xóa"
        cancelText="Hủy"
        okType="danger"
      >
        <p>Bạn có chắc muốn xóa phiên chat này?</p>
      </Modal>

      {/* Rename Chat Session Modal */}
      <Modal
        title="Đổi tên phiên chat"
        open={renameSessionModalOpen}
        onCancel={() => setRenameSessionModalOpen(false)}
        footer={null}
      >
        <Form
          form={chatForm}
          layout="vertical"
          onFinish={handleRenameSession}
          initialValues={{ title: sessionToRename?.title }}
        >
          <Form.Item
            name="title"
            label="Tên mới"
            rules={[{ required: true, message: "Vui lòng nhập tên mới" }]}
          >
            <Input placeholder="Tên phiên chat mới..." />
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setRenameSessionModalOpen(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Lưu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
