import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Receipt, Wallet, Settings } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/transactions', label: 'Transaksi', icon: ArrowLeftRight },
    { path: '/bills', label: 'Tagihan', icon: Receipt },
    { path: '/wallets', label: 'Dompet', icon: Wallet },
    { path: '/settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between p-6 min-h-screen sticky top-0">
      <div className="space-y-8">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-md border border-slate-800/80 flex-shrink-0 overflow-hidden p-1.5 ring-1 ring-blue-500/20">
            <img 
              src="/logo.png" 
              alt="D&A Wallet Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-white">D&amp;A WALLET</h1>
            <p className="text-[10px] text-slate-400 font-medium">Fintech Dashboard</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="pt-4 border-t border-slate-900">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/60">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-black text-xs">
            DS
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-black text-slate-200 truncate">Doni Setiawan</p>
            <p className="text-[10px] text-slate-400 truncate">doni@email.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}