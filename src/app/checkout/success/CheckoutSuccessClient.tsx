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

export default function CheckoutSuccessClient({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Get token from ALL possible sources
        let token: string | null = null;

        // 1. Try searchParams (Next.js server-side)
        try {
          const params = await searchParams;
          token = typeof params.token === 'string' ? params.token : null;
          console.log('[CheckoutSuccess] searchParams:', JSON.stringify(params));
        } catch (e) {
          console.log('[CheckoutSuccess] searchParams error:', e);
        }

        // 2. Try window.location.search (client-side)
        if (!token && typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          token = urlParams.get('token');
          console.log('[CheckoutSuccess] URL search:', window.location.search);
        }

        // 3. Try window.location.hash (PayPal sometimes puts params in hash)
        if (!token && typeof window !== 'undefined') {
          const hash = window.location.hash;
          if (hash) {
            const hashParams = new URLSearchParams(hash.substring(1));
            token = hashParams.get('token');
            console.log('[CheckoutSuccess] URL hash:', hash);
          }
        }

        // 4. Check full URL for token pattern (catch-all)
        if (!token && typeof window !== 'undefined') {
          const fullUrl = window.location.href;
          const tokenMatch = fullUrl.match(/[?&]token=([^&]+)/);
          if (tokenMatch) {
            token = tokenMatch[1];
            console.log('[CheckoutSuccess] Regex match token:', token);
          }
        }

        console.log('[CheckoutSuccess] Final token:', token);
        console.log('[CheckoutSuccess] Full URL:', typeof window !== 'undefined' ? window.location.href : 'N/A');

        if (!token) {
          setError('Missing token');
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/checkout/capture?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Payment capture failed');
          setLoading(false);
          return;
        }

        setOrder(data.order);
      } catch (err) {
        setError('An unexpected error occurred');
        console.error('[CheckoutSuccess] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [searchParams]);

  const handleDownload = async () => {
    if (!order) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/download/${order.download_token}`);
      if (!res.ok) throw new Error('Download failed');
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#C8956C]/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-[#C8956C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[#6B6B6B] text-lg">Confirming Payment...</p>
          <p className="text-[#999] text-sm mt-2">Please wait while we verify your payment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full mx-4 text-center border border-[#E8E6E1]">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Payment Error</h1>
          <p className="text-[#6B6B6B] mb-6">{error}</p>
          <Link href="/" className="inline-block bg-[#1A1A1A] text-white px-6 py-3 rounded-xl hover:bg-[#333] transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full mx-4 text-center border border-[#E8E6E1]">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Payment Successful!</h1>
        {order && (
          <>
            <p className="text-[#6B6B6B] mb-1">{order.category_name}</p>
            <p className="text-[#C8956C] font-semibold text-lg mb-6">${(order.amount_cents / 100).toFixed(2)}</p>
          </>
        )}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full bg-[#1A1A1A] text-white px-6 py-3 rounded-xl hover:bg-[#333] transition-colors disabled:opacity-50 mb-4 text-lg font-medium"
        >
          {downloading ? 'Preparing Download...' : 'Download ZIP Package'}
        </button>
        <p className="text-sm text-[#999]">
          Download link expires in 24 hours
          {order && ` • ${order.max_downloads - order.download_count} downloads remaining`}
        </p>
      </div>
    </div>
  );
}
