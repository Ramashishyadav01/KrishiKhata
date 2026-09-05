import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import FarmerSelector from '../components/FarmerSelector';
import { formatBighaBissaDisplay } from '../utils/bighaUtils';
import { MapPin, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

const Fields = () => {
  const { t } = useLanguage();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [fieldError, setFieldError] = useState('');

  // Add Field Form State
  const [formData, setFormData] = useState({
    customer: '',
    name: '',
    village: '',
    bigha: 0,
    bissa: 0,
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const resFld = await api.get('/fields');
      if (resFld.data.success) setFields(resFld.data.fields);
    } catch (error) {
      console.error('Failed to fetch fields:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitField = async (e) => {
    e.preventDefault();
    setFieldError('');

    if (!formData.customer) {
      setFieldError('Please select or create a farmer (किसान चुनें या नया जोड़ें)');
      return;
    }

    if (!formData.name.trim()) {
      setFieldError('Field name is required (खेत का नाम आवश्यक है)');
      return;
    }

    try {
      const res = await api.post('/fields', formData);
      if (res.data.success) {
        setShowModal(false);
        setFormData({ customer: '', name: '', village: '', bigha: 0, bissa: 0, notes: '' });
        fetchData();
        setToastMessage('Field added successfully (खेत सफलतापूर्वक जोड़ा गया)');
        setTimeout(() => setToastMessage(''), 3500);
      }
    } catch (error) {
      setFieldError(error.response?.data?.message || 'Failed to add field');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this field?')) {
      await api.delete(`/fields/${id}`);
      fetchData();
    }
  };

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-800 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 animate-bounce font-hindi text-xs font-bold">
          <CheckCircle size={18} className="text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-hindi">
            {t('fields')} (खेत / भूमि प्रबंधन)
          </h1>
          <p className="text-xs text-gray-500 font-hindi mt-0.5">
            Registered land holdings by customer with exact Bigha & Bissa measurements
          </p>
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            setFieldError('');
          }}
          className="bg-agri-700 hover:bg-agri-800 text-white font-hindi text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition flex items-center justify-center space-x-2"
        >
          <Plus size={18} />
          <span>+ नया खेत (Add Field)</span>
        </button>
      </div>

      {/* Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map((f) => (
          <div key={f._id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:border-agri-300 transition">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm font-hindi">{f.name}</h3>
                  <p className="text-xs text-gray-500 font-bold">{f.customer?.name} ({f.village})</p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between text-xs mt-2">
                <span className="text-gray-500 font-semibold">Area Measurement:</span>
                <span className="font-bold text-agri-900 font-hindi">{formatBighaBissaDisplay(f.bigha, f.bissa)}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
              <button onClick={() => handleDelete(f._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN ADD FIELD MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
              <h2 className="text-lg font-bold text-gray-900 font-hindi">+ Add Field (खेत जोड़ें)</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">
                ×
              </button>
            </div>

            {fieldError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center space-x-2 font-hindi">
                <AlertCircle size={16} className="shrink-0" />
                <span>{fieldError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitField} className="space-y-4 text-xs">
              {/* Reusable Farmer Selector Component */}
              <FarmerSelector
                value={formData.customer}
                onChange={(farmerId, farmerObj) => {
                  setFormData((prev) => ({
                    ...prev,
                    customer: farmerId,
                    village: farmerObj ? farmerObj.village || prev.village : prev.village,
                  }));
                }}
                label="Farmer (किसान)"
                required
              />

              <div>
                <label className="block font-bold text-gray-700 mb-1 font-hindi">Field Name (खेत का नाम) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Field 1 (North Khet)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1 font-hindi">Bigha (बीघा)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bigha}
                    onChange={(e) => setFormData({ ...formData, bigha: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1 font-hindi">Bissa (बिस्सा)</label>
                  <input
                    type="number"
                    min="0"
                    max="19"
                    value={formData.bissa}
                    onChange={(e) => setFormData({ ...formData, bissa: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 font-hindi"
                >
                  Cancel (रद्द करें)
                </button>
                <button type="submit" className="px-6 py-2.5 bg-agri-700 hover:bg-agri-800 text-white font-bold rounded-xl shadow-md font-hindi">
                  Save Field (खेत सेव करें)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fields;
