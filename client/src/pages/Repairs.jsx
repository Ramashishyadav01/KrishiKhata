import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSeason } from '../context/SeasonContext';
import api from '../services/api';
import { Wrench, Plus, Trash2 } from 'lucide-react';

const Repairs = () => {
  const { t } = useLanguage();
  const { selectedSeason } = useSeason();

  const [repairs, setRepairs] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    machine: '',
    date: new Date().toISOString().slice(0, 10),
    problem: '',
    description: '',
    partsCost: 0,
    labourCost: 0,
    mechanic: '',
    status: 'Completed',
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRep, resMach] = await Promise.all([
        api.get(`/repairs?season=${selectedSeason || ''}`),
        api.get('/machines'),
      ]);
      if (resRep.data.success) setRepairs(resRep.data.repairs);
      if (resMach.data.success) setMachines(resMach.data.machines);
    } catch (error) {
      console.error('Failed to fetch repair logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSeason]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/repairs', {
        ...formData,
        season: selectedSeason || null,
      });
      if (res.data.success) {
        setShowModal(false);
        setFormData({ machine: '', date: new Date().toISOString().slice(0, 10), problem: '', description: '', partsCost: 0, labourCost: 0, mechanic: '', status: 'Completed', notes: '' });
        fetchData();
      }
    } catch (error) {
      alert('Failed to log repair');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this repair record?')) {
      await api.delete(`/repairs/${id}`);
      fetchData();
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-hindi">
            {t('repairs')} (मरम्मत एवं रखरखाव)
          </h1>
          <p className="text-xs text-gray-500 font-hindi mt-0.5">
            Log machine breakdowns, mechanic costs, spare parts, and service charges
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white font-hindi text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition flex items-center justify-center space-x-2"
        >
          <Plus size={18} />
          <span>+ मरम्मत जोड़ें (Log Repair)</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold border-b border-gray-200">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Machine</th>
                <th className="py-3 px-4">Problem / Issue</th>
                <th className="py-3 px-4">Mechanic</th>
                <th className="py-3 px-4 text-right">Parts Cost</th>
                <th className="py-3 px-4 text-right">Labour Cost</th>
                <th className="py-3 px-4 text-right">Total Cost</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium">
              {repairs.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono">{new Date(r.date).toLocaleDateString('en-IN')}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">
                    {r.machine ? `${r.machine.nameEn} (${r.machine.nameHi})` : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-gray-800 font-hindi">{r.problem}</td>
                  <td className="py-3 px-4 text-gray-500">{r.mechanic || '-'}</td>
                  <td className="py-3 px-4 text-right font-mono">₹{r.partsCost}</td>
                  <td className="py-3 px-4 text-right font-mono">₹{r.labourCost}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-700">
                    ₹{r.totalCost?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => handleDelete(r._id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 font-hindi mb-4">+ Log Machine Repair</h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Machine *</label>
                <select
                  required
                  value={formData.machine}
                  onChange={(e) => setFormData({ ...formData, machine: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium font-hindi"
                >
                  <option value="">Select Machine</option>
                  {machines.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.nameEn} ({m.nameHi})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Problem Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hydraulic pipe replacement"
                  value={formData.problem}
                  onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Parts Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.partsCost}
                    onChange={(e) => setFormData({ ...formData, partsCost: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Labour Charge (₹)</label>
                  <input
                    type="number"
                    value={formData.labourCost}
                    onChange={(e) => setFormData({ ...formData, labourCost: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Mechanic / Workshop</label>
                <input
                  type="text"
                  placeholder="e.g. Sharma Tractor Workshop"
                  value={formData.mechanic}
                  onChange={(e) => setFormData({ ...formData, mechanic: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Repair Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Repairs;
