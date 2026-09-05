import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSeason } from '../context/SeasonContext';
import QuickActionBar from '../components/QuickActionBar';
import api from '../services/api';
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  UserCheck,
  HardHat,
  Fuel,
  Wrench,
  Wheat,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#16a34a', '#b45309', '#2563eb', '#dc2626', '#9333ea', '#ea580c', '#0891b2'];

const Dashboard = () => {
  const { t } = useLanguage();
  const { selectedSeason } = useSeason();

  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState({ machineRevenue: [], expenseBreakdown: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/dashboard/summary?season=${selectedSeason || ''}`);
        if (res.data.success) {
          setSummary(res.data.summary);
          setCharts(res.data.charts);
        }
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [selectedSeason]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-agri-700"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: t('totalIncome'),
      amount: summary?.totalIncome || 0,
      sub: 'Work + Bran + Mill',
      icon: TrendingUp,
      bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      iconColor: 'bg-emerald-600 text-white',
    },
    {
      title: t('totalReceived'),
      amount: summary?.totalReceived || 0,
      sub: 'Cash & Digital Received',
      icon: CheckCircle2,
      bgColor: 'bg-blue-50 text-blue-800 border-blue-200',
      iconColor: 'bg-blue-600 text-white',
    },
    {
      title: t('customerPending'),
      amount: summary?.customerPending || 0,
      sub: 'Outstanding Farmer Receivables',
      icon: AlertTriangle,
      bgColor: 'bg-amber-50 text-amber-900 border-amber-200',
      iconColor: 'bg-amber-600 text-white',
    },
    {
      title: t('totalExpenses'),
      amount: summary?.totalExpenses || 0,
      sub: 'Fuel, Repairs, Labour, Driver, Power',
      icon: TrendingDown,
      bgColor: 'bg-rose-50 text-rose-800 border-rose-200',
      iconColor: 'bg-rose-600 text-white',
    },
    {
      title: t('netProfit'),
      amount: summary?.netProfit || 0,
      sub: 'Gross Income - Total Expenses',
      icon: DollarSign,
      bgColor: summary?.netProfit >= 0 ? 'bg-agri-100 text-agri-950 border-agri-300' : 'bg-red-100 text-red-950 border-red-300',
      iconColor: summary?.netProfit >= 0 ? 'bg-agri-700 text-white' : 'bg-red-700 text-white',
    },
  ];

  const subCards = [
    { title: t('driverPending'), amount: summary?.driverPending || 0, icon: UserCheck, color: 'text-indigo-600' },
    { title: t('labourPending'), amount: summary?.labourPending || 0, icon: HardHat, color: 'text-purple-600' },
    { title: t('fuelExpense'), amount: summary?.fuelCost || 0, icon: Fuel, color: 'text-amber-600' },
    { title: t('repairExpense'), amount: summary?.repairCost || 0, icon: Wrench, color: 'text-rose-600' },
    { title: t('branIncome'), amount: summary?.branIncome || 0, icon: Wheat, color: 'text-emerald-600' },
  ];

  return (
    <div>
      {/* Top Welcome Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-hindi">
          {t('dashboard')}
        </h1>
        <p className="text-xs text-gray-500 mt-0.5 font-hindi">
          "खेती का काम, मशीन और पैसा — सबका एक जगह हिसाब।"
        </p>
      </div>

      {/* Quick Action Bar */}
      <QuickActionBar />

      {/* Primary Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border shadow-sm ${card.bgColor} transition transform hover:-translate-y-0.5`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider opacity-80">{card.title}</span>
                <div className={`p-2 rounded-xl ${card.iconColor}`}>
                  <Icon size={18} />
                </div>
              </div>
              <p className="text-2xl font-black font-mono">
                ₹{(card.amount || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] opacity-75 mt-1 font-medium">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Secondary Operational Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {subCards.map((sc, idx) => {
          const Icon = sc.icon;
          return (
            <div key={idx} className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
              <div className={`p-2 bg-gray-50 rounded-lg ${sc.color}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-500 truncate">{sc.title}</p>
                <p className="text-base font-bold text-gray-900 font-mono">
                  ₹{(sc.amount || 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Machine Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <span>📊</span> <span>Machine & Service Revenue (मशीन आय विश्लेषण)</span>
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.machineRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#16a34a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <span>🍕</span> <span>Expense Breakdown (खर्चों का वितरण)</span>
          </h2>
          <div className="h-64 flex items-center justify-center">
            {charts.expenseBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="amount"
                    nameKey="category"
                  >
                    {charts.expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-gray-400 font-hindi">No expense records found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
