import React from 'react';
import { Crown, BarChart2, CalendarDays, ChevronDown } from 'lucide-react';

export default function Header({ 
  userName = "Doni", 
  netBalance = 10000000, 
  setActiveTab, 
  setIsCalendarOpen 
}) {
  return (
    /* Tambahkan md:hidden di sini agar header ini hanya muncul di HP/Mobile */
    <header className="md:hidden px-4 pt-6 pb-4 flex justify-between items-start bg-[#121212] text-white">
      {/* Bagian Kiri: Nama & Saldo Utama */}
      <div>
        <p className="text-gray-400 text-sm mb-0.5">{userName}</p>
        <div 
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => setActiveTab && setActiveTab('dashboard')}
        >
          <h1 className="text-2xl font-bold">
            Rp {netBalance.toLocaleString('id-ID')}
          </h1>
          <ChevronDown className="w-5 h-5 text-gray-400 mt-1" />
        </div>
      </div>

      {/* Bagian Kanan: Icon Fitur */}
      <div className="flex items-center gap-5 text-gray-300 mt-1">
        <div className="relative cursor-pointer">
          <Crown className="w-6 h-6 text-yellow-500" />
          <span className="absolute -bottom-1 -right-2 bg-yellow-600 text-[9px] font-bold px-1 rounded-sm text-white">
            PRO
          </span>
        </div>
        <BarChart2 className="w-6 h-6 cursor-pointer hover:text-white" />
        <CalendarDays 
          className="w-6 h-6 cursor-pointer hover:text-white" 
          onClick={() => setIsCalendarOpen && setIsCalendarOpen(true)}
        />
      </div>
    </header>
  );
}