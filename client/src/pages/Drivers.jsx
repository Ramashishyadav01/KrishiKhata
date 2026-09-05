import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSeason } from '../context/SeasonContext';
import api from '../services/api';
import { UserCheck, Plus, CheckCircle, Calendar, CreditCard } from 'lucide-react';

const Drivers = () => {
  const { t } = useLanguage();
  const { selectedSeason } = useSeason();

  const [drivers, setDrivers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showAttModal, setShowAttModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  // Driver Form
  const [driverName, setDriverName] = useState('');
  const [driverMobile, setDriverMobile] = useState('');
  const [driverSalaryType, setDriverSalaryType] = useState('Daily');
  const [driverDailyRate, setDriverDailyRate] = useState(600);
  const [driverMonthlySalary, setDriverMonthlySalary] = useState(18000);

  // Attendance Form
  const [attDriver, setAttDriver] = useState('');
  const [attDate, setAttDate] = useState(new Date().toISOString().slice(0, 10));
  const [attStatus, setAttStatus] = useState('Present');
  const [attMachine, setAttMachine] = useState('');
  const [attWork, setAttWork] = useState('');

  // Payment Form
  const [payDriver, setPayDriver] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resDrv, resMach] = await Promise.all([api.get('/drivers'), api.get('/machines')]);
      if (resDrv.data.success) setDrivers(resDrv.data.drivers);
      if (resMach.data.success) setMachines(resMach.data.machines);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddDriver = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/drivers', {
        name: driverName,
        mobile: driverMobile,
        salaryType: driverSalaryType,
        dailyRate: parseFloat(driverDailyRate),
        monthlySalary: parseFloat(driverMonthlySalary),
      });
      if (res.data.success) {
        setShowDriverModal(false);
        setDriverName('');
        setDriverMobile('');
        fetchData();
      }
    } catch (error) {
      alert('Failed to add driver');
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/drivers/attendance', {
        driverId: attDriver,
        date: attDate,
        status: attStatus,
        machine: attMachine || null,
        workPerformed: attWork,
      });
      if (res.data.success) {
        setShowAttModal(false);
        fetchData();
      }
    } catch (error) {
      alert('Failed to mark attendance');
    }
  };

  const handlePayDriver = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/drivers/payment', {
        driverId: payDriver,
        amount: parseFloat(payAmount),
        paymentMethod: payMethod,
        season: selectedSeason || null,
      });
      if (res.data.success) {
        setShowPayModal(false);
        setPayAmount('');
        fetchData();
      }
    } catch (error) {
      alert('Failed to record driver payment');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-hindi">
            {t('drivers')} (ड्राइवर प्रबंधन)
          </h1>
          <p className="text-xs text-gray-500 font-hindi mt-0.5">
            Track driver attendance (Present/Absent/Half Day), earnings, and salary payments
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAttModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-hindi text-xs font-bold py-2.5 px-3 rounded-xl shadow-md transition flex items-center space-x-1.5"
          >
            <Calendar size={16} />
            <span>+ हाजिरी (Attendance)</span>
          </button>
          <button
            onClick={() => setShowPayModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-hindi text-xs font-bold py-2.5 px-3 rounded-xl shadow-md transition flex items-center space-x-1.5"
          >
            <CreditCard size={16} />
            <span>+ भुगतान (Salary Pay)</span>
          </button>
          <button
            onClick={() => setShowDriverModal(true)}
            className="bg-agri-700 hover:bg-agri-800 text-white font-hindi text-xs font-bold py-2.5 px-3 rounded-xl shadow-md transition flex items-center space-x-1.5"
          >
            <Plus size={16} />
            <span>+ नया ड्राइवर (Add Driver)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.map((d) => (
          <div key={d._id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-indigo-100 text-indigo-800 rounded-xl font-bold">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm font-hindi">{d.name}</h3>
                  <p className="text-[11px] font-mono text-gray-500">{d.mobile}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Salary Type:</span>
                  <span className="font-bold text-gray-800">{d.salaryType} ({d.salaryType === 'Daily' ? `₹${d.dailyRate}/day` : `₹${d.monthlySalary}/mo`})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Present Days:</span>
                  <span className="font-bold text-indigo-700">{d.presentDays || 0} days</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-500 font-bold">Pending Salary:</span>
                  <span className="font-bold font-mono text-amber-800 text-sm">₹{(d.pending || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD DRIVER MODAL */}
      {showDriverModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 font-hindi mb-4">+ Add Driver</h2>
            <form onSubmit={handleAddDriver} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Driver Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Raj Kumar"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Mobile Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9123456789"
                  value={driverMobile}
                  onChange={(e) => setDriverMobile(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Salary Type</label>
                  <select
                    value={driverSalaryType}
                    onChange={(e) => setDriverSalaryType(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                  >
                    <option value="Daily">Daily Rate</option>
                    <option value="Monthly">Monthly Salary</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Rate (₹)</label>
                  <input
                    type="number"
                    value={driverSalaryType === 'Daily' ? driverDailyRate : driverMonthlySalary}
                    onChange={(e) =>
                      driverSalaryType === 'Daily'
                        ? setDriverDailyRate(e.target.value)
                        : setDriverMonthlySalary(e.target.value)
                    }
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDriverModal(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-agri-700 hover:bg-agri-800 text-white font-bold rounded-xl">
                  Save Driver
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
            <h2 className="text-lg font-bold text-gray-900 font-hindi mb-4">+ Mark Driver Attendance</h2>
            <form onSubmit={handleMarkAttendance} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Driver *</label>
                <select
                  required
                  value={attDriver}
                  onChange={(e) => setAttDriver(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                >
                  <option value="">Select Driver</option>
                  {drivers.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
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
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl">
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRIVER PAYMENT MODAL */}
      {showPayModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 font-hindi mb-4">+ Record Driver Salary Payment</h2>
            <form onSubmit={handlePayDriver} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Driver *</label>
                <select
                  required
                  value={payDriver}
                  onChange={(e) => setPayDriver(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                >
                  <option value="">Select Driver</option>
                  {drivers.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} (Pending: ₹{d.pending})
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
                  Save Salary Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;
