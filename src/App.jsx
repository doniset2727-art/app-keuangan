import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Tags, 
  FileSpreadsheet, 
  PlusCircle, 
  Trash2, 
  Pencil, 
  Wallet, 
  Calendar, 
  X, 
  PieChart as PieChartIcon, 
  BarChart2, 
  Search, 
  Filter, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  Plus, 
  Download,
  Menu,
  ChevronRight,
  Receipt
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
  { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' }, { value: '04', label: 'April' },
  { value: '05', label: 'Mei' }, { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' }, { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
]

function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard' | 'income' | 'expense' | 'installments' | 'categories' | 'reports'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Data States
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [installments, setInstallments] = useState([]) // State dummy / local for Cicilan
  const [loading, setLoading] = useState(true)

  // Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')

  // Transaction Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('expense')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')

  // Budget State
  const [monthlyBudget, setMonthlyBudget] = useState(3000000)
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [inputBudget, setInputBudget] = useState('')

  // Category State
  const [catName, setCatName] = useState('')
  const [catType, setCatType] = useState('expense')
  const [editingCategory, setEditingCategory] = useState(null)

  // Installment Form State
  const [instName, setInstName] = useState('')
  const [instNominal, setInstNominal] = useState('')
  const [instTenor, setInstTenor] = useState('')

  useEffect(() => {
    fetchCategories()
    fetchTransactions()
    
    // Load local installments
    const savedInst = localStorage.getItem('user_installments')
    if (savedInst) setInstallments(JSON.parse(savedInst))
  }, [])

  useEffect(() => {
    const budgetKey = `budget_${selectedYear}_${selectedMonth}`
    const savedBudget = localStorage.getItem(budgetKey) || localStorage.getItem('master_monthly_budget') || '3000000'
    setMonthlyBudget(Number(savedBudget))
  }, [selectedMonth, selectedYear])

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true })
    if (error) console.error('Error categories:', error)
    else setCategories(data || [])
  }

  const fetchTransactions = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('transactions').select('*, categories(name)').order('transaction_date', { ascending: false })
    if (error) console.error('Error transactions:', error)
    else setTransactions(data || [])
    setLoading(false)
  }

  // Handle Transaksi
  const handleOpenCreateModal = (defaultType = 'expense') => {
    setEditingTransaction(null)
    setAmount('')
    setType(defaultType)
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

  const handleSubmitTransaction = async (e) => {
    e.preventDefault()
    if (!amount || !type) return alert('Mohon isi nominal dan tipe!')

    const payload = {
      amount: parseFloat(amount),
      type,
      category_id: categoryId ? parseInt(categoryId) : null,
      description,
    }

    if (editingTransaction) {
      const { error } = await supabase.from('transactions').update(payload).eq('id', editingTransaction.id)
      if (error) alert('Gagal update: ' + error.message)
      else { setShowModal(false); fetchTransactions() }
    } else {
      const { error } = await supabase.from('transactions').insert([payload])
      if (error) alert('Gagal simpan: ' + error.message)
      else { setShowModal(false); fetchTransactions() }
    }
  }

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (error) alert('Gagal hapus: ' + error.message)
      else fetchTransactions()
    }
  }

  // Handle Target Anggaran
  const handleSaveBudget = (e) => {
    e.preventDefault()
    const num = parseFloat(inputBudget)
    if (isNaN(num) || num < 0) return alert('Masukkan nominal valid!')
    setMonthlyBudget(num)
    localStorage.setItem(`budget_${selectedYear}_${selectedMonth}`, num.toString())
    localStorage.setItem('master_monthly_budget', num.toString())
    setShowBudgetModal(false)
  }

  // Handle Kategori
  const handleSaveCategory = async (e) => {
    e.preventDefault()
    if (!catName.trim()) return alert('Nama kategori wajib diisi!')

    if (editingCategory) {
      const { error } = await supabase.from('categories').update({ name: catName.trim(), type: catType }).eq('id', editingCategory.id)
      if (error) alert('Gagal edit kategori: ' + error.message)
      else { setEditingCategory(null); setCatName(''); fetchCategories(); fetchTransactions() }
    } else {
      const { error } = await supabase.from('categories').insert([{ name: catName.trim(), type: catType }])
      if (error) alert('Gagal tambah kategori: ' + error.message)
      else { setCatName(''); fetchCategories() }
    }
  }

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Hapus kategori ini?')) {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) alert('Gagal hapus kategori: ' + error.message)
      else { fetchCategories(); fetchTransactions() }
    }
  }

  // Handle Cicilan / Tagihan
  const handleAddInstallment = (e) => {
    e.preventDefault()
    if (!instName || !instNominal) return
    const newInst = [...installments, { id: Date.now(), name: instName, nominal: parseFloat(instNominal), tenor: instTenor }]
    setInstallments(newInst)
    localStorage.setItem('user_installments', JSON.stringify(newInst))
    setInstName(''); setInstNominal(''); setInstTenor('')
  }

  const handleDeleteInstallment = (id) => {
    const newInst = installments.filter(i => i.id !== id)
    setInstallments(newInst)
    localStorage.setItem('user_installments', JSON.stringify(newInst))
  }

  // Export CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return alert('Tidak ada data untuk diekspor!')
    const headers = ['Tanggal', 'Tipe Transaksi', 'Kategori', 'Catatan / Deskripsi', 'Nominal (Rp)']
    const rows = filteredTransactions.map((item) => [
      item.transaction_date || '',
      item.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      `"${(item.categories?.name || 'Tanpa Kategori').replace(/"/g, '""')}"`,
      `"${(item.description || '-').replace(/"/g, '""')}"`,
      item.amount
    ])
    const csvString = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Laporan_Keuangan_${selectedMonth}_${selectedYear}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Calculations
  const availableYears = Array.from(new Set(transactions.map(t => t.transaction_date?.split('-')[0]).filter(Boolean))).sort((a,b)=>b-a)

  const filteredTransactions = transactions.filter((t) => {
    const [year, month] = t.transaction_date ? t.transaction_date.split('-') : ['', '']
    const matchesSearch = (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.categories?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMonth = selectedMonth === 'all' || month === selectedMonth
    const matchesYear = selectedYear === 'all' || year === selectedYear
    return matchesSearch && matchesMonth && matchesYear
  })

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0)
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0)
  const balance = totalIncome - totalExpense

  const budgetPercentage = monthlyBudget > 0 ? Math.round((totalExpense / monthlyBudget) * 100) : 0
  const remainingBudget = monthlyBudget - totalExpense

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num)

  // Chart Data
  const expenseByCategory = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => {
    const cName = t.categories?.name || 'Tanpa Kategori'
    acc[cName] = (acc[cName] || 0) + Number(t.amount)
    return acc
  }, {})
  const pieChartData = Object.keys(expenseByCategory).map(name => ({ name, value: expenseByCategory[name] }))
  const barChartData = [{ name: 'Pemasukan', total: totalIncome }, { name: 'Pengeluaran', total: totalExpense }]

  // Menu Items Sidebar
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'income', label: 'Pemasukan', icon: TrendingUp, color: 'text-emerald-400' },
    { id: 'expense', label: 'Pengeluaran', icon: TrendingDown, color: 'text-rose-400' },
    { id: 'installments', label: 'Cicilan & Tagihan', icon: CreditCard, color: 'text-amber-400' },
    { id: 'categories', label: 'Kelola Kategori', icon: Tags },
    { id: 'reports', label: 'Laporan & Ekspor', icon: FileSpreadsheet },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex">
      
      {/* --- SIDEBAR NAV --- */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } flex flex-col justify-between`}>
        <div>
          {/* Logo Brand */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/30">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white tracking-wide">Financial.io</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Main Menu</div>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color || 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
                </button>
              )
            })}
          </nav>
        </div>

        {/* User Card / Footer Sidebar */}
        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-sm border border-blue-500/30">
              ME
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">My Financial Account</p>
              <p className="text-[10px] text-emerald-400 font-medium">● Standalone Mode</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        
        {/* Top Navbar Header */}
        <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white capitalize">
              {navItems.find(i => i.id === activeTab)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenCreateModal('expense')}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah Transaksi</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-4 md:p-8 space-y-6 flex-1">
          
          {/* ==================== TAB 1: DASHBOARD ==================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Ringkasan Saldo Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
                  <div className="flex justify-between items-center text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Saldo</span>
                    <Wallet className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatRupiah(balance)}
                  </p>
                </div>

                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
                  <div className="flex justify-between items-center text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Pemasukan</span>
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-400">{formatRupiah(totalIncome)}</p>
                </div>

                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
                  <div className="flex justify-between items-center text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Pengeluaran</span>
                    <TrendingDown className="w-5 h-5 text-rose-400" />
                  </div>
                  <p className="text-2xl font-bold text-rose-400">{formatRupiah(totalExpense)}</p>
                </div>
              </div>

              {/* Target Anggaran Banner */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    <h3 className="text-sm font-semibold text-white">Target Anggaran Pengeluaran</h3>
                  </div>
                  <button
                    onClick={() => { setInputBudget(monthlyBudget.toString()); setShowBudgetModal(true) }}
                    className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Sliders className="w-3.5 h-3.5" /> Atur Batas
                  </button>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${budgetPercentage >= 95 ? 'bg-rose-500' : budgetPercentage >= 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>Terpakai: <strong className="text-white">{formatRupiah(totalExpense)}</strong> ({budgetPercentage}%)</span>
                  <span>Limit: <strong className="text-white">{formatRupiah(monthlyBudget)}</strong></span>
                </div>
              </div>

              {/* Visual Grafik */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-rose-400" /> Pengeluaran per Kategori
                  </h3>
                  {pieChartData.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-xs text-slate-500">Belum ada data pengeluaran</div>
                  ) : (
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                            {pieChartData.map((_, idx) => <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(v) => formatRupiah(v)} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-blue-400" /> Arus Kas
                  </h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                        <YAxis stroke="#64748b" tickLine={false} tickFormatter={(v) => `Rp${v/1000}k`} width={65} />
                        <Tooltip formatter={(v) => formatRupiah(v)} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff' }} />
                        <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                          <Cell fill="#10b981" />
                          <Cell fill="#ef4444" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* 5 Transaksi Terakhir */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-slate-400" /> Transaksi Terbaru
                  </h3>
                  <button onClick={() => setActiveTab('expense')} className="text-xs text-blue-400 hover:underline">
                    Lihat Semua →
                  </button>
                </div>
                <div className="divide-y divide-slate-800/60">
                  {transactions.slice(0, 5).map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors text-xs">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${item.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {item.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{item.description || 'Tanpa Catatan'}</p>
                          <p className="text-[10px] text-slate-500">{item.transaction_date} • {item.categories?.name || 'Tanpa Kategori'}</p>
                        </div>
                      </div>
                      <span className={`font-bold ${item.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.type === 'income' ? '+' : '-'} {formatRupiah(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 2: PEMASUKAN ==================== */}
          {activeTab === 'income' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h3 className="font-bold text-emerald-400 text-lg">Kelola Pemasukan</h3>
                  <p className="text-xs text-slate-400">Total Pemasukan: <strong className="text-white">{formatRupiah(totalIncome)}</strong></p>
                </div>
                <button
                  onClick={() => handleOpenCreateModal('income')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" /> Tambah Pemasukan
                </button>
              </div>

              {/* Tabel Transaksi Pemasukan */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/50 uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Tanggal</th>
                      <th className="p-3.5">Kategori</th>
                      <th className="p-3.5">Catatan</th>
                      <th className="p-3.5 text-right">Nominal</th>
                      <th className="p-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {transactions.filter(t => t.type === 'income').map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/30">
                        <td className="p-3.5 text-slate-400">{item.transaction_date}</td>
                        <td className="p-3.5 font-medium text-white">{item.categories?.name || '-'}</td>
                        <td className="p-3.5 text-slate-400">{item.description || '-'}</td>
                        <td className="p-3.5 text-right font-bold text-emerald-400">+{formatRupiah(item.amount)}</td>
                        <td className="p-3.5 text-center">
                          <button onClick={() => handleOpenEditModal(item)} className="p-1 text-slate-400 hover:text-blue-400 mr-1"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteTransaction(item.id)} className="p-1 text-slate-400 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== TAB 3: PENGELUARAN ==================== */}
          {activeTab === 'expense' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h3 className="font-bold text-rose-400 text-lg">Kelola Pengeluaran</h3>
                  <p className="text-xs text-slate-400">Total Pengeluaran: <strong className="text-white">{formatRupiah(totalExpense)}</strong></p>
                </div>
                <button
                  onClick={() => handleOpenCreateModal('expense')}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" /> Tambah Pengeluaran
                </button>
              </div>

              {/* Tabel Transaksi Pengeluaran */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/50 uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Tanggal</th>
                      <th className="p-3.5">Kategori</th>
                      <th className="p-3.5">Catatan</th>
                      <th className="p-3.5 text-right">Nominal</th>
                      <th className="p-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {transactions.filter(t => t.type === 'expense').map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/30">
                        <td className="p-3.5 text-slate-400">{item.transaction_date}</td>
                        <td className="p-3.5 font-medium text-white">{item.categories?.name || '-'}</td>
                        <td className="p-3.5 text-slate-400">{item.description || '-'}</td>
                        <td className="p-3.5 text-right font-bold text-rose-400">-{formatRupiah(item.amount)}</td>
                        <td className="p-3.5 text-center">
                          <button onClick={() => handleOpenEditModal(item)} className="p-1 text-slate-400 hover:text-blue-400 mr-1"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteTransaction(item.id)} className="p-1 text-slate-400 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== TAB 4: CICILAN & TAGIHAN ==================== */}
          {activeTab === 'installments' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="font-bold text-amber-400 text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5" /> Catat Cicilan Baru
                </h3>
                <form onSubmit={handleAddInstallment} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Nama Cicilan (misal: Motor Vario)"
                    value={instName}
                    onChange={(e) => setInstName(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Cicilan per Bulan (Rp)"
                    value={instNominal}
                    onChange={(e) => setInstNominal(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white"
                    required
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Tenor (misal: 12 Bulan)"
                      value={instTenor}
                      onChange={(e) => setInstTenor(e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white w-full"
                    />
                    <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs whitespace-nowrap">
                      Tambah
                    </button>
                  </div>
                </form>
              </div>

              {/* Daftar Cicilan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {installments.map((inst) => (
                  <div key={inst.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-sm">{inst.name}</h4>
                      <p className="text-xs text-amber-400 font-semibold mt-1">{formatRupiah(inst.nominal)} /bln</p>
                      {inst.tenor && <p className="text-[10px] text-slate-400 mt-1">Tenor: {inst.tenor}</p>}
                    </div>
                    <button onClick={() => handleDeleteInstallment(inst.id)} className="text-slate-500 hover:text-rose-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== TAB 5: KELOLA KATEGORI ==================== */}
          {activeTab === 'categories' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="font-bold text-white text-base">Tambah Kategori Baru</h3>
                <form onSubmit={handleSaveCategory} className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={catType}
                    onChange={(e) => setCatType(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white"
                  >
                    <option value="expense">Pengeluaran</option>
                    <option value="income">Pemasukan</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Nama Kategori (contoh: Investasi, Hobi)..."
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white flex-1"
                    required
                  />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs">
                    Simpan
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                  <h4 className="font-bold text-rose-400 text-xs uppercase mb-3">Kategori Pengeluaran</h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.filter(c => c.type === 'expense').map(cat => (
                      <span key={cat.id} className="bg-slate-800 border border-slate-700 text-xs px-3 py-1.5 rounded-xl flex items-center gap-2">
                        {cat.name}
                        <button onClick={() => handleDeleteCategory(cat.id)} className="text-slate-400 hover:text-rose-400"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                  <h4 className="font-bold text-emerald-400 text-xs uppercase mb-3">Kategori Pemasukan</h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.filter(c => c.type === 'income').map(cat => (
                      <span key={cat.id} className="bg-slate-800 border border-slate-700 text-xs px-3 py-1.5 rounded-xl flex items-center gap-2">
                        {cat.name}
                        <button onClick={() => handleDeleteCategory(cat.id)} className="text-slate-400 hover:text-rose-400"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 6: LAPORAN & EKSPOR ==================== */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" /> Ekspor Laporan Keuangan
                </h3>
                <p className="text-xs text-slate-400">Pilih periode laporan yang ingin diekspor ke file Excel / CSV.</p>
                
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white"
                  >
                    <option value="all">Semua Bulan</option>
                    {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>

                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-xs rounded-xl p-2.5 text-white"
                  >
                    <option value="all">Semua Tahun</option>
                    {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>

                  <button
                    onClick={handleExportCSV}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    <Download className="w-4 h-4" /> Unduh Laporan CSV
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL TAMBAH / EDIT TRANSAKSI */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white">{editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmitTransaction} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Tipe</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setType('expense')} className={`p-2 rounded-xl border font-bold ${type==='expense' ? 'bg-rose-500/10 border-rose-500 text-rose-400' : 'border-slate-800 text-slate-400'}`}>Pengeluaran</button>
                  <button type="button" onClick={() => setType('income')} className={`p-2 rounded-xl border font-bold ${type==='income' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'border-slate-800 text-slate-400'}`}>Pemasukan</button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Nominal (Rp)</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" required />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Kategori</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white">
                  <option value="">-- Pilih Kategori --</option>
                  {categories.filter(c => c.type === type).map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Catatan</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-slate-400">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ATUR ANGGARAN */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white">Atur Target Anggaran</h3>
              <button onClick={() => setShowBudgetModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveBudget} className="space-y-3 text-xs">
              <input type="number" value={inputBudget} onChange={(e) => setInputBudget(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" required />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowBudgetModal(false)} className="px-4 py-2 rounded-xl text-slate-400">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default App