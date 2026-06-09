import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl border border-[var(--color-linen)] p-8 text-center">
          <div className="w-16 h-16 bg-[var(--color-secondary)] rounded-full flex items-center justify-center mx-auto">
            <ArrowLeft className="w-8 h-8 text-[var(--color-muted-foreground)]" />
          </div>
          <h1 className="mt-4 font-serif text-2xl font-semibold text-[var(--color-foreground)]">
            Checkout Cancelled
          </h1>
          <p className="mt-2 text-[var(--color-muted-foreground)]">
            Your payment was not completed. No charges have been made.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-[var(--color-foreground)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Browse More Images
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
