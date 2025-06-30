import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, message, Typography, Space, Divider } from "antd";
import {
  UserOutlined,
  LockOutlined,
  BookOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await fetch("/api/register", {
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
        message.success("Đăng ký thành công! Vui lòng đăng nhập.");
        navigate("/login");
      } else {
        message.error(data.error || "Đăng ký thất bại");
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
            Ứng dụng ghi chú thông minh với AI - Nơi ý tưởng của bạn trở nên
            sống động
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
            "TakeNoteLM đã thay đổi cách tôi làm việc với tài liệu. AI thông
            minh giúp tôi hiểu sâu hơn về nội dung và tạo ra những insight tuyệt
            vời."
          </Text>
          <div className="mt-3">
            <Text className="text-white font-medium">
              - Người dùng hài lòng
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
                Tạo tài khoản
              </Title>
              <Text type="secondary" className="text-base">
                Khởi đầu hành trình ghi chú thông minh với AI
              </Text>
            </div>

            <Form
              name="register"
              onFinish={onFinish}
              scrollToFirstError
              size="large"
              layout="vertical"
            >
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[
                  { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                  { min: 3, message: "Tên đăng nhập phải có ít nhất 3 ký tự!" },
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
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu!" },
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                ]}
                hasFeedback
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Nhập mật khẩu..."
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="confirm"
                label="Xác nhận mật khẩu"
                dependencies={["password"]}
                hasFeedback
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Hai mật khẩu không khớp!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Xác nhận mật khẩu..."
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item className="mb-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 border-none hover:from-blue-600 hover:to-purple-700 font-medium text-base"
                  loading={loading}
                >
                  Tạo tài khoản
                </Button>
              </Form.Item>

              <Divider className="my-6">
                <Text type="secondary">hoặc</Text>
              </Divider>

              <div className="text-center">
                <Text type="secondary">
                  Đã có tài khoản?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Đăng nhập ngay
                  </Link>
                </Text>
              </div>
            </Form>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <Text type="secondary" className="text-sm">
              Bằng việc đăng ký, bạn đồng ý với{" "}
              <a href="#" className="text-blue-600 hover:text-blue-700">
                Điều khoản dịch vụ
              </a>{" "}
              và{" "}
              <a href="#" className="text-blue-600 hover:text-blue-700">
                Chính sách bảo mật
              </a>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
