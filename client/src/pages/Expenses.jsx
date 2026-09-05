import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSeason } from '../context/SeasonContext';
import api from '../services/api';
import { Receipt, Plus, Trash2 } from 'lucide-react';

const Expenses = () => {
  const { t } = useLanguage();
  const { selectedSeason } = useSeason();

  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ totalExpense: 0, categoryTotals: {} });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    category: 'Other',
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    description: '',
    paymentMethod: 'Cash',
    vendor: '',
    notes: '',
  });

  const categories = [
    'Diesel',
    'Petrol',
    'Electricity',
    'Repair',
    'Spare Parts',
    'Labour',
    'Driver',
    'Transport',
    'Maintenance',
    'Other',
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/expenses?season=${selectedSeason || ''}`);
      if (res.data.success) {
        setExpenses(res.data.expenses);
        setSummary(res.data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
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
      const res = await api.post('/expenses', {
        ...formData,
        season: selectedSeason || null,
      });
      if (res.data.success) {
        setShowModal(false);
        setFormData({
          category: 'Other',
          date: new Date().toISOString().slice(0, 10),
          amount: '',
          description: '',
          paymentMethod: 'Cash',
          vendor: '',
          notes: '',
        });
        fetchData();
      }
    } catch (error) {
      alert('Failed to log expense');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this expense entry?')) {
      await api.delete(`/expenses/${id}`);
      fetchData();
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-hindi">
            {t('expenses')} (सामान्य खर्चे)
          </h1>
          <p className="text-xs text-gray-500 font-hindi mt-0.5">
            Log all business operating costs categorized by type
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white font-hindi text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition flex items-center justify-center space-x-2"
        >
          <Plus size={18} />
          <span>+ नया खर्चा (Add Expense)</span>
        </button>
      </div>

      <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl mb-6">
        <p className="text-xs font-bold text-rose-800 uppercase">Total Operating Expenses</p>
        <p className="text-2xl font-black font-mono text-rose-900">₹{summary.totalExpense?.toLocaleString('en-IN')}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold border-b border-gray-200">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium">
              {expenses.map((ex) => (
                <tr key={ex._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono">{new Date(ex.date).toLocaleDateString('en-IN')}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 bg-gray-100 font-bold text-gray-700 rounded-lg text-[10px]">
                      {ex.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-900 font-hindi">{ex.description}</td>
                  <td className="py-3 px-4 text-gray-500">{ex.vendor || '-'}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-700">
                    ₹{ex.amount?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => handleDelete(ex._id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
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
            <h2 className="text-lg font-bold text-gray-900 font-hindi mb-4">+ Add General Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Expense Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description (विवरण) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rice Mill electricity bill"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 4500"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold font-mono text-rose-700"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Vendor / Payee</label>
                <input
                  type="text"
                  placeholder="e.g. UPPCL State Board"
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
                <button type="submit" className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl">
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
