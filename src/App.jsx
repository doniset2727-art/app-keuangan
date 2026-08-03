import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  Trash2, 
  Receipt, 
  Calendar,
  X 
} from 'lucide-react'

function App() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('expense')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    fetchCategories()
    fetchTransactions()
  }, [])

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*')
    if (error) console.error('Error fetching categories:', error)
    else setCategories(data || [])
  }

  const fetchTransactions = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('transactions')
      .select('*, categories(name)')
      .order('created_at', { ascending: false })

    if (error) console.error('Error fetching transactions:', error)
    else setTransactions(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount || !type) return alert('Mohon isi nominal dan tipe transaksi!')

    const { error } = await supabase.from('transactions').insert([
      {
        amount: parseFloat(amount),
        type,
        category_id: categoryId ? parseInt(categoryId) : null,
        description,
      },
    ])

    if (error) {
      alert('Gagal menyimpan transaksi: ' + error.message)
    } else {
      setAmount('')
      setDescription('')
      setCategoryId('')
      setShowModal(false)
      fetchTransactions()
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (error) alert('Gagal menghapus: ' + error.message)
      else fetchTransactions()
    }
  }

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + Number(curr.amount), 0)

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + Number(curr.amount), 0)

  const balance = totalIncome - totalExpense

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(number)
  }

  const filteredCategories = categories.filter((c) => c.type === type)

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700/50 shadow-xl">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Wallet className="w-7 h-7 text-blue-500" />
              Manajemen Keuangan
            </h1>
            <p className="text-sm text-slate-400 mt-1">Pantau pemasukan dan pengeluaran harian Anda</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <PlusCircle className="w-5 h-5" />
            Tambah Transaksi
          </button>
        </header>

        {/* Ringkasan Saldo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card Total Saldo */}
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/50 shadow-md">
            <div className="flex justify-between items-center text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Saldo</span>
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatRupiah(balance)}
            </p>
          </div>

          {/* Card Pemasukan */}
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/50 shadow-md">
            <div className="flex justify-between items-center text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Pemasukan</span>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">{formatRupiah(totalIncome)}</p>
          </div>

          {/* Card Pengeluaran */}
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/50 shadow-md">
            <div className="flex justify-between items-center text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Pengeluaran</span>
              <TrendingDown className="w-5 h-5 text-rose-400" />
            </div>
            <p className="text-2xl font-bold text-rose-400">{formatRupiah(totalExpense)}</p>
          </div>
        </div>

        {/* Tabel Riwayat Transaksi */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-slate-400" />
              Riwayat Transaksi
            </h2>
            <span className="text-xs text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full">
              {transactions.length} Transaksi
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400">Memuat data transaksi...</div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400">Belum ada transaksi tercatat.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700/50">
                  <tr>
                    <th className="p-4">Tanggal</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Catatan</th>
                    <th className="p-4 text-right">Nominal</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {transactions.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 whitespace-nowrap text-slate-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        {item.transaction_date}
                      </td>
                      <td className="p-4 font-medium text-white">
                        <span className="bg-slate-700/60 px-2.5 py-1 rounded-lg text-xs">
                          {item.categories?.name || 'Tanpa Kategori'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{item.description || '-'}</td>
                      <td className={`p-4 text-right font-semibold whitespace-nowrap ${
                        item.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {item.type === 'income' ? '+' : '-'} {formatRupiah(item.amount)}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Form */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex justify-between items-center border-b border-slate-700 pb-4">
                <h3 className="text-lg font-semibold text-white">Tambah Transaksi Baru</h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tipe Transaksi</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setType('expense')}
                      className={`p-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        type === 'expense' 
                          ? 'bg-rose-500/10 border-rose-500 text-rose-400' 
                          : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      Pengeluaran
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('income')}
                      className={`p-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        type === 'income' 
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                          : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      Pemasukan
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nominal (Rp)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 50000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Kategori</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {filteredCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Catatan / Deskripsi</label>
                  <input
                    type="text"
                    placeholder="Contoh: Beli bensin & parkir"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-400 hover:bg-slate-700 text-sm font-semibold transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/20 transition-all"
                  >
                    Simpan Transaksi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default App