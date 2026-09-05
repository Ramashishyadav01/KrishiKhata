import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSeason } from '../context/SeasonContext';
import api from '../services/api';
import FarmerSelector from '../components/FarmerSelector';
import { CreditCard, Plus, Trash2 } from 'lucide-react';

const Payments = () => {
  const { t } = useLanguage();
  const { selectedSeason } = useSeason();

  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    customer: '',
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    paymentMethod: 'Cash',
    reference: '',
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resPay, resCust] = await Promise.all([
        api.get(`/payments?season=${selectedSeason || ''}`),
        api.get('/customers'),
      ]);
      if (resPay.data.success) setPayments(resPay.data.payments);
      if (resCust.data.success) setCustomers(resCust.data.customers);
    } catch (error) {
      console.error('Failed to load payments:', error);
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
      const res = await api.post('/payments', {
        ...formData,
        season: selectedSeason || null,
      });
      if (res.data.success) {
        setShowModal(false);
        setFormData({ customer: '', date: new Date().toISOString().slice(0, 10), amount: '', paymentMethod: 'Cash', reference: '', notes: '' });
        fetchData();
      }
    } catch (error) {
      alert('Failed to record payment');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this payment record?')) {
      await api.delete(`/payments/${id}`);
      fetchData();
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-hindi">
            {t('payments')} (भुगतान प्रविष्टि)
          </h1>
          <p className="text-xs text-gray-500 font-hindi mt-0.5">
            Log all farmer payments (Cash, UPI, Bank Transfer)
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-hindi text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition flex items-center justify-center space-x-2"
        >
          <Plus size={18} />
          <span>+ नया भुगतान (Record Payment)</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold border-b border-gray-200">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4 text-right">Amount Paid</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium">
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono">{new Date(p.date).toLocaleDateString('en-IN')}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{p.customer?.name} ({p.customer?.village})</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                      {p.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{p.reference || '-'}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                    ₹{p.amount?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => handleDelete(p._id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
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
            <h2 className="text-lg font-bold text-gray-900 font-hindi mb-4">+ Record Customer Payment</h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <FarmerSelector
                value={formData.customer}
                onChange={(farmerId) => setFormData({ ...formData, customer: farmerId })}
                label="Farmer (किसान) *"
                required
              />

              <div>
                <label className="block font-bold text-gray-700 mb-1">Amount Received (₹) *</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold font-mono text-emerald-700 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                >
                  <option value="Cash">Cash (नकद)</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Reference / Txn ID</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
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
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
