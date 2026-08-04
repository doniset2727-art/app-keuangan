import React from 'react';
import { Trash2 } from 'lucide-react';

export default function TransactionsDesktop({ transactions, onDelete }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-900/40 border border-slate-800/60 rounded-3xl">
        <p className="text-xs text-slate-400 font-bold">Belum ada data transaksi.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider bg-slate-950/40">
            <th className="py-4 px-6 font-bold">Tanggal</th>
            <th className="py-4 px-6 font-bold">Kategori</th>
            <th className="py-4 px-6 font-bold">Keterangan</th>
            <th className="py-4 px-6 font-bold">Dompet</th>
            <th className="py-4 px-6 font-bold text-right">Jumlah</th>
            <th className="py-4 px-6 font-bold text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-xs">
          {transactions.map((tx) => {
            const isIncome = tx.type === 'income';
            return (
              <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-4 px-6 text-slate-300 font-medium">
                  {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="py-4 px-6">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-slate-800 text-slate-200 border border-slate-700">
                    {tx.categories?.name || 'Umum'}
                  </span>
                </td>
                <td className="py-4 px-6 text-white font-bold">{tx.description || '-'}</td>
                <td className="py-4 px-6 text-slate-400">{tx.wallets?.name || 'Dompet Utama'}</td>
                <td className={`py-4 px-6 text-right font-black ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isIncome ? '+' : '-'} Rp {Number(tx.amount || 0).toLocaleString('id-ID')}
                </td>
                <td className="py-4 px-6 text-center">
                  <button 
                    onClick={() => onDelete(tx.id)}
                    className="p-2 rounded-xl bg-slate-800/80 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}