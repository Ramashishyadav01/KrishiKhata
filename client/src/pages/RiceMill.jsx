import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSeason } from '../context/SeasonContext';
import api from '../services/api';
import FarmerSelector from '../components/FarmerSelector';
import { Factory, Plus, Trash2, Wheat } from 'lucide-react';

const RiceMill = () => {
  const { t } = useLanguage();
  const { selectedSeason } = useSeason();

  const [entries, setEntries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState({
    totalProcessed: 0,
    totalBranProduced: 0,
    totalBranSold: 0,
    remainingBran: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    customer: '',
    customerName: '',
    riceProcessedQuintal: '',
    branProducedQuintal: '',
    processingRatePerQuintal: 250,
    electricityCost: 0,
    labourCost: 0,
    otherCosts: 0,
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resMill, resCust] = await Promise.all([
        api.get(`/rice-mill?season=${selectedSeason || ''}`),
        api.get('/customers'),
      ]);
      if (resMill.data.success) {
        setEntries(resMill.data.entries);
        setInventory(resMill.data.inventory);
      }
      if (resCust.data.success) setCustomers(resCust.data.customers);
    } catch (error) {
      console.error('Failed to fetch rice mill logs:', error);
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
      const res = await api.post('/rice-mill', {
        ...formData,
        season: selectedSeason || null,
      });
      if (res.data.success) {
        setShowModal(false);
        setFormData({
          date: new Date().toISOString().slice(0, 10),
          customer: '',
          customerName: '',
          riceProcessedQuintal: '',
          branProducedQuintal: '',
          processingRatePerQuintal: 250,
          electricityCost: 0,
          labourCost: 0,
          otherCosts: 0,
          notes: '',
        });
        fetchData();
      }
    } catch (error) {
      alert('Failed to log rice mill batch');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this rice mill record?')) {
      await api.delete(`/rice-mill/${id}`);
      fetchData();
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-hindi">
            {t('riceMill')} (राइस मिल प्रबंधन)
          </h1>
          <p className="text-xs text-gray-500 font-hindi mt-0.5">
            Rice processing logs, milling charges, and automatic Bran (चोकर) inventory tracking
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-agri-700 hover:bg-agri-800 text-white font-hindi text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition flex items-center justify-center space-x-2"
        >
          <Plus size={18} />
          <span>+ नई राइस मिल एंट्री (Add Processing Batch)</span>
        </button>
      </div>

      {/* Inventory Counter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase">Rice Processed</p>
          <p className="text-2xl font-black font-mono text-gray-900">{inventory.totalProcessed} Qtl</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
          <p className="text-xs font-bold text-emerald-800 uppercase">Bran Produced</p>
          <p className="text-2xl font-black font-mono text-emerald-900">{inventory.totalBranProduced} Qtl</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
          <p className="text-xs font-bold text-blue-800 uppercase">Bran Sold</p>
          <p className="text-2xl font-black font-mono text-blue-900">{inventory.totalBranSold} Qtl</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
          <p className="text-xs font-bold text-amber-800 uppercase">Remaining Bran Stock</p>
          <p className="text-2xl font-black font-mono text-amber-900">{inventory.remainingBran} Qtl</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold border-b border-gray-200">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 text-right">Rice Processed</th>
                <th className="py-3 px-4 text-right">Bran Produced</th>
                <th className="py-3 px-4 text-right">Rate / Qtl</th>
                <th className="py-3 px-4 text-right">Total Charge</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium">
              {entries.map((e) => (
                <tr key={e._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono">{new Date(e.date).toLocaleDateString('en-IN')}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">
                    {e.customer ? `${e.customer.name} (${e.customer.village})` : e.customerName || 'Walk-in'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold">{e.riceProcessedQuintal} Qtl</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-amber-800">{e.branProducedQuintal} Qtl</td>
                  <td className="py-3 px-4 text-right font-mono">₹{e.processingRatePerQuintal}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-agri-900">
                    ₹{e.totalProcessingCharge?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => handleDelete(e._id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
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
            <h2 className="text-lg font-bold text-gray-900 font-hindi mb-4">+ Add Rice Mill Processing Batch</h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <FarmerSelector
                value={formData.customer}
                onChange={(farmerId) => setFormData({ ...formData, customer: farmerId })}
                label="Customer / Owner (किसान/मालिक) *"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Rice Processed (Qtl) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 100"
                    value={formData.riceProcessedQuintal}
                    onChange={(e) => setFormData({ ...formData, riceProcessedQuintal: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Bran Produced (Qtl) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 8"
                    value={formData.branProducedQuintal}
                    onChange={(e) => setFormData({ ...formData, branProducedQuintal: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold font-mono text-amber-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Rate / Qtl (₹)</label>
                  <input
                    type="number"
                    value={formData.processingRatePerQuintal}
                    onChange={(e) => setFormData({ ...formData, processingRatePerQuintal: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Electricity Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.electricityCost}
                    onChange={(e) => setFormData({ ...formData, electricityCost: e.target.value })}
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
                  Save Processing Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiceMill;
