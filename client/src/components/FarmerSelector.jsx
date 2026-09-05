import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import AddFarmerModal from './AddFarmerModal';
import { Search, UserPlus, Phone, MapPin, Check, ChevronDown, X, User } from 'lucide-react';

const FarmerSelector = ({
  value,
  onChange,
  label = 'Farmer (किसान)',
  required = false,
  placeholder = 'Search farmer... (किसान खोजें)',
  disabled = false,
  error = '',
  showAddButton = true,
}) => {
  const [farmers, setFarmers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef(null);

  // Fetch initial active farmers list (Recent Farmers)
  const fetchFarmers = async (query = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/customers?search=${encodeURIComponent(query)}&status=Active`);
      if (res.data.success) {
        setFarmers(res.data.customers || []);
      }
    } catch (err) {
      console.error('Failed to fetch farmers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers('');
  }, []);

  // Debounced search when searchQuery changes while dropdown is open
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      fetchFarmers(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, isOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedFarmer = farmers.find((f) => f._id === value);

  const handleSelect = (farmer) => {
    onChange(farmer._id, farmer);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('', null);
    setSearchQuery('');
  };

  const handleFarmerCreated = (newFarmer) => {
    setFarmers((prev) => [newFarmer, ...prev]);
    onChange(newFarmer._id, newFarmer);
    setIsModalOpen(false);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Label and Add Button Header */}
      <div className="flex items-center justify-between mb-1">
        {label && (
          <label className="block text-xs font-bold text-gray-700 font-hindi">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        {showAddButton && !disabled && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-amber-700 hover:text-amber-900 font-bold text-[11px] font-hindi flex items-center space-x-1 hover:underline focus:outline-none"
          >
            <UserPlus size={14} />
            <span>➕ Add New Farmer (नया किसान जोड़ें)</span>
          </button>
        )}
      </div>

      {/* Selected Box / Search Input */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`relative w-full p-2.5 bg-gray-50 border rounded-xl flex items-center justify-between cursor-pointer transition text-xs font-hindi ${
          disabled ? 'opacity-60 cursor-not-allowed bg-gray-100' : 'hover:border-amber-400 focus-within:ring-2 focus-within:ring-amber-500'
        } ${error ? 'border-red-400 bg-red-50/30' : 'border-gray-300'}`}
      >
        <div className="flex items-center space-x-2 overflow-hidden w-full mr-2">
          <Search size={16} className="text-gray-400 shrink-0" />
          {selectedFarmer ? (
            <div className="flex items-center justify-between w-full font-bold text-gray-900 truncate">
              <div className="flex items-center space-x-2 truncate">
                <span>{selectedFarmer.name}</span>
                {selectedFarmer.mobile && (
                  <span className="text-[11px] font-mono text-gray-500 font-normal">📱 {selectedFarmer.mobile}</span>
                )}
                {selectedFarmer.village && (
                  <span className="text-[11px] text-gray-500 font-normal">📍 {selectedFarmer.village}</span>
                )}
              </div>
            </div>
          ) : (
            <span className="text-gray-400 font-medium truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          {selectedFarmer && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {error && <p className="text-[11px] text-red-600 font-medium mt-1 font-hindi">{error}</p>}

      {/* DROPDOWN POPUP */}
      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden max-h-64 flex flex-col font-hindi animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Internal Search Input */}
          <div className="p-2 border-b border-gray-100 bg-gray-50/80">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                autoFocus
                placeholder="Type name, mobile, or village... (नाम/मोबाइल/गांव खोजें)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Action Header: Add New Farmer */}
          {showAddButton && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsModalOpen(true);
              }}
              className="w-full text-left p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center space-x-2 border-b border-amber-200 transition shrink-0"
            >
              <UserPlus size={15} />
              <span>➕ Add New Farmer (नया किसान जोड़ें)</span>
            </button>
          )}

          {/* Farmers List */}
          <div className="overflow-y-auto divide-y divide-gray-100">
            {!searchQuery && farmers.length > 0 && (
              <div className="px-3 py-1 bg-gray-100/70 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Recent Farmers (हाल के किसान)
              </div>
            )}

            {loading ? (
              <div className="p-4 text-center text-xs text-gray-400">
                किसान खोजे जा रहे हैं... (Searching farmers...)
              </div>
            ) : farmers.length > 0 ? (
              farmers.map((f) => (
                <div
                  key={f._id}
                  onClick={() => handleSelect(f)}
                  className={`p-3 hover:bg-emerald-50/70 cursor-pointer flex items-center justify-between transition text-xs ${
                    value === f._id ? 'bg-emerald-100/60 font-bold text-emerald-950' : 'text-gray-800'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-gray-900 text-xs flex items-center space-x-1.5">
                      <User size={13} className="text-gray-400" />
                      <span>{f.name}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-[11px] text-gray-500 font-normal">
                      {f.mobile && (
                        <span className="flex items-center space-x-1 font-mono">
                          <Phone size={11} className="text-gray-400" />
                          <span>{f.mobile}</span>
                        </span>
                      )}
                      {f.village && (
                        <span className="flex items-center space-x-1 font-hindi">
                          <MapPin size={11} className="text-gray-400" />
                          <span>{f.village}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  {value === f._id && <Check size={16} className="text-emerald-700 shrink-0" />}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-400 text-xs font-hindi">
                No farmer found (कोई किसान नहीं मिला)
              </div>
            )}
          </div>
        </div>
      )}

      {/* EMBEDDED REUSABLE ADD FARMER MODAL */}
      <AddFarmerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFarmerCreated={handleFarmerCreated}
      />
    </div>
  );
};

export default FarmerSelector;
