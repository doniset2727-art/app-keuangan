import React from 'react';
import { Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function TransactionsMobile({ transactions, onDelete }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-900/40 border border-slate-800/60 rounded-3xl">
        <p className="text-xs text-slate-400 font-bold">Belum ada data transaksi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => {
        const isIncome = tx.type === 'income';
        return (
          <div 
            key={tx.id} 
            className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-lg backdrop-blur-md"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isIncome ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-white truncate">{tx.description || tx.categories?.name || 'Transaksi'}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • <span className="text-slate-300 font-bold">{tx.wallets?.name || 'Dompet'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 text-right">
              <div>
                <p className={`text-xs font-black ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isIncome ? '+' : '-'} Rp {Number(tx.amount || 0).toLocaleString('id-ID')}
                </p>
                <span className="inline-block mt-0.5 text-[9px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold border border-slate-700/60">
                  {tx.categories?.name || 'Umum'}
                </span>
              </div>

              <button 
                onClick={() => onDelete(tx.id)}
                className="p-2 rounded-xl bg-slate-950 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer border border-slate-800"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}