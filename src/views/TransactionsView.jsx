import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowUpRight, ArrowDownLeft, Wallet, Tag, Calendar, FileText, Search } from 'lucide-react';
import { getTransactions, addTransaction, deleteTransaction, getWallets, getCategories } from '../services/financeService';

export default function Transactionsview() {
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // State Form Input Transaksi
  const [type, setType] = useState('expense'); // 'income' atau 'expense'
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [walletId, setWalletId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [txData, walletData, catData] = await Promise.all([
        getTransactions(),
        getWallets(),
        getCategories()
      ]);
      setTransactions(txData || []);
      setWallets(walletData || []);
      setCategories(catData || []);
      
      if (walletData && walletData.length > 0) setWalletId(walletData[0].id);
      
      // Set default category berdasarkan tipe awal ('expense')
      if (catData && catData.length > 0) {
        const defaultCats = catData.filter(cat => cat.type === 'expense');
        if (defaultCats.length > 0) {
          setCategoryId(defaultCats[0].id);
        } else {
          setCategoryId(catData[0].id);
        }
      }
    } catch (error) {
      console.error("Gagal memuat data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Logika saat tombol jenis transaksi (Pemasukan/Pengeluaran) ditekan
  const handleTypeChange = (newType) => {
    setType(newType);
    // Filter kategori berdasarkan tipe yang baru dipilih
    const filtered = categories.filter(cat => cat.type ? cat.type === newType : true);
    if (filtered.length > 0) {
      setCategoryId(filtered[0].id);
    } else {
      setCategoryId('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !walletId) {
      alert("Mohon isi nominal dan pilih dompet terlebih dahulu!");
      return;
    }

    const numericAmount = Number(amount);

    // LOGIKA VALIDASI SALDO UNTUK PENGELUARAN (EXPENSE)
    if (type === 'expense') {
      const selectedWallet = wallets.find(w => String(w.id) === String(walletId));

      if (!selectedWallet) {
        alert("Dompet yang dipilih tidak ditemukan!");
        return;
      }

      const currentBalance = Number(selectedWallet.balance || 0);

      if (currentBalance <= 0) {
        alert(`Gagal! Saldo di dompet "${selectedWallet.name}" saat ini kosong (Rp 0).`);
        return;
      }

      if (numericAmount > currentBalance) {
        alert(
          `Saldo Anda tidak mencukupi!\n\n` +
          `Dompet: ${selectedWallet.name}\n` +
          `Saldo Tersedia: Rp ${currentBalance.toLocaleString('id-ID')}\n` +
          `Nominal Pengeluaran: Rp ${numericAmount.toLocaleString('id-ID')}`
        );
        return; // Hentikan proses simpan jika saldo tidak cukup
      }
    }

    try {
      setIsSubmitting(true);
      const newTx = {
        type,
        amount: numericAmount,
        category_id: categoryId ? Number(categoryId) : null,
        wallet_id: Number(walletId),
        date,
        description
      };

      await addTransaction(newTx);
      
      setAmount('');
      setDescription('');
      
      // Refresh ulang data transaksi dan data dompet terbaru agar saldo ter-update
      const [updatedTx, updatedWallets] = await Promise.all([
        getTransactions(),
        getWallets()
      ]);
      setTransactions(updatedTx || []);
      setWallets(updatedWallets || []);

      alert("Transaksi berhasil dicatat!");
    } catch (error) {
      console.error("Gagal menyimpan transaksi:", error);
      alert("Gagal mencatat transaksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Yakin ingin menghapus transaksi ini?")) {
      try {
        await deleteTransaction(id);
        setTransactions(transactions.filter(tx => tx.id !== id));
        // Refresh dompet juga setelah hapus transaksi agar saldo kembali menyesuaikan
        const updatedWallets = await getWallets();
        setWallets(updatedWallets || []);
      } catch (error) {
        alert("Gagal menghapus transaksi");
      }
    }
  };

  const filteredTransactions = transactions.filter(tx => 
    tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.categories?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Kategori yang hanya tampil sesuai dengan type yang aktif (income / expense)
  const activeCategories = categories.filter(cat => cat.type ? cat.type === type : true);

  return (
    <div className="w-full pb-28 md:pb-12 text-white font-sans antialiased p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* HEADER HALAMAN */}
      <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800/80 backdrop-blur-xl">
        <h1 className="text-lg sm:text-xl font-black tracking-wide uppercase text-white">Kelola Transaksi</h1>
        <p className="text-xs text-slate-400 font-medium">Catat pemasukan atau pengeluaran serta pantau riwayat keuangan Anda</p>
      </div>

      {/* FORM INPUT PEMASUKAN / PENGELUARAN */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
        <h2 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-400" />
          <span>Form Catat Transaksi Baru</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all border cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Pemasukan</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all border cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Pengeluaran</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Nominal (Rp)</label>
              <input 
                type="number"
                placeholder="Contoh: 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Tag className="w-3 h-3 text-blue-400" /> Kategori ({type === 'income' ? 'Pemasukan' : 'Pengeluaran'})
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {activeCategories.length === 0 ? (
                  <option value="">Tidak ada kategori untuk tipe ini</option>
                ) : (
                  activeCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Wallet className="w-3 h-3 text-blue-400" /> Dompet / Rekening
              </label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>{w.name} (Rp {Number(w.balance || 0).toLocaleString('id-ID')})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3 text-blue-400" /> Tanggal
              </label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <FileText className="w-3 h-3 text-blue-400" /> Keterangan (Opsional)
            </label>
            <input 
              type="text"
              placeholder="Contoh: Beli makan siang / Gaji bulanan"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-all shadow-lg shadow-blue-600/30 active:scale-[0.98] cursor-pointer"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
          </button>
        </form>
      </div>

      {/* RIWAYAT TRANSAKSI */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
          <h2 className="text-sm font-black uppercase tracking-wider text-white">Riwayat Transaksi</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari riwayat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800/60 rounded-3xl">
            <p className="text-xs text-slate-400 font-bold">Belum ada data transaksi.</p>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider bg-slate-950/40">
                    <th className="py-4 px-6 font-bold">Tanggal</th>
                    <th className="py-4 px-6 font-bold">Kategori</th>
                    <th className="py-4 px-6 font-bold">Keterangan</th>
                    <th className="py-4 px-6 font-bold">Dompet</th>
                    <th className="py-4 px-6 font-bold text-right">Jumlah</th>
                    <th className="py-4 px-6 font-bold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredTransactions.map((tx) => {
                    const isIncome = tx.type === 'income';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-6 text-slate-300 font-medium whitespace-nowrap">
                          {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className="px-3 py-1 rounded-full text-[10px] font-black bg-slate-800 text-slate-200 border border-slate-700">
                            {tx.categories?.name || 'Umum'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-white font-bold">{tx.description || '-'}</td>
                        <td className="py-4 px-6 text-slate-400 whitespace-nowrap">{tx.wallets?.name || 'Dompet Utama'}</td>
                        <td className={`py-4 px-6 text-right font-black whitespace-nowrap ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isIncome ? '+' : '-'} Rp {Number(tx.amount || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="py-4 px-6 text-center whitespace-nowrap">
                          <button 
                            onClick={() => handleDelete(tx.id)}
                            className="p-2 rounded-xl bg-slate-800/80 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}