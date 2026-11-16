import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSeason } from '../context/SeasonContext';
import api from '../services/api';
import EditFarmerModal from '../components/EditFarmerModal';
import { exportToCSV } from '../utils/csvExporter';
import { formatBighaBissaDisplay } from '../utils/bighaUtils';
import {
  User,
  Phone,
  MapPin,
  Plus,
  CreditCard,
  Download,
  ArrowLeft,
  Calendar,
  Layers,
  BookOpen,
  Edit,
  Trash2,
  AlertTriangle,
  X,
  CheckCircle,
  Tractor,
} from 'lucide-react';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { selectedSeason } = useSeason();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Payment Form
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // Field Form
  const [fieldName, setFieldName] = useState('');
  const [fieldVillage, setFieldVillage] = useState('');
  const [fieldBigha, setFieldBigha] = useState(0);
  const [fieldBissa, setFieldBissa] = useState(0);

  const fetchCustomer = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers/${id}`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error('Failed to load customer details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id, selectedSeason]);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/payments', {
        customer: id,
        amount: parseFloat(payAmount),
        paymentMethod: payMethod,
        reference: payRef,
        notes: payNotes,
        season: selectedSeason || null,
      });
      if (res.data.success) {
        setShowPaymentModal(false);
        setPayAmount('');
        setPayRef('');
        setPayNotes('');
        fetchCustomer();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to record payment');
    }
  };

  const handleAddField = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/fields', {
        customer: id,
        name: fieldName,
        village: fieldVillage || data?.customer?.village,
        bigha: parseFloat(fieldBigha),
        bissa: parseFloat(fieldBissa),
      });
      if (res.data.success) {
        setShowFieldModal(false);
        setFieldName('');
        setFieldBigha(0);
        setFieldBissa(0);
        fetchCustomer();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add field');
    }
  };

  const handleDeleteFarmer = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await api.delete(`/customers/${id}`);
      if (res.data.success) {
        setShowDeleteModal(false);
        navigate('/customers');
      }
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.hasLinkedRecords) {
        setDeleteError({
          message: err.response.data.message,
          hasLinkedRecords: true,
        });
      } else {
        alert(err.response?.data?.message || 'Failed to delete farmer');
        setShowDeleteModal(false);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeactivateFarmer = async () => {
    try {
      const res = await api.put(`/customers/${id}`, { status: 'Inactive' });
      if (res.data.success) {
        setShowDeleteModal(false);
        fetchCustomer();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to deactivate farmer');
    }
  };

  const handleExportLedger = () => {
    if (!data?.ledger) return;
    const headers = ['Date', 'Type', 'Description', 'Charge (+₹)', 'Payment Received (-₹)', 'Pending Balance (₹)'];
    const rows = data.ledger.map((item) => [
      new Date(item.date).toLocaleDateString('en-IN'),
      item.type,
      `${item.title} - ${item.description}`,
      item.debit,
      item.credit,
      item.runningBalance,
    ]);
    exportToCSV(`BahiKhata_Ledger_${data.customer.name}`, headers, rows);
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-agri-700"></div>
      </div>
    );
  }

  const { customer, fields, financials, ledger } = data;

  return (
    <div>
      {/* Back Button */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/customers')}
          className="text-xs font-bold text-gray-500 hover:text-gray-900 flex items-center space-x-1.5 transition"
        >
          <ArrowLeft size={16} />
          <span>Back to Farmers List (किसानों की सूची पर वापस जाएं)</span>
        </button>

        {/* Action Buttons: Edit & Delete (Admin & Operator) */}
        <div className="flex items-center space-x-2 font-hindi">
          <button
            onClick={() => setShowEditModal(true)}
            className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition border border-blue-200"
          >
            <Edit size={14} />
            <span>Edit Farmer (किसान बदलें)</span>
          </button>
          <button
            onClick={() => {
              setDeleteError(null);
              setShowDeleteModal(true);
            }}
            className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition border border-red-200"
          >
            <Trash2 size={14} />
            <span>Delete Farmer (डिलीट)</span>
          </button>
        </div>
      </div>

      {/* Top Profile Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-agri-700 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            {customer.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-gray-900 font-hindi">{customer.name}</h1>
              {customer.status === 'Inactive' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
                  Inactive
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  Active
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mt-1">
              {customer.village && (
                <span className="flex items-center space-x-1">
                  <MapPin size={14} className="text-agri-600" />
                  <span>{customer.village}</span>
                </span>
              )}
              {customer.mobile && (
                <span className="flex items-center space-x-1 font-mono font-semibold">
                  <Phone size={14} className="text-agri-600" />
                  <span>{customer.mobile}</span>
                </span>
              )}
              {customer.address && (
                <span className="text-gray-500 font-hindi">| {customer.address}</span>
              )}
            </div>
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="flex items-center space-x-3">
          <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-2xl text-center min-w-[100px]">
            <p className="text-[10px] uppercase font-bold text-gray-400">Total Work</p>
            <p className="text-base font-bold font-mono text-gray-900">
              ₹{financials.totalWork.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-center min-w-[100px]">
            <p className="text-[10px] uppercase font-bold text-emerald-600">Total Paid</p>
            <p className="text-base font-bold font-mono text-emerald-700">
              ₹{financials.totalPaid.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-center min-w-[110px]">
            <p className="text-[10px] uppercase font-bold text-amber-700">Pending</p>
            <p className="text-base font-bold font-mono text-amber-800">
              ₹{financials.pending.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons & Fields Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Fields List */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2 font-hindi">
              <Layers size={16} className="text-agri-700" />
              <span>Registered Fields ({fields.length})</span>
            </h3>
            <button
              onClick={() => setShowFieldModal(true)}
              className="text-xs text-agri-700 font-bold hover:underline"
            >
              + Add Field
            </button>
          </div>

          <div className="space-y-2.5">
            {fields.map((f) => (
              <div key={f._id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800 text-xs">{f.name}</p>
                  <p className="text-[10px] text-gray-500">{f.village}</p>
                </div>
                <span className="text-xs font-bold text-agri-800 bg-agri-100 px-2.5 py-1 rounded-lg font-hindi">
                  {formatBighaBissaDisplay(f.bigha, f.bissa)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Payment Action */}
        <div className="lg:col-span-2 bg-gradient-to-r from-agri-900 to-agri-800 p-6 rounded-2xl text-white shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold font-hindi mb-1 flex items-center space-x-2">
              <BookOpen size={20} className="text-amber-400" />
              <span>Digital Bahi-Khata Ledger (डिजिटल बही-खाता)</span>
            </h3>
            <p className="text-xs text-agri-200 font-hindi">
              Every work charge (+) and customer payment (-) automatically computes running pending balance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              onClick={() =>
                navigate('/work-entries', {
                  state: { customerId: customer._id, openModal: true },
                })
              }
              className="bg-white hover:bg-agri-50 text-agri-900 font-bold text-xs py-2.5 px-5 rounded-xl shadow-md transition flex items-center space-x-2"
            >
              <Tractor size={16} className="text-agri-700" />
              <span>+ मशीन का काम जोड़ें (Add Machine Work)</span>
            </button>

            <button
              onClick={() => setShowPaymentModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-agri-950 font-bold text-xs py-2.5 px-5 rounded-xl shadow-md transition flex items-center space-x-2"
            >
              <CreditCard size={16} />
              <span>+ Record Payment Received (भुगतान जमा करें)</span>
            </button>

            <button
              onClick={handleExportLedger}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 px-4 rounded-xl border border-white/20 transition flex items-center space-x-2"
            >
              <Download size={16} />
              <span>Export Ledger CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* BAHI-KHATA LEDGER TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 font-hindi">
            Khata History & Running Balance
          </h3>
          <span className="text-xs text-gray-500 font-mono">Running Balance Calculation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-200">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 text-right">Debit / Charge (+₹)</th>
                <th className="py-3 px-4 text-right">Credit / Payment (-₹)</th>
                <th className="py-3 px-4 text-right">Pending Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium">
              {ledger.map((item) => (
                <tr key={item.id} className={item.type === 'PAYMENT' ? 'bg-emerald-50/40' : 'hover:bg-gray-50'}>
                  <td className="py-3 px-4 font-mono">
                    {new Date(item.date).toLocaleDateString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.type === 'WORK' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-gray-900 font-hindi">{item.title}</p>
                    <p className="text-[10px] text-gray-500">{item.description}</p>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                    {item.debit > 0 ? `+₹${item.debit.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                    {item.credit > 0 ? `-₹${item.credit.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-amber-800">
                    ₹{item.runningBalance.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT FARMER MODAL */}
      <EditFarmerModal
        isOpen={showEditModal}
        farmer={customer}
        onClose={() => setShowEditModal(false)}
        onFarmerUpdated={() => fetchCustomer()}
      />

      {/* DELETE / DEACTIVATE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 font-hindi">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-red-100 text-red-700 rounded-xl">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Delete Farmer? (किसान डिलीट करें)
                  </h3>
                  <p className="text-[11px] text-gray-500">Confirm deletion or safe deactivation</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteError(null);
                }}
                className="text-gray-400 hover:text-gray-600 font-bold p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Farmer Details Box */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl mb-4 text-xs space-y-1">
              <p><span className="font-bold text-gray-700">Farmer:</span> <span className="font-bold text-gray-900">{customer.name}</span></p>
              {customer.mobile && <p><span className="font-bold text-gray-700">Mobile:</span> <span className="font-mono">{customer.mobile}</span></p>}
              {customer.village && <p><span className="font-bold text-gray-700">Village:</span> {customer.village}</p>}
            </div>

            {/* LINKED RECORDS WARNING */}
            {deleteError && deleteError.hasLinkedRecords ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium rounded-2xl space-y-2">
                  <p className="font-bold text-amber-950 flex items-center space-x-1.5">
                    <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                    <span>डिलीट अस्वीकृत (Deletion Blocked)</span>
                  </p>
                  <p>{deleteError.message}</p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900">
                  <p className="font-bold mb-1">Recommended Solution (सुरक्षित विकल्प):</p>
                  <p className="text-[11px] text-gray-700">
                    Deactivating this farmer retains historical financial ledgers while hiding the farmer from new work entry forms.
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteError(null);
                    }}
                    className="px-4 py-2.5 border border-gray-300 rounded-xl font-bold text-xs text-gray-700 hover:bg-gray-50"
                  >
                    Cancel (रद्द करें)
                  </button>
                  <button
                    type="button"
                    onClick={handleDeactivateFarmer}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    Deactivate Farmer (किसान को निष्क्रिय करें)
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-600 mb-5">
                  Are you sure you want to permanently delete this farmer? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2.5 border border-gray-300 rounded-xl font-bold text-xs text-gray-700 hover:bg-gray-50"
                  >
                    Cancel (रद्द करें)
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleDeleteFarmer}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Farmer (डिलीट करें)'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 font-hindi mb-4">
              + भुगतान जमा करें (Record Payment Received)
            </h2>
            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Amount Received (राशि ₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 4000"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold font-mono text-emerald-700 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Payment Method (भुगतान माध्यम) *</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                >
                  <option value="Cash">Cash (नकद)</option>
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="Bank Transfer">Bank Transfer (बैंक ट्रांसफर)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Reference / Transaction ID</label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref 12345"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Partial cash payment after harvest"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                >
                  Record Payment (जमा करें)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD FIELD MODAL */}
      {showFieldModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 font-hindi mb-4">
              + नया खेत जोड़ें (Add Field)
            </h2>
            <form onSubmit={handleAddField} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Field Name (खेत का नाम) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Field 1 (North Khet)"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Village / Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rampur"
                  value={fieldVillage}
                  onChange={(e) => setFieldVillage(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Bigha (बीघा)</label>
                  <input
                    type="number"
                    min="0"
                    value={fieldBigha}
                    onChange={(e) => setFieldBigha(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Bissa (बिस्सा)</label>
                  <input
                    type="number"
                    min="0"
                    max="19"
                    value={fieldBissa}
                    onChange={(e) => setFieldBissa(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowFieldModal(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-agri-700 hover:bg-agri-800 text-white font-bold rounded-xl shadow-md"
                >
                  Save Field (सुरक्षित करें)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;
