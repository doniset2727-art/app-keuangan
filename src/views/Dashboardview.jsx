import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, ChevronLeft, ChevronRight, 
  ChevronRight as ChevronRightSm, TrendingUp, TrendingDown, X,
  Wallet, ArrowUpRight, ArrowDownLeft, LayoutDashboard, Receipt, CreditCard, Settings, LogOut
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getTransactions, getWallets } from '../services/financeService';

// IMPORT LOGO ANDA DARI FOLDER ASSETS
import logoImg from '../assets/logo.png';

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

  const handlePrevMonth = () => {
    const nextDate = new Date(currentDate);
    nextDate.setMonth(nextDate.getMonth() - 1);
    setCurrentDate(nextDate);
    setSelectedYear(nextDate.getFullYear());
  };

  const handleNextMonth = () => {
    const nextDate = new Date(currentDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    setCurrentDate(nextDate);
    setSelectedYear(nextDate.getFullYear());
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
      <div className="bg-[#0b0f19] min-h-screen text-white flex items-center justify-center">
        <p className="text-blue-400 text-sm animate-pulse font-semibold">Memuat D&A Wallet...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex font-sans antialiased selection:bg-blue-500 selection:text-white">
      
      {/* ================= DESKTOP SIDEBAR NAVIGATION (Hanya tampil di Laptop/Desktop) ================= */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950/80 border-r border-slate-800/80 p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
            <div className="w-full h-full bg-[#0b0f19] rounded-[14px] flex items-center justify-center overflow-hidden">
              <img src={logoImg} alt="D&A Logo" className="w-full h-full object-cover" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-black tracking-wide text-white">D&A WALLET</h1>
            <p className="text-[11px] text-slate-400 font-medium">Fintech Dashboard</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-blue-600 text-white font-semibold text-sm shadow-lg shadow-blue-600/30">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-900 font-medium text-sm transition-all">
            <Receipt className="w-4 h-4" /> Transaksi
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-900 font-medium text-sm transition-all">
            <CreditCard className="w-4 h-4" /> Dompet & Rekening
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-900 font-medium text-sm transition-all">
            <Settings className="w-4 h-4" /> Pengaturan
          </a>
        </nav>

        <div className="pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center font-bold text-blue-400 text-xs">
              DS
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">Doni Setiawan</p>
              <p className="text-[10px] text-slate-400 truncate">doni@email.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 pb-28 md:pb-12 min-w-0">
        
        {/* MOBILE HEADER (Hanya tampil di HP) */}
        <div className="md:hidden px-4 pt-5 pb-3 flex justify-between items-center bg-[#0b0f19]/90 border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-md flex items-center justify-center overflow-hidden flex-shrink-0">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center overflow-hidden">
                <img src={logoImg} alt="D&A Logo" className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wide text-white">D&A WALLET</h1>
              <p className="text-[11px] text-slate-400">Halo, Doni 👋</p>
            </div>
          </div>
          <button 
            onClick={() => setIsCalendarModalOpen(true)}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400"
          >
            <CalendarDays className="w-4 h-4" />
          </button>
        </div>

        {/* DESKTOP TOP BAR (Hanya tampil di Desktop) */}
        <header className="hidden md:flex justify-between items-center px-8 py-6 bg-slate-950/40 border-b border-slate-800/60 sticky top-0 z-30 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Dashboard Keuangan</h2>
            <p className="text-xs text-slate-400">Selamat datang kembali, Doni! Berikut ringkasan finansial Anda.</p>
          </div>
          <button 
            onClick={() => setIsCalendarModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:border-slate-700 transition-all shadow-sm"
          >
            <CalendarDays className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold">{formattedMonthYear}</span>
          </button>
        </header>

        {/* KONTEN UTAMA DASHBOARD */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          
          {/* GRID UTAMA DESKTOP */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* KOLOM KIRI (Saldo & Navigasi Bulan Mobile) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* KARTU SALDO UTAMA */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-6 sm:p-8 shadow-2xl shadow-blue-900/30">
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex items-center justify-between mb-2">
                  <p className="text-blue-100 text-xs sm:text-sm font-semibold uppercase tracking-wider">Total Saldo Keseluruhan</p>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-6">
                  Rp {netBalance.toLocaleString('id-ID')}
                </h2>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                  <div className="bg-black/15 p-3 rounded-2xl backdrop-blur-sm">
                    <div className="flex items-center gap-1.5 text-emerald-300 text-[11px] font-medium mb-0.5">
                      <ArrowDownLeft className="w-3.5 h-3.5" /> Pemasukan
                    </div>
                    <p className="text-sm font-bold text-white truncate">
                      + Rp {totalIncome.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="bg-black/15 p-3 rounded-2xl backdrop-blur-sm">
                    <div className="flex items-center gap-1.5 text-rose-300 text-[11px] font-medium mb-0.5">
                      <ArrowUpRight className="w-3.5 h-3.5" /> Pengeluaran
                    </div>
                    <p className="text-sm font-bold text-white truncate">
                      - Rp {totalExpense.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>

              {/* PEMILIH BULAN (Mobile Only Nav) */}
              <div className="flex md:hidden justify-between items-center px-4 py-3 bg-slate-900/90 rounded-2xl border border-slate-800/80 shadow-sm">
                <button onClick={handlePrevMonth} className="text-slate-400 p-1 hover:text-white">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div onClick={() => setIsCalendarModalOpen(true)} className="font-bold text-sm text-slate-100 capitalize cursor-pointer">
                  {formattedMonthYear}
                </div>
                <button onClick={handleNextMonth} className="text-slate-400 p-1 hover:text-white">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* DAFTAR DOMPET */}
              <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800/80 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Daftar Dompet / Rekening</h3>
                <div className="space-y-3">
                  {wallets.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Belum ada dompet terdaftar.</p>
                  ) : (
                    wallets.map((w, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/50">
                        <span className="text-sm font-semibold text-slate-300">{w.name}</span>
                        <span className="text-sm font-bold text-blue-400">Rp {Number(w.balance || 0).toLocaleString('id-ID')}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* KOLOM KANAN (Ringkasan & Grafik Pengeluaran) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* RINGKASAN KEUANGAN */}
              <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800/80 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 mb-5 uppercase tracking-wider">Ringkasan Keuangan Bulan Ini</h3>
                <div className="space-y-4 mb-5">
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-950/40 border border-slate-800/40">
                    <div className="flex items-center gap-3 text-slate-300">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Total Masuk</p>
                        <span className="font-semibold text-slate-200 text-sm">Pendapatan</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-emerald-400 text-base sm:text-lg">
                      Rp {totalIncome.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-950/40 border border-slate-800/40">
                    <div className="flex items-center gap-3 text-slate-300">
                      <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                        <TrendingDown className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Total Keluar</p>
                        <span className="font-semibold text-slate-200 text-sm">Pengeluaran</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-rose-400 text-base sm:text-lg">
                      Rp {totalExpense.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-800 text-sm px-2">
                    <span className="text-slate-300 font-bold">Selisih Bersih (Cashflow)</span>
                    <span className={`font-black text-lg ${(totalIncome - totalExpense) >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
                      Rp {(totalIncome - totalExpense).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-4 flex justify-between items-center cursor-pointer text-xs sm:text-sm text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                  <span>Lihat riwayat transaksi lengkap</span>
                  <ChevronRightSm className="w-4 h-4" />
                </div>
              </div>

              {/* STRUKTUR PENGELUARAN */}
              <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800/80 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 mb-5 uppercase tracking-wider">Struktur Pengeluaran Berdasarkan Kategori</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-5 flex justify-center">
                    <div className="relative w-44 h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expenseBreakdown.length === 0 ? emptyChartData : expenseBreakdown}
                            innerRadius={58}
                            outerRadius={80}
                            dataKey="value"
                            stroke="none"
                          >
                            {(expenseBreakdown.length === 0 ? emptyChartData : expenseBreakdown).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Pengeluaran</span>
                        <span className="text-xs sm:text-sm font-extrabold text-slate-100">
                          Rp {totalExpense > 1000000 ? `${(totalExpense/1000000).toFixed(1)}jt` : totalExpense.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-7 space-y-2.5 max-h-52 overflow-y-auto pr-1">
                    {expenseBreakdown.length === 0 ? (
                      <div className="text-slate-500 text-xs italic text-center py-8">Belum ada pengeluaran di bulan ini</div>
                    ) : (
                      expenseBreakdown.map((item, i) => {
                        const percentage = totalExpense > 0 ? ((item.value / totalExpense) * 100).toFixed(1) : 0;
                        return (
                          <div key={i} className="flex justify-between items-center text-xs sm:text-sm bg-slate-950/50 px-4 py-3 rounded-2xl border border-slate-800/60">
                            <div className="flex items-center gap-3 truncate pr-2">
                              <div className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: item.color }}></div>
                              <span className="text-slate-200 font-semibold truncate">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className="text-slate-100 font-bold">Rp {item.value.toLocaleString('id-ID')}</span>
                              <span className="text-slate-400 text-xs bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">({percentage}%)</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* ================= MODAL KALENDER INTERAKTIF ================= */}
      {isCalendarModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-5">
            
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Pilih Bulan & Tahun</h3>
              <button 
                onClick={() => setIsCalendarModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-between items-center bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Tahun</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedYear(selectedYear - 1)}
                  className="text-slate-400 hover:text-white font-bold px-2.5 py-1 bg-slate-800 rounded-lg text-sm"
                >
                  -
                </button>
                <span className="text-sm font-extrabold text-white">{selectedYear}</span>
                <button 
                  onClick={() => setSelectedYear(selectedYear + 1)}
                  className="text-slate-400 hover:text-white font-bold px-2.5 py-1 bg-slate-800 rounded-lg text-sm"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {monthsList.map((mName, index) => {
                const isCurrentActive = currentDate.getMonth() === index && currentDate.getFullYear() === selectedYear;
                return (
                  <button
                    key={index}
                    onClick={() => handleSelectMonth(index)}
                    className={`py-3 rounded-2xl text-xs font-bold transition-all border ${
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