import React from 'react';
import { Settings as SettingsIcon, User, Shield, Bell } from 'lucide-react';

export default function SettingsView() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto text-white space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Pengaturan</h1>
        <p className="text-xs sm:text-sm text-slate-400">Kelola preferensi akun dan aplikasi Anda.</p>
      </div>

      <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800/80 space-y-4">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/60">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            DS
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Doni Setiawan Putra</h3>
            <p className="text-xs text-slate-400">doni@email.com</p>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-950/40 border border-slate-800/40 cursor-pointer hover:border-slate-700 transition-colors">
            <span className="text-xs sm:text-sm font-semibold text-slate-200">Edit Profil & Informasi Akun</span>
            <span className="text-xs text-blue-400 font-bold">Ubah</span>
          </div>
          <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-950/40 border border-slate-800/40 cursor-pointer hover:border-slate-700 transition-colors">
            <span className="text-xs sm:text-sm font-semibold text-slate-200">Keamanan & Sandi</span>
            <span className="text-xs text-blue-400 font-bold">Atur</span>
          </div>
        </div>
      </div>
    </div>
  );
}