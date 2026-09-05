import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { User, Phone, Lock, AlertCircle, CheckCircle } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Operator');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!name.trim()) {
      setError('Please enter your full name (पूरा नाम दर्ज करें)');
      return false;
    }
    const cleanMobile = mobile.trim();
    if (!cleanMobile || !/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError('Invalid mobile number. Must be a 10-digit Indian mobile number (मान्य 10 अंकों का मोबाइल नंबर दर्ज करें)');
      return false;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters (पासवर्ड कम से कम 6 अक्षरों का होना चाहिए)');
      return false;
    }
    if (password !== confirmPassword) {
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
      const res = await register(name, mobile.trim(), password, confirmPassword);
      if (res && res.success) {
        setSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login', { state: { message: 'Account created successfully. Please login with your credentials.' } });
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-agri-950 via-agri-900 to-agri-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-agri-100 relative overflow-hidden my-6">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-lg mb-3">
            🚜
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-hindi">
            {t('appName')} <span className="text-amber-600 font-normal">कृषिखाता</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-hindi">
            Create Account / नया अकाउंट बनाएं
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center space-x-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center space-x-2">
            <CheckCircle size={16} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
              Full Name (पूरा नाम) *
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
              Mobile Number (मोबाइल नंबर) *
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
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
              Password (पासवर्ड) *
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-3 text-gray-400" />
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
              Confirm Password (पासवर्ड की पुष्टि) *
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-3 text-gray-400" />
              <input
                type="password"
                required
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
              Account Type (अकाउंट का प्रकार)
            </label>
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs text-amber-900 font-hindi">Operator (ऑपरेटर)</span>
                <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md">Default</span>
              </div>
              <span className="text-[11px] text-gray-500 italic font-hindi">Standard User</span>
            </div>
            <p className="text-[11px] text-amber-800 font-medium mt-1.5 font-hindi">
              Admin account is restricted to the system owner.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm rounded-xl shadow-md transition transform hover:-translate-y-0.5 disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating Account...' : 'Create Account (अकाउंट बनाएं)'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-600 font-hindi">
            Already have an account? (पहले से अकाउंट है?){' '}
            <Link to="/login" className="font-bold text-agri-800 hover:text-agri-950 underline ml-1">
              Sign In (लॉग इन करें)
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
