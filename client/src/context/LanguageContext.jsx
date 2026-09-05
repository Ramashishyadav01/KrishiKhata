import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    appName: 'KrishiKhata',
    tagline: 'Kheti ka kaam, machine aur paisa — sabka ek jagah hisaab.',
    dashboard: 'Dashboard',
    customers: 'Farmers / Customers',
    fields: 'Fields (Khet)',
    machines: 'Machines & Services',
    workEntries: 'Work Entries',
    payments: 'Customer Payments',
    ledger: 'Bahi-Khata Ledger',
    fuel: 'Fuel Logs',
    repairs: 'Machine Repairs',
    drivers: 'Drivers',
    labour: 'Labour',
    riceMill: 'Rice Mill (राइस मिल)',
    branSales: 'Bran Sales (चोकर बिक्री)',
    expenses: 'General Expenses',
    seasons: 'Seasons',
    pendingHub: 'Pending Balances',
    reports: 'Reports & Analytics',
    settings: 'Settings & Users',
    
    // Quick Actions
    addWork: '+ Add Work',
    addPayment: '+ Add Payment',
    addCustomer: '+ Add Customer',
    addFuel: '+ Add Fuel',
    addExpense: '+ Add Expense',
    driverPayment: '+ Driver Salary',
    labourPayment: '+ Labour Wage',
    branSale: '+ Bran Sale',
    
    // Key Metrics
    totalIncome: 'Total Income',
    totalReceived: 'Total Received',
    customerPending: 'Customer Pending',
    totalExpenses: 'Total Expenses',
    netProfit: 'Net Profit',
    driverPending: 'Driver Pending',
    labourPending: 'Labour Pending',
    fuelExpense: 'Fuel Expense',
    repairExpense: 'Repair Expense',
    branIncome: 'Bran Sales',
    
    // Status
    paid: 'PAID (पूरा भुगतान)',
    partial: 'PARTIAL (आंशिक)',
    pending: 'PENDING (बकाया)',

    // Units
    bigha: 'Bigha (बीघा)',
    bissa: 'Bissa (बिस्सा)',
    hour: 'Hour (घंटा)',
    trip: 'Trip (चक्कर)',
    quintal: 'Quintal (कुंतल)',
  },
  hi: {
    appName: 'कृषिखाता',
    tagline: 'खेती का काम, मशीन और पैसा — सबका एक जगह हिसाब।',
    dashboard: 'डैशबोर्ड (Dashboard)',
    customers: 'किसान / ग्राहक (Customers)',
    fields: 'खेत / भूमि (Fields)',
    machines: 'मशीन एवं सेवाएँ (Machines)',
    workEntries: 'काम की प्रविष्टि (Work Entries)',
    payments: 'भुगतान जमा (Payments)',
    ledger: 'बही-खाता (Khata Ledger)',
    fuel: 'डीज़ल/पेट्रोल खर्च (Fuel)',
    repairs: 'मरम्मत व रखरखाव (Repairs)',
    drivers: 'ड्राइवर प्रबंधन (Drivers)',
    labour: 'मजदूर प्रबंधन (Labour)',
    riceMill: 'राइस मिल (Rice Mill)',
    branSales: 'चोकर बिक्री (Bran Sales)',
    expenses: 'सामान्य खर्चे (Expenses)',
    seasons: 'फसल सीजन (Seasons)',
    pendingHub: 'बकाया राशि (Pending Hub)',
    reports: 'रिपोर्ट्स (Reports)',
    settings: 'सेटिंग्स (Settings)',
    
    // Quick Actions
    addWork: '+ नया काम (Add Work)',
    addPayment: '+ नया भुगतान (Payment)',
    addCustomer: '+ नया ग्राहक (Customer)',
    addFuel: '+ डीज़ल (Fuel)',
    addExpense: '+ खर्चा (Expense)',
    driverPayment: '+ ड्राइवर भुगतान',
    labourPayment: '+ मजदूर भुगतान',
    branSale: '+ चोकर बिक्री (Bran)',

    // Key Metrics
    totalIncome: 'कुल आय (Total Income)',
    totalReceived: 'कुल प्राप्त (Total Received)',
    customerPending: 'ग्राहक का बकाया (Pending)',
    totalExpenses: 'कुल खर्च (Total Expenses)',
    netProfit: 'शुद्ध लाभ (Net Profit)',
    driverPending: 'ड्राइवर का बकाया',
    labourPending: 'मजदूर का बकाया',
    fuelExpense: 'डीज़ल/पेट्रोल खर्च',
    repairExpense: 'मरम्मत खर्च',
    branIncome: 'चोकर बिक्री आय',

    // Status
    paid: 'पूरा भुगतान (PAID)',
    partial: 'आंशिक भुगतान (PARTIAL)',
    pending: 'बकाया (PENDING)',

    // Units
    bigha: 'बीघा (Bigha)',
    bissa: 'बिस्सा (Bissa)',
    hour: 'घंटा (Hour)',
    trip: 'चक्कर (Trip)',
    quintal: 'कुंतल (Quintal)',
  },
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(
    localStorage.getItem('krishikhata_lang') || localStorage.getItem('khetkhata_lang') || 'en'
  );

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'hi' : 'en';
    setLang(newLang);
    localStorage.setItem('krishikhata_lang', newLang);
    localStorage.setItem('khetkhata_lang', newLang);
  };

  const t = (key) => translations[lang]?.[key] || translations['en']?.[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
