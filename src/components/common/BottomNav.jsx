import React from 'react';
import { LayoutDashboard, ArrowRightLeft, Plus, Receipt, Wallet } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, onOpenAddModal }) {
  const navItemsLeft = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transaksi', label: 'Transaksi', icon: ArrowRightLeft },
  ];

  const navItemsRight = [
    { id: 'tagihan', label: 'Tagihan', icon: Receipt },
    { id: 'dompet', label: 'Dompet', icon: Wallet },
  ];

  return (
    /* Tambahkan md:hidden di sini agar otomatis tersembunyi di Desktop/Laptop */
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#2a2a2a] px-2 py-2 flex justify-between items-center text-[10px] z-40">
      
      {/* Navigasi Kiri: Dashboard & Transaksi */}
      <div className="flex flex-1 justify-around">
        {navItemsLeft.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 w-16 transition-colors ${
                isActive ? 'text-white font-medium' : 'text-gray-500 hover:text-gray-400'
              }`}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tombol Plus (+) Menjolok di Tengah */}
      <div className="relative -top-6 flex-shrink-0 mx-2">
        <button
          onClick={onOpenAddModal}
          className="bg-blue-500 hover:bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center border-4 border-[#121212]"
        >
          <Plus className="w-8 h-8" strokeWidth={2.5} />
        </button>
      </div>

      {/* Navigasi Kanan: Tagihan & Dompet */}
      <div className="flex flex-1 justify-around">
        {navItemsRight.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 w-16 transition-colors ${
                isActive ? 'text-white font-medium' : 'text-gray-500 hover:text-gray-400'
              }`}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

    </nav>
  );
}