import React, { useState, useEffect } from 'react';
import { getWallets } from '../services/financeService';
import { Wallet, CreditCard } from 'lucide-react';

export default function WalletView() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const data = await getWallets();
      setWallets(data || []);
    } catch (error) {
      console.error("Gagal memuat dompet:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto text-white space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Dompet & Rekening</h1>
        <p className="text-xs sm:text-sm text-slate-400">Kelola berbagai akun pembayaran dan saldo Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-xs text-slate-400 col-span-2 text-center py-6 animate-pulse">Memuat dompet...</p>
        ) : wallets.length === 0 ? (
          <p className="text-xs text-slate-500 col-span-2 text-center py-12 italic">Belum ada dompet atau rekening terdaftar.</p>
        ) : (
          wallets.map((w, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg">Aktif</span>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Nama Rekening / Dompet</p>
                <h3 className="text-lg font-bold text-white">{w.name}</h3>
              </div>
              <div className="pt-3 border-t border-slate-800/80 flex justify-between items-center">
                <span className="text-xs text-slate-400">Saldo Tersedia</span>
                <span className="text-base font-extrabold text-blue-400">Rp {Number(w.balance || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}