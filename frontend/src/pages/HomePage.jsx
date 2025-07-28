import { useState, useEffect } from "react";
import {
  PlusIcon,
  BookOpenIcon,
  DocumentTextIcon,
  CpuChipIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

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
      icon: <BookOpenIcon className="w-8 h-8 text-blue-500" />,
      title: "Tổ chức thông tin",
      description:
        "Tạo và quản lý notebooks để tổ chức tài liệu một cách có hệ thống",
    },
    {
      icon: <CpuChipIcon className="w-8 h-8 text-green-500" />,
      title: "AI thông minh",
      description:
        "Chat với AI về nội dung tài liệu, tạo tóm tắt và outline tự động",
    },
    {
      icon: <DocumentTextIcon className="w-8 h-8 text-purple-500" />,
      title: "Ghi chú đa dạng",
      description: "Tạo nhiều loại ghi chú khác nhau: tóm tắt, outline, Q&A",
    },
    {
      icon: <LightBulbIcon className="w-8 h-8 text-orange-500" />,
      title: "Phân tích sâu",
      description:
        "AI giúp phân tích và trích xuất thông tin quan trọng từ tài liệu",
    },
  ];

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          TakeNoteLM
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Ứng dụng ghi chú thông minh với AI - Tổ chức, phân tích và tương tác
          với tài liệu của bạn một cách hiệu quả
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center mb-12">
        <button
          onClick={() => navigate("/notebooks")}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Bắt đầu ngay
        </button>
        <button
          onClick={() => navigate("/notebooks")}
          className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Xem Notebooks
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-2">
            <BookOpenIcon className="w-8 h-8 text-blue-500" />
            <span className="text-4xl font-bold text-blue-500">{stats.notebooks}</span>
          </div>
          <p className="text-gray-600 mt-2">Notebooks</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-2">
                <DocumentTextIcon className="w-8 h-8 text-green-500" />
                <span className="text-4xl font-bold text-green-500">{stats.notes}</span>
            </div>
          <p className="text-gray-600 mt-2">Ghi chú</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-2">
                <BookOpenIcon className="w-8 h-8 text-purple-500" />
                <span className="text-4xl font-bold text-purple-500">{stats.sources}</span>
            </div>
          <p className="text-gray-600 mt-2">Nguồn tài liệu</p>
        </div>
      </div>

      {/* Features Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Tính năng nổi bật</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 text-center hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Notebooks */}
      {recentNotebooks.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Notebooks gần đây</h2>
            <button onClick={() => navigate("/notebooks")} className="text-blue-600 font-semibold hover:underline">
              Xem tất cả
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentNotebooks.map((notebook) => (
              <div
                key={notebook.id}
                onClick={() => navigate(`/notebooks/${notebook.id}`)}
                className="bg-white p-6 rounded-lg border border-gray-200 cursor-pointer hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <BookOpenIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-lg font-semibold truncate">{notebook.title}</h3>
                        {notebook.description && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                            {notebook.description}
                        </p>
                        )}
                        <div className="text-sm text-gray-500 flex gap-4">
                            <span>{notebook._count?.notes || 0} ghi chú</span>
                            <span>{notebook._count?.sources || 0} nguồn</span>
                        </div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
