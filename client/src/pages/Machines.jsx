import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { Tractor, Edit3, Check, Plus } from 'lucide-react';

const Machines = () => {
  const { t } = useLanguage();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editRate, setEditRate] = useState(0);

  const fetchMachines = async () => {
    setLoading(true);
    try {
      const res = await api.get('/machines');
      if (res.data.success) setMachines(res.data.machines);
    } catch (error) {
      console.error('Failed to fetch machines:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const handleSaveRate = async (id) => {
    const parsedRate = parseFloat(editRate);
    if (isNaN(parsedRate) || parsedRate < 0) {
      alert('Please enter a valid rate (कृपया एक मान्य दर दर्ज करें)');
      return;
    }

    try {
      const updateRes = await api.put(`/machines/${id}`, { defaultRate: parsedRate });
      if (updateRes.data.success) {
        setEditingId(null);
        setMachines((prev) =>
          prev.map((m) =>
            m._id === id ? { ...m, defaultRate: updateRes.data.machine.defaultRate } : m
          )
        );
      }
    } catch (error) {
      console.error('Rate update error:', error);
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to update rate';
      alert(message);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-hindi">
          {t('machines')} (मशीन एवं सेवाएँ)
        </h1>
        <p className="text-xs text-gray-500 font-hindi mt-0.5">
          Configure default rates and billing units. Historical work entries retain their original rate.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {machines.map((m) => (
          <div
            key={m._id}
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:border-agri-300 transition"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-agri-100 text-agri-800 rounded-xl">
                    <Tractor size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm font-hindi">
                      {m.nameEn} ({m.nameHi})
                    </h3>
                    <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold uppercase mt-0.5">
                      Unit: {m.billingUnit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rate Card */}
              <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between mt-2">
                <div>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase">Default Rate</p>
                  {editingId === m._id ? (
                    <input
                      type="number"
                      value={editRate}
                      onChange={(e) => setEditRate(e.target.value)}
                      className="w-24 p-1 border border-amber-400 rounded-lg text-sm font-bold font-mono focus:outline-none"
                    />
                  ) : (
                    <p className="text-lg font-bold font-mono text-agri-900">
                      ₹{m.defaultRate} <span className="text-xs font-normal text-gray-500">/{m.billingUnit}</span>
                    </p>
                  )}
                </div>

                {editingId === m._id ? (
                  <button
                    onClick={() => handleSaveRate(m._id)}
                    className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                  >
                    <Check size={18} />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(m._id);
                      setEditRate(m.defaultRate);
                    }}
                    className="p-2 text-gray-500 hover:text-agri-700 hover:bg-white rounded-lg transition"
                    title="Edit Rate"
                  >
                    <Edit3 size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Machines;
