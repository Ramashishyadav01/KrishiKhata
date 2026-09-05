import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSeason } from '../context/SeasonContext';
import api from '../services/api';
import { Fuel, Plus, Trash2 } from 'lucide-react';

const FuelEntries = () => {
  const { t } = useLanguage();
  const { selectedSeason } = useSeason();

  const [fuelEntries, setFuelEntries] = useState([]);
  const [machines, setMachines] = useState([]);
  const [summary, setSummary] = useState({ totalLitres: 0, totalCost: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    machine: '',
    fuelType: 'Diesel',
    quantity: '',
    ratePerLitre: 92,
    meterReading: '',
    vendor: '',
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resFuel, resMach] = await Promise.all([
        api.get(`/fuel-entries?season=${selectedSeason || ''}`),
        api.get('/machines'),
      ]);
      if (resFuel.data.success) {
        setFuelEntries(resFuel.data.fuelEntries);
        setSummary(resFuel.data.summary);
      }
      if (resMach.data.success) setMachines(resMach.data.machines);
    } catch (error) {
      console.error('Failed to fetch fuel logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSeason]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.machine) {
      alert('Please select a Machine / Vehicle');
      return;
    }
    const qty = parseFloat(formData.quantity);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity (Litres)');
      return;
    }
    const rate = parseFloat(formData.ratePerLitre);
    if (isNaN(rate) || rate <= 0) {
      alert('Please enter a valid rate per litre');
      return;
    }

    try {
      const res = await api.post('/fuel-entries', {
        ...formData,
        season: selectedSeason || undefined,
      });
      if (res.data.success) {
        setShowModal(false);
        setFormData({
          date: new Date().toISOString().slice(0, 10),
          machine: '',
          fuelType: 'Diesel',
          quantity: '',
          ratePerLitre: 92,
          meterReading: '',
          vendor: '',
          notes: '',
        });
        fetchData();
      }
    } catch (error) {
      console.error('Fuel log error:', error);
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to log fuel entry';
      alert(`Failed to log fuel entry: ${message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this fuel entry?')) {
      await api.delete(`/fuel-entries/${id}`);
      fetchData();
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-hindi">
            {t('fuel')} (डीज़ल/पेट्रोल खर्च)
          </h1>
          <p className="text-xs text-gray-500 font-hindi mt-0.5">
            Track fuel quantity (Litres), rate/L, and machine-wise fuel expenses
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white font-hindi text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition flex items-center justify-center space-x-2"
        >
          <Plus size={18} />
          <span>+ डीज़ल जोड़ें (Add Fuel Log)</span>
        </button>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
          <p className="text-xs font-bold text-amber-800 uppercase">Total Fuel Consumed</p>
          <p className="text-2xl font-black font-mono text-amber-900">{summary.totalLitres} Litres</p>
        </div>
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl">
          <p className="text-xs font-bold text-rose-800 uppercase">Total Fuel Expense</p>
          <p className="text-2xl font-black font-mono text-rose-900">₹{summary.totalCost?.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold border-b border-gray-200">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Machine</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Quantity (L)</th>
                <th className="py-3 px-4 text-right">Rate / L</th>
                <th className="py-3 px-4 text-right">Total Expense</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium">
              {fuelEntries.map((f) => (
                <tr key={f._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono">{new Date(f.date).toLocaleDateString('en-IN')}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">
                    {f.machine ? `${f.machine.nameEn} (${f.machine.nameHi})` : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full font-bold text-[10px]">
                      {f.fuelType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold">{f.quantity} L</td>
                  <td className="py-3 px-4 text-right font-mono">₹{f.ratePerLitre}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-700">
                    ₹{f.totalAmount?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => handleDelete(f._id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
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
            <h2 className="text-lg font-bold text-gray-900 font-hindi mb-4">+ Add Fuel Log (डीज़ल प्रविष्टि)</h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Machine / Vehicle *</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Quantity (Litres) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 50"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Rate / Litre (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.ratePerLitre}
                    onChange={(e) => setFormData({ ...formData, ratePerLitre: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Petrol Pump / Vendor</label>
                <input
                  type="text"
                  placeholder="e.g. Kisan Fuel Station"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
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
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Fuel Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelEntries;
