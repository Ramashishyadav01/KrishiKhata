import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MapPin,
  Tractor,
  FileSpreadsheet,
  CreditCard,
  BookOpen,
  Fuel,
  Wrench,
  UserCheck,
  HardHat,
  Factory,
  Wheat,
  Receipt,
  Calendar,
  AlertCircle,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  const navItems = [
    { path: '/', label: t('dashboard'), icon: LayoutDashboard },
    { path: '/customers', label: t('customers'), icon: Users },
    { path: '/fields', label: t('fields'), icon: MapPin },
    { path: '/machines', label: t('machines'), icon: Tractor },
    { path: '/work-entries', label: t('workEntries'), icon: FileSpreadsheet },
    { path: '/payments', label: t('payments'), icon: CreditCard },
    { path: '/ledger', label: t('ledger'), icon: BookOpen },
    { path: '/pending-hub', label: t('pendingHub'), icon: AlertCircle },
    { path: '/fuel', label: t('fuel'), icon: Fuel },
    { path: '/repairs', label: t('repairs'), icon: Wrench },
    { path: '/drivers', label: t('drivers'), icon: UserCheck },
    { path: '/labour', label: t('labour'), icon: HardHat },
    { path: '/rice-mill', label: t('riceMill'), icon: Factory },
    { path: '/bran-sales', label: t('branSales'), icon: Wheat },
    { path: '/expenses', label: t('expenses'), icon: Receipt },
    { path: '/seasons', label: t('seasons'), icon: Calendar },
    { path: '/reports', label: t('reports'), icon: BarChart3 },
    { path: '/settings', label: t('settings'), icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-agri-950 text-white z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col shadow-2xl`}
      >
        {/* Header Branding */}
        <div className="h-16 flex items-center justify-between px-5 bg-agri-900 border-b border-agri-800">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500 p-2 rounded-xl text-agri-950 font-bold text-lg">
              🚜
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-wide text-white font-hindi">
                KrishiKhata <span className="text-xs text-amber-400 font-normal">कृषिखाता</span>
              </h1>
              <p className="text-[10px] text-agri-300 font-medium">Farm & Machinery Business</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-agri-300 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Nav list */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500 text-agri-950 font-semibold shadow-md'
                      : 'text-agri-100 hover:bg-agri-900 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Tagline */}
        <div className="p-4 bg-agri-900/60 border-t border-agri-800 text-center">
          <p className="text-xs text-amber-300/90 font-hindi italic">
            "खेती का काम, मशीन और पैसा — सबका एक जगह हिसाब।"
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
