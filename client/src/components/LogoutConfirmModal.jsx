import React from 'react';
import { LogOut, AlertTriangle, X } from 'lucide-react';

const LogoutConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg transition"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center pt-2">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <LogOut size={26} />
          </div>

          <h3 className="text-lg font-bold text-gray-900 font-hindi mb-1">
            Logout Confirmation
          </h3>
          <p className="text-sm font-semibold text-gray-700 font-hindi mb-2">
            Are you sure you want to logout?
          </p>
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl font-hindi mb-6">
            क्या आप लॉग आउट करना चाहते हैं?
          </p>

          <div className="flex space-x-3 w-full">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition font-hindi"
            >
              Cancel (रद्द करें)
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition font-hindi flex items-center justify-center space-x-1.5"
            >
              <LogOut size={16} />
              <span>Logout (लॉग आउट)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;
