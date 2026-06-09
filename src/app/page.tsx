import Link from 'next/link';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export const dynamic = 'force-dynamic';

interface Category {
  id: string;
  name: string;
  name_cn: string;
  slug: string;
  description: string;
  cover_image: string;
  image_count: number;
  price_cents: number;
  sort_order: number;
}

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
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight">
              Manifest Your Dreams
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Beautiful, high-quality vision board image packs designed to inspire and motivate.
              Download, print, and create the life you envision.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="#categories"
                className="inline-flex items-center px-8 py-3.5 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                Browse Collections
              </Link>
              <p className="text-sm text-muted-foreground">
                Instant download &middot; Print-ready &middot; High resolution
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
              300dpi Print-Ready
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
              className="group relative rounded-2xl overflow-hidden bg-card border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={cat.cover_image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-lg font-serif font-semibold">{cat.name}</h3>
                  <p className="text-sm text-white/80 mt-1">{cat.image_count} images</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Full pack</span>
                <span className="text-lg font-bold text-warm-gold">
                  ${(cat.price_cents / 100).toFixed(2)}
                </span>
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
              <p className="text-sm text-muted-foreground">Browse our curated vision board packs by theme.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-warm-gold/20 text-warm-gold flex items-center justify-center mx-auto mb-4 text-xl font-bold font-serif">2</div>
              <h3 className="font-semibold text-foreground mb-2">Secure Checkout</h3>
              <p className="text-sm text-muted-foreground">Pay securely with Stripe. Credit cards, Apple Pay & more.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-warm-gold/20 text-warm-gold flex items-center justify-center mx-auto mb-4 text-xl font-bold font-serif">3</div>
              <h3 className="font-semibold text-foreground mb-2">Download & Print</h3>
              <p className="text-sm text-muted-foreground">Download the ZIP file and print your vision board art.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xl font-serif font-bold tracking-wider text-foreground">LXNUYYHYI</span>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} LXNUYYHYI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
