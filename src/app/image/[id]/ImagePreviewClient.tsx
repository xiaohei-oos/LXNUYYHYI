'use client';

import Link from 'next/link';
import { ArrowLeft, Download, Shield, Printer, CreditCard } from 'lucide-react';
import { useState } from 'react';

interface ImageData {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  price_cents: number;
  is_featured: boolean;
  print_size: string;
  tags: string;
  aspect_ratio: string;
  category: {
    name: string;
    slug: string;
  };
}

export default function ImagePreviewPage({ image }: { image: ImageData }) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleBuy = async () => {
    setIsRedirecting(true);
    try {
      const res = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId: image.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to create checkout session');
        setIsRedirecting(false);
      }
    } catch {
      alert('Something went wrong. Please try again.');
      setIsRedirecting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--color-linen)] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
            VisionDream
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
          <Link href="/" className="hover:text-[var(--color-foreground)] transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/category/${image.category.slug}`} className="hover:text-[var(--color-foreground)] transition-colors">
            {image.category.name}
          </Link>
          <span>/</span>
          <span className="text-[var(--color-foreground)]">{image.title}</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Image Preview */}
          <div className="lg:col-span-3">
            <div className="relative rounded-2xl overflow-hidden bg-[var(--color-secondary)]">
              <img
                src={image.thumbnail_url}
                alt={image.title}
                className="w-full aspect-[4/3] object-cover"
              />
              {/* Watermark overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <span className="text-white/20 text-6xl font-bold rotate-[-30deg] select-none tracking-widest">
                  SAMPLE
                </span>
              </div>
              {image.is_featured && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-[var(--color-warm-gold)] text-white text-sm font-medium rounded-lg">
                  Featured
                </span>
              )}
            </div>
            <Link
              href={`/category/${image.category.slug}`}
              className="inline-flex items-center mt-4 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to {image.category.name}
            </Link>
          </div>

          {/* Purchase Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-[var(--color-linen)] p-6 lg:sticky lg:top-24">
              <h1 className="font-serif text-2xl lg:text-3xl font-semibold text-[var(--color-foreground)]">
                {image.title}
              </h1>
              <p className="mt-3 text-[var(--color-muted-foreground)] leading-relaxed">
                {image.description}
              </p>

              {/* Tags */}
              {image.tags && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {(typeof image.tags === 'string' ? JSON.parse(image.tags) : image.tags).map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-[var(--color-secondary)] text-xs text-[var(--color-muted-foreground)] rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Price */}
              <div className="mt-6 pt-6 border-t border-[var(--color-linen)]">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[var(--color-foreground)]">
                    ${(image.price_cents / 100).toFixed(2)}
                  </span>
                  <span className="text-sm text-[var(--color-muted-foreground)]">USD</span>
                </div>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                  One-time purchase. Instant download.
                </p>
              </div>

              {/* Buy Button */}
              <button
                onClick={handleBuy}
                disabled={isRedirecting}
                className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--color-foreground)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isRedirecting ? (
                  <span>Redirecting to checkout...</span>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Buy & Download
                  </>
                )}
              </button>

              {/* Features */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-[var(--color-muted-foreground)]">
                  <Download className="w-4 h-4 text-[var(--color-warm-gold)] shrink-0" />
                  <span>High-resolution instant download</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--color-muted-foreground)]">
                  <Printer className="w-4 h-4 text-[var(--color-warm-gold)] shrink-0" />
                  <span>Optimized for {image.print_size} printing</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--color-muted-foreground)]">
                  <Shield className="w-4 h-4 text-[var(--color-warm-gold)] shrink-0" />
                  <span>Secure payment via Stripe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-linen)] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="font-serif text-lg font-semibold text-[var(--color-foreground)]">VisionDream</span>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              &copy; {new Date().getFullYear()} VisionDream. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
