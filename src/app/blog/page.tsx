import Link from 'next/link';
import type { Metadata } from 'next';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog | LXNUYYHYI - Vision Board Tips, Guides & Inspiration',
  description:
    'Discover expert tips on creating vision boards, manifestation techniques, and inspiration for every area of your life. Free guides from LXNUYYHYI.',
  keywords: [
    'vision board blog',
    'how to make a vision board',
    'manifestation tips',
    'law of attraction guide',
    'vision board ideas',
  ],
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Blog | LXNUYYHYI',
    description: 'Vision board tips, guides & inspiration for manifesting your dream life.',
    url: '/blog',
  },
};

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  meta_description: string | null;
  cover_image: string | null;
  category: string;
  tags: string[] | null;
  author: string;
  published_at: string;
  created_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  guides: 'Guides',
  tips: 'Tips & Tricks',
  inspiration: 'Inspiration',
  wealth: 'Wealth',
  travel: 'Travel',
  fitness: 'Fitness',
  career: 'Career',
  'self-love': 'Self-Love',
  family: 'Family',
  home: 'Home',
  spiritual: 'Spiritual',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const category = params.category;
  const pageSize = 9;

  const supabase = getSupabaseClient();
  let query = supabase
    .from('blog_posts')
    .select('id, title, slug, meta_description, cover_image, category, tags, author, published_at, created_at', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data: posts, error, count } = await query.range(from, to);

  if (error) {
    console.error('Failed to fetch blog posts:', error);
  }

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Hero */}
      <section className="bg-[#1A1A1A] text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold mb-4">
            From Our Blog
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Tips, guides, and inspiration to help you create the perfect vision board and manifest the life you desire.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-b border-[#E8E6E1] bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-4">
            <Link
              href="/blog"
              className={`px-4 py-2 text-sm rounded-full whitespace-nowrap transition-colors ${
                !category
                  ? 'bg-[#1A1A1A] text-white'
                  : 'bg-[#E8E6E1] text-[#1A1A1A] hover:bg-[#C8956C] hover:text-white'
              }`}
            >
              All
            </Link>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <Link
                key={key}
                href={`/blog?category=${key}`}
                className={`px-4 py-2 text-sm rounded-full whitespace-nowrap transition-colors ${
                  category === key
                    ? 'bg-[#1A1A1A] text-white'
                    : 'bg-[#E8E6E1] text-[#1A1A1A] hover:bg-[#C8956C] hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {(!posts || posts.length === 0) ? (
          <div className="text-center py-16">
            <p className="text-[#1A1A1A]/50 text-lg">No articles yet. Check back soon!</p>
            <Link href="/" className="inline-block mt-4 text-[#C8956C] hover:underline">
              Browse Vision Board Collections →
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post: BlogPost) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-[#E8E6E1] hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Cover Image */}
                  <div className="aspect-[16/10] bg-[#E8E6E1] overflow-hidden">
                    {post.cover_image ? (
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#C8956C]">
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                      </div>
                    )}
                  </div>
                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium text-[#C8956C] bg-[#C8956C]/10 px-2 py-0.5 rounded-full">
                        {CATEGORY_LABELS[post.category] || post.category}
                      </span>
                      <span className="text-xs text-[#1A1A1A]/40">
                        {formatDate(post.published_at)}
                      </span>
                    </div>
                    <h2 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-[#1A1A1A] mb-2 line-clamp-2 group-hover:text-[#C8956C] transition-colors">
                      {post.title}
                    </h2>
                    {post.meta_description && (
                      <p className="text-sm text-[#1A1A1A]/60 line-clamp-2">
                        {post.meta_description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {page > 1 && (
                  <Link
                    href={`/blog?page=${page - 1}${category ? `&category=${category}` : ''}`}
                    className="px-4 py-2 text-sm bg-white border border-[#E8E6E1] rounded-lg hover:bg-[#E8E6E1] transition-colors"
                  >
                    ← Previous
                  </Link>
                )}
                <span className="text-sm text-[#1A1A1A]/50">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/blog?page=${page + 1}${category ? `&category=${category}` : ''}`}
                    className="px-4 py-2 text-sm bg-[#1A1A1A] text-white rounded-lg hover:bg-[#1A1A1A]/80 transition-colors"
                  >
                    Next →
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
