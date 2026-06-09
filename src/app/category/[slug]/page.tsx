import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  cover_image: string;
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
  aspect_ratio: string;
}

async function getCategory(slug: string): Promise<Category | null> {
  const { getSupabaseClient } = await import('@/storage/database/supabase-client');
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch category: ${error.message}`);
  return data as Category | null;
}

async function getCategoryImages(categoryId: string): Promise<VisionImage[]> {
  const { getSupabaseClient } = await import('@/storage/database/supabase-client');
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('vision_images')
    .select('*')
    .eq('category_id', categoryId)
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch images: ${error.message}`);
  return data as VisionImage[];
}

async function getAllCategories(): Promise<Category[]> {
  const { getSupabaseClient } = await import('@/storage/database/supabase-client');
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw new Error(`Failed to fetch categories: ${error.message}`);
  return data as Category[];
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [category, allCategories] = await Promise.all([
    getCategory(slug),
    getAllCategories(),
  ]);

  if (!category) {
    notFound();
  }

  const images = await getCategoryImages(category.id);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--color-linen)] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
            VisionDream
          </Link>
          <nav className="hidden sm:flex items-center gap-4">
            {allCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className={`text-sm transition-colors ${
                  cat.slug === slug
                    ? 'text-[var(--color-foreground)] font-medium'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
              >
                {cat.name.split(' & ')[0]}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Category Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={category.cover_image}
            alt={category.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-white">
            {category.name}
          </h1>
          <p className="mt-3 text-white/80 max-w-lg">{category.description}</p>
          <p className="mt-2 text-sm text-white/60">{images.length} vision images available</p>
        </div>
      </section>

      {/* Image Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img) => (
            <Link
              key={img.id}
              href={`/image/${img.id}`}
              className="group bg-white rounded-2xl overflow-hidden border border-[var(--color-linen)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={img.thumbnail_url}
                  alt={img.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {img.is_featured && (
                  <span className="absolute top-3 left-3 px-2 py-1 bg-[var(--color-warm-gold)] text-white text-xs font-medium rounded-lg">
                    Featured
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-serif font-medium text-lg text-[var(--color-foreground)]">{img.title}</h3>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)] line-clamp-2">{img.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[var(--color-warm-gold)] font-semibold text-lg">
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

        {images.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[var(--color-muted-foreground)]">No images available in this category yet.</p>
          </div>
        )}
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
