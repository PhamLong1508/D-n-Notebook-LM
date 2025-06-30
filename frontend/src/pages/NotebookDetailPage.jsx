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
} from "antd";
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
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function NotebookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notebook, setNotebook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("sources");

  // Modals
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);

  // AI Chat
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Forms
  const [sourceForm] = Form.useForm();
  const [noteForm] = Form.useForm();
  const [chatForm] = Form.useForm();

  useEffect(() => {
    fetchNotebook();
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
      const response = await fetch(`/api/notebooks/${id}/sources`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success("Thêm nguồn thành công");
        fetchNotebook();
        setSourceModalOpen(false);
        sourceForm.resetFields();
      } else {
        message.error("Không thể thêm nguồn");
      }
    } catch (error) {
      message.error("Lỗi kết nối");
    }
  };

  const handleAddNote = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/notebooks/${id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success("Thêm ghi chú thành công");
        fetchNotebook();
        setNoteModalOpen(false);
        noteForm.resetFields();
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
      const newMessage = { role: "user", content: values.prompt };
      setChatMessages((prev) => [...prev, newMessage]);

      const token = localStorage.getItem("token");
      const response = await fetch(`/api/notebooks/${id}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.result },
        ]);
        chatForm.resetFields();
      } else {
        message.error("Không thể chat với AI");
      }
    } catch (error) {
      message.error("Lỗi kết nối");
    } finally {
      setChatLoading(false);
    }
  };

  const getSourceIcon = (type) => {
    switch (type) {
      case "pdf":
        return <FilePdfOutlined />;
      case "webpage":
        return <GlobalOutlined />;
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
                    avatar={<Avatar icon={getSourceIcon(source.type)} />}
                    title={source.title}
                    description={
                      <div>
                        <Paragraph
                          ellipsis={{ rows: 2, expandable: true }}
                          className="mb-1"
                        >
                          {source.content}
                        </Paragraph>
                        {source.url && (
                          <Text type="secondary">
                            <LinkOutlined /> {source.url}
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
                    <Button type="text" icon={<EditOutlined />} size="small" />,
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      danger
                      size="small"
                    />,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={getNoteTypeIcon(note.type)} />}
                    title={note.title}
                    description={
                      <Paragraph ellipsis={{ rows: 3, expandable: true }}>
                        {note.content}
                      </Paragraph>
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
        <div>
          <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto">
            {chatMessages.length === 0 ? (
              <Empty
                image={
                  <MessageOutlined style={{ fontSize: 48, color: "#ccc" }} />
                }
                description="Bắt đầu cuộc trò chuyện với AI về notebook này"
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
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.role === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-white border"
                      }`}
                    >
                      {msg.content}
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
                enterButton="Gửi"
                loading={chatLoading}
                disabled={!notebook.sources?.length}
                size="large"
              />
            </Form.Item>
            {!notebook.sources?.length && (
              <Text type="secondary" className="text-sm">
                Thêm nguồn tài liệu để có thể chat với AI
              </Text>
            )}
          </Form>
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
        onCancel={() => setSourceModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={sourceForm} layout="vertical" onFinish={handleAddSource}>
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input placeholder="Tiêu đề nguồn tài liệu..." />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại"
            rules={[{ required: true, message: "Vui lòng chọn loại" }]}
          >
            <Select placeholder="Chọn loại nguồn">
              <Select.Option value="text">Văn bản</Select.Option>
              <Select.Option value="document">Tài liệu</Select.Option>
              <Select.Option value="webpage">Trang web</Select.Option>
              <Select.Option value="pdf">PDF</Select.Option>
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

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setSourceModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
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
        onCancel={() => setNoteModalOpen(false)}
        footer={null}
        width={600}
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

          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
          >
            <TextArea rows={8} placeholder="Nội dung ghi chú..." />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setNoteModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Thêm
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
