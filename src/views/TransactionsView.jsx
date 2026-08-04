import React, { useState, useEffect } from 'react';
import { getTransactions } from '../services/financeService';
import { ArrowUpRight, ArrowDownLeft, Receipt } from 'lucide-react';

export default function TransactionsView() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(false);
      const data = await getTransactions();
      setTransactions(data || []);
    } catch (error) {
      console.error("Gagal memuat transaksi:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto text-white space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Riwayat Transaksi</h1>
        <p className="text-xs sm:text-sm text-slate-400">Semua catatan pemasukan dan pengeluaran Anda.</p>
      </div>

      <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800/80 shadow-sm space-y-3">
        {loading ? (
          <p className="text-xs text-slate-400 text-center py-6 animate-pulse">Memuat data transaksi...</p>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs italic">
            Belum ada transaksi tercatat.
          </div>
        ) : (
          transactions.map((tx, idx) => (
            <div key={idx} className="flex justify-between items-center p-4 rounded-2xl bg-slate-950/60 border border-slate-800/60">
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {tx.type === 'income' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200">{tx.description || tx.categories?.name || 'Transaksi'}</p>
                  <p className="text-[11px] text-slate-400">{new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <span className={`text-sm font-extrabold ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {tx.type === 'income' ? '+' : '-'} Rp {Number(tx.amount || 0).toLocaleString('id-ID')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}