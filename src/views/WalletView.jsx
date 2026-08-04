import React, { useState, useEffect } from 'react';
import { getWallets, addWallet, deleteWallet } from '../services/financeService';
import WalletsDesktop from './WalletsDesktop';
import WalletsMobile from './WalletsMobile';

export default function WalletsView() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [type, setType] = useState('Bank');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchWalletsData = async () => {
    try {
      setLoading(true);
      const data = await getWallets();
      setWallets(data || []);
    } catch (error) {
      console.error("Gagal memuat dompet:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletsData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      alert("Mohon isi nama dompet / bank!");
      return;
    }

    try {
      setIsSubmitting(true);
      // Saldo otomatis mulai dari 0 saat dompet dibuat (murni dihitung dari transaksi)
      await addWallet({
        name,
        type,
        balance: 0 
      });
      setName('');
      setType('Bank');
      await fetchWalletsData();
      alert("Dompet berhasil ditambahkan!");
    } catch (error) {
      console.error("Gagal menambah dompet:", error);
      alert("Gagal menambah dompet: " + (error.message || JSON.stringify(error)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus dompet/rekening ini?")) {
      try {
        await deleteWallet(id);
        await fetchWalletsData();
      } catch (error) {
        console.error("Gagal menghapus dompet:", error);
        alert("Gagal menghapus dompet.");
      }
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  const totalBalance = wallets.reduce((acc, curr) => acc + (Number(curr.balance) || 0), 0);

  const sharedProps = {
    wallets,
    loading,
    name,
    setName,
    type,
    setType,
    isSubmitting,
    onSubmit: handleSubmit,
    onDelete: handleDelete,
    formatRupiah,
    totalBalance
  };

  return isMobile ? (
    <WalletsMobile {...sharedProps} />
  ) : (
    <WalletsDesktop {...sharedProps} />
  );
}