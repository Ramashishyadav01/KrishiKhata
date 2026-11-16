import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import {
  Tractor,
  Edit3,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  Info,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

const Machines = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editRate, setEditRate] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // New Machine Form
  const [formData, setFormData] = useState({
    nameEn: '',
    nameHi: '',
    billingUnit: 'Bigha',
    defaultRate: '',
    status: 'Active',
    notes: '',
  });

  const fetchMachines = async () => {
    setLoading(true);
    try {
      const res = await api.get('/machines');
      if (res.data.success) {
        setMachines(res.data.machines || []);
      }
    } catch (error) {
      console.error('Failed to fetch machines:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const handleSeedDefaults = async () => {
    setSeeding(true);
    try {
      const res = await api.post('/machines/seed');
      if (res.data.success) {
        setMachines(res.data.machines || []);
        alert(res.data.message || 'Default machines loaded successfully');
      }
    } catch (error) {
      console.error('Failed to seed machines:', error);
      alert('Failed to load standard machines');
    } finally {
      setSeeding(false);
    }
  };

  const handleSaveRate = async (id) => {
    const parsedRate = parseFloat(editRate);
    if (isNaN(parsedRate) || parsedRate < 0) {
      alert('Please enter a valid rate (कृपया एक मान्य दर दर्ज करें)');
      return;
    }

    try {
      const updateRes = await api.put(`/machines/${id}`, { defaultRate: parsedRate });
      if (updateRes.data.success) {
        setEditingId(null);
        setMachines((prev) =>
          prev.map((m) =>
            m._id === id ? { ...m, defaultRate: updateRes.data.machine.defaultRate } : m
          )
        );
      }
    } catch (error) {
      console.error('Rate update error:', error);
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to update rate';
      alert(message);
    }
  };

  const handleCreateMachine = async (e) => {
    e.preventDefault();
    if (!formData.nameEn.trim()) {
      alert('Please enter Machine Name (English)');
      return;
    }
    const rate = parseFloat(formData.defaultRate);
    if (isNaN(rate) || rate < 0) {
      alert('Please enter a valid default rate');
      return;
    }

    try {
      const res = await api.post('/machines', {
        ...formData,
        defaultRate: rate,
      });
      if (res.data.success) {
        setShowAddModal(false);
        setFormData({
          nameEn: '',
          nameHi: '',
          billingUnit: 'Bigha',
          defaultRate: '',
          status: 'Active',
          notes: '',
        });
        fetchMachines();
      }
    } catch (error) {
      console.error('Failed to create machine:', error);
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to add machine';
      alert(message);
    }
  };

  const handleDeleteMachine = async (id, name) => {
    if (window.confirm(`Delete machine "${name}"? (क्या आप इस मशीन को हटाना चाहते हैं?)`)) {
      try {
        await api.delete(`/machines/${id}`);
        fetchMachines();
      } catch (error) {
        console.error('Failed to delete machine:', error);
        alert(error.response?.data?.message || 'Failed to delete machine');
      }
    }
  };

  const handleRecordWork = (machine) => {
    navigate('/work-entries', {
      state: {
        machineId: machine._id,
        openModal: true,
      },
    });
  };

  return (
    <div>
      {/* Page Header with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-hindi flex items-center space-x-2">
            <span>{t('machines')} (मशीन एवं सेवाएँ)</span>
          </h1>
          <p className="text-xs text-gray-500 font-hindi mt-0.5">
            Configure default rates, billing units, and record which machine works for which farmer.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSeedDefaults}
            disabled={seeding}
            className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-hindi text-xs font-bold py-2.5 px-3.5 rounded-xl transition flex items-center space-x-1.5 shadow-xs"
            title="Load standard agricultural machines (ट्रैक्टर, रोटावेटर, थ्रेशर, आदि)"
          >
            <Sparkles size={16} className="text-amber-600" />
            <span>{seeding ? 'लोड हो रहा है...' : '⚡ मानक मशीनें लोड करें (Default Fleet)'}</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-agri-700 hover:bg-agri-800 text-white font-hindi text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition flex items-center space-x-1.5"
          >
            <Plus size={18} />
            <span>+ नई मशीन जोड़ें (Add Machine)</span>
          </button>
        </div>
      </div>

      {/* Workflow Explanatory Card */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 mb-6 flex items-start space-x-3 text-xs text-emerald-950 font-hindi">
        <Info size={18} className="text-emerald-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-bold text-emerald-900 mb-0.5">
            💡 कौन सी मशीन किस किसान के खेत में काम की — इसका हिसाब कैसे रखें?
          </p>
          <p className="text-emerald-800">
            मशीन का काम किसान के खाते में दर्ज करने के लिए नीचे किसी भी मशीन कार्ड पर{' '}
            <strong className="text-agri-900 underline font-extrabold cursor-pointer">
              '+ किसान का काम जोड़ें (Assign to Farmer)'
            </strong>{' '}
            दबाएं, या बाईं तरफ मेनू में{' '}
            <strong
              onClick={() => navigate('/work-entries')}
              className="text-agri-800 underline font-bold cursor-pointer"
            >
              'काम की प्रविष्टि' (Work Entries)
            </strong>{' '}
            पर जाएं।
          </p>
        </div>
      </div>

      {/* Machines Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-gray-400 font-hindi">
          मशीनों की सूची लोड हो रही है... (Loading machines...)
        </div>
      ) : machines.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-300 text-center shadow-xs">
          <div className="w-16 h-16 bg-agri-100 text-agri-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Tractor size={32} />
          </div>
          <h3 className="text-base font-bold text-gray-900 font-hindi mb-1">
            कोई मशीन नहीं मिली (No Machines Found)
          </h3>
          <p className="text-xs text-gray-500 font-hindi max-w-md mx-auto mb-6">
            आपके खाते में अभी कोई कृषि मशीन नहीं जुड़ी है। आप एक क्लिक में मानक कृषि मशीनें
            (ट्रैक्टर, रोटावेटर, थ्रेशर, ट्रॉली, आदि) लोड कर सकते हैं या नई कस्टम मशीन जोड़ सकते हैं।
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleSeedDefaults}
              disabled={seeding}
              className="bg-agri-700 hover:bg-agri-800 text-white font-hindi text-xs font-bold py-2.5 px-5 rounded-xl shadow-md transition flex items-center space-x-2"
            >
              <Sparkles size={16} />
              <span>⚡ मानक कृषि मशीनें लोड करें (Load Standard Machines)</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-hindi text-xs font-bold py-2.5 px-5 rounded-xl shadow-xs transition flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>+ नई मशीन जोड़ें (Add Custom Machine)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {machines.map((m) => (
            <div
              key={m._id}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:border-agri-400 hover:shadow-md transition group"
            >
              <div>
                {/* Header: Icon, Name & Status */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-agri-100 text-agri-800 rounded-2xl group-hover:bg-agri-700 group-hover:text-white transition">
                      <Tractor size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm font-hindi leading-tight">
                        {m.nameEn}
                        {m.nameHi && m.nameHi !== m.nameEn && (
                          <span className="text-gray-500 font-normal ml-1">({m.nameHi})</span>
                        )}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[10px] font-bold uppercase">
                          इकाई: {m.billingUnit}
                        </span>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            m.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.status === 'Maintenance'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {m.status || 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteMachine(m._id, m.nameEn)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Delete Machine"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Rate Card */}
                <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between mt-3 border border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-500 font-semibold uppercase">
                      Default Rate (दर)
                    </p>
                    {editingId === m._id ? (
                      <input
                        type="number"
                        value={editRate}
                        onChange={(e) => setEditRate(e.target.value)}
                        className="w-24 p-1 border border-amber-400 rounded-lg text-sm font-bold font-mono focus:outline-none bg-white"
                        autoFocus
                      />
                    ) : (
                      <p className="text-lg font-black font-mono text-agri-900">
                        ₹{m.defaultRate}{' '}
                        <span className="text-xs font-normal text-gray-500">/{m.billingUnit}</span>
                      </p>
                    )}
                  </div>

                  {editingId === m._id ? (
                    <button
                      onClick={() => handleSaveRate(m._id)}
                      className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                      title="Save Rate"
                    >
                      <Check size={18} />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(m._id);
                        setEditRate(m.defaultRate);
                      }}
                      className="p-2 text-gray-500 hover:text-agri-700 hover:bg-white rounded-lg transition"
                      title="Edit Rate"
                    >
                      <Edit3 size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Action: Record Work for Farmer */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleRecordWork(m)}
                  className="w-full py-2 px-3 bg-agri-50 hover:bg-agri-100 text-agri-800 hover:text-agri-950 font-hindi font-bold text-xs rounded-xl border border-agri-200 transition flex items-center justify-center space-x-1.5 shadow-2xs"
                >
                  <Plus size={15} />
                  <span>+ किसान का काम जोड़ें (Assign to Farmer)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Machine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 font-hindi mb-4">
              + नई कृषि मशीन / सेवा जोड़ें (Add Machine)
            </h2>
            <form onSubmit={handleCreateMachine} className="space-y-4 text-xs font-hindi">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Machine Name in English (मशीन का नाम - अंग्रेज़ी) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Combine Harvester, Laser Leveler, Seed Drill"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:outline-none focus:border-agri-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Machine Name in Hindi (मशीन का नाम - हिंदी)
                </label>
                <input
                  type="text"
                  placeholder="उदा. कम्बाइन हार्वेस्टर, लेजर लेवलर, सीड ड्रिल"
                  value={formData.nameHi}
                  onChange={(e) => setFormData({ ...formData, nameHi: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:outline-none focus:border-agri-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Billing Unit (इकाई) *</label>
                  <select
                    value={formData.billingUnit}
                    onChange={(e) => setFormData({ ...formData, billingUnit: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:outline-none focus:border-agri-500"
                  >
                    <option value="Bigha">Bigha (बीघा)</option>
                    <option value="Hour">Hour (घंटे)</option>
                    <option value="Trip">Trip (चक्कर)</option>
                    <option value="Quintal">Quintal (क्विंटल)</option>
                    <option value="Custom">Custom (अन्य)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Default Rate (₹ दर) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 1500"
                    value={formData.defaultRate}
                    onChange={(e) => setFormData({ ...formData, defaultRate: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold font-mono focus:outline-none focus:border-agri-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status (स्थिति)</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                  >
                    <option value="Active">Active (सक्रिय)</option>
                    <option value="Maintenance">Maintenance (मरम्मत में)</option>
                    <option value="Inactive">Inactive (निष्क्रिय)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Notes (विवरण)</label>
                  <input
                    type="text"
                    placeholder="उदा. महिंद्रा 575 ट्रैक्टर"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel (रद्द करें)
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-agri-700 hover:bg-agri-800 text-white font-bold rounded-xl shadow-md"
                >
                  Save Machine (मशीन सहेजें)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Machines;
