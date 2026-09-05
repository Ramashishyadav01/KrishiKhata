import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import AddFarmerModal from '../components/AddFarmerModal';
import EditFarmerModal from '../components/EditFarmerModal';
import {
  Plus,
  Search,
  UserCheck,
  MapPin,
  Phone,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
  Filter,
} from 'lucide-react';

const Customers = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active'); // Active, Inactive, All
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState(null);
  const [deletingFarmer, setDeletingFarmer] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/customers?search=${encodeURIComponent(search)}&status=${encodeURIComponent(statusFilter)}`
      );
      if (res.data.success) setCustomers(res.data.customers);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter]);

  const handleDeleteClick = (farmer, e) => {
    e.stopPropagation();
    setDeletingFarmer(farmer);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingFarmer) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await api.delete(`/customers/${deletingFarmer._id}`);
      if (res.data.success) {
        setDeletingFarmer(null);
        fetchCustomers();
      }
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.hasLinkedRecords) {
        setDeleteError({
          message: err.response.data.message,
          hasLinkedRecords: true,
        });
      } else {
        alert(err.response?.data?.message || 'Failed to delete farmer.');
        setDeletingFarmer(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeactivateFarmer = async (farmer) => {
    try {
      const res = await api.put(`/customers/${farmer._id}`, { status: 'Inactive' });
      if (res.data.success) {
        setDeletingFarmer(null);
        setDeleteError(null);
        fetchCustomers();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to deactivate farmer.');
    }
  };

  const handleActivateFarmer = async (farmer, e) => {
    e.stopPropagation();
    try {
      const res = await api.put(`/customers/${farmer._id}`, { status: 'Active' });
      if (res.data.success) {
        fetchCustomers();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to activate farmer.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-hindi">
            {t('customers')} (किसान / ग्राहक)
          </h1>
          <p className="text-xs text-gray-500 font-hindi mt-0.5">
            View, search, edit and manage farmer accounts and financial ledgers
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-agri-700 hover:bg-agri-800 text-white font-hindi text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition flex items-center justify-center space-x-2 shrink-0"
        >
          <Plus size={18} />
          <span>+ Add New Farmer (नया किसान जोड़ें)</span>
        </button>
      </div>

      {/* Search Bar & Status Filter */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 font-hindi">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by farmer name, mobile number, or village (नाम, नंबर या गाँव खोजें)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-xl shrink-0 text-xs font-bold">
          <button
            onClick={() => setStatusFilter('Active')}
            className={`px-3 py-1.5 rounded-lg transition ${
              statusFilter === 'Active' ? 'bg-white text-emerald-800 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active Farmers (सक्रिय)
          </button>
          <button
            onClick={() => setStatusFilter('Inactive')}
            className={`px-3 py-1.5 rounded-lg transition ${
              statusFilter === 'Inactive' ? 'bg-white text-red-800 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Inactive Farmers (निष्क्रिय)
          </button>
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 rounded-lg transition ${
              statusFilter === 'All' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Farmers (सभी)
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-agri-700"></div>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm font-hindi">
          <p className="text-gray-400 text-sm mb-2">No farmers found matching search criteria.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-2 text-xs font-bold text-amber-700 hover:underline inline-flex items-center space-x-1"
          >
            <Plus size={14} />
            <span>Add your first farmer (पहला किसान जोड़ें)</span>
          </button>
        </div>
      ) : (
        /* Customer Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {customers.map((c) => (
            <div
              key={c._id}
              onClick={() => navigate(`/customers/${c._id}`)}
              className={`bg-white rounded-3xl p-5 border shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between ${
                c.status === 'Inactive' ? 'border-gray-300 opacity-75 bg-gray-50/50' : 'border-gray-200 hover:border-amber-400'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-agri-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm flex items-center space-x-1.5 font-hindi">
                        <span>{c.name}</span>
                        {c.status === 'Inactive' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                            Inactive
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center space-x-1 mt-0.5 font-hindi">
                        <MapPin size={12} className="text-gray-400" />
                        <span>{c.village || 'No village specified'}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 flex items-center space-x-1.5 mb-4 font-mono font-medium">
                  <Phone size={13} className="text-gray-400" />
                  <span>{c.mobile || 'No mobile number'}</span>
                </p>

                {/* Financial Summary Box */}
                <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-2xl text-center border border-gray-100 mb-4">
                  <div>
                    <p className="text-[10px] text-gray-500 font-semibold font-hindi">Total Work</p>
                    <p className="text-xs font-bold font-mono text-gray-900">
                      ₹{(c.totalWork || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-semibold font-hindi">Paid</p>
                    <p className="text-xs font-bold font-mono text-emerald-700">
                      ₹{(c.totalPaid || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-semibold font-hindi">Pending</p>
                    <p className="text-xs font-bold font-mono text-amber-700">
                      ₹{(c.pending || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS (Both Admin and Operator) */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 font-hindi">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/customers/${c._id}`);
                  }}
                  className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs flex items-center justify-center space-x-1 transition"
                >
                  <Eye size={14} />
                  <span>View (देखें)</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingFarmer(c);
                  }}
                  className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl font-bold text-xs flex items-center justify-center space-x-1 transition"
                >
                  <Edit size={14} />
                  <span>Edit (एडिट)</span>
                </button>

                {c.status === 'Inactive' ? (
                  <button
                    type="button"
                    onClick={(e) => handleActivateFarmer(c, e)}
                    className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs flex items-center space-x-1 transition"
                    title="Activate Farmer"
                  >
                    <CheckCircle size={14} />
                    <span>Activate</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteClick(c, e)}
                    className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-bold text-xs flex items-center space-x-1 transition"
                    title="Delete Farmer"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REUSABLE ADD FARMER MODAL */}
      <AddFarmerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onFarmerCreated={() => fetchCustomers()}
      />

      {/* EDIT FARMER MODAL */}
      <EditFarmerModal
        isOpen={Boolean(editingFarmer)}
        farmer={editingFarmer}
        onClose={() => setEditingFarmer(null)}
        onFarmerUpdated={() => fetchCustomers()}
      />

      {/* DELETE / DEACTIVATE CONFIRMATION MODAL */}
      {deletingFarmer && (
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
                  setDeletingFarmer(null);
                  setDeleteError(null);
                }}
                className="text-gray-400 hover:text-gray-600 font-bold p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Farmer Details Box */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl mb-4 text-xs space-y-1">
              <p><span className="font-bold text-gray-700">Farmer:</span> <span className="font-bold text-gray-900">{deletingFarmer.name}</span></p>
              {deletingFarmer.mobile && <p><span className="font-bold text-gray-700">Mobile:</span> <span className="font-mono">{deletingFarmer.mobile}</span></p>}
              {deletingFarmer.village && <p><span className="font-bold text-gray-700">Village:</span> {deletingFarmer.village}</p>}
            </div>

            {/* ERROR ALERT IF FARMER HAS LINKED RECORDS */}
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
                      setDeletingFarmer(null);
                      setDeleteError(null);
                    }}
                    className="px-4 py-2.5 border border-gray-300 rounded-xl font-bold text-xs text-gray-700 hover:bg-gray-50"
                  >
                    Cancel (रद्द करें)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeactivateFarmer(deletingFarmer)}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    Deactivate Farmer (किसान को निष्क्रिय करें)
                  </button>
                </div>
              </div>
            ) : (
              /* NORMAL DELETE CONFIRMATION */
              <div>
                <p className="text-xs text-gray-600 mb-5">
                  Are you sure you want to permanently delete this farmer? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setDeletingFarmer(null)}
                    className="px-4 py-2.5 border border-gray-300 rounded-xl font-bold text-xs text-gray-700 hover:bg-gray-50"
                  >
                    Cancel (रद्द करें)
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleConfirmDelete}
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
    </div>
  );
};

export default Customers;
