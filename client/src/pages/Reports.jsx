import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSeason } from '../context/SeasonContext';
import api from '../services/api';
import { exportToCSV } from '../utils/csvExporter';
import { BarChart3, Download, Filter } from 'lucide-react';

const Reports = () => {
  const { t } = useLanguage();
  const { selectedSeason } = useSeason();

  const [reportType, setReportType] = useState('customer_pending');
  const [reportData, setReportData] = useState({ headers: [], data: [] });
  const [loading, setLoading] = useState(false);

  const reportOptions = [
    { value: 'customer_pending', label: '1. Customer Pending Report (किसान बकाया)' },
    { value: 'machine_income', label: '2. Machine Income Report (मशीन आय)' },
    { value: 'season_profit', label: '3. Season Profit & Loss Report (सीजन शुद्ध लाभ)' },
    { value: 'work_entries_all', label: '4. Complete Work Entries Report (सभी काम का विवरण)' },
  ];

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports?reportType=${reportType}&season=${selectedSeason || ''}`);
      if (res.data.success) {
        setReportData({ headers: res.data.headers, data: res.data.data });
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, selectedSeason]);

  const handleDownload = () => {
    if (!reportData.data.length) return;
    exportToCSV(`KrishiKhata_Report_${reportType}`, reportData.headers, reportData.data);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-hindi">
            {t('reports')} (व्यापार रिपोर्ट)
          </h1>
          <p className="text-xs text-gray-500 font-hindi mt-0.5">
            Export comprehensive financial, machine, driver, labour, and season reports to CSV
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={!reportData.data.length}
          className="bg-agri-700 hover:bg-agri-800 disabled:opacity-50 text-white font-hindi text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition flex items-center justify-center space-x-2"
        >
          <Download size={18} />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Report Selector */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center gap-4">
        <label className="text-xs font-bold text-gray-700 whitespace-nowrap">Select Report Type:</label>
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="w-full sm:w-auto flex-1 p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-agri-900"
        >
          {reportOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold border-b border-gray-200">
                {reportData.headers.map((h, i) => (
                  <th key={i} className="py-3 px-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium">
              {reportData.data.length > 0 ? (
                reportData.data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="py-3 px-4 font-hindi">
                        {typeof val === 'number' ? `₹${val.toLocaleString('en-IN')}` : val}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={reportData.headers.length || 1} className="text-center py-8 text-gray-400 font-hindi">
                    No report records found for this selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
