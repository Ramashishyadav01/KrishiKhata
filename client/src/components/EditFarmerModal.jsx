import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { UserCheck, AlertCircle, X } from 'lucide-react';

const EditFarmerModal = ({ isOpen, onClose, farmer, onFarmerUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    village: '',
    address: '',
    notes: '',
    status: 'Active',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (farmer) {
      setFormData({
        name: farmer.name || '',
        mobile: farmer.mobile || '',
        village: farmer.village || '',
        address: farmer.address || '',
        notes: farmer.notes || '',
        status: farmer.status || 'Active',
      });
    }
    setError('');
  }, [farmer, isOpen]);

  if (!isOpen || !farmer) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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
      const res = await api.put(`/customers/${farmer._id}`, {
        name: formData.name.trim(),
        mobile: cleanMobile || undefined,
        village: formData.village.trim(),
        address: formData.address.trim(),
        notes: formData.notes.trim(),
        status: formData.status,
      });

      if (res.data.success) {
        onFarmerUpdated(res.data.customer);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update farmer details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
              <UserCheck size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 font-hindi">
                Edit Farmer (किसान की जानकारी बदलें)
              </h3>
              <p className="text-[11px] text-gray-500 font-hindi">Update farmer profile information</p>
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
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center space-x-2 font-hindi">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <span>{error}</span>
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
              placeholder="e.g. 9876543210"
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
              placeholder="e.g. Rampur"
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
              placeholder="e.g. Near Old Water Tank"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Status (अकाउंट स्थिति)
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
            >
              <option value="Active">Active (सक्रिय)</option>
              <option value="Inactive">Inactive (निष्क्रिय)</option>
            </select>
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
              {loading ? 'Updating...' : 'Update Farmer (अपडेट करें)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFarmerModal;
