import React from 'react';
import UserProfileForm from '../components/UserProfileForm';
import ChangePasswordForm from '../components/ChangePasswordForm';

function ProfilePage() {
  return (
    <div className="profile-page p-4">
      <h1 className="text-2xl font-bold mb-6">Hồ sơ người dùng</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Cập nhật thông tin cá nhân</h2>
          <UserProfileForm />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Đổi mật khẩu</h2>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;