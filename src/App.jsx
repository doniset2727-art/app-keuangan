import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  Trash2, 
  Pencil,
  Receipt, 
  Calendar,
  X,
  PieChart as PieChartIcon,
  BarChart2,
  Search,
  Filter,
  RotateCcw,
  Target,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Tags,
  Plus
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

  // State Modal & Form (Tambah / Edit Transaksi)
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('expense')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')

  // State Batas Anggaran (Monthly Budgeting)
  const [monthlyBudget, setMonthlyBudget] = useState(3000000)
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [inputBudget, setInputBudget] = useState('')

  // State Kelola Kategori Mandiri (Custom Categories)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [catName, setCatName] = useState('')
  const [catType, setCatType] = useState('expense')
  const [editingCategory, setEditingCategory] = useState(null)

  useEffect(() => {
    fetchCategories()
    fetchTransactions()
  }, [])

  // Muat Anggaran dari LocalStorage saat Filter Bulan/Tahun Berubah
  useEffect(() => {
    const budgetKey = `budget_${selectedYear}_${selectedMonth}`
    const savedBudget = localStorage.getItem(budgetKey) || localStorage.getItem('master_monthly_budget') || '3000000'
    setMonthlyBudget(Number(savedBudget))
  }, [selectedMonth, selectedYear])

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

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

  // Buka Modal Transaksi
  const handleOpenCreateModal = () => {
    setEditingTransaction(null)
    setAmount('')
    setType('expense')
    setCategoryId('')
    setDescription('')
    setShowModal(true)
  }

  const handleOpenEditModal = (item) => {
    setEditingTransaction(item)
    setAmount(item.amount)
    setType(item.type)
    setCategoryId(item.category_id || '')
    setDescription(item.description || '')
    setShowModal(true)
  }

  // Handle Simpan Transaksi (Tambah / Update)
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount || !type) return alert('Mohon isi nominal dan tipe transaksi!')

    const payload = {
      amount: parseFloat(amount),
      type,
      category_id: categoryId ? parseInt(categoryId) : null,
      description,
    }

    if (editingTransaction) {
      const { error } = await supabase
        .from('transactions')
        .update(payload)
        .eq('id', editingTransaction.id)

      if (error) alert('Gagal memperbarui transaksi: ' + error.message)
      else {
        setShowModal(false)
        fetchTransactions()
      }
    } else {
      const { error } = await supabase.from('transactions').insert([payload])

      if (error) alert('Gagal menyimpan transaksi: ' + error.message)
      else {
        setShowModal(false)
        fetchTransactions()
      }
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (error) alert('Gagal menghapus: ' + error.message)
      else fetchTransactions()
    }
  }

  // Handle Simpan Target Anggaran
  const handleSaveBudget = (e) => {
    e.preventDefault()
    const num = parseFloat(inputBudget)
    if (isNaN(num) || num < 0) return alert('Masukkan nominal anggaran yang valid!')

    setMonthlyBudget(num)
    const budgetKey = `budget_${selectedYear}_${selectedMonth}`
    localStorage.setItem(budgetKey, num.toString())
    localStorage.setItem('master_monthly_budget', num.toString())
    setShowBudgetModal(false)
  }

  // --- KELOLA KATEGORI LOGIC ---
  const handleOpenCategoryModal = () => {
    setCatName('')
    setCatType('expense')
    setEditingCategory(null)
    setShowCategoryModal(true)
  }

  const handleEditCategoryClick = (cat) => {
    setEditingCategory(cat)
    setCatName(cat.name)
    setCatType(cat.type)
  }

  const handleCancelCategoryEdit = () => {
    setEditingCategory(null)
    setCatName('')
    setCatType('expense')
  }

  const handleSaveCategory = async (e) => {
    e.preventDefault()
    if (!catName.trim()) return alert('Nama kategori tidak boleh kosong!')

    if (editingCategory) {
      // Update Kategori
      const { error } = await supabase
        .from('categories')
        .update({ name: catName.trim(), type: catType })
        .eq('id', editingCategory.id)

      if (error) {
        alert('Gagal mengedit kategori: ' + error.message)
      } else {
        handleCancelCategoryEdit()
        fetchCategories()
        fetchTransactions() // refresh jika nama kategori di transaksi terpengaruh
      }
    } else {
      // Tambah Kategori Baru
      const { error } = await supabase
        .from('categories')
        .insert([{ name: catName.trim(), type: catType }])

      if (error) {
        alert('Gagal menambah kategori: ' + error.message)
      } else {
        setCatName('')
        fetchCategories()
      }
    }
  }

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Hapus kategori ini? Transaksi yang menggunakan kategori ini mungkin kehilangan label kategorinya.')) {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) {
        alert('Gagal menghapus kategori (mungkin masih digunakan oleh transaksi): ' + error.message)
      } else {
        fetchCategories()
        fetchTransactions()
      }
    }
  }

  // Dapatkan daftar tahun unik
  const availableYears = Array.from(
    new Set(
      transactions
        .map((t) => t.transaction_date?.split('-')[0])
        .filter(Boolean)
    )
  ).sort((a, b) => b - a)

  // Filter Transaksi
  const filteredTransactions = transactions.filter((t) => {
    const [year, month] = t.transaction_date ? t.transaction_date.split('-') : ['', '']

    const matchesSearch =
      (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.categories?.name || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesMonth = selectedMonth === 'all' || month === selectedMonth
    const matchesYear = selectedYear === 'all' || year === selectedYear

    return matchesSearch && matchesMonth && matchesYear
  })

  // Kalkulasi Saldo
  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + Number(curr.amount), 0)

  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + Number(curr.amount), 0)

  const balance = totalIncome - totalExpense

  // Kalkulasi Target Budget
  const budgetPercentage = monthlyBudget > 0 ? Math.round((totalExpense / monthlyBudget) * 100) : 0
  const remainingBudget = monthlyBudget - totalExpense

  let budgetColorClass = 'bg-emerald-500'
  let budgetBadgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  let budgetStatusText = 'Anggaran Aman'

  if (budgetPercentage >= 95) {
    budgetColorClass = 'bg-rose-500'
    budgetBadgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    budgetStatusText = budgetPercentage > 100 ? 'Melebihi Anggaran!' : 'Batas Limit Krusial'
  } else if (budgetPercentage >= 75) {
    budgetColorClass = 'bg-amber-500'
    budgetBadgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    budgetStatusText = 'Mendekati Limit'
  }

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(number)
  }

  const filteredCategories = categories.filter((c) => c.type === type)

  // Data Pie Chart
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

  // Data Bar Chart
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
          
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleOpenCategoryModal}
              className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all border border-slate-600 active:scale-95 flex-1 sm:flex-none"
            >
              <Tags className="w-4 h-4 text-amber-400" />
              Kelola Kategori
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex-1 sm:flex-none"
            >
              <PlusCircle className="w-4 h-4" />
              Tambah Transaksi
            </button>
          </div>
        </header>

        {/* Filter & Search Toolbar */}
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700/50 shadow-lg flex flex-col md:flex-row gap-3 items-center justify-between">
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

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
              
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

        {/* Seksi Batas Anggaran Bulanan */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Target Anggaran Pengeluaran</h3>
                <p className="text-xs text-slate-400">Kontrol batas pengeluaran bulanan Anda</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-xs px-3 py-1 rounded-full border font-medium ${budgetBadgeColor}`}>
                {budgetStatusText} ({budgetPercentage}%)
              </span>
              <button
                onClick={() => {
                  setInputBudget(monthlyBudget.toString())
                  setShowBudgetModal(true)
                }}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-xl border border-blue-500/20 transition-all font-medium"
              >
                <Sliders className="w-3.5 h-3.5" />
                Atur Anggaran
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="w-full bg-slate-900 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className={`h-full rounded-full transition-all duration-500 ${budgetColorClass}`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center text-xs font-medium text-slate-400 pt-1">
              <span>Pengeluaran: <strong className="text-white">{formatRupiah(totalExpense)}</strong></span>
              <span>Target: <strong className="text-white">{formatRupiah(monthlyBudget)}</strong></span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 border-t border-slate-700/40 gap-2 text-xs">
            <div className="text-slate-400">
              {remainingBudget >= 0 ? (
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Sisa Anggaran: {formatRupiah(remainingBudget)}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  Peringatan: Melebihi anggaran sebesar {formatRupiah(Math.abs(remainingBudget))}
                </span>
              )}
            </div>
            <span className="text-slate-500 italic">
              *Tersimpan otomatis per periode filter
            </span>
          </div>
        </div>

        {/* Visualisasi Grafik Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Edit Transaksi"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Transaksi (Tambah / Edit) */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex justify-between items-center border-b border-slate-700 pb-4">
                <h3 className="text-lg font-semibold text-white">
                  {editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
                </h3>
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
                    {editingTransaction ? 'Simpan Perubahan' : 'Simpan Transaksi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Form Target Budget */}
        {showBudgetModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex justify-between items-center border-b border-slate-700 pb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Atur Target Anggaran
                </h3>
                <button 
                  onClick={() => setShowBudgetModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveBudget} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Batas Maksimal Pengeluaran (Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 3000000"
                    value={inputBudget}
                    onChange={(e) => setInputBudget(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Batas ini digunakan sebagai indikator peringatan pengeluaran pada periode terpilih.
                  </p>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBudgetModal(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-400 hover:bg-slate-700 text-sm font-semibold transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/20 transition-all"
                  >
                    Simpan Target
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL KELOLA KATEGORI MANDIRI (CUSTOM CATEGORIES) */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
              
              <div className="flex justify-between items-center border-b border-slate-700 pb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Tags className="w-5 h-5 text-amber-400" />
                  Kelola Kategori Mandiri
                </h3>
                <button 
                  onClick={() => setShowCategoryModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Tambah / Edit Kategori */}
              <form onSubmit={handleSaveCategory} className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={catType}
                    onChange={(e) => setCatType(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-sm rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="expense">Pengeluaran</option>
                    <option value="income">Pemasukan</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Nama kategori (ex: Investasi, Hobi)..."
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-sm rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 flex-1"
                    required
                  />

                  <div className="flex gap-1.5">
                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-1"
                    >
                      {editingCategory ? <Pencil className="w-3.5 h-3.5" /> : <Plus className="w-4 h-4" />}
                      {editingCategory ? 'Update' : 'Tambah'}
                    </button>

                    {editingCategory && (
                      <button
                        type="button"
                        onClick={handleCancelCategoryEdit}
                        className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium px-3 py-2 rounded-xl text-sm transition-all"
                      >
                        Batal
                      </button>
                    )}
                  </div>
                </div>
              </form>

              {/* Daftar Kategori Eksisting */}
              <div className="space-y-4">
                {/* Kategori Pengeluaran */}
                <div>
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4" />
                    Kategori Pengeluaran ({categories.filter(c => c.type === 'expense').length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.filter(c => c.type === 'expense').map(cat => (
                      <div key={cat.id} className="bg-slate-900 border border-slate-700/80 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs text-slate-200">
                        <span>{cat.name}</span>
                        <div className="flex items-center gap-1 border-l border-slate-700 pl-1.5">
                          <button
                            onClick={() => handleEditCategoryClick(cat)}
                            className="text-slate-400 hover:text-amber-400 p-0.5 rounded"
                            title="Edit"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="text-slate-400 hover:text-rose-400 p-0.5 rounded"
                            title="Hapus"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kategori Pemasukan */}
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    Kategori Pemasukan ({categories.filter(c => c.type === 'income').length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.filter(c => c.type === 'income').map(cat => (
                      <div key={cat.id} className="bg-slate-900 border border-slate-700/80 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs text-slate-200">
                        <span>{cat.name}</span>
                        <div className="flex items-center gap-1 border-l border-slate-700 pl-1.5">
                          <button
                            onClick={() => handleEditCategoryClick(cat)}
                            className="text-slate-400 hover:text-amber-400 p-0.5 rounded"
                            title="Edit"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="text-slate-400 hover:text-rose-400 p-0.5 rounded"
                            title="Hapus"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-700">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold transition-all"
                >
                  Selesai
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default App