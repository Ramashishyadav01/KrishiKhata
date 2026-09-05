import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  PlusCircle,
  CreditCard,
  UserPlus,
  Fuel,
  Receipt,
  UserCheck,
  HardHat,
  Wheat,
} from 'lucide-react';

const QuickActionBar = ({ onOpenModal }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const actions = [
    { label: t('addWork'), color: 'bg-agri-600 hover:bg-agri-700 text-white', icon: PlusCircle, path: '/work-entries?action=new' },
    { label: t('addPayment'), color: 'bg-emerald-600 hover:bg-emerald-700 text-white', icon: CreditCard, path: '/payments?action=new' },
    { label: t('addCustomer'), color: 'bg-blue-600 hover:bg-blue-700 text-white', icon: UserPlus, path: '/customers?action=new' },
    { label: t('addFuel'), color: 'bg-amber-600 hover:bg-amber-700 text-white', icon: Fuel, path: '/fuel?action=new' },
    { label: t('addExpense'), color: 'bg-rose-600 hover:bg-rose-700 text-white', icon: Receipt, path: '/expenses?action=new' },
    { label: t('driverPayment'), color: 'bg-indigo-600 hover:bg-indigo-700 text-white', icon: UserCheck, path: '/drivers?action=payment' },
    { label: t('labourPayment'), color: 'bg-purple-600 hover:bg-purple-700 text-white', icon: HardHat, path: '/labour?action=payment' },
    { label: t('branSale'), color: 'bg-orange-600 hover:bg-orange-700 text-white', icon: Wheat, path: '/bran-sales?action=new' },
  ];

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center space-x-2">
        <span>⚡</span> <span>त्वरित प्रविष्टि (Quick Field Actions)</span>
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <button
              key={idx}
              onClick={() => navigate(act.path)}
              className={`${act.color} font-hindi text-xs font-bold py-2.5 px-2 rounded-xl shadow-sm transition-all transform hover:-translate-y-0.5 flex flex-col items-center justify-center space-y-1 text-center`}
            >
              <Icon size={18} />
              <span className="leading-tight">{act.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionBar;
