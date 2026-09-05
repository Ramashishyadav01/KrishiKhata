import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { AlertCircle, Users, Wheat, UserCheck, HardHat, ArrowRight } from 'lucide-react';

const PendingHub = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('customers');
  const [data, setData] = useState({
    customers: [],
    branBuyers: [],
    drivers: [],
    labourers: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true);
      try {
        const [resCust, resBran, resDrv, resLab] = await Promise.all([
          api.get('/customers'),
          api.get('/bran-sales'),
          api.get('/drivers'),
          api.get('/labour'),
        ]);

        setData({
          customers: resCust.data.customers.filter((c) => c.pending > 0),
          branBuyers: resBran.data.sales.filter((s) => s.pendingAmount > 0),
          drivers: resDrv.data.drivers.filter((d) => d.pending > 0),
          labourers: resLab.data.labourers.filter((l) => l.pending > 0),
        });
      } catch (error) {
        console.error('Failed to load pending balances:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const totalCustomerPending = data.customers.reduce((sum, c) => sum + c.pending, 0);
  const totalBranPending = data.branBuyers.reduce((sum, b) => sum + b.pendingAmount, 0);
  const totalDriverPending = data.drivers.reduce((sum, d) => sum + d.pending, 0);
  const totalLabourPending = data.labourers.reduce((sum, l) => sum + l.pending, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-hindi">
          {t('pendingHub')} (बकाया राशि डैशबोर्ड)
        </h1>
        <p className="text-xs text-gray-500 font-hindi mt-0.5">
          Single place to monitor all receivables (Farmers & Bran Buyers) and payables (Drivers & Labour)
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('customers')}
          className={`py-3 px-4 text-xs font-bold font-hindi flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'customers' ? 'border-amber-600 text-amber-900 bg-amber-50/50' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Users size={16} />
          <span>Farmers ({data.customers.length}) - ₹{totalCustomerPending.toLocaleString('en-IN')}</span>
        </button>

        <button
          onClick={() => setActiveTab('bran')}
          className={`py-3 px-4 text-xs font-bold font-hindi flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'bran' ? 'border-amber-600 text-amber-900 bg-amber-50/50' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Wheat size={16} />
          <span>Bran Buyers ({data.branBuyers.length}) - ₹{totalBranPending.toLocaleString('en-IN')}</span>
        </button>

        <button
          onClick={() => setActiveTab('drivers')}
          className={`py-3 px-4 text-xs font-bold font-hindi flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'drivers' ? 'border-amber-600 text-amber-900 bg-amber-50/50' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <UserCheck size={16} />
          <span>Drivers ({data.drivers.length}) - ₹{totalDriverPending.toLocaleString('en-IN')}</span>
        </button>

        <button
          onClick={() => setActiveTab('labour')}
          className={`py-3 px-4 text-xs font-bold font-hindi flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'labour' ? 'border-amber-600 text-amber-900 bg-amber-50/50' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <HardHat size={16} />
          <span>Labour ({data.labourers.length}) - ₹{totalLabourPending.toLocaleString('en-IN')}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {activeTab === 'customers' && (
          <div className="divide-y divide-gray-100">
            {data.customers.map((c) => (
              <div
                key={c._id}
                onClick={() => navigate(`/customers/${c._id}`)}
                className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition"
              >
                <div>
                  <h4 className="font-bold text-gray-900 text-sm font-hindi">{c.name}</h4>
                  <p className="text-xs text-gray-500">{c.village} | Mobile: {c.mobile}</p>
                </div>
                <div className="text-right flex items-center space-x-3">
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Pending Balance</p>
                    <p className="text-base font-bold font-mono text-amber-800">
                      ₹{c.pending.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <ArrowRight size={18} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'bran' && (
          <div className="divide-y divide-gray-100">
            {data.branBuyers.map((b) => (
              <div key={b._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm font-hindi">{b.buyer}</h4>
                  <p className="text-xs text-gray-500">Qty: {b.quantityQuintal} Qtl | Date: {new Date(b.date).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase">Pending Amount</p>
                  <p className="text-base font-bold font-mono text-amber-800">
                    ₹{b.pendingAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'drivers' && (
          <div className="divide-y divide-gray-100">
            {data.drivers.map((d) => (
              <div key={d._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm font-hindi">{d.name}</h4>
                  <p className="text-xs text-gray-500">Salary: {d.salaryType} | Mobile: {d.mobile}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase">Pending Salary</p>
                  <p className="text-base font-bold font-mono text-indigo-700">
                    ₹{d.pending.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'labour' && (
          <div className="divide-y divide-gray-100">
            {data.labourers.map((l) => (
              <div key={l._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm font-hindi">{l.name}</h4>
                  <p className="text-xs text-gray-500">Daily Wage: ₹{l.dailyWage} | Mobile: {l.mobile}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase">Pending Wage</p>
                  <p className="text-base font-bold font-mono text-purple-700">
                    ₹{l.pending.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingHub;
