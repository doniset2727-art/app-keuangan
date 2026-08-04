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

// Tambah transaksi baru (otomatis mengambil user_id yang sedang login)
export async function addTransaction(transactionData) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const userId = userData.user.id;

  const { data, error } = await supabase
    .from('transactions')
    .insert([{ ...transactionData, user_id: userId }])
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

// Ambil daftar dompet user
export async function getWallets() {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

// Tambah dompet baru
export async function addWallet(walletData) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const { data, error } = await supabase
    .from('wallets')
    .insert([{ ...walletData, user_id: userData.user.id }])
    .select();

  if (error) throw error;
  return data;
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
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const { data, error } = await supabase
    .from('bills')
    .insert([{ ...billData, user_id: userData.user.id }])
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