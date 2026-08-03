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
  X,
  PieChart as PieChartIcon,
  BarChart2,
  Search,
  Filter,
  RotateCcw
} from 'lucide-react'
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts'

const CHART_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

const MONTHS = [
  { value: '01', label: 'Januari' },
  { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
]

function App() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // State Filter & Search
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')

  // State Modal Form
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
      .order('transaction_date', { ascending: false })

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

  // Dapatkan daftar tahun unik yang ada di transaksi
  const availableYears = Array.from(
    new Set(
      transactions
        .map((t) => t.transaction_date?.split('-')[0])
        .filter(Boolean)
    )
  ).sort((a, b) => b - a)

  // LOGIKA FILTER TRANSAKSI
  const filteredTransactions = transactions.filter((t) => {
    const [year, month] = t.transaction_date ? t.transaction_date.split('-') : ['', '']

    const matchesSearch =
      (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.categories?.name || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesMonth = selectedMonth === 'all' || month === selectedMonth
    const matchesYear = selectedYear === 'all' || year === selectedYear

    return matchesSearch && matchesMonth && matchesYear
  })

  // Kalkulasi Saldo Berdasarkan Filter
  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + Number(curr.amount), 0)

  const totalExpense = filteredTransactions
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

  // Olah Data Pie Chart Berdasarkan Filter
  const expenseByCategory = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      const catName = t.categories?.name || 'Tanpa Kategori'
      acc[catName] = (acc[catName] || 0) + Number(t.amount)
      return acc
    }, {})

  const pieChartData = Object.keys(expenseByCategory).map((name) => ({
    name,
    value: expenseByCategory[name],
  }))

  // Olah Data Bar Chart Berdasarkan Filter
  const barChartData = [
    { name: 'Pemasukan', total: totalIncome },
    { name: 'Pengeluaran', total: totalExpense },
  ]

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedMonth('all')
    setSelectedYear('all')
  }

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

        {/* Filter & Search Toolbar */}
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700/50 shadow-lg flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Input Search */}
          <div className="relative w-full md:w-1/2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari transaksi atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-sm rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
              
              {/* Filter Bulan */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-sm rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors w-full sm:w-auto"
              >
                <option value="all">Semua Bulan</option>
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>

              {/* Filter Tahun */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-sm rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors w-full sm:w-auto"
              >
                <option value="all">Semua Tahun</option>
                {availableYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Reset Filter Button */}
            {(searchTerm || selectedMonth !== 'all' || selectedYear !== 'all') && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 px-3 py-2.5 rounded-xl border border-rose-500/20 transition-all"
                title="Reset Filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Ringkasan Saldo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/50 shadow-md">
            <div className="flex justify-between items-center text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Saldo</span>
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatRupiah(balance)}
            </p>
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/50 shadow-md">
            <div className="flex justify-between items-center text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Pemasukan</span>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">{formatRupiah(totalIncome)}</p>
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/50 shadow-md">
            <div className="flex justify-between items-center text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Pengeluaran</span>
              <TrendingDown className="w-5 h-5 text-rose-400" />
            </div>
            <p className="text-2xl font-bold text-rose-400">{formatRupiah(totalExpense)}</p>
          </div>
        </div>

        {/* Visualisasi Grafik Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Pie Chart: Pengeluaran Per Kategori */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50 shadow-xl flex flex-col justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
              <PieChartIcon className="w-5 h-5 text-rose-400" />
              Pengeluaran per Kategori
            </h3>
            
            {pieChartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
                Tidak ada data pengeluaran
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatRupiah(value)}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Bar Chart: Pemasukan vs Pengeluaran */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50 shadow-xl flex flex-col justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
              <BarChart2 className="w-5 h-5 text-blue-400" />
              Perbandingan Arus Kas
            </h3>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} tickFormatter={(val) => `Rp${val / 1000}k`} width={70} />
                  <Tooltip 
                    formatter={(value) => formatRupiah(value)}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                  />
                  <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
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
              {filteredTransactions.length} Transaksi Ditemukan
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400">Memuat data transaksi...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              {transactions.length === 0 ? 'Belum ada transaksi tercatat.' : 'Tidak ada transaksi yang cocok dengan filter.'}
            </div>
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
                  {filteredTransactions.map((item) => (
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