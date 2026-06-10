'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Order {
  id: string;
  category_name: string;
  amount_cents: number;
  download_token: string;
  download_expires_at: string;
  download_count: number;
  max_downloads: number;
  status: string;
}

export default function CheckoutSuccessClient({ token }: { token: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const capturePayment = async () => {
      try {
        const res = await fetch(`/api/checkout/capture?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Payment verification failed');
          return;
        }

        setOrder(data.order);
      } catch {
        setError('Failed to verify payment. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    capturePayment();
  }, [token]);

  const handleDownload = async () => {
    if (!order?.download_token) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/download/${order.download_token}`);
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Download failed');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${order.category_name.replace(/\s+/g, '-').toLowerCase()}-vision-board-pack.zip`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white border border-[#E8E6E1] rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#C8956C]/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <svg className="w-8 h-8 text-[#C8956C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#1A1A1A] mb-2">Confirming Payment...</h1>
            <p className="text-[#6B6B6B]">Please wait while we verify your PayPal payment.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white border border-[#E8E6E1] rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#1A1A1A] mb-2">Payment Error</h1>
            <p className="text-[#6B6B6B] mb-6">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-[#1A1A1A] text-white rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white border border-[#E8E6E1] rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#A8B5A0]/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#A8B5A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#1A1A1A] mb-2">Order Confirmed!</h1>
          <p className="text-[#6B6B6B] mb-6">
            Your <strong>{order.category_name}</strong> collection is ready for download.
          </p>
          <div className="bg-[#F5F5F0] rounded-xl p-4 mb-6 text-left">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#6B6B6B]">Pack</span>
              <span className="font-medium text-[#1A1A1A]">{order.category_name}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#6B6B6B]">Amount</span>
              <span className="font-medium text-[#1A1A1A]">${(order.amount_cents / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B6B6B]">Downloads</span>
              <span className="font-medium text-[#1A1A1A]">{order.download_count} / {order.max_downloads}</span>
            </div>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full px-6 py-3 bg-[#1A1A1A] text-white rounded-full font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {downloading ? 'Preparing Download...' : 'Download ZIP Pack'}
          </button>
        </div>
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
            Continue Browsing
          </Link>
        </div>
      </div>
    </div>
  );
}
