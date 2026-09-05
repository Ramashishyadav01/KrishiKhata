import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSeason } from '../context/SeasonContext';
import api from '../services/api';
import { Calendar, Plus, CheckCircle } from 'lucide-react';

const Seasons = () => {
  const { t } = useLanguage();
  const { seasons, fetchSeasons } = useSeason();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    status: 'Active',
    notes: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/seasons', formData);
      if (res.data.success) {
        setShowModal(false);
        setFormData({ name: '', startDate: new Date().toISOString().slice(0, 10), endDate: new Date().toISOString().slice(0, 10), status: 'Active', notes: '' });
        fetchSeasons();
      }
    } catch (error) {
      alert('Failed to create season');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Completed' : 'Active';
    await api.put(`/seasons/${id}`, { status: newStatus });
    fetchSeasons();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-hindi">
            {t('seasons')} (फसल सीजन)
          </h1>
          <p className="text-xs text-gray-500 font-hindi mt-0.5">
            Agricultural season cycles (e.g. Kharif 2026, Rabi 2026-27) to isolate seasonal P&L
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-agri-700 hover:bg-agri-800 text-white font-hindi text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition flex items-center justify-center space-x-2"
        >
          <Plus size={18} />
          <span>+ नया सीजन (Add Season)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {seasons.map((s) => (
          <div key={s._id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{s.name}</h3>
                    <p className="text-[10px] text-gray-500">{s.notes || 'Agricultural Season'}</p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    s.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {s.status}
                </span>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl space-y-1 text-xs mb-3 font-mono">
                <p><span className="text-gray-500 font-sans">Start:</span> {new Date(s.startDate).toLocaleDateString('en-IN')}</p>
                <p><span className="text-gray-500 font-sans">End:</span> {new Date(s.endDate).toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            <button
              onClick={() => handleToggleStatus(s._id, s.status)}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition"
            >
              Mark as {s.status === 'Active' ? 'Completed' : 'Active'}
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 font-hindi mb-4">+ Add Season</h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Season Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kharif 2026"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-agri-700 hover:bg-agri-800 text-white font-bold rounded-xl">
                  Save Season
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Seasons;
