import React, { useState } from 'react';
import api from '../services/api';
import { UserPlus, AlertCircle, CheckCircle, X, Phone, MapPin, FileText } from 'lucide-react';

const AddFarmerModal = ({ isOpen, onClose, onFarmerCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    village: '',
    address: '',
    notes: '',
  });

  const [error, setError] = useState('');
  const [existingCustomer, setExistingCustomer] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExistingCustomer(null);

    if (!formData.name.trim()) {
      setError('Farmer Name (किसान का नाम) is required.');
      return;
    }

    const cleanMobile = formData.mobile.trim();
    if (cleanMobile && !/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError('Invalid mobile number. Must be a 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/customers', formData);
      if (res.data.success) {
        const createdFarmer = res.data.customer || res.data.data;
        onFarmerCreated(createdFarmer);
        setFormData({ name: '', mobile: '', village: '', address: '', notes: '' });
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create farmer (किसान जोड़ने में समस्या हुई)';
      setError(msg);
      if (err.response?.data?.existingCustomer) {
        setExistingCustomer(err.response.data.existingCustomer);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExisting = () => {
    if (existingCustomer) {
      onFarmerCreated(existingCustomer);
      setFormData({ name: '', mobile: '', village: '', address: '', notes: '' });
      setExistingCustomer(null);
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 font-hindi">
                Add New Farmer (नया किसान जोड़ें)
              </h3>
              <p className="text-[11px] text-gray-500 font-hindi">Create farmer master record without leaving page</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-xl p-1"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl space-y-2 font-hindi">
            <div className="flex items-center space-x-2">
              <AlertCircle size={16} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>

            {/* DUPLICATE FARMER DETECTED CARD */}
            {existingCustomer && (
              <div className="mt-2 p-3 bg-white border border-red-200 rounded-xl text-gray-800">
                <p className="text-[11px] font-bold text-gray-600 mb-1">Existing Registered Farmer:</p>
                <p className="font-bold text-sm text-gray-900">{existingCustomer.name}</p>
                {existingCustomer.mobile && (
                  <p className="text-xs text-gray-600 flex items-center space-x-1 mt-0.5 font-mono">
                    <Phone size={12} className="text-gray-400" />
                    <span>{existingCustomer.mobile}</span>
                  </p>
                )}
                {existingCustomer.village && (
                  <p className="text-xs text-gray-600 flex items-center space-x-1 mt-0.5 font-hindi">
                    <MapPin size={12} className="text-gray-400" />
                    <span>{existingCustomer.village}</span>
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleSelectExisting}
                  className="mt-2.5 w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition font-hindi"
                >
                  Select Existing Farmer (इस किसान को चुनें)
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-hindi">
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Farmer Name (किसान का नाम) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ram Kumar"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Mobile Number (मोबाइल नंबर)
            </label>
            <input
              type="text"
              maxLength={10}
              placeholder="e.g. 9876543210 (Optional)"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Village (गांव)
            </label>
            <input
              type="text"
              placeholder="e.g. Rampur (Optional)"
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Address (पता)
            </label>
            <input
              type="text"
              placeholder="e.g. Near Old Water Tank (Optional)"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Notes (नोट्स)
            </label>
            <input
              type="text"
              placeholder="Optional remarks"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
            >
              Cancel (रद्द करें)
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-agri-700 hover:bg-agri-800 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Farmer (किसान सेव करें)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFarmerModal;
