import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  UserOutlined,
  BookOutlined,
  HomeOutlined,
  LogoutOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Avatar, message } from "antd";
import { useState, useEffect } from "react";

const menu = [
  { key: "/", icon: <HomeOutlined />, label: "Trang chủ" },
  { key: "/notebooks", icon: <BookOutlined />, label: "Notebooks" },
];

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    message.success("Đăng xuất thành công");
    navigate("/login");
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin tài khoản",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  return (
    <div className="flex min-h-screen w-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOutlined className="text-white text-lg" />
            </div>
            <span className="hidden md:block font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TakeNoteLM
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menu.map((item) => (
              <Link
                key={item.key}
                to={item.key}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  location.pathname === item.key
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="hidden md:block">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-gray-200">
          {user && (
            <div className="flex items-center gap-3">
              <Avatar
                size={40}
                icon={<UserOutlined />}
                className="bg-blue-500 flex-shrink-0"
              />
              <div className="hidden md:block flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {user.username}
                </div>
                <div className="text-sm text-gray-500 capitalize">
                  {user.role}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white flex items-center justify-between px-6 border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-semibold text-gray-900">
              {menu.find((item) => item.key === location.pathname)?.label ||
                "TakeNoteLM"}
            </h1>

            {/* Top Menu Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {menu.map((item) => (
                <Link
                  key={item.key}
                  to={item.key}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                    location.pathname === item.key
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <Dropdown
                menu={{ items: userMenuItems }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  className="flex items-center gap-2 hover:bg-gray-50"
                >
                  <Avatar
                    size={32}
                    icon={<UserOutlined />}
                    className="bg-blue-500"
                  />
                  <span className="hidden sm:block font-medium">
                    {user.username}
                  </span>
                </Button>
              </Dropdown>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto ">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
