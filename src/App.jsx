import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboardview from './views/Dashboardview';
import TransactionsView from './views/TransactionsView';
import WalletView from './views/WalletView';
import BillsView from './views/BillsView';
import SettingsView from './views/SettingsView';
import Sidebar from './components/common/Sidebar'; // Sesuaikan path folder Sidebar Anda jika berbeda
import BottomNav from './components/common/BottomNav';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0b0f19] text-white selection:bg-blue-500 selection:text-white flex flex-col md:flex-row">
        
        {/* Sidebar khusus Desktop (Tampil di layar medium ke atas) */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Area Konten Utama */}
        <div className="flex-1 min-w-0">
          <Routes>
            <Route path="/" element={<Dashboardview />} />
            <Route path="/transactions" element={<TransactionsView />} />
            <Route path="/wallets" element={<WalletView />} />
            <Route path="/bills" element={<BillsView />} />
            <Route path="/settings" element={<SettingsView />} />
          </Routes>
        </div>

        {/* Bottom Navigation khusus HP */}
        <div className="md:hidden">
          <BottomNav />
        </div>

      </div>
    </Router>
  );
}