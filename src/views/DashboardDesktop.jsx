import React from 'react';
import { 
  ChevronRight as ChevronRightSm, TrendingUp, TrendingDown, 
  Wallet, ArrowUpRight, ArrowDownLeft, CreditCard, Receipt, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function DashboardDesktop({
  wallets,
  filteredTransactions,
  totalIncome,
  totalExpense,
  netBalance,
  expenseBreakdown,
  emptyChartData,
  formattedMonthYear
}) {
  return (
    <div className="space-y-8">
      {/* HERO CARD SALDO UTAMA */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 p-8 border border-blue-500/20 shadow-2xl backdrop-blur-xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
          <div className="col-span-6 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                Total Saldo Keseluruhan
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tight">
              Rp {netBalance.toLocaleString('id-ID')}
            </h2>
          </div>

          <div className="col-span-6 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-black mb-1">
                <ArrowDownLeft className="w-4 h-4" /> Pemasukan Bulan Ini
              </div>
              <p className="text-base font-black text-slate-100 truncate">
                + Rp {totalIncome.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-rose-400 text-xs font-black mb-1">
                <ArrowUpRight className="w-4 h-4" /> Pengeluaran Bulan Ini
              </div>
              <p className="text-base font-black text-slate-100 truncate">
                - Rp {totalExpense.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* GRID 2 KOLOM (KIRI & KANAN) */}
      <div className="grid grid-cols-12 gap-8 items-start">
        
        {/* KOLOM KIRI: RINGKASAN BULAN INI + STRUKTUR PENGELUARAN */}
        <div className="col-span-7 space-y-8">
          
          {/* CARD 1: RINGKASAN BULAN INI */}
          <div className="bg-slate-900/70 rounded-3xl p-6 border border-slate-800/80 shadow-xl backdrop-blur-xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Ringkasan Bulan Ini</h3>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
                {formattedMonthYear}
              </span>
            </div>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/60 hover:border-emerald-500/30 transition-all">
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Masuk</p>
                    <span className="font-extrabold text-slate-200 text-sm">Pendapatan</span>
                  </div>
                </div>
                <span className="font-black text-emerald-400 text-lg">
                  + Rp {totalIncome.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/60 hover:border-rose-500/30 transition-all">
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Keluar</p>
                    <span className="font-extrabold text-slate-200 text-sm">Pengeluaran</span>
                  </div>
                </div>
                <span className="font-black text-rose-400 text-lg">
                  - Rp {totalExpense.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-300 font-extrabold uppercase tracking-wider text-xs">Selisih Bersih (Cashflow)</span>
                <span className={`font-black text-lg ${(totalIncome - totalExpense) >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
                  Rp {(totalIncome - totalExpense).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <Link 
              to="/transactions" 
              className="mt-4 border-t border-slate-800/80 pt-3.5 flex justify-between items-center text-xs text-blue-400 font-extrabold hover:text-blue-300 transition-colors group"
            >
              <span>Lihat riwayat transaksi lengkap</span>
              <ChevronRightSm className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* CARD 2: STRUKTUR PENGELUARAN BERDASARKAN KATEGORI */}
          <div className="bg-slate-900/70 rounded-3xl p-6 border border-slate-800/80 shadow-xl backdrop-blur-xl">
            <h3 className="text-xs font-black text-slate-400 mb-5 uppercase tracking-widest">Struktur Pengeluaran Berdasarkan Kategori</h3>
            
            <div className="grid grid-cols-12 gap-6 items-center">
              <div className="col-span-5 flex justify-center">
                <div className="relative w-44 h-44">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <PieChart>
                      <Pie
                        data={expenseBreakdown.length === 0 ? emptyChartData : expenseBreakdown}
                        innerRadius={58}
                        outerRadius={78}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                        isAnimationActive={true}
                      >
                        {(expenseBreakdown.length === 0 ? emptyChartData : expenseBreakdown).map((entry, index) => (
                          <Cell key={`cell-d-${index}`} fill={entry.color} className="transition-all duration-300 hover:opacity-80 cursor-pointer" />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black">TOTAL KELUAR</span>
                    <span className="text-sm font-black text-white mt-0.5">
                      Rp {totalExpense > 1000000 ? `${(totalExpense/1000000).toFixed(1)}jt` : totalExpense.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-span-7 space-y-2 max-h-52 overflow-y-auto pr-1">
                {expenseBreakdown.length === 0 ? (
                  <div className="text-slate-500 text-xs italic text-center py-8 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800/80 flex flex-col items-center justify-center gap-1">
                    <Receipt className="w-6 h-6 text-slate-600 mb-1" />
                    <span>Belum ada pengeluaran pada bulan ini.</span>
                  </div>
                ) : (
                  expenseBreakdown.map((item, i) => {
                    const percentage = totalExpense > 0 ? ((item.value / totalExpense) * 100).toFixed(1) : 0;
                    return (
                      <div key={i} className="flex justify-between items-center text-xs bg-slate-950/60 px-3.5 py-2.5 rounded-xl border border-slate-800/60 hover:border-slate-700 transition-all">
                        <div className="flex items-center gap-2.5 truncate pr-2">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                          <span className="text-slate-200 font-extrabold truncate">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-slate-100 font-black">Rp {item.value.toLocaleString('id-ID')}</span>
                          <span className="text-slate-400 text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 font-bold">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

        </div>

        {/* KOLOM KANAN: DAFTAR DOMPET/REKENING + RIWAYAT TRANSAKSI */}
        <div className="col-span-5 space-y-8">
          
          {/* CARD 1: DAFTAR DOMPET / REKENING */}
          <div className="bg-slate-900/70 rounded-3xl p-6 border border-slate-800/80 shadow-xl backdrop-blur-xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Daftar Dompet / Rekening</h3>
              <Link to="/wallets" className="text-xs text-blue-400 font-extrabold hover:text-blue-300 transition-colors flex items-center gap-1">
                Kelola <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {wallets.length === 0 ? (
                <div className="text-center py-6 px-4 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800/80 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 mb-2 border border-slate-800">
                    <Wallet className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-300 font-extrabold mb-1">Belum Ada Dompet Terdaftar</p>
                  <p className="text-[11px] text-slate-500 max-w-[220px] mb-3">Tambahkan rekening bank atau e-wallet untuk mulai memantau saldo.</p>
                  <Link 
                    to="/wallets" 
                    className="px-3.5 py-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-extrabold hover:bg-blue-600 hover:text-white transition-all"
                  >
                    + Tambah Dompet
                  </Link>
                </div>
              ) : (
                wallets.map((w, idx) => (
                  <Link 
                    to="/wallets" 
                    key={idx} 
                    className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/60 hover:border-blue-500/40 transition-all group shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-slate-200 group-hover:text-blue-400 transition-colors block">{w.name}</span>
                        <span className="text-[10px] text-slate-500 font-medium">Rekening Aktif</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-blue-400">Rp {Number(w.balance || 0).toLocaleString('id-ID')}</span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* CARD 2: RIWAYAT TRANSAKSI TERAKHIR */}
          <div className="bg-slate-900/70 rounded-3xl p-6 border border-slate-800/80 shadow-xl backdrop-blur-xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Riwayat Transaksi</h3>
              <Link to="/transactions" className="text-xs text-blue-400 font-extrabold hover:text-blue-300 transition-colors flex items-center gap-1">
                Lihat Semua <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800/80 flex flex-col items-center justify-center">
                  <Receipt className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400 font-extrabold">Belum Ada Transaksi</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Transaksi bulan ini akan muncul di sini.</p>
                </div>
              ) : (
                filteredTransactions.slice(0, 5).map((tx, idx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <div 
                      key={idx} 
                      className="flex justify-between items-center p-3 rounded-2xl bg-slate-950/50 border border-slate-800/60 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-3 overflow-hidden pr-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0 ${
                          isIncome 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}>
                          {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-extrabold text-slate-200 truncate">
                            {tx.description || tx.categories?.name || 'Transaksi'}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {tx.wallets?.name || 'Dompet'}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-black flex-shrink-0 ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isIncome ? '+' : '-'} Rp {Number(tx.amount || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}