import Link from 'next/link';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import CategoryBuyClient from './CategoryBuyClient';

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
}

interface VisionImage {
  id: string;
  title: string;
  thumbnail_url: string;
  sort_order: number;
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const client = getSupabaseClient();

  const { data: category } = await client
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-foreground mb-4">Collection Not Found</h1>
          <Link href="/" className="text-warm-gold hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  const cat = category as Category;

  const { data: images } = await client
    .from('vision_images')
    .select('id, title, thumbnail_url, sort_order')
    .eq('category_id', cat.id)
    .order('sort_order', { ascending: true });

  const imgs = (images || []) as VisionImage[];

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
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              All Collections
            </Link>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <span className="text-foreground">{cat.name}</span>
        </div>
      </div>

      {/* Category Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="relative rounded-2xl overflow-hidden aspect-[21/9]">
          <img
            src={cat.cover_image}
            alt={cat.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex items-center p-8 sm:p-12">
            <div className="text-white max-w-xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold">{cat.name}</h1>
              <p className="mt-4 text-white/80 text-sm sm:text-base leading-relaxed">{cat.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Full Collection Bundle</h2>
            <p className="mt-2 text-muted-foreground text-sm">
              {cat.image_count} hi-res images &middot; 300dpi print-ready &middot; Instant ZIP download
            </p>
            <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-sage-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Multiple sizes
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-sage-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Commercial use
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-sage-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                24h download link
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div>
              <span className="text-3xl font-bold text-warm-gold">${(cat.price_cents / 100).toFixed(2)}</span>
              <p className="text-sm text-muted-foreground mt-0.5 text-right">{cat.image_count} images included</p>
            </div>
            <CategoryBuyClient categoryId={cat.id} categoryName={cat.name} priceCents={cat.price_cents} />
          </div>
        </div>
      </div>

      {/* Image Preview Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Preview ({imgs.length} images)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {imgs.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-secondary border border-border"
            >
              <img
                src={img.thumbnail_url}
                alt={img.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-sm font-medium truncate">{img.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

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
