import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Tags, 
  PlusCircle, 
  Trash2, 
  Pencil, 
  Wallet, 
  X, 
  PieChart as PieChartIcon, 
  BarChart2, 
  Eye, 
  EyeOff, 
  Plus,
  Sliders,
  FileSpreadsheet,
  Download
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

const CHART_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']

function App() {
  // Navigation State ('dashboard' | 'income' | 'expense' | 'installments' | 'categories')
  const [activeTab, setActiveTab] = useState('dashboard')
  // State untuk mengontrol Bottom Sheet Kategori
  const [showCategorySheet, setShowCategorySheet] = useState(false)

  const getCategoryEmoji = (name = '') => {
  const lower = name.toLowerCase()
  if (lower.includes('makan') || lower.includes('kuliner')) return '🍔'
  if (lower.includes('minum') || lower.includes('kopi')) return '☕'
  if (lower.includes('gaji') || lower.includes('income')) return '💰'
  if (lower.includes('trans') || lower.includes('bensin') || lower.includes('ojek')) return '🚗'
  if (lower.includes('tagihan') || lower.includes('listrik') || lower.includes('air')) return '⚡'
  if (lower.includes('belanja') || lower.includes('mall')) return '🛍️'
  if (lower.includes('hiburan') || lower.includes('nonton')) return '🎬'
  if (lower.includes('sampingan') || lower.includes('freelance')) return '💼'
  if (lower.includes('bonus') || lower.includes('thr')) return '🎁'
  return '📌' // Emoji bawaan jika tidak ada kata kunci yang cocok
  }
  
  // Privacy & UI State
  const [hideBalance, setHideBalance] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showBudgetModal, setShowBudgetModal] = useState(false)

  // Data States
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [installments, setInstallments] = useState([])
  const [loading, setLoading] = useState(true)

  // Form States
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('expense')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')

  // Budget State
  const [monthlyBudget, setMonthlyBudget] = useState(3000000)
  const [inputBudget, setInputBudget] = useState('')

  // Category & Installment Form States
  const [catName, setCatName] = useState('')
  const [catType, setCatType] = useState('expense')
  const [instName, setInstName] = useState('')
  const [instNominal, setInstNominal] = useState('')
  const [instTenor, setInstTenor] = useState('')

  useEffect(() => {
    fetchCategories()
    fetchTransactions()
    const savedInst = localStorage.getItem('user_installments')
    if (savedInst) setInstallments(JSON.parse(savedInst))
    const savedBudget = localStorage.getItem('master_monthly_budget') || '3000000'
    setMonthlyBudget(Number(savedBudget))
  }, [])

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name', { ascending: true })
    setCategories(data || [])
  }

  const fetchTransactions = async () => {
    setLoading(true)
    const { data } = await supabase.from('transactions').select('*, categories(name)').order('transaction_date', { ascending: false })
    setTransactions(data || [])
    setLoading(false)
  }

  // Handle Quick Add / Edit
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
    if (window.confirm('Hapus transaksi ini?')) {
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (!error) fetchTransactions()
    }
  }

  // Handle Target Anggaran
  const handleSaveBudget = (e) => {
    e.preventDefault()
    const num = parseFloat(inputBudget)
    if (isNaN(num) || num < 0) return
    setMonthlyBudget(num)
    localStorage.setItem('master_monthly_budget', num.toString())
    setShowBudgetModal(false)
  }

  // Handle Kategori & Cicilan
  const handleSaveCategory = async (e) => {
    e.preventDefault()
    if (!catName.trim()) return
    const { error } = await supabase.from('categories').insert([{ name: catName.trim(), type: catType }])
    if (!error) { setCatName(''); fetchCategories() }
  }

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Hapus kategori ini?')) {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (!error) { fetchCategories(); fetchTransactions() }
    }
  }

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
    if (transactions.length === 0) return alert('Tidak ada data!')
    const headers = ['Tanggal', 'Tipe', 'Kategori', 'Catatan', 'Nominal']
    const rows = transactions.map((item) => [
      item.transaction_date || '',
      item.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      `"${(item.categories?.name || '-').replace(/"/g, '""')}"`,
      `"${(item.description || '-').replace(/"/g, '""')}"`,
      item.amount
    ])
    const csvString = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Laporan_Keuangan.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Calculations
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0)
  const balance = totalIncome - totalExpense

  const budgetPercentage = monthlyBudget > 0 ? Math.round((totalExpense / monthlyBudget) * 100) : 0

  const formatRupiah = (num) => {
    if (hideBalance) return 'Rp •••••••'
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num)
  }

  // Chart Data
  const expenseByCategory = transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
    const cName = t.categories?.name || 'Lainnya'
    acc[cName] = (acc[cName] || 0) + Number(t.amount)
    return acc
  }, {})
  const pieChartData = Object.keys(expenseByCategory).map(name => ({ name, value: expenseByCategory[name] }))
  const barChartData = [{ name: 'Pemasukan', total: totalIncome }, { name: 'Pengeluaran', total: totalExpense }]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 md:pb-8 md:pl-64">
      
      {/* --- DESKTOP SIDEBAR (Sembunyi di HP) --- */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 flex-col justify-between z-30">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/30">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-white">Financial.io</span>
          </div>
          <nav className="p-4 space-y-1">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>
            <button onClick={() => setActiveTab('income')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${activeTab === 'income' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Pemasukan
            </button>
            <button onClick={() => setActiveTab('expense')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${activeTab === 'expense' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <TrendingDown className="w-4 h-4 text-rose-400" /> Pengeluaran
            </button>
            <button onClick={() => setActiveTab('installments')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${activeTab === 'installments' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <CreditCard className="w-4 h-4 text-amber-400" /> Cicilan
            </button>
            <button onClick={() => setActiveTab('categories')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${activeTab === 'categories' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Tags className="w-4 h-4" /> Kategori
            </button>
          </nav>
        </div>
      </aside>

      {/* --- MOBILE TOP HEADER --- */}
      <header className="h-14 bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-20 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg text-white md:hidden">
            <Wallet className="w-4 h-4" />
          </div>
          <h1 className="font-bold text-base text-white capitalize">
            {activeTab === 'dashboard' ? 'Financial.io' : activeTab}
          </h1>
        </div>

        {/* Sensor Saldo Toggle & Export */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setHideBalance(!hideBalance)} 
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors"
            title="Sembunyikan Nominal"
          >
            {hideBalance ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
          </button>
          <button 
            onClick={handleExportCSV} 
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-emerald-400 transition-colors"
            title="Ekspor CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="p-4 space-y-4 max-w-4xl mx-auto">

        {/* CARD SALDO UTAMA (Tampilan Mobile Friendly) */}
        <div className="bg-gradient-to-br from-blue-900/40 via-slate-900 to-slate-900 p-5 rounded-3xl border border-blue-500/20 shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Saldo Bersih</p>
              <h2 className={`text-3xl font-extrabold tracking-tight mt-1 ${balance >= 0 ? 'text-white' : 'text-rose-400'}`}>
                {formatRupiah(balance)}
              </h2>
            </div>
          </div>

          {/* Quick Stat In/Out */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Pemasukan</p>
                <p className="text-xs font-bold text-emerald-400">{formatRupiah(totalIncome)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg">
                <TrendingDown className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Pengeluaran</p>
                <p className="text-xs font-bold text-rose-400">{formatRupiah(totalExpense)}</p>
              </div>
            </div>
          </div>

          {/* Progress Anggaran */}
          <div className="pt-2">
            <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
              <span>Batas Anggaran: {formatRupiah(monthlyBudget)}</span>
              <button onClick={() => { setInputBudget(monthlyBudget.toString()); setShowBudgetModal(true) }} className="text-blue-400 hover:underline flex items-center gap-0.5">
                <Sliders className="w-2.5 h-2.5" /> Edit
              </button>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${budgetPercentage >= 90 ? 'bg-rose-500' : budgetPercentage >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* Visual Mini Charts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <h3 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <PieChartIcon className="w-3.5 h-3.5 text-rose-400" /> Kategori Pengeluaran
                </h3>
                {pieChartData.length === 0 ? (
                  <div className="h-36 flex items-center justify-center text-[10px] text-slate-500">Belum ada data pengeluaran</div>
                ) : (
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                          {pieChartData.map((_, idx) => <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v) => hideBalance ? '***' : `Rp ${v}`} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <h3 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5 text-blue-400" /> Arus Kas
                </h3>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 9 }} width={45} />
                      <Tooltip formatter={(v) => hideBalance ? '***' : `Rp ${v}`} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
                      <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Transaksi Terakhir List */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-3 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-xs font-bold text-white">Transaksi Terbaru</h3>
                <button onClick={() => setActiveTab('expense')} className="text-[11px] text-blue-400 hover:underline">Semua</button>
              </div>
              <div className="divide-y divide-slate-800/60">
                {transactions.slice(0, 5).map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${item.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {item.type === 'income' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{item.description || 'Tanpa Catatan'}</p>
                        <p className="text-[10px] text-slate-500">{item.transaction_date} • {item.categories?.name || '-'}</p>
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

        {/* TAB 2: PEMASUKAN */}
        {activeTab === 'income' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Total: <strong className="text-emerald-400">{formatRupiah(totalIncome)}</strong></span>
              <button onClick={() => handleOpenCreateModal('income')} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Tambah
              </button>
            </div>
            <div className="space-y-2">
              {transactions.filter(t => t.type === 'income').map(t => (
                <div key={t.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800/80 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-white">{t.description || 'Pemasukan'}</p>
                    <p className="text-[10px] text-slate-500">{t.transaction_date} • {t.categories?.name || '-'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-emerald-400">+{formatRupiah(t.amount)}</span>
                    <button onClick={() => handleDeleteTransaction(t.id)} className="text-slate-500 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PENGELUARAN */}
        {activeTab === 'expense' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Total: <strong className="text-rose-400">{formatRupiah(totalExpense)}</strong></span>
              <button onClick={() => handleOpenCreateModal('expense')} className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Tambah
              </button>
            </div>
            <div className="space-y-2">
              {transactions.filter(t => t.type === 'expense').map(t => (
                <div key={t.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800/80 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-white">{t.description || 'Pengeluaran'}</p>
                    <p className="text-[10px] text-slate-500">{t.transaction_date} • {t.categories?.name || '-'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-rose-400">-{formatRupiah(t.amount)}</span>
                    <button onClick={() => handleDeleteTransaction(t.id)} className="text-slate-500 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CICILAN */}
        {activeTab === 'installments' && (
          <div className="space-y-4">
            <form onSubmit={handleAddInstallment} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <p className="font-bold text-amber-400 mb-1">Tambah Cicilan / Tagihan</p>
              <input type="text" placeholder="Nama Tagihan (Motor, HP)" value={instName} onChange={e => setInstName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white" required />
              <div className="flex gap-2">
                <input type="number" placeholder="Nominal / bln" value={instNominal} onChange={e => setInstNominal(e.target.value)} className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white" required />
                <button type="submit" className="bg-amber-500 font-bold text-slate-950 px-4 rounded-xl whitespace-nowrap">Simpan</button>
              </div>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {installments.map(inst => (
                <div key={inst.id} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-white">{inst.name}</p>
                    <p className="text-amber-400 font-semibold">{formatRupiah(inst.nominal)} /bln</p>
                  </div>
                  <button onClick={() => handleDeleteInstallment(inst.id)} className="text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: KATEGORI */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <form onSubmit={handleSaveCategory} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex gap-2 text-xs">
              <select value={catType} onChange={e => setCatType(e.target.value)} className="bg-slate-800 border border-slate-700 p-2 rounded-xl text-white">
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
              </select>
              <input type="text" placeholder="Kategori baru..." value={catName} onChange={e => setCatName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 p-2 rounded-xl text-white" required />
              <button type="submit" className="bg-blue-600 font-semibold px-4 rounded-xl text-white">Tambah</button>
            </form>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300">Daftar Kategori</h4>
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <span key={c.id} className="bg-slate-800 border border-slate-700 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-slate-300">
                    {c.name}
                    <button onClick={() => handleDeleteCategory(c.id)} className="text-slate-500 hover:text-rose-400"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* --- MOBILE BOTTOM NAVIGATION BAR (Khusus HP) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-4 py-2 flex justify-around items-center z-40">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`flex flex-col items-center text-[10px] font-medium transition-colors ${activeTab === 'dashboard' ? 'text-blue-500' : 'text-slate-500'}`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </button>

        <button 
          onClick={() => setActiveTab('income')} 
          className={`flex flex-col items-center text-[10px] font-medium transition-colors ${activeTab === 'income' ? 'text-emerald-400' : 'text-slate-500'}`}
        >
          <TrendingUp className="w-5 h-5 mb-0.5" />
          <span>Masuk</span>
        </button>

        {/* FLOATING ACTION BUTTON (+) DI TENGAH */}
        <button 
          onClick={() => handleOpenCreateModal('expense')}
          className="bg-blue-600 hover:bg-blue-500 text-white p-3.5 rounded-full shadow-lg shadow-blue-600/40 -mt-6 border-4 border-slate-950 active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        <button 
          onClick={() => setActiveTab('expense')} 
          className={`flex flex-col items-center text-[10px] font-medium transition-colors ${activeTab === 'expense' ? 'text-rose-400' : 'text-slate-500'}`}
        >
          <TrendingDown className="w-5 h-5 mb-0.5" />
          <span>Keluar</span>
        </button>

        <button 
          onClick={() => setActiveTab('installments')} 
          className={`flex flex-col items-center text-[10px] font-medium transition-colors ${activeTab === 'installments' ? 'text-amber-400' : 'text-slate-500'}`}
        >
          <CreditCard className="w-5 h-5 mb-0.5" />
          <span>Cicilan</span>
        </button>
      </nav>

      {/* --- MODAL TAMBAH TRANSAKSI --- */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6 space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">{editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmitTransaction} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Tipe Transaksi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setType('expense')} className={`p-2.5 rounded-xl border font-bold ${type==='expense' ? 'bg-rose-500/10 border-rose-500 text-rose-400' : 'border-slate-800 text-slate-400'}`}>Pengeluaran</button>
                  <button type="button" onClick={() => setType('income')} className={`p-2.5 rounded-xl border font-bold ${type==='income' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'border-slate-800 text-slate-400'}`}>Pemasukan</button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Nominal (Rp)</label>
                <input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm font-bold" required />
              </div>

              {/* --- FIELD INPUT KATEGORI (TRIGGER BOTTOM SHEET) --- */}
<div>
  <label className="block text-slate-400 mb-1">Kategori</label>
  <button
    type="button"
    onClick={() => setShowCategorySheet(true)}
    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-left text-white flex items-center justify-between hover:bg-slate-750 transition-colors"
  >
    {categoryId ? (
      <span className="flex items-center gap-2 font-medium">
        <span>{getCategoryEmoji(categories.find(c => c.id === parseInt(categoryId))?.name)}</span>
        <span>{categories.find(c => c.id === parseInt(categoryId))?.name}</span>
      </span>
    ) : (
      <span className="text-slate-500">-- Pilih Kategori --</span>
    )}
    <span className="text-slate-400 text-xs">Ubah ❯</span>
  </button>
</div>

{/* --- BOTTOM SHEET SLIDE-UP KATEGORI (OPSI 2 + 3) --- */}
{showCategorySheet && (
  <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-end z-[60]">
    <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl w-full max-w-md p-5 space-y-4 animate-in slide-in-from-bottom duration-200">
      
      {/* Handle Drag Bar & Header */}
      <div className="flex flex-col items-center">
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mb-3"></div>
        <div className="w-full flex justify-between items-center pb-2 border-b border-slate-800">
          <h4 className="font-bold text-white text-sm">Pilih Kategori ({type === 'expense' ? 'Pengeluaran' : 'Pemasukan'})</h4>
          <button 
            type="button" 
            onClick={() => setShowCategorySheet(false)}
            className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1 bg-slate-800 rounded-lg"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* GRID KATEGORI VISUAL DENGAN EMOJI */}
      <div className="grid grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
        {categories
          .filter(c => c.type === type)
          .map(cat => {
            const isSelected = parseInt(categoryId) === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategoryId(cat.id.toString())
                  setShowCategorySheet(false)
                }}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                  isSelected 
                    ? 'bg-blue-600/20 border-blue-500 text-white font-bold ring-2 ring-blue-500/50' 
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-lg p-1.5 bg-slate-900/80 rounded-xl">
                  {getCategoryEmoji(cat.name)}
                </span>
                <span className="text-xs font-medium truncate">{cat.name}</span>
              </button>
            )
          })}
      </div>

    </div>
  </div>
)}

              <div>
                <label className="block text-slate-400 mb-1">Catatan</label>
                <input type="text" placeholder="Beli Kopi, Gaji, dll." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white" />
              </div>

              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30">
                Simpan Transaksi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL EDIT ANGGARAN --- */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 space-y-3">
            <h3 className="font-bold text-white text-sm">Target Anggaran Bulanan</h3>
            <form onSubmit={handleSaveBudget} className="space-y-3 text-xs">
              <input type="number" value={inputBudget} onChange={(e) => setInputBudget(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" required />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowBudgetModal(false)} className="px-3 py-1.5 text-slate-400">Batal</button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-xl">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default App