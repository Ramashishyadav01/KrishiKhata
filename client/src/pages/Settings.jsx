import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { Shield, Users, Plus, CheckCircle, XCircle } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const fetchUsers = async () => {
    if (user?.role !== 'admin') return;
    setLoading(true);
    try {
      const res = await api.get('/auth/users');
      if (res.data.success) setUsersList(res.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const handleCreateOperator = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter full name (पूरा नाम दर्ज करें)');
      return;
    }
    const cleanMobile = mobile.trim();
    if (!cleanMobile || !/^[6-9]\d{9}$/.test(cleanMobile)) {
      alert('Invalid mobile number. Must be 10 digits.');
      return;
    }
    if (!password || password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      const res = await api.post('/auth/users', {
        name: name.trim(),
        mobile: cleanMobile,
        email: email ? email.trim() : undefined,
        password,
        role: 'operator',
      });
      if (res.data.success) {
        setShowUserModal(false);
        setName('');
        setMobile('');
        setEmail('');
        setPassword('');
        fetchUsers();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create operator');
    }
  };

  const handleToggleStatus = async (targetUser) => {
    if (targetUser.role === 'admin') {
      alert('The Admin account cannot be deactivated.');
      return;
    }
    const newStatus = targetUser.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await api.put(`/auth/users/${targetUser._id}/status`, { status: newStatus });
      if (res.data.success) {
        fetchUsers();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-hindi">
          {t('settings')} (सिस्टम सेटिंग्स एवं उपयोगकर्ता)
        </h1>
        <p className="text-xs text-gray-500 font-hindi mt-0.5">
          Role Hierarchy: Admin (Owner) & System Operators (ऑपरेटर)
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center space-x-2 font-hindi">
          <Shield className="text-agri-700" size={18} />
          <span>My Profile (मेरी प्रोफाइल)</span>
        </h3>
        <div className="bg-gray-50 p-4 rounded-xl text-xs space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase">Full Name (पूरा नाम)</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{user?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase">Mobile Number (मोबाइल)</p>
              <p className="text-sm font-bold text-gray-900 font-mono mt-0.5">{user?.mobile || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase">Role (रोल)</p>
              <div className="mt-0.5">
                {user?.role === 'admin' ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 font-hindi">
                    👑 Admin (एडमिन - Owner)
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300 font-hindi">
                    👤 Operator (ऑपरेटर)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operators / User Management Section (Admin Only) */}
      {user?.role === 'admin' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-base font-bold text-gray-900 font-hindi flex items-center space-x-2">
                <Users size={20} className="text-agri-700" />
                <span>Operators (ऑपरेटर) ({usersList.filter((u) => u.role !== 'admin').length})</span>
              </h3>
              <p className="text-xs text-gray-500 font-hindi mt-0.5">
                Manage staff and system operators. Only 1 Admin exists in KrishiKhata.
              </p>
            </div>
            <button
              onClick={() => setShowUserModal(true)}
              className="bg-agri-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl hover:bg-agri-800 transition flex items-center space-x-1.5 shadow-sm"
            >
              <Plus size={16} />
              <span>+ Add Operator (नया ऑपरेटर जोड़ें)</span>
            </button>
          </div>

          <div className="divide-y divide-gray-100 text-xs">
            {usersList.map((u) => (
              <div key={u._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <p className="font-bold text-sm text-gray-900">{u.name}</p>
                    {u.role === 'admin' ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                        Admin (System Owner)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        Operator (ऑपरेटर)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-mono">
                    Mobile: {u.mobile} {u.email ? `| Email: ${u.email}` : ''}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <span
                    className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {u.status === 'active' ? (
                      <>
                        <CheckCircle size={12} />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={12} />
                        <span>Inactive</span>
                      </>
                    )}
                  </span>

                  {u.role !== 'admin' && (
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                        u.status === 'active'
                          ? 'border-red-200 text-red-700 hover:bg-red-50'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {u.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Operator Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 font-hindi mb-1">
              + Add Operator (नया ऑपरेटर जोड़ें)
            </h2>
            <p className="text-xs text-gray-500 mb-4 font-hindi">
              Create a new operator account for staff members.
            </p>

            <form onSubmit={handleCreateOperator} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1 uppercase tracking-wide">
                  Full Name (पूरा नाम) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ram Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 uppercase tracking-wide">
                  Mobile Number (मोबाइल नंबर) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="e.g. 9876543212"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 uppercase tracking-wide">
                  Password (पासवर्ड) *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 uppercase tracking-wide">
                  Role (अकाउंट रोल)
                </label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-900 font-hindi">
                    Operator (ऑपरेटर)
                  </span>
                  <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-2 py-0.5 rounded-md">
                    Fixed Role
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1 font-hindi">
                  Role cannot be modified. All staff are registered as Operators.
                </p>
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-agri-700 hover:bg-agri-800 text-white font-bold rounded-xl shadow-sm transition"
                >
                  Create Operator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
