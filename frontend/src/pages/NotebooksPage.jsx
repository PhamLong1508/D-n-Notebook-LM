import { useState, useEffect } from "react";
import {
  Button,
  Card,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Typography,
  Space,
  Avatar,
  Dropdown,
  message,
  Empty,
  Spin,
} from "antd";
import {
  PlusOutlined,
  BookOutlined,
  FileTextOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function NotebooksPage() {
  const [notebooks, setNotebooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNotebook, setEditingNotebook] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotebooks();
  }, []);

  const fetchNotebooks = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/notebooks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotebooks(data);
      } else {
        message.error("Không thể tải danh sách notebook");
      }
    } catch (error) {
      message.error("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotebook = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/notebooks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success("Tạo notebook thành công");
        fetchNotebooks();
        setModalOpen(false);
        form.resetFields();
      } else {
        message.error("Không thể tạo notebook");
      }
    } catch (error) {
      message.error("Lỗi kết nối");
    }
  };

  const handleEditNotebook = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/notebooks/${editingNotebook.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success("Cập nhật notebook thành công");
        fetchNotebooks();
        setModalOpen(false);
        setEditingNotebook(null);
        form.resetFields();
      } else {
        message.error("Không thể cập nhật notebook");
      }
    } catch (error) {
      message.error("Lỗi kết nối");
    }
  };

  const handleDeleteNotebook = async (notebookId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/notebooks/${notebookId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        message.success("Xóa notebook thành công");
        fetchNotebooks();
      } else {
        message.error("Không thể xóa notebook");
      }
    } catch (error) {
      message.error("Lỗi kết nối");
    }
  };

  const openCreateModal = () => {
    setEditingNotebook(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (notebook) => {
    setEditingNotebook(notebook);
    form.setFieldsValue({
      title: notebook.title,
      description: notebook.description,
    });
    setModalOpen(true);
  };

  const getDropdownItems = (notebook) => [
    {
      key: "view",
      icon: <EyeOutlined />,
      label: "Xem chi tiết",
      onClick: () => navigate(`/notebooks/${notebook.id}`),
    },
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Chỉnh sửa",
      onClick: () => openEditModal(notebook),
    },
    {
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Xóa",
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: "Xác nhận xóa",
          content: `Bạn có chắc muốn xóa notebook "${notebook.title}"?`,
          onOk: () => handleDeleteNotebook(notebook.id),
        });
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Title level={2} className="mb-2">
            Notebooks của bạn
          </Title>
          <Text type="secondary">Quản lý và tổ chức tài liệu với AI</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={openCreateModal}
        >
          Notebook mới
        </Button>
      </div>

      {notebooks.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              Chưa có notebook nào.
              <br />
              Tạo notebook đầu tiên để bắt đầu!
            </span>
          }
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Tạo notebook đầu tiên
          </Button>
        </Empty>
      ) : (
        <Row gutter={[24, 24]}>
          {notebooks.map((notebook) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={notebook.id}>
              <Card
                hoverable
                className="h-full transition-all duration-200 hover:shadow-lg"
                cover={
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 text-center">
                    <Avatar
                      size={64}
                      icon={<BookOutlined />}
                      className="bg-blue-500"
                    />
                  </div>
                }
                actions={[
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/notebooks/${notebook.id}`)}
                  >
                    Mở
                  </Button>,
                  <Dropdown
                    menu={{ items: getDropdownItems(notebook) }}
                    trigger={["click"]}
                  >
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>,
                ]}
              >
                <Card.Meta
                  title={
                    <div className="truncate" title={notebook.title}>
                      {notebook.title}
                    </div>
                  }
                  description={
                    <div>
                      {notebook.description && (
                        <Text
                          type="secondary"
                          className="block mb-2 line-clamp-2"
                        >
                          {notebook.description}
                        </Text>
                      )}
                      <Space className="text-xs text-gray-500">
                        <span>
                          <FileTextOutlined /> {notebook._count?.notes || 0} ghi
                          chú
                        </span>
                        <span>📁 {notebook._count?.sources || 0} nguồn</span>
                      </Space>
                      <div className="mt-2 text-xs text-gray-400">
                        {new Date(notebook.updatedAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={editingNotebook ? "Chỉnh sửa Notebook" : "Tạo Notebook mới"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingNotebook(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingNotebook ? handleEditNotebook : handleCreateNotebook}
        >
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input placeholder="Nhập tiêu đề notebook..." />
          </Form.Item>

          <Form.Item name="description" label="Mô tả (tùy chọn)">
            <TextArea
              rows={3}
              placeholder="Mô tả ngắn về nội dung notebook..."
            />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingNotebook ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
