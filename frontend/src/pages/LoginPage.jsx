import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  message,
  Typography,
  Space,
  Divider,
  Checkbox,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  BookOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        message.success("Đăng nhập thành công!");
        navigate("/");
      } else {
        message.error(data.error || "Đăng nhập thất bại");
      }
    } catch (error) {
      message.error("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Tổ chức tài liệu thông minh với AI",
    "Chat với AI về nội dung tài liệu",
    "Tạo tóm tắt và outline tự động",
    "Giao diện hiện đại, dễ sử dụng",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 text-white flex-col justify-center px-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <BookOutlined className="text-2xl" />
            </div>
            <Title level={2} className="text-white mb-0">
              TakeNoteLM
            </Title>
          </div>
          <Text className="text-xl text-blue-100 mb-8 block">
            Chào mừng trở lại! Tiếp tục hành trình khám phá với AI
          </Text>
        </div>

        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <CheckCircleOutlined className="text-green-300 text-lg" />
              <Text className="text-blue-100">{feature}</Text>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-white bg-opacity-10 rounded-xl backdrop-blur">
          <Text className="text-blue-100 italic">
            "Mỗi ngày sử dụng TakeNoteLM, tôi đều khám phá ra điều gì đó mới từ
            tài liệu của mình nhờ sự hỗ trợ của AI."
          </Text>
          <div className="mt-3">
            <Text className="text-white font-medium">
              - Người dùng thường xuyên
            </Text>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOutlined className="text-white text-lg" />
            </div>
            <Title
              level={3}
              className="mb-0 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              TakeNoteLM
            </Title>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <Title level={2} className="mb-2">
                Đăng nhập
              </Title>
              <Text type="secondary" className="text-base">
                Tiếp tục khám phá sức mạnh của AI trong ghi chú
              </Text>
            </div>

            <Form
              name="login"
              onFinish={onFinish}
              size="large"
              layout="vertical"
            >
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[
                  { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Nhập tên đăng nhập..."
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Nhập mật khẩu..."
                  className="rounded-lg"
                />
              </Form.Item>

              <div className="flex justify-between items-center mb-6">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                </Form.Item>
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Quên mật khẩu?
                </a>
              </div>

              <Form.Item className="mb-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 border-none hover:from-blue-600 hover:to-purple-700 font-medium text-base"
                  loading={loading}
                >
                  Đăng nhập
                </Button>
              </Form.Item>

              <Divider className="my-6">
                <Text type="secondary">hoặc</Text>
              </Divider>

              <div className="text-center">
                <Text type="secondary">
                  Chưa có tài khoản?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Đăng ký ngay
                  </Link>
                </Text>
              </div>
            </Form>
          </div>

          {/* Quick Access */}
          <div className="mt-8 text-center">
            <Text type="secondary" className="text-sm block mb-2">
              Truy cập nhanh với tài khoản demo:
            </Text>
            <div className="flex gap-2 justify-center">
              <Button
                size="small"
                onClick={() => {
                  // Auto fill demo account
                  document.querySelector(
                    'input[placeholder="Nhập tên đăng nhập..."]'
                  ).value = "demo";
                  document.querySelector(
                    'input[placeholder="Nhập mật khẩu..."]'
                  ).value = "demo123";
                }}
              >
                Demo User
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
