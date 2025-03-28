import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Building2, Users, MessageSquare, ClipboardList, LogOut, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CompanyManagement from '../components/admin/CompanyManagement';
import StaffManagement from '../components/admin/StaffManagement';
import ChatworkSettings from '../components/admin/ChatworkSettings';
import WalkinSettings from '../components/admin/WalkinSettings';
import LogManagement from '../components/admin/LogManagement';

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '', icon: Building2, label: '会社情報' },
    { path: 'staff', icon: Users, label: '担当者情報' },
    { path: 'chatwork', icon: MessageSquare, label: 'Chatwork設定' },
    { path: 'walkin', icon: UserPlus, label: '予約なし通知設定' },
    { path: 'logs', icon: ClipboardList, label: 'ログ管理' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="h-full flex flex-col">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-800">管理画面</h1>
          </div>
          <nav className="flex-1">
            <ul className="space-y-1 px-3">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-blue-600 transition-all duration-200"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>ログアウト</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<CompanyManagement />} />
          <Route path="/staff" element={<StaffManagement />} />
          <Route path="/chatwork" element={<ChatworkSettings />} />
          <Route path="/walkin" element={<WalkinSettings />} />
          <Route path="/logs" element={<LogManagement />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;