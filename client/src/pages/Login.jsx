import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Lock, Phone, AlertCircle, CheckCircle } from 'lucide-react';

const Login = () => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const successMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanMobile = mobile.trim();
    if (!cleanMobile) {
      setError('Please enter your mobile number (मोबाइल नंबर दर्ज करें)');
      return;
    }
    if (!password) {
      setError('Please enter your password (पासवर्ड दर्ज करें)');
      return;
    }

    setLoading(true);
    try {
      await login(cleanMobile, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid mobile number or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-agri-950 via-agri-900 to-agri-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-agri-100 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-lg mb-3">
            🚜
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-hindi">
            {t('appName')} <span className="text-amber-600 font-normal">कृषिखाता</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-hindi">
            "खेती का काम, मशीन और पैसा — सबका एक जगह हिसाब।"
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center space-x-2">
            <CheckCircle size={16} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center space-x-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
              Mobile Number (मोबाइल नंबर)
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
              Password (पासवर्ड)
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-3 text-gray-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm rounded-xl shadow-md transition transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Sign In to KrishiKhata (लॉग इन करें)'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-600 font-hindi mb-4">
            Don't have an account? (अकाउंट नहीं है?){' '}
            <Link to="/register" className="font-bold text-amber-700 hover:text-amber-900 underline ml-1">
              Create Account / नया अकाउंट बनाएं
            </Link>
          </p>

          <div className="pt-4 border-t border-gray-100 text-xs text-gray-500">
            <p className="font-semibold text-gray-700 mb-1">Demo Accounts:</p>
            <p>Admin: <span className="font-mono font-bold text-agri-800">9876543210</span> / <span className="font-mono">admin123</span></p>
            <p>Operator: <span className="font-mono font-bold text-agri-800">9876543211</span> / <span className="font-mono">operator123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
