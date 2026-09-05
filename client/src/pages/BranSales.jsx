import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSeason } from '../context/SeasonContext';
import api from '../services/api';
import FarmerSelector from '../components/FarmerSelector';
import { Wheat, Plus, Trash2 } from 'lucide-react';

const BranSales = () => {
  const { t } = useLanguage();
  const { selectedSeason } = useSeason();

  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({
    totalBranProduced: 0,
    totalQuantitySold: 0,
    remainingBran: 0,
    totalSalesAmount: 0,
    totalReceived: 0,
    totalPending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    buyer: '',
    buyerMobile: '',
    quantityQuintal: '',
    ratePerQuintal: 2500,
    amountReceived: '',
    paymentMethod: 'Cash',
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/bran-sales?season=${selectedSeason || ''}`);
      if (res.data.success) {
        setSales(res.data.sales);
        setSummary(res.data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch bran sales:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSeason]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.buyer || !formData.buyer.trim()) {
      alert('Please select or enter a Buyer / Farmer name');
      return;
    }
    const qty = parseFloat(formData.quantityQuintal);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity in Quintal');
      return;
    }
    const rate = parseFloat(formData.ratePerQuintal);
    if (isNaN(rate) || rate <= 0) {
      alert('Please enter a valid rate per Quintal');
      return;
    }
    const received = parseFloat(formData.amountReceived) || 0;
    const totalAmount = Math.round(qty * rate);
    if (received > totalAmount) {
      alert(`Amount received (₹${received}) cannot be greater than total amount (₹${totalAmount}).`);
      return;
    }

    try {
      const res = await api.post('/bran-sales', {
        ...formData,
        season: selectedSeason || undefined,
      });
      if (res.data.success) {
        setShowModal(false);
        setFormData({
          date: new Date().toISOString().slice(0, 10),
          customer: '',
          buyer: '',
          buyerMobile: '',
          quantityQuintal: '',
          ratePerQuintal: 2500,
          amountReceived: '',
          paymentMethod: 'Cash',
          notes: '',
        });
        fetchData();
      }
    } catch (error) {
      console.error('Bran sale error:', error);
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to log bran sale';
      alert(`Failed to log bran sale: ${message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this bran sale record?')) {
      await api.delete(`/bran-sales/${id}`);
      fetchData();
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-hindi">
            {t('branSales')} (चोकर बिक्री)
          </h1>
          <p className="text-xs text-gray-500 font-hindi mt-0.5">
            Log Bran (Chokar) sales by Quintal, rate/Quintal, received and pending amounts
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white font-hindi text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition flex items-center justify-center space-x-2"
        >
          <Plus size={18} />
          <span>+ चोकर बिक्री जोड़ें (Add Bran Sale)</span>
        </button>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl">
          <p className="text-xs font-bold text-orange-800 uppercase">Bran Stock Remaining</p>
          <p className="text-2xl font-black font-mono text-orange-900">{summary.remainingBran} Qtl</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
          <p className="text-xs font-bold text-emerald-800 uppercase">Total Sales Revenue</p>
          <p className="text-2xl font-black font-mono text-emerald-900">₹{summary.totalSalesAmount?.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
          <p className="text-xs font-bold text-blue-800 uppercase">Amount Received</p>
          <p className="text-2xl font-black font-mono text-blue-900">₹{summary.totalReceived?.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
          <p className="text-xs font-bold text-amber-800 uppercase">Pending Receivable</p>
          <p className="text-2xl font-black font-mono text-amber-900">₹{summary.totalPending?.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold border-b border-gray-200">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Buyer Name</th>
                <th className="py-3 px-4 text-right">Quantity (Qtl)</th>
                <th className="py-3 px-4 text-right">Rate / Qtl</th>
                <th className="py-3 px-4 text-right">Total Sale</th>
                <th className="py-3 px-4 text-right">Received</th>
                <th className="py-3 px-4 text-right">Pending</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium">
              {sales.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono">{new Date(s.date).toLocaleDateString('en-IN')}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">
                    {s.buyer} {s.buyerMobile ? `(${s.buyerMobile})` : ''}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold">{s.quantityQuintal} Qtl</td>
                  <td className="py-3 px-4 text-right font-mono">₹{s.ratePerQuintal}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                    ₹{s.totalSaleAmount?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                    ₹{s.amountReceived?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-amber-800">
                    ₹{s.pendingAmount?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => handleDelete(s._id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
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
            <h2 className="text-lg font-bold text-gray-900 font-hindi mb-4">+ Add Bran Sale (चोकर बिक्री)</h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <FarmerSelector
                value={formData.customer}
                onChange={(farmerId, farmerObj) => {
                  setFormData((prev) => ({
                    ...prev,
                    customer: farmerId,
                    buyer: farmerObj ? farmerObj.name : prev.buyer,
                    buyerMobile: farmerObj ? farmerObj.mobile || prev.buyerMobile : prev.buyerMobile,
                  }));
                }}
                label="Buyer / Farmer (खरीदार / किसान) *"
                required
              />

              <div>
                <label className="block font-bold text-gray-700 mb-1">Buyer Mobile</label>
                <input
                  type="text"
                  placeholder="e.g. 9811223344"
                  value={formData.buyerMobile}
                  onChange={(e) => setFormData({ ...formData, buyerMobile: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Quantity (Quintal) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 5"
                    value={formData.quantityQuintal}
                    onChange={(e) => setFormData({ ...formData, quantityQuintal: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Rate / Quintal (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.ratePerQuintal}
                    onChange={(e) => setFormData({ ...formData, ratePerQuintal: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Amount Received Now (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.amountReceived}
                  onChange={(e) => setFormData({ ...formData, amountReceived: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold font-mono text-emerald-700"
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
                <button type="submit" className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl">
                  Save Bran Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranSales;
