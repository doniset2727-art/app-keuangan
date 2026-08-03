import { useState, useEffect } from 'react'
import { supabase } from './supabase'

function App() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // State Form
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

  // FUNGSI BARU: Hapus Transaksi
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')
    if (!confirmDelete) return

    const { error } = await supabase.from('transactions').delete().eq('id', id)

    if (error) {
      alert('Gagal menghapus: ' + error.message)
    } else {
      fetchTransactions() // Reload data transaksi setelah dihapus
    }
  }

  // Kalkulasi
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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Manajemen Keuangan</h1>
        <button
          onClick={() => setShowModal(true)}
          style={{ padding: '10px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Tambah Transaksi
        </button>
      </header>

      {/* Cards Ringkasan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <small style={{ color: '#64748b' }}>Total Saldo</small>
          <h2 style={{ color: balance >= 0 ? '#16a34a' : '#dc2626', margin: '5px 0 0 0' }}>{formatRupiah(balance)}</h2>
        </div>
        <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <small style={{ color: '#166534' }}>Pemasukan</small>
          <h2 style={{ color: '#16a34a', margin: '5px 0 0 0' }}>{formatRupiah(totalIncome)}</h2>
        </div>
        <div style={{ background: '#fef2f2', padding: '15px', borderRadius: '8px', border: '1px solid #fecaca' }}>
          <small style={{ color: '#991b1b' }}>Pengeluaran</small>
          <h2 style={{ color: '#dc2626', margin: '5px 0 0 0' }}>{formatRupiah(totalExpense)}</h2>
        </div>
      </div>

      {/* Tabel Riwayat */}
      <h3>Riwayat Transaksi</h3>
      {loading ? (
        <p>Memuat data...</p>
      ) : transactions.length === 0 ? (
        <p style={{ color: '#64748b' }}>Belum ada transaksi tercatat.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Tanggal</th>
              <th style={{ padding: '10px' }}>Kategori</th>
              <th style={{ padding: '10px' }}>Catatan</th>
              <th style={{ padding: '10px', textAlign: 'right' }}>Nominal</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px' }}>{item.transaction_date}</td>
                <td style={{ padding: '10px' }}>{item.categories?.name || 'Tanpa Kategori'}</td>
                <td style={{ padding: '10px' }}>{item.description || '-'}</td>
                <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: item.type === 'income' ? '#16a34a' : '#dc2626' }}>
                  {item.type === 'income' ? '+' : '-'} {formatRupiah(item.amount)}
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal Input */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
            <h3>Tambah Transaksi Baru</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Tipe Transaksi</label>
                <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%', padding: '8px' }}>
                  <option value="expense">Pengeluaran</option>
                  <option value="income">Pemasukan</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Nominal (Rp)</label>
                <input
                  type="number"
                  placeholder="Contoh: 50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Kategori</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={{ width: '100%', padding: '8px' }}>
                  <option value="">-- Pilih Kategori --</option>
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Catatan / Deskripsi</label>
                <input
                  type="text"
                  placeholder="Contoh: Beli bensin & parkir"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 14px', background: '#94a3b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Batal
                </button>
                <button type="submit" style={{ padding: '8px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App