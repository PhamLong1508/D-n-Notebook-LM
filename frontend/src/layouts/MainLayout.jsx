import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  UserIcon,
  BookOpenIcon,
  HomeIcon,
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
  PowerIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { useContextMenu } from "../contexts/ContextPanelContext";
import { Button, Empty, Space, message, Dropdown } from "antd";
import {
  CloseOutlined,
  EditOutlined,
  RobotOutlined,
  BulbOutlined,
  UnorderedListOutlined,
  QuestionCircleOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useNotebook } from "../contexts/NotebookContext";

const menuItems = [
  { key: "/", icon: <HomeIcon className="w-6 h-6" />, label: "Trang chủ" },
  {
    key: "/notebooks",
    icon: <BookOpenIcon className="w-6 h-6" />,
    label: "Notebooks",
  },
  { key: "/profile", icon: <UserIcon className="w-6 h-6" />, label: "Hồ sơ" },
];

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { snippets, removeSnippet, clearContext, noteCreator } =
    useContextMenu();
  const {
    notebookId,
    notebookSources,
    chatLoading,
    setChatLoading,
    openNoteModal,
    fetchNotebook,
  } = useNotebook();

  const menu =
    user?.role === "admin"
      ? [
          ...menuItems,
          {
            key: "/admin",
            icon: <Cog6ToothIcon className="w-6 h-6" />,
            label: "Admin",
          },
        ]
      : menuItems;

  const handleGenerateNote = async (values) => {
    if (!notebookId || !notebookSources.length) {
      message.warning(
        "Vui lòng chọn một notebook và thêm nguồn tài liệu để sử dụng AI Tools."
      );
      return;
    }

    try {
      setChatLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/notebooks/${notebookId}/generate`, {
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
        if (openNoteModal) {
          openNoteModal({
            content: newNote.content,
            title: newNote.title,
            type: newNote.type,
          });
        }
        if (fetchNotebook) {
          fetchNotebook();
        }
      } else {
        message.error("Không thể tạo ghi chú AI");
      }
    } catch (error) {
      message.error("Lỗi kết nối");
    } finally {
      setChatLoading(false);
    }
  };

  const handleCreateNote = () => {
    if (noteCreator) {
      const combinedContent = snippets
        .map((s) => s.content)
        .join("\n\n---\n\n");
      noteCreator(combinedContent);
      clearContext();
    }
  };

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
    // message.success("Đăng xuất thành công");
    navigate("/login");
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpenIcon className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* User info & Logout */}
        <div className="p-4 border-t border-gray-200">
          {user && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {user.username}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {user.role}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              >
                <PowerIcon className="w-6 h-6 text-red-500" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content & Right Panel */}
      <div className="flex flex-1 min-w-0">
        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>

        {/* Right Panel (Context) */}
        <aside
          className={`w-96 bg-white border-l border-gray-200 p-6 flex flex-col transition-all duration-300 ${
            snippets.length > 0 ? "block" : "hidden lg:block"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Context</h2>
            {snippets.length > 0 && (
              <Button type="link" danger onClick={clearContext}>
                Xóa tất cả
              </Button>
            )}
          </div>

          {snippets.length === 0 ? (
            <div className="bg-gray-50 rounded-lg h-[60%] flex items-center justify-center">
              <p className="text-gray-500 text-center px-4">
                Thêm các đoạn trích từ cuộc trò chuyện AI để tạo ghi chú mới.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {snippets.map((snippet) => (
                <div
                  key={snippet.id}
                  className="bg-gray-100 p-3 rounded-md relative group"
                >
                  <p className="text-gray-800">{snippet.content}</p>
                  <Button
                    icon={<CloseOutlined />}
                    size="small"
                    type="text"
                    danger
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeSnippet(snippet.id)}
                  />
                </div>
              ))}
            </div>
          )}

          {snippets.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Button
                type="primary"
                block
                icon={<EditOutlined />}
                onClick={handleCreateNote}
              >
                Tạo ghi chú mới
              </Button>
            </div>
          )}

          <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-2">
            {chatLoading && (
              <div className="col-span-2 text-center">Đang tạo ghi chú...</div>
            )}
            <Button
              icon={<BulbOutlined />}
              disabled={!notebookId || !notebookSources.length || chatLoading}
              block
              onClick={() =>
                handleGenerateNote({
                  type: "summary",
                  prompt: "Tạo tóm tắt từ các nguồn tài liệu",
                })
              }
            >
              Tạo tóm tắt
            </Button>
            <Button
              icon={<UnorderedListOutlined />}
              disabled={!notebookId || !notebookSources.length || chatLoading}
              block
              onClick={() =>
                handleGenerateNote({
                  type: "outline",
                  prompt: "Tạo outline có cấu trúc từ các nguồn tài liệu",
                })
              }
            >
              Tạo outline
            </Button>
            <Button
              icon={<QuestionCircleOutlined />}
              disabled={!notebookId || !notebookSources.length || chatLoading}
              block
              onClick={() =>
                handleGenerateNote({
                  type: "qa",
                  prompt:
                    "Tạo các câu hỏi và câu trả lời từ các nguồn tài liệu",
                })
              }
            >
              Tạo Q&A
            </Button>
            <Button
              icon={<BookOutlined />}
              disabled={!notebookId || !notebookSources.length || chatLoading}
              block
              onClick={() =>
                handleGenerateNote({
                  type: "guide",
                  prompt:
                    "Tạo một hướng dẫn chi tiết dựa trên các nguồn tài liệu",
                })
              }
            >
              Tạo hướng dẫn
            </Button>
            <Button
              icon={<UnorderedListOutlined />}
              disabled={!notebookId || !notebookSources.length || chatLoading}
              block
              onClick={() =>
                handleGenerateNote({
                  type: "timeline",
                  prompt:
                    "Tạo một dòng thời gian các sự kiện quan trọng từ các nguồn tài liệu",
                })
              }
            >
              Tạo dòng thời gian
            </Button>
            <Button
              icon={<QuestionCircleOutlined />}
              disabled={!notebookId || !notebookSources.length || chatLoading}
              block
              onClick={() =>
                handleGenerateNote({
                  type: "faq",
                  prompt:
                    "Tạo một danh sách các câu hỏi thường gặp và câu trả lời từ các nguồn tài liệu",
                })
              }
            >
              Tạo FAQ
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
