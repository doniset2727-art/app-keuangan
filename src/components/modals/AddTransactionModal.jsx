import React from 'react';

export default function AddTransactionModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
      <div className="bg-[#0b0f19] w-full max-w-md p-6 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Tambah Transaksi Baru</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        
        <p className="text-sm text-slate-400 mb-6">Form input Pemasukan & Pengeluaran akan diatur di sini.</p>
        
        <button 
          onClick={onClose}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition-colors text-white"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}