import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { message } from 'antd';

function UserProfileForm() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        const res = await axios.get('/api/user', config);
        setUsername(res.data.username);
      } catch (err) {
        message.error('Không thể tải thông tin người dùng');
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.put('/api/user/profile', { username }, config);
      message.success('Cập nhật thông tin thành công');
    } catch (err) {
      message.error(err.response?.data?.error || 'Cập nhật thông tin thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Tên người dùng
        </label>
        <input
          type="text"
          id="username"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        disabled={loading}
      >
        {loading ? 'Đang cập nhật...' : 'Cập nhật'}
      </button>
    </form>
  );
}

export default UserProfileForm;