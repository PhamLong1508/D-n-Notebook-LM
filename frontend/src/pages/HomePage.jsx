import { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Card,
  Row,
  Col,
  Space,
  Avatar,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  BookOutlined,
  FileTextOutlined,
  RobotOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

export default function HomePage() {
  const [stats, setStats] = useState({ notebooks: 0, notes: 0, sources: 0 });
  const [recentNotebooks, setRecentNotebooks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchStats();
      fetchRecentNotebooks();
    }
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/notebooks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const notebooks = await response.json();
        const totalNotes = notebooks.reduce(
          (sum, nb) => sum + (nb._count?.notes || 0),
          0
        );
        const totalSources = notebooks.reduce(
          (sum, nb) => sum + (nb._count?.sources || 0),
          0
        );

        setStats({
          notebooks: notebooks.length,
          notes: totalNotes,
          sources: totalSources,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchRecentNotebooks = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/notebooks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const notebooks = await response.json();
        setRecentNotebooks(notebooks.slice(0, 3));
      }
    } catch (error) {
      console.error("Error fetching recent notebooks:", error);
    }
  };

  const features = [
    {
      icon: <BookOutlined className="text-2xl text-blue-500" />,
      title: "Tổ chức thông tin",
      description:
        "Tạo và quản lý notebooks để tổ chức tài liệu một cách có hệ thống",
    },
    {
      icon: <RobotOutlined className="text-2xl text-green-500" />,
      title: "AI thông minh",
      description:
        "Chat với AI về nội dung tài liệu, tạo tóm tắt và outline tự động",
    },
    {
      icon: <FileTextOutlined className="text-2xl text-purple-500" />,
      title: "Ghi chú đa dạng",
      description: "Tạo nhiều loại ghi chú khác nhau: tóm tắt, outline, Q&A",
    },
    {
      icon: <BulbOutlined className="text-2xl text-orange-500" />,
      title: "Phân tích sâu",
      description:
        "AI giúp phân tích và trích xuất thông tin quan trọng từ tài liệu",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-full">
      {/* Hero Section */}
      <div className="text-center py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Title
            level={1}
            className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 md:mb-6"
          >
            TakeNoteLM
          </Title>
          <Paragraph className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 md:mb-8 max-w-4xl mx-auto">
            Ứng dụng ghi chú thông minh với AI - Tổ chức, phân tích và tương tác
            với tài liệu của bạn một cách hiệu quả
          </Paragraph>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 md:mb-12">
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate("/notebooks")}
              className="h-12 px-8 text-base md:text-lg w-full sm:w-auto"
            >
              Bắt đầu ngay
            </Button>
            <Button
              size="large"
              onClick={() => navigate("/notebooks")}
              className="h-12 px-8 text-base md:text-lg w-full sm:w-auto"
            >
              Xem Notebooks
            </Button>
          </div>

          {/* Stats */}
          <Row gutter={[16, 16]} className="max-w-2xl mx-auto">
            <Col xs={8} sm={8} md={8}>
              <Statistic
                title="Notebooks"
                value={stats.notebooks}
                prefix={<BookOutlined />}
                valueStyle={{
                  color: "#1890ff",
                  fontSize: "clamp(1.2rem, 4vw, 2rem)",
                }}
                className="text-center"
              />
            </Col>
            <Col xs={8} sm={8} md={8}>
              <Statistic
                title="Ghi chú"
                value={stats.notes}
                prefix={<FileTextOutlined />}
                valueStyle={{
                  color: "#52c41a",
                  fontSize: "clamp(1.2rem, 4vw, 2rem)",
                }}
                className="text-center"
              />
            </Col>
            <Col xs={8} sm={8} md={8}>
              <Statistic
                title="Nguồn tài liệu"
                value={stats.sources}
                prefix={<BookOutlined />}
                valueStyle={{
                  color: "#faad14",
                  fontSize: "clamp(1.2rem, 4vw, 2rem)",
                }}
                className="text-center"
              />
            </Col>
          </Row>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 md:py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <Title
            level={2}
            className="text-center mb-8 md:mb-12 text-2xl md:text-3xl"
          >
            Tính năng nổi bật
          </Title>

          <Row gutter={[24, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card
                  className="h-full text-center hover:shadow-lg transition-shadow duration-300 border-0 shadow-md"
                  bodyStyle={{ padding: "2rem 1.5rem" }}
                >
                  <div className="mb-4">{feature.icon}</div>
                  <Title level={4} className="mb-3 text-lg">
                    {feature.title}
                  </Title>
                  <Text type="secondary" className="text-sm md:text-base">
                    {feature.description}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Recent Notebooks */}
      {recentNotebooks.length > 0 && (
        <div className="py-12 md:py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <Title level={2} className="mb-0 text-2xl md:text-3xl">
                Notebooks gần đây
              </Title>
              <Button onClick={() => navigate("/notebooks")} size="large">
                Xem tất cả
              </Button>
            </div>

            <Row gutter={[24, 24]}>
              {recentNotebooks.map((notebook) => (
                <Col xs={24} sm={12} lg={8} key={notebook.id}>
                  <Card
                    hoverable
                    onClick={() => navigate(`/notebooks/${notebook.id}`)}
                    className="h-full shadow-md border-0"
                    bodyStyle={{ padding: "1.5rem" }}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar
                        size={48}
                        icon={<BookOutlined />}
                        className="bg-blue-500 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <Title level={5} className="mb-1 truncate text-base">
                          {notebook.title}
                        </Title>
                        {notebook.description && (
                          <Text
                            type="secondary"
                            className="block mb-2 text-sm line-clamp-2"
                          >
                            {notebook.description}
                          </Text>
                        )}
                        <Space className="text-xs text-gray-500" size="middle">
                          <span>{notebook._count?.notes || 0} ghi chú</span>
                          <span>{notebook._count?.sources || 0} nguồn</span>
                        </Space>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="py-12 md:py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <Title level={2} className="text-white mb-4 text-2xl md:text-3xl">
            Sẵn sàng bắt đầu?
          </Title>
          <Paragraph className="text-base md:text-lg text-blue-100 mb-6 md:mb-8 max-w-2xl mx-auto">
            Tạo notebook đầu tiên và khám phá sức mạnh của AI trong việc quản lý
            thông tin
          </Paragraph>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate("/notebooks")}
            className="h-12 px-8 text-base md:text-lg bg-white text-blue-600 border-none hover:bg-blue-50 w-full sm:w-auto"
          >
            Tạo Notebook đầu tiên
          </Button>
        </div>
      </div>
    </div>
  );
}
