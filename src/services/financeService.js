import { supabase } from './supabase';

// ==========================================
// 1. TRANSACTION SERVICES (Transaksi)
// ==========================================

// Ambil semua transaksi beserta relasi kategori, dompet, dan tagihannya
export async function getTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      categories (id, name, type),
      wallets (id, name),
      bills (id, title)
    `)
    .order('date', { ascending: false });

  if (error) throw error;
  return data;
}

// Tambah transaksi baru (otomatis terhubung ke wallet_id yang dipilih)
export async function addTransaction(transactionData) {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transactionData])
    .select();

  if (error) throw error;
  return data;
}

// Hapus transaksi berdasarkan ID
export async function deleteTransaction(id) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}


// ==========================================
// 2. WALLET SERVICES (Dompet / Akun)
// ==========================================

// Ambil daftar dompet & hitung saldonya secara otomatis (Saldo Awal + Pemasukan - Pengeluaran)
export async function getWallets() {
  // 1. Ambil data dasar dompet
  const { data: wallets, error: walletError } = await supabase
    .from('wallets')
    .select('*')
    .order('created_at', { ascending: true });

  if (walletError) throw walletError;

  // 2. Ambil seluruh transaksi beserta tipe kategorinya untuk kalkulasi saldo
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select(`
      amount,
      wallet_id,
      categories (type)
    `);

  if (txError) throw txError;

  // 3. Hitung saldo akhir secara dinamis untuk setiap dompet
  const walletsWithCalculatedBalance = wallets.map(wallet => {
    // Saring transaksi yang hanya milik dompet ini
    const walletTxs = transactions.filter(tx => tx.wallet_id === wallet.id);
    
    // Nilai awal dari input "Saldo Awal" saat dompet dibuat
    let currentBalance = Number(wallet.balance) || 0;

    walletTxs.forEach(tx => {
      const amount = Number(tx.amount) || 0;
      const type = tx.categories?.type ? tx.categories.type.toLowerCase() : '';

      // Jika kategori termasuk pemasukan (income / pemasukan), tambahkan saldo
      if (type.includes('income') || type.includes('pemasukan')) {
        currentBalance += amount;
      } 
      // Jika kategori termasuk pengeluaran (expense / pengeluaran), kurangi saldo
      else if (type.includes('expense') || type.includes('pengeluaran')) {
        currentBalance -= amount;
      }
    });

    return {
      ...wallet,
      balance: currentBalance // Menampilkan saldo real-time hasil kalkulasi
    };
  });

  return walletsWithCalculatedBalance;
}

// Tambah dompet baru (Menyimpan Nama, Jenis, dan Saldo Awalnya)
export async function addWallet(walletData) {
  const { data, error } = await supabase
    .from('wallets')
    .insert([walletData])
    .select();

  if (error) throw error;
  return data;
}

// Hapus dompet berdasarkan ID
export async function deleteWallet(id) {
  const { error } = await supabase
    .from('wallets')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}


// ==========================================
// 3. CATEGORY SERVICES (Kategori)
// ==========================================

// Ambil daftar kategori pendapatan & pengeluaran
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
}


// ==========================================
// 4. BILL SERVICES (Tagihan)
// ==========================================

// Ambil daftar tagihan
export async function getBills() {
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .order('due_date', { ascending: true });

  if (error) throw error;
  return data;
}

// Tambah tagihan baru
export async function addBill(billData) {
  const { data, error } = await supabase
    .from('bills')
    .insert([billData])
    .select();

  if (error) throw error;
  return data;
}

// Update status lunas/belum pada tagihan
export async function updateBillStatus(id, isPaid) {
  const { data, error } = await supabase
    .from('bills')
    .update({ is_paid: isPaid })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
}