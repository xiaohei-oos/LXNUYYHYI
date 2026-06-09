import Link from 'next/link';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import DownloadClient from './DownloadClient';

export const dynamic = 'force-dynamic';

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

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-foreground mb-4">Invalid Session</h1>
          <Link href="/" className="text-warm-gold hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  const client = getSupabaseClient();
  const { data: order } = await client
    .from('orders')
    .select('*')
    .eq('stripe_session_id', session_id)
    .maybeSingle();

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-foreground mb-4">Order Not Found</h1>
          <Link href="/" className="text-warm-gold hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  const ord = order as Order;
  const isPaid = ord.status === 'paid';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          {isPaid ? (
            <>
              <div className="w-16 h-16 rounded-full bg-sage-green/20 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-sage-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-serif font-bold text-foreground mb-2">Payment Successful!</h1>
              <p className="text-muted-foreground mb-6">
                Your <strong>{ord.category_name}</strong> collection is ready to download.
              </p>
              <div className="bg-secondary rounded-xl p-4 mb-6 text-left">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Collection</span>
                  <span className="font-medium text-foreground">{ord.category_name}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium text-foreground">${(ord.amount_cents / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Downloads</span>
                  <span className="font-medium text-foreground">{ord.download_count} / {ord.max_downloads}</span>
                </div>
              </div>
              <DownloadClient downloadToken={ord.download_token} categoryName={ord.category_name} />
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-warm-gold/20 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-warm-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-serif font-bold text-foreground mb-2">Processing Payment</h1>
              <p className="text-muted-foreground mb-6">
                Your payment is being processed. Please wait a moment and refresh the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                Refresh
              </button>
            </>
          )}
        </div>
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Continue Browsing
          </Link>
        </div>
      </div>
    </div>
  );
}
