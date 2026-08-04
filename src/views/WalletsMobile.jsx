import React from 'react';
import { Wallet, Plus, Trash2, Building2, CreditCard, Banknote } from 'lucide-react';

export default function WalletsMobile({
  wallets,
  loading,
  name,
  setName,
  type,
  setType,
  isSubmitting,
  onSubmit,
  onDelete,
  formatRupiah,
  totalBalance
}) {
  const getWalletIcon = (accountType) => {
    const t = (accountType || '').toLowerCase();
    if (t.includes('bank')) return <Building2 className="w-5 h-5 text-blue-400" />;
    if (t.includes('e-wallet') || t.includes('ewallet')) return <CreditCard className="w-5 h-5 text-purple-400" />;
    return <Banknote className="w-5 h-5 text-emerald-400" />;
  };

  return (
    <div className="p-4 space-y-5 pb-24 text-slate-100 font-sans">
      
      {/* HEADER MOBILE */}
      <div className="bg-[#121826] border border-slate-800/80 p-5 rounded-2xl shadow-xl space-y-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">DOMPET & REKENING</h1>
          <p className="text-xs text-slate-400 mt-1 font-normal leading-relaxed">
            Kelola akun pembayaran, rekening bank, dan saldo tunai Anda.
          </p>
        </div>
        <div className="bg-[#1a2234] border border-slate-700/60 p-4 rounded-xl shadow-inner">
          <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">Total Seluruh Saldo</p>
          <p className="text-xl font-extrabold text-blue-400 mt-1 tracking-tight">{formatRupiah(totalBalance)}</p>
        </div>
      </div>

      {/* FORM TAMBAH DOMPET MOBILE */}
      <div className="bg-[#121826] border border-slate-800/80 p-5 rounded-2xl shadow-xl">
        <h2 className="text-xs font-bold tracking-wider uppercase flex items-center gap-2 mb-4 text-slate-200">
          <Plus className="w-4 h-4 text-blue-500" />
          Tambah Dompet Baru
        </h2>

        <form onSubmit={onSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Nama Dompet / Bank
            </label>
            <input
              type="text"
              placeholder="Contoh: BCA, GoPay"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1a2234] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition shadow-inner"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Jenis Akun
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-[#1a2234] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition shadow-inner"
            >
              <option value="Bank">Rekening Bank</option>
              <option value="E-Wallet">E-Wallet</option>
              <option value="Tunai">Tunai / Cash</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold py-3 rounded-xl transition duration-200 shadow-lg shadow-blue-600/25 disabled:opacity-50 mt-2 text-sm tracking-wide"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Dompet'}
          </button>
        </form>
      </div>

      {/* DAFTAR AKUN TERDAFTAR MOBILE */}
      <div className="bg-[#121826] border border-slate-800/80 p-5 rounded-2xl shadow-xl">
        <h2 className="text-xs font-bold tracking-wider uppercase mb-4 text-slate-200">
          Daftar Akun Terdaftar
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500 text-xs font-medium">
            Memuat data dompet...
          </div>
        ) : wallets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-800/80 rounded-xl">
            <Wallet className="w-10 h-10 text-slate-600 mb-2.5 stroke-[1.5]" />
            <p className="text-xs text-slate-400 font-medium">Belum ada dompet terdaftar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="bg-[#1a2234] border border-slate-700/60 p-3.5 rounded-xl flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800/90 flex items-center justify-center shrink-0 border border-slate-700/50">
                    {getWalletIcon(wallet.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm tracking-tight">{wallet.name}</h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">{wallet.type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-extrabold text-slate-100 text-sm tracking-tight">{formatRupiah(wallet.balance)}</p>
                  </div>
                  <button
                    onClick={() => onDelete(wallet.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    title="Hapus Dompet"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}