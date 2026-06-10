import Link from 'next/link';
import type { Metadata } from 'next';
import { getSupabaseClient } from '@/storage/database/supabase-client';


export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'LXNUYYHYI | Premium Vision Board Image Packs | Download & Print',
  description:
    'Curated vision board image collections across 8 life categories. High-quality, print-ready downloads starting at $9.90. Manifest your dreams with beautiful vision board art.',
  keywords: [
    'vision board printables',
    'vision board images',
    'vision board kit',
    'manifestation art',
    'law of attraction images',
    'printable vision board',
    'vision board download',
    'dream board printables',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'LXNUYYHYI | Premium Vision Board Image Packs',
    description:
      'Curated vision board image collections across 8 life categories. High-quality, print-ready downloads.',
    url: '/',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'LXNUYYHYI - Premium Vision Board Image Packs',
      },
    ],
  },
};

interface Category {
  id: string;
  name: string;
  name_cn: string;
  slug: string;
  description: string;
  image_count: number;
  price_cents: number;
  sort_order: number;
}

// Static cover images stored locally - never change
const CATEGORY_COVER_IMAGES: Record<string, string> = {
  'wealth-finance': '/images/categories/cover-wealth-finance.jpg',
  'travel-adventure': '/images/categories/cover-travel-adventure.jpg',
  'health-fitness': '/images/categories/cover-health-fitness.jpg',
  'career-business': '/images/categories/cover-career-business.jpg',
  'self-love-growth': '/images/categories/cover-self-love-growth.jpg',
  'family-relationship': '/images/categories/cover-family-relationship.jpg',
  'home-living': '/images/categories/cover-home-living.jpg',
  'spiritual-manifestation': '/images/categories/cover-spiritual-manifestation.jpg',
};

export default async function HomePage() {
  const client = getSupabaseClient();
  const { data: categories } = await client
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  const cats = (categories || []) as Category[];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-serif font-bold tracking-wider text-foreground">
                LXNUYYHYI
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              {cats.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="hover:text-foreground transition-colors"
                >
                  {cat.name.split(' & ')[0]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[500px] sm:min-h-[600px] flex items-center">
        <img
          src="/images/hero-banner.jpg"
          alt="LXNUYYHYI vision board inspiration - curated high-resolution image packs for manifesting your dreams"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 w-full">
          <div className="max-w-2xl">
            <p className="text-warm-gold font-medium tracking-widest uppercase text-sm mb-4">LXNUYYHYI</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight">
              Manifest Your Dreams
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-foreground/70 leading-relaxed">
              Curated high-resolution image packs to bring your vision board to life.
              Download instantly, print at home, and start manifesting.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="#categories"
                className="inline-flex items-center px-8 py-3.5 bg-foreground text-white rounded-full font-medium hover:bg-foreground/90 transition-colors"
              >
                Browse Collections
              </Link>
              <p className="text-sm text-foreground/50 flex items-center gap-3">
                <span>Instant download</span>
                <span className="w-1 h-1 rounded-full bg-foreground/30" />
                <span>Print-ready</span>
                <span className="w-1 h-1 rounded-full bg-foreground/30" />
                <span>High resolution</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-warm-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Secure Payment via Stripe
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-warm-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Instant Download
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-warm-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Print-Ready 300dpi
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
            Vision Board Collections
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Each collection includes high-resolution images curated for your vision board.
            Buy the pack, download the ZIP, and start manifesting.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cats.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group rounded-2xl overflow-hidden bg-card border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={CATEGORY_COVER_IMAGES[cat.slug] || '/images/categories/cover-wealth-finance.jpg'}
                  alt={`${cat.name} vision board images - curated collection for manifestation and goal setting`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-serif font-semibold text-foreground leading-snug line-clamp-2 min-h-[2.5rem] sm:min-h-[2.75rem]">{cat.name}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{cat.image_count} Prints &middot; Full Bundle</p>
                <div className="mt-3 flex items-end justify-between gap-2">
                  <span className="text-lg sm:text-xl font-bold text-warm-gold">${(cat.price_cents / 100).toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide shrink-0">Instant Download</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <h2 className="text-3xl font-serif font-bold text-foreground text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-warm-gold/20 text-warm-gold flex items-center justify-center mx-auto mb-4 text-xl font-bold font-serif">1</div>
              <h3 className="font-semibold text-foreground mb-2">Choose a Collection</h3>
              <p className="text-sm text-muted-foreground">Browse our curated vision board packs by theme — from wealth and travel to health and spirituality.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-warm-gold/20 text-warm-gold flex items-center justify-center mx-auto mb-4 text-xl font-bold font-serif">2</div>
              <h3 className="font-semibold text-foreground mb-2">Secure Checkout</h3>
              <p className="text-sm text-muted-foreground">Pay securely with PayPal or credit card. No account required for card payments.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-warm-gold/20 text-warm-gold flex items-center justify-center mx-auto mb-4 text-xl font-bold font-serif">3</div>
              <h3 className="font-semibold text-foreground mb-2">Download & Print</h3>
              <p className="text-sm text-muted-foreground">Each ZIP includes individual high-res images plus ready-to-print A4 layouts. Just download, print at home, and start manifesting.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
            <div>
              <span className="text-xl font-serif font-bold tracking-wider text-foreground">LXNUYYHYI</span>
              <p className="text-sm text-muted-foreground mt-2">Premium vision board image packs for manifesting your dreams.</p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
              <Link href="/license" className="hover:text-foreground transition-colors">Commercial License</Link>
              <Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} LXNUYYHYI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
