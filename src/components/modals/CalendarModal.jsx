import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { FULL_MONTH_NAMES } from '../../constants/dateConstants';

export default function CalendarModal({ isOpen, onClose, currentDate, setCurrentDate }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b0f19] w-full max-w-sm p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" /> Pilih Bulan & Tahun
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="flex justify-between items-center bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400">Tahun</span>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                const nextDate = new Date(currentDate);
                nextDate.setFullYear(nextDate.getFullYear() - 1);
                setCurrentDate(nextDate);
              }}
              className="p-1 hover:bg-slate-800 rounded text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm text-white">{currentDate.getFullYear()}</span>
            <button 
              onClick={() => {
                const nextDate = new Date(currentDate);
                nextDate.setFullYear(nextDate.getFullYear() + 1);
                setCurrentDate(nextDate);
              }}
              className="p-1 hover:bg-slate-800 rounded text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2">
          {FULL_MONTH_NAMES.map((mName, idx) => {
            const isSelected = currentDate.getMonth() === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  const newD = new Date(currentDate);
                  newD.setDate(1);
                  newD.setMonth(idx);
                  setCurrentDate(newD);
                  onClose();
                }}
                className={`py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isSelected 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800/60'
                }`}
              >
                {mName}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}