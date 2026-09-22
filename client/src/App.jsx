import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { SeasonProvider } from './context/SeasonContext';

import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import Fields from './pages/Fields';
import Machines from './pages/Machines';
import WorkEntries from './pages/WorkEntries';
import Payments from './pages/Payments';
import Ledger from './pages/Ledger';
import FuelEntries from './pages/FuelEntries';
import Repairs from './pages/Repairs';
import Drivers from './pages/Drivers';
import Labour from './pages/Labour';
import RiceMill from './pages/RiceMill';
import BranSales from './pages/BranSales';
import Expenses from './pages/Expenses';
import Seasons from './pages/Seasons';
import PendingHub from './pages/PendingHub';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-agri-700"></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <SeasonProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="farmers" element={<Customers />} />
              <Route path="customers" element={<Customers />} />
              <Route path="customers/:id" element={<CustomerDetails />} />
              <Route path="fields" element={<Fields />} />
              <Route path="machines" element={<Machines />} />
              <Route path="work-entries" element={<WorkEntries />} />
              <Route path="payments" element={<Payments />} />
              <Route path="ledger" element={<Ledger />} />
              <Route path="fuel" element={<FuelEntries />} />
              <Route path="repairs" element={<Repairs />} />
              <Route path="drivers" element={<Drivers />} />
              <Route path="labour" element={<Labour />} />
              <Route path="rice-mill" element={<RiceMill />} />
              <Route path="bran-sales" element={<BranSales />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="seasons" element={<Seasons />} />
              <Route path="pending-hub" element={<PendingHub />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SeasonProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
