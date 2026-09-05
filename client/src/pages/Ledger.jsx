import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { BookOpen, Search, ArrowRight } from 'lucide-react';

const Ledger = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/customers?search=${search}`);
        if (res.data.success) setCustomers(res.data.customers);
      } catch (error) {
        console.error('Failed to load ledger customers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [search]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-hindi">
          {t('ledger')} (डिजिटल बही-खाता)
        </h1>
        <p className="text-xs text-gray-500 font-hindi mt-0.5">
          Select any farmer to view their complete digital ledger, work charges, payments, and running balance
        </p>
      </div>

      <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm mb-6 flex items-center space-x-3">
        <Search size={18} className="text-gray-400 ml-2" />
        <input
          type="text"
          placeholder="Search farmer by name, village, or mobile to open Bahi-Khata ledger..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs font-medium focus:outline-none bg-transparent"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {customers.map((c) => (
            <div
              key={c._id}
              onClick={() => navigate(`/customers/${c._id}`)}
              className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-100 text-amber-900 rounded-xl font-bold text-sm">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm font-hindi">{c.name}</h4>
                  <p className="text-xs text-gray-500">{c.village} | Mobile: {c.mobile}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-right">
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase">Pending Balance</p>
                  <p className="text-sm font-bold font-mono text-amber-800">
                    ₹{(c.pending || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <ArrowRight size={18} className="text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Ledger;
