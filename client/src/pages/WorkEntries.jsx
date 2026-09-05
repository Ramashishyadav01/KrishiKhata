import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSeason } from '../context/SeasonContext';
import api from '../services/api';
import FarmerSelector from '../components/FarmerSelector';
import { calculateBighaCost, formatBighaBissaDisplay } from '../utils/bighaUtils';
import { Plus, Search, Filter, Trash2, Calendar, FileText, CheckCircle } from 'lucide-react';

const WorkEntries = () => {
  const { t } = useLanguage();
  const { selectedSeason } = useSeason();

  const [entries, setEntries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [fields, setFields] = useState([]);
  const [machines, setMachines] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    customer: '',
    field: '',
    village: '',
    date: new Date().toISOString().slice(0, 10),
    season: selectedSeason || '',
    machine: '',
    billingUnit: 'Bigha',
    bigha: 0,
    bissa: 0,
    hours: 0,
    trips: 0,
    quantity: 1,
    rate: 0,
    paidAmount: 0,
    driver: '',
    description: '',
    notes: '',
  });

  const fetchInitial = async () => {
    setLoading(true);
    try {
      const [resWork, resCust, resMach, resDrv] = await Promise.all([
        api.get(`/work-entries?season=${selectedSeason || ''}`),
        api.get('/customers'),
        api.get('/machines'),
        api.get('/drivers'),
      ]);
      if (resWork.data.success) setEntries(resWork.data.workEntries);
      if (resCust.data.success) setCustomers(resCust.data.customers);
      if (resMach.data.success) setMachines(resMach.data.machines);
      if (resDrv.data.success) setDrivers(resDrv.data.drivers);
    } catch (error) {
      console.error('Failed to fetch work entry data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitial();
  }, [selectedSeason]);

  // When customer changes, load customer's fields & default village
  const handleCustomerChange = async (customerId, farmerObj) => {
    const cust = farmerObj || customers.find((c) => c._id === customerId);
    setFormData((prev) => ({
      ...prev,
      customer: customerId,
      village: cust ? cust.village : prev.village,
      field: '',
    }));
    if (customerId) {
      const res = await api.get(`/fields?customer=${customerId}`);
      if (res.data.success) setFields(res.data.fields);
    } else {
      setFields([]);
    }
  };

  // When machine changes, set default billing unit & default rate
  const handleMachineChange = (machineId) => {
    const m = machines.find((mac) => mac._id === machineId);
    if (m) {
      setFormData((prev) => ({
        ...prev,
        machine: machineId,
        billingUnit: m.billingUnit,
        rate: m.defaultRate,
      }));
    }
  };

  // Calculate live total amount
  const computeTotal = () => {
    const r = parseFloat(formData.rate) || 0;
    if (formData.billingUnit === 'Bigha') {
      return calculateBighaCost(formData.bigha, formData.bissa, r);
    } else if (formData.billingUnit === 'Hour') {
      return Math.round((parseFloat(formData.hours) || 0) * r);
    } else if (formData.billingUnit === 'Trip') {
      return Math.round((parseFloat(formData.trips) || 0) * r);
    } else {
      return Math.round((parseFloat(formData.quantity) || 1) * r);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        season: selectedSeason || formData.season,
      };
      const res = await api.post('/work-entries', payload);
      if (res.data.success) {
        setShowModal(false);
        fetchInitial();
        setFormData({
          customer: '',
          field: '',
          village: '',
          date: new Date().toISOString().slice(0, 10),
          season: selectedSeason || '',
          machine: '',
          billingUnit: 'Bigha',
          bigha: 0,
          bissa: 0,
          hours: 0,
          trips: 0,
          quantity: 1,
          rate: 0,
          paidAmount: 0,
          driver: '',
          description: '',
          notes: '',
        });
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create work entry');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this work entry?')) {
      await api.delete(`/work-entries/${id}`);
      fetchInitial();
    }
  };

  const computedTotalAmount = computeTotal();

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-hindi">
            {t('workEntries')} (काम की प्रविष्टि)
          </h1>
          <p className="text-xs text-gray-500 font-hindi mt-0.5">
            Dynamic billing based on machine type (Bigha, Hour, Trip, Custom)
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-agri-700 hover:bg-agri-800 text-white font-hindi text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition flex items-center justify-center space-x-2"
        >
          <Plus size={18} />
          <span>+ नया काम जोड़ें (Add Work Entry)</span>
        </button>
      </div>

      {/* Work Entries Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold border-b border-gray-200">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer & Village</th>
                <th className="py-3 px-4">Machine / Service</th>
                <th className="py-3 px-4">Quantity / Area</th>
                <th className="py-3 px-4 text-right">Rate</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {entries.length > 0 ? (
                entries.map((w) => (
                  <tr key={w._id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-medium">
                      {new Date(w.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900">{w.customer?.name || 'N/A'}</p>
                      <p className="text-[10px] text-gray-500">{w.village || w.field?.name || ''}</p>
                    </td>
                    <td className="py-3.5 px-4 font-hindi">
                      <span className="font-bold text-agri-900">
                        {w.machine ? `${w.machine.nameEn} (${w.machine.nameHi})` : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-hindi font-medium text-gray-700">
                      {w.billingUnit === 'Bigha' && formatBighaBissaDisplay(w.bigha, w.bissa)}
                      {w.billingUnit === 'Hour' && `${w.hours} घंटे (Hours)`}
                      {w.billingUnit === 'Trip' && `${w.trips} चक्कर (Trips)`}
                      {w.billingUnit !== 'Bigha' && w.billingUnit !== 'Hour' && w.billingUnit !== 'Trip' && `${w.quantity || 1} units`}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">₹{w.rate}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">
                      ₹{w.totalAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          w.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : w.paymentStatus === 'PARTIAL'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {w.paymentStatus === 'PAID' ? t('paid') : w.paymentStatus === 'PARTIAL' ? t('partial') : t('pending')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleDelete(w._id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-400 font-hindi">
                    No work entries recorded for this season.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DYNAMIC WORK ENTRY MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
              <h2 className="text-lg font-bold text-gray-900 font-hindi">
                + नया काम जोड़ें (Add Work Entry)
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FarmerSelector
                  value={formData.customer}
                  onChange={(farmerId, farmerObj) => handleCustomerChange(farmerId, farmerObj)}
                  label="Farmer (किसान) *"
                  required
                />

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Field (खेत) / Village</label>
                  <select
                    value={formData.field}
                    onChange={(e) => {
                      const f = fields.find((fl) => fl._id === e.target.value);
                      setFormData({
                        ...formData,
                        field: e.target.value,
                        village: f ? f.village : formData.village,
                        bigha: f ? f.bigha : formData.bigha,
                        bissa: f ? f.bissa : formData.bissa,
                      });
                    }}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                  >
                    <option value="">Select Field (Optional)</option>
                    {fields.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.name} ({f.bigha} बीघा {f.bissa} बिस्सा)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Machine / Service (मशीन) *</label>
                  <select
                    required
                    value={formData.machine}
                    onChange={(e) => handleMachineChange(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium font-hindi"
                  >
                    <option value="">Select Machine</option>
                    {machines.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.nameEn} ({m.nameHi}) - ₹{m.defaultRate}/{m.billingUnit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Date (तारीख) *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* DYNAMIC FIELD SECTION ACCORDING TO BILLING UNIT */}
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
                <h4 className="font-bold text-amber-900 mb-2 uppercase text-[10px] tracking-wider">
                  Billing Metrics ({formData.billingUnit} Based)
                </h4>

                {formData.billingUnit === 'Bigha' && (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Bigha (बीघा)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.bigha}
                        onChange={(e) => setFormData({ ...formData, bigha: e.target.value })}
                        className="w-full p-2 bg-white border border-amber-300 rounded-lg text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Bissa (बिस्सा - max 19)</label>
                      <input
                        type="number"
                        min="0"
                        max="19"
                        value={formData.bissa}
                        onChange={(e) => setFormData({ ...formData, bissa: e.target.value })}
                        className="w-full p-2 bg-white border border-amber-300 rounded-lg text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Rate / Bigha (₹)</label>
                      <input
                        type="number"
                        value={formData.rate}
                        onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                        className="w-full p-2 bg-white border border-amber-300 rounded-lg text-center font-bold text-agri-900"
                      />
                    </div>
                  </div>
                )}

                {formData.billingUnit === 'Hour' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Hours Worked (घंटे)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={formData.hours}
                        onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                        className="w-full p-2 bg-white border border-amber-300 rounded-lg text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Rate / Hour (₹)</label>
                      <input
                        type="number"
                        value={formData.rate}
                        onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                        className="w-full p-2 bg-white border border-amber-300 rounded-lg text-center font-bold text-agri-900"
                      />
                    </div>
                  </div>
                )}

                {formData.billingUnit === 'Trip' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Total Trips (चक्कर)</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.trips}
                        onChange={(e) => setFormData({ ...formData, trips: e.target.value })}
                        className="w-full p-2 bg-white border border-amber-300 rounded-lg text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Rate / Trip (₹)</label>
                      <input
                        type="number"
                        value={formData.rate}
                        onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                        className="w-full p-2 bg-white border border-amber-300 rounded-lg text-center font-bold text-agri-900"
                      />
                    </div>
                  </div>
                )}

                {formData.billingUnit !== 'Bigha' && formData.billingUnit !== 'Hour' && formData.billingUnit !== 'Trip' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Quantity (मात्रा)</label>
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className="w-full p-2 bg-white border border-amber-300 rounded-lg text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Rate (₹)</label>
                      <input
                        type="number"
                        value={formData.rate}
                        onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                        className="w-full p-2 bg-white border border-amber-300 rounded-lg text-center font-bold text-agri-900"
                      />
                    </div>
                  </div>
                )}

                {/* COMPUTED SUMMARY */}
                <div className="mt-3 pt-3 border-t border-amber-200/80 flex items-center justify-between">
                  <span className="font-bold text-amber-900">Total Calculated Amount (कुल बिल):</span>
                  <span className="text-xl font-black font-mono text-agri-900">
                    ₹{computedTotalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Initial Cash Received (नकद जमा)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.paidAmount}
                    onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold font-mono text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Driver / Operator</label>
                  <select
                    value={formData.driver}
                    onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
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
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Land preparation for Wheat crop"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  className="px-6 py-2.5 bg-agri-700 hover:bg-agri-800 text-white font-bold rounded-xl shadow-md"
                >
                  Save Work Entry (सुरक्षित करें)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkEntries;
