import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Globe, Calendar, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useSeason } from '../context/SeasonContext';
import LogoutConfirmModal from './LogoutConfirmModal';

const Navbar = ({ onOpenSidebar }) => {
  const { user, logout } = useAuth();
  const { lang, toggleLanguage } = useLanguage();
  const { seasons, selectedSeason, setSelectedSeason } = useSeason();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/login', {
      replace: true,
      state: { message: 'Logged out successfully (सफलतापूर्वक लॉग आउट हो गए)' },
    });
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6 shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Open Navigation"
          >
            <Menu size={22} />
          </button>
          
          {/* Season Selector */}
          <div className="flex items-center space-x-2 bg-agri-50 border border-agri-200 px-3 py-1.5 rounded-lg">
            <Calendar size={16} className="text-agri-700" />
            <span className="text-xs font-semibold text-agri-900 hidden sm:inline">Season:</span>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="bg-transparent text-xs font-bold text-agri-800 focus:outline-none cursor-pointer"
            >
              <option value="">All Seasons (सभी सीज़न)</option>
              {seasons.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} {s.status === 'Active' ? '🟢 (Active)' : '⚪'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Language Switcher Button */}
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-gray-300 hover:border-amber-500 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-amber-50 transition"
            title="Switch Language / भाषा बदलें"
          >
            <Globe size={15} className="text-amber-600" />
            <span>{lang === 'en' ? 'English | हिंदी' : 'हिंदी | English'}</span>
          </button>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-2 sm:space-x-3 border-l pl-3 border-gray-200">
            <div className="w-8 h-8 rounded-full bg-agri-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-gray-800 leading-tight">{user?.name || 'User'}</p>
              <p className="text-[10px] text-gray-500 capitalize">{user?.role || 'operator'}</p>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition shadow-xs"
              title="Logout (लॉग आउट)"
            >
              <LogOut size={15} />
              <span className="font-hindi">{lang === 'hi' ? 'लॉग आउट (Logout)' : 'Logout (लॉग आउट)'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};

export default Navbar;
