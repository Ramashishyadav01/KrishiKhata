import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSeason } from '../context/SeasonContext';
import api from '../services/api';
import { HardHat, Plus, Calendar, CreditCard } from 'lucide-react';

const Labour = () => {
  const { t } = useLanguage();
  const { selectedSeason } = useSeason();

  const [labourers, setLabourers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLabourModal, setShowLabourModal] = useState(false);
  const [showAttModal, setShowAttModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  // Forms
  const [labourName, setLabourName] = useState('');
  const [labourMobile, setLabourMobile] = useState('');
  const [labourWage, setLabourWage] = useState(500);

  const [attLabour, setAttLabour] = useState('');
  const [attDate, setAttDate] = useState(new Date().toISOString().slice(0, 10));
  const [attStatus, setAttStatus] = useState('Present');

  const [payLabour, setPayLabour] = useState('');
  const [payAmount, setPayAmount] = useState('');

  const fetchLabourers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/labour');
      if (res.data.success) setLabourers(res.data.labourers);
    } catch (error) {
      console.error('Failed to fetch labour:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabourers();
  }, []);

  const handleAddLabour = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/labour', { name: labourName, mobile: labourMobile, dailyWage: parseFloat(labourWage) });
      if (res.data.success) {
        setShowLabourModal(false);
        setLabourName('');
        fetchLabourers();
      }
    } catch (error) {
      alert('Failed to add labourer');
    }
  };

  const handleAttendance = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/labour/attendance', { labourId: attLabour, date: attDate, status: attStatus });
      if (res.data.success) {
        setShowAttModal(false);
        fetchLabourers();
      }
    } catch (error) {
      alert('Failed to mark attendance');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/labour/payment', { labourId: payLabour, amount: parseFloat(payAmount), season: selectedSeason || null });
      if (res.data.success) {
        setShowPayModal(false);
        setPayAmount('');
        fetchLabourers();
      }
    } catch (error) {
      alert('Failed to record wage payment');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-hindi">
            {t('labour')} (मजदूर प्रबंधन)
          </h1>
          <p className="text-xs text-gray-500 font-hindi mt-0.5">
            Track daily wages, attendance (Present/Absent/Half Day), and wage payments
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAttModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-hindi text-xs font-bold py-2.5 px-3 rounded-xl shadow-md transition flex items-center space-x-1.5"
          >
            <Calendar size={16} />
            <span>+ हाजिरी (Attendance)</span>
          </button>
          <button
            onClick={() => setShowPayModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-hindi text-xs font-bold py-2.5 px-3 rounded-xl shadow-md transition flex items-center space-x-1.5"
          >
            <CreditCard size={16} />
            <span>+ मजदूर भुगतान (Pay)</span>
          </button>
          <button
            onClick={() => setShowLabourModal(true)}
            className="bg-agri-700 hover:bg-agri-800 text-white font-hindi text-xs font-bold py-2.5 px-3 rounded-xl shadow-md transition flex items-center space-x-1.5"
          >
            <Plus size={16} />
            <span>+ नया मजदूर (Add Labour)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {labourers.map((l) => (
          <div key={l._id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-purple-100 text-purple-800 rounded-xl font-bold">
                  <HardHat size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm font-hindi">{l.name}</h3>
                  <p className="text-[11px] font-mono text-gray-500">{l.mobile}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Daily Wage:</span>
                  <span className="font-bold text-gray-800">₹{l.dailyWage}/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Present Days:</span>
                  <span className="font-bold text-purple-700">{l.presentDays || 0} days</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-500 font-bold">Pending Wage:</span>
                  <span className="font-bold font-mono text-amber-800 text-sm">₹{(l.pending || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD LABOUR MODAL */}
      {showLabourModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 font-hindi mb-4">+ Add Labourer</h2>
            <form onSubmit={handleAddLabour} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Labour Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ram"
                  value={labourName}
                  onChange={(e) => setLabourName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  placeholder="e.g. 9111111111"
                  value={labourMobile}
                  onChange={(e) => setLabourMobile(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Daily Wage (₹) *</label>
                <input
                  type="number"
                  required
                  value={labourWage}
                  onChange={(e) => setLabourWage(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowLabourModal(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-agri-700 hover:bg-agri-800 text-white font-bold rounded-xl">
                  Save Labourer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MARK ATTENDANCE MODAL */}
      {showAttModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 font-hindi mb-4">+ Mark Labour Attendance</h2>
            <form onSubmit={handleAttendance} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Labourer *</label>
                <select
                  required
                  value={attLabour}
                  onChange={(e) => setAttLabour(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                >
                  <option value="">Select Labourer</option>
                  {labourers.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={attDate}
                    onChange={(e) => setAttDate(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status *</label>
                  <select
                    value={attStatus}
                    onChange={(e) => setAttStatus(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                  >
                    <option value="Present">Present (उपस्थित)</option>
                    <option value="Absent">Absent (अनुपस्थित)</option>
                    <option value="Half Day">Half Day (आधा दिन)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAttModal(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl">
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LABOUR PAYMENT MODAL */}
      {showPayModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 font-hindi mb-4">+ Record Labour Wage Payment</h2>
            <form onSubmit={handlePayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Labourer *</label>
                <select
                  required
                  value={payLabour}
                  onChange={(e) => setPayLabour(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                >
                  <option value="">Select Labourer</option>
                  {labourers.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.name} (Pending: ₹{l.pending})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Amount Paid (₹) *</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold font-mono text-emerald-700 text-sm"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl">
                  Save Wage Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Labour;
