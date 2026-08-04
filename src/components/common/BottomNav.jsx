import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, ArrowLeftRight, Plus, ReceiptText, WalletCards } from 'lucide-react';

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-xl px-4 py-2 block lg:hidden shadow-2xl">
      <div className="flex justify-around items-center max-w-md mx-auto relative">
        
        {/* Menu Dashboard */}
        <NavLink 
          to="/" 
          className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px]">Dashboard</span>
        </NavLink>

        {/* Menu Transaksi */}
        <NavLink 
          to="/transactions" 
          className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <ArrowLeftRight className="w-5 h-5" />
          <span className="text-[10px]">Transaksi</span>
        </NavLink>

        {/* Tombol Utama (+) di Tengah */}
        <div className="relative -top-5">
          <NavLink 
            to="/transactions" 
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all border-4 border-slate-950"
          >
            <Plus className="w-7 h-7" />
          </NavLink>
        </div>

        {/* Menu Tagihan */}
        <NavLink 
          to="/bills" 
          className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <ReceiptText className="w-5 h-5" />
          <span className="text-[10px]">Tagihan</span>
        </NavLink>

        {/* Menu Dompet */}
        <NavLink 
          to="/wallets" 
          className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <WalletCards className="w-5 h-5" />
          <span className="text-[10px]">Dompet</span>
        </NavLink>

      </div>
    </div>
  );
}