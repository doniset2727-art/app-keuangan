import React from 'react';
import { Receipt } from 'lucide-react';

export default function BillsView() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto text-white space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Tagihan & Langganan</h1>
        <p className="text-xs sm:text-sm text-slate-400">Pantau pengingat tagihan rutin bulanan Anda.</p>
      </div>

      <div className="bg-slate-900/90 rounded-3xl p-8 border border-slate-800/80 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 text-blue-400 flex items-center justify-center mx-auto">
          <Receipt className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-200">Belum ada tagihan aktif</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">Fitur pengelolaan tagihan berkala akan membantu Anda mencatat langganan dan cicilan.</p>
      </div>
    </div>
  );
}