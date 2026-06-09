import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  cover_image: string;
  sort_order: number;
}

interface VisionImage {
  id: string;
  title: string;
  description: string;
  category_id: string;
  thumbnail_url: string;
  price_cents: number;
  is_featured: boolean;
  print_size: string;
  tags: string;
}

interface CategoryWithCount extends Category {
  image_count: number;
}

async function getCategories(): Promise<CategoryWithCount[]> {
  const { getSupabaseClient } = await import('@/storage/database/supabase-client');
  const client = getSupabaseClient();

  const { data: categories, error: catError } = await client
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (catError) throw new Error(`Failed to fetch categories: ${catError.message}`);

  const { data: images, error: imgError } = await client
    .from('vision_images')
    .select('category_id')
    .eq('status', 'active');

  if (imgError) throw new Error(`Failed to fetch image counts: ${imgError.message}`);

  const countMap = new Map<string, number>();
  for (const img of images ?? []) {
    countMap.set(img.category_id, (countMap.get(img.category_id) ?? 0) + 1);
  }

  return (categories as Category[]).map((cat) => ({
    ...cat,
    image_count: countMap.get(cat.id) ?? 0,
  }));
}

async function getFeaturedImages(): Promise<VisionImage[]> {
  const { getSupabaseClient } = await import('@/storage/database/supabase-client');
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('vision_images')
    .select('*')
    .eq('status', 'active')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(8);

  if (error) throw new Error(`Failed to fetch featured images: ${error.message}`);
  return data as VisionImage[];
}

export default async function HomePage() {
  const [categories, featuredImages] = await Promise.all([
    getCategories(),
    getFeaturedImages(),
  ]);

  const heroImage = 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_ae84a8d0-5a1d-4bfa-80d2-7f8738f39eb5.jpeg?sign=1812541161-776800e52d-0-62542c9a94d5cb3900cdfb1cd791c1680278103dde3711c07b712222f514da4a';

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--color-linen)] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
            VisionDream
          </Link>
          <nav className="hidden sm:flex items-center gap-6">
            <Link href="/#categories" className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
              Categories
            </Link>
            <Link href="/#featured" className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
              Featured
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Vision Board"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/40" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight text-[var(--color-foreground)]">
              Create Your
              <br />
              <span className="text-[var(--color-warm-gold)]">Vision Board</span>
            </h1>
            <p className="mt-6 text-lg text-[var(--color-muted-foreground)] leading-relaxed max-w-lg">
              Beautiful, print-ready vision board images to manifest your dreams.
              Download, print, and transform your space into a daily reminder of your aspirations.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/#categories"
                className="inline-flex items-center justify-center px-6 py-3 bg-[var(--color-foreground)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Browse Collections
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link
                href="/#featured"
                className="inline-flex items-center justify-center px-6 py-3 border border-[var(--color-linen)] rounded-xl text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-secondary)] transition-colors"
              >
                View Featured
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-b border-[var(--color-linen)] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-[var(--color-muted-foreground)]">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--color-warm-gold)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
              Secure Checkout via Stripe
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--color-warm-gold)]" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" /></svg>
              High-Resolution Print Quality
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--color-warm-gold)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              Instant Download
            </span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--color-foreground)]">
            Explore by Category
          </h2>
          <p className="mt-3 text-[var(--color-muted-foreground)] max-w-md mx-auto">
            Find the perfect images for every area of your life
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-[var(--color-secondary)]"
            >
              <img
                src={cat.cover_image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-serif text-xl font-semibold text-white">{cat.name}</h3>
                <p className="mt-1 text-sm text-white/80">{cat.image_count} images</p>
              </div>
              <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Images */}
      <section id="featured" className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--color-foreground)]">
              Featured Visions
            </h2>
            <p className="mt-3 text-[var(--color-muted-foreground)] max-w-md mx-auto">
              Our most popular and inspiring vision board images
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredImages.map((img) => (
              <Link
                key={img.id}
                href={`/image/${img.id}`}
                className="group bg-[var(--color-card)] rounded-2xl overflow-hidden border border-[var(--color-linen)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={img.thumbnail_url}
                    alt={img.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-serif font-medium text-[var(--color-foreground)]">{img.title}</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[var(--color-warm-gold)] font-semibold">
                      ${(img.price_cents / 100).toFixed(2)}
                    </span>
                    <span className="text-xs text-[var(--color-muted-foreground)]">
                      {img.print_size}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
