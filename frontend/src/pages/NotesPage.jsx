import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export default function NotesPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Ghi chú của bạn</h1>
        <Button type="primary" icon={<PlusOutlined />} size="large">
          Ghi chú mới
        </Button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        <p>Chưa có ghi chú nào.</p>
        <p>Nhấn "Ghi chú mới" để bắt đầu.</p>
      </div>
    </div>
  );
} 