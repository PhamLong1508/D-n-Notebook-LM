import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Form, Input, Select, Button, message } from 'antd';

const { Option } = Select;

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const usersRes = await axios.get('/api/admin/users', config);
      setUsers(usersRes.data);

      const statsRes = await axios.get('/api/admin/statistics', config);
      setStatistics(statsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalVisible(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.delete(`/api/admin/users/${userId}`, config);
      message.success('Xóa người dùng thành công');
      fetchData();
    } catch (err) {
      message.error(err.response?.data?.error || 'Không thể xóa người dùng');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      if (editingUser) {
        // Update user
        await axios.put(`/api/admin/users/${editingUser.id}`, values, config);
        message.success('Cập nhật người dùng thành công');
      } else {
        // Add user
        await axios.post('/api/admin/users', values, config);
        message.success('Thêm người dùng thành công');
      }
      setIsModalVisible(false);
      fetchData();
    } catch (err) {
      message.error(err.response?.data?.error || 'Thao tác thất bại');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="text-red-500">Lỗi: {error}</div>;

  return (
    <div className="admin-dashboard p-4">
      <h2 className="text-xl font-bold mb-4">Thống kê</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-100 p-4 rounded shadow">
          <h3 className="font-semibold">Tổng số người dùng</h3>
          <p className="text-2xl">{statistics.totalUsers}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded shadow">
          <h3 className="font-semibold">Tổng số sổ ghi chép</h3>
          <p className="text-2xl">{statistics.totalNotebooks}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded shadow">
          <h3 className="font-semibold">Tổng số ghi chú</h3>
          <p className="text-2xl">{statistics.totalNotes}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded shadow">
          <h3 className="font-semibold">Tổng số nguồn</h3>
          <p className="text-2xl">{statistics.totalSources}</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Quản lý người dùng</h2>
      <Button type="primary" onClick={handleAddUser} className="mb-4">
        Thêm người dùng mới
      </Button>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Tên người dùng</th>
              <th className="py-2 px-4 border-b">Vai trò</th>
              <th className="py-2 px-4 border-b">Ngày tạo</th>
              <th className="py-2 px-4 border-b">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{user.id}</td>
                <td className="py-2 px-4 border-b">{user.username}</td>
                <td className="py-2 px-4 border-b">
                  {user.role}
                </td>
                <td className="py-2 px-4 border-b">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="py-2 px-4 border-b space-x-2">
                  <Button size="small" onClick={() => handleEditUser(user)}>
                    Sửa
                  </Button>
                  <Button
                    size="small"
                    danger
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        title={editingUser ? 'Sửa người dùng' : 'Thêm người dùng mới'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingUser ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="Tên người dùng"
            rules={[{ required: true, message: 'Vui lòng nhập tên người dùng!' }]}
          >
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select>
              <Option value="user">Người dùng</Option>
              <Option value="admin">Quản trị viên</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminDashboard;