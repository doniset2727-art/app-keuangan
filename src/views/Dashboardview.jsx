import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTransactions, getWallets } from '../services/financeService';
import DashboardDesktop from './DashboardDesktop';
import DashboardMobile from './DashboardMobile';

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'];

export default function Dashboardview() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [walletData, txData] = await Promise.all([
        getWallets(),
        getTransactions()
      ]);
      setWallets(walletData || []);
      setTransactions(txData || []);
    } catch (error) {
      console.error("Gagal memuat data dashboard:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMonth = (monthIndex) => {
    const newDate = new Date(selectedYear, monthIndex, 1);
    setCurrentDate(newDate);
    setIsCalendarModalOpen(false);
  };

  const formattedMonthYear = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const filteredTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    return (
      txDate.getMonth() === currentDate.getMonth() &&
      txDate.getFullYear() === currentDate.getFullYear()
    );
  });

  const netBalance = wallets.reduce((acc, w) => acc + Number(w.balance || 0), 0);
  const totalIncome = filteredTransactions.filter(tx => tx.type === 'income').reduce((acc, tx) => acc + Number(tx.amount || 0), 0);
  const totalExpense = filteredTransactions.filter(tx => tx.type === 'expense').reduce((acc, tx) => acc + Number(tx.amount || 0), 0);

  const expenseByCategory = {};
  filteredTransactions
    .filter(tx => tx.type === 'expense')
    .forEach(tx => {
      const catName = tx.categories?.name || 'Lainnya';
      expenseByCategory[catName] = (expenseByCategory[catName] || 0) + Number(tx.amount || 0);
    });

  const expenseBreakdown = Object.keys(expenseByCategory).map((catName, index) => ({
    name: catName,
    value: expenseByCategory[catName],
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
  }));

  const emptyChartData = [{ name: 'Belum ada data', value: 1, color: '#1e293b' }];
  const monthsList = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];

  if (loading) {
    return (
      <div className="min-h-[80vh] text-white flex items-center justify-center">
        <div className="flex items-center gap-3 bg-slate-900/80 px-5 py-3 rounded-2xl border border-slate-800">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-400 text-sm font-bold tracking-wide">Memuat Dashboard...</p>
        </div>
      </div>
    );
  }

  const sharedProps = {
    wallets,
    filteredTransactions,
    totalIncome,
    totalExpense,
    netBalance,
    expenseBreakdown,
    emptyChartData,
    formattedMonthYear
  };

  return (
    <div className="relative w-full pb-28 md:pb-12 text-white font-sans antialiased selection:bg-blue-500 selection:text-white overflow-hidden">
      
      {/* AMBIENT BACKGROUND GLOWS */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute top-1/2 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      {/* HEADER DASHBOARD */}
      <header className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-5 bg-slate-950/60 border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          {/* LOGO: Hanya tampil di mobile (lg:hidden), disembunyikan di desktop */}
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg shadow-blue-500/30 flex-shrink-0 bg-slate-900 border border-slate-800 flex items-center justify-center lg:hidden">
            <img 
              src="/logo.png" 
              alt="D&A Wallet Logo" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }} 
            />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-wider text-white uppercase flex items-center gap-1.5">
              D&A <span className="text-blue-400">WALLET</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Dashboard Keuangan Anda</p>
          </div>
        </div>

        {/* BAGIAN KANAN HEADER: KALENDER & TOMBOL DESKTOP */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCalendarModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all text-xs font-bold shadow-lg cursor-pointer"
          >
            <CalendarDays className="w-4 h-4 text-blue-400" />
            <span>{formattedMonthYear}</span>
          </button>

          <Link 
            to="/transactions" 
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-all shadow-lg shadow-blue-600/30 active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Transaksi</span>
          </Link>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        
        {/* TAMPILAN DESKTOP */}
        <div className="hidden lg:block">
          <DashboardDesktop {...sharedProps} />
        </div>

        {/* TAMPILAN MOBILE */}
        <div className="block lg:hidden">
          <DashboardMobile {...sharedProps} />
        </div>

      </div>

      {/* MODAL KALENDER */}
      {isCalendarModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Pilih Bulan & Tahun</h3>
              <button 
                onClick={() => setIsCalendarModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-between items-center bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 font-bold">Tahun</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedYear(selectedYear - 1)}
                  className="text-slate-400 hover:text-white font-bold px-2.5 py-1 bg-slate-800 rounded-lg text-xs cursor-pointer"
                >
                  -
                </button>
                <span className="text-xs font-black text-white">{selectedYear}</span>
                <button 
                  onClick={() => setSelectedYear(selectedYear + 1)}
                  className="text-slate-400 hover:text-white font-bold px-2.5 py-1 bg-slate-800 rounded-lg text-xs cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {monthsList.map((mName, index) => {
                const isCurrentActive = currentDate.getMonth() === index && currentDate.getFullYear() === selectedYear;
                return (
                  <button
                    key={index}
                    onClick={() => handleSelectMonth(index)}
                    className={`py-2.5 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                      isCurrentActive 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30' 
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    {mName}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}