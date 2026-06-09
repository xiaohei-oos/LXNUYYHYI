'use client';

import Link from 'next/link';
import { Download, CheckCircle, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface OrderInfo {
  id: string;
  download_token: string;
  image: {
    id: string;
    title: string;
    thumbnail_url: string;
    print_size: string;
  };
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setError('Missing session ID');
      setLoading(false);
      return;
    }

    fetch(`/api/checkout/verify?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setOrder(data);
        }
      })
      .catch(() => setError('Failed to verify payment'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleDownload = async () => {
    if (!order) return;
    setDownloading(true);

    try {
      const res = await fetch(`/api/download/${order.download_token}`);
      const data = await res.json();

      if (data.url) {
        const response = await fetch(data.url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${order.image.title.replace(/\s+/g, '-').toLowerCase()}.jpg`;
        link.click();
        window.URL.revokeObjectURL(blobUrl);
      } else {
        alert(data.error || 'Download failed');
      }
    } catch {
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl border border-[var(--color-linen)] p-8 text-center">
          {loading ? (
            <div className="py-8">
              <div className="w-12 h-12 border-4 border-[var(--color-linen)] border-t-[var(--color-warm-gold)] rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-[var(--color-muted-foreground)]">Verifying your payment...</p>
            </div>
          ) : error ? (
            <>
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">!</span>
              </div>
              <h1 className="mt-4 font-serif text-2xl font-semibold text-[var(--color-foreground)]">
                Verification Failed
              </h1>
              <p className="mt-2 text-[var(--color-muted-foreground)]">{error}</p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-foreground)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Back to Home
              </Link>
            </>
          ) : order ? (
            <>
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="mt-4 font-serif text-2xl font-semibold text-[var(--color-foreground)]">
                Payment Successful!
              </h1>
              <p className="mt-2 text-[var(--color-muted-foreground)]">
                Your vision board image is ready to download.
              </p>

              {/* Image Preview */}
              <div className="mt-6 rounded-xl overflow-hidden border border-[var(--color-linen)]">
                <img
                  src={order.image.thumbnail_url}
                  alt={order.image.title}
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
              <p className="mt-3 font-serif font-medium text-[var(--color-foreground)]">
                {order.image.title}
              </p>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Print size: {order.image.print_size}
              </p>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--color-warm-gold)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                {downloading ? 'Downloading...' : 'Download High-Resolution Image'}
              </button>

              <p className="mt-3 text-xs text-[var(--color-muted-foreground)]">
                Download link expires in 24 hours. Maximum 3 downloads.
              </p>

              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-1 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                Continue Browsing
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
