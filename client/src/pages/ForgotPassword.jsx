import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Phone, Lock, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [mobile, setMobile] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { resetPassword } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const validateForm = () => {
    const cleanMobile = mobile.trim();
    if (!cleanMobile || !/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError('Invalid mobile number. Must be a 10-digit Indian mobile number (मान्य 10 अंकों का मोबाइल नंबर दर्ज करें)');
      return false;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters (नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए)');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match (पासवर्ड मेल नहीं खाते)');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await resetPassword(mobile.trim(), newPassword, confirmPassword);
      if (res && res.success) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Password updated successfully. Please log in with your new password.' },
          });
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-agri-950 via-agri-900 to-agri-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-agri-100 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-lg mb-3">
            🔑
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-hindi">
            Reset Password <span className="text-amber-600 font-normal">(पासवर्ड बदलें)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-hindi">
            Enter your registered mobile number and set a new password.
          </p>
        </div>

        {success && (
          <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center space-x-2">
            <CheckCircle size={16} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center space-x-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
              Registered Mobile Number (रजिस्टर्ड मोबाइल नंबर)
            </label>
            <div className="relative">
              <Phone size={18} className="absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                required
                maxLength={10}
                placeholder="e.g. 9876543210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
              New Password (नया पासवर्ड)
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-3 text-gray-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
              Confirm New Password (नया पासवर्ड दोबारा दर्ज करें)
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-3 text-gray-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-md transition transform hover:-translate-y-0.5 disabled:opacity-50 mt-2"
          >
            {loading ? 'Resetting Password...' : 'Update Password (पासवर्ड अपडेट करें)'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-xs font-bold text-agri-700 hover:text-agri-900 underline font-hindi"
          >
            <ArrowLeft size={14} className="mr-1" />
            Back to Sign In (लॉग इन पर वापस जाएं)
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
