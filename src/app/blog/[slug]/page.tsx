import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import BlogPostContent from './BlogPostContent';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  meta_description: string | null;
  meta_keywords: string[] | null;
  cover_image: string | null;
  content: string;
  category: string;
  tags: string[] | null;
  author: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

const BLOG_COVER_FALLBACKS = [
  '/blog-covers/blog-cover-1.png',
  '/blog-covers/blog-cover-2.png',
  '/blog-covers/blog-cover-3.png',
  '/blog-covers/blog-cover-4.png',
];

function getBlogCover(coverImage: string | null, slug: string): string {
  if (coverImage) return coverImage;
  // Deterministic selection based on slug so same post always shows same cover
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash) + slug.charCodeAt(i);
    hash |= 0;
  }
  return BLOG_COVER_FALLBACKS[Math.abs(hash) % BLOG_COVER_FALLBACKS.length];
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

export const dynamic = 'force-dynamic';

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabaseClient();

  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, meta_description, meta_keywords, cover_image, category, tags')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!post) {
    return { title: 'Post Not Found | LXNUYYHYI' };
  }

  const coverUrl = getBlogCover(post.cover_image, slug);

  return {
    title: `${post.title} | LXNUYYHYI Blog`,
    description: post.meta_description || `${post.title} - Read more on the LXNUYYHYI blog.`,
    keywords: post.meta_keywords || post.tags || [],
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.meta_description || '',
      url: `/blog/${slug}`,
      type: 'article',
      publishedTime: undefined,
      authors: ['LXNUYYHYI'],
      images: [{ url: coverUrl, width: 1200, height: 630 }],
    },
  };
}

// JSON-LD structured data for articles
function generateJsonLd(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta_description || '',
    image: getBlogCover(post.cover_image, post.slug),
    author: {
      '@type': 'Organization',
      name: 'LXNUYYHYI',
    },
    publisher: {
      '@type': 'Organization',
      name: 'LXNUYYHYI',
    },
    datePublished: post.published_at,
    dateModified: post.updated_at || post.created_at,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `/blog/${post.slug}`,
    },
    keywords: (post.meta_keywords || post.tags || []).join(', '),
    articleSection: CATEGORY_LABELS[post.category] || post.category,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = getSupabaseClient();

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !post) {
    notFound();
  }

  // Get related posts (same category, limit 3)
  const { data: relatedPosts } = await supabase
    .from('blog_posts')
    .select('id, title, slug, cover_image, category, published_at')
    .eq('status', 'published')
    .eq('category', post.category)
    .neq('id', post.id)
    .order('published_at', { ascending: false })
    .limit(3);

  const jsonLd = generateJsonLd(post);

  return (
    <>
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#FAFAF8]">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-[#E8E6E1]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-sm text-[#1A1A1A]/50">
              <Link href="/" className="hover:text-[#C8956C] transition-colors">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-[#C8956C] transition-colors">Blog</Link>
              <span>/</span>
              <span className="text-[#1A1A1A]/70 truncate">{post.title}</span>
            </nav>
          </div>
        </div>

        {/* Article */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium text-[#C8956C] bg-[#C8956C]/10 px-3 py-1 rounded-full">
                {CATEGORY_LABELS[post.category] || post.category}
              </span>
              <span className="text-sm text-[#1A1A1A]/40">
                {new Date(post.published_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A1A1A] leading-tight mb-4">
              {post.title}
            </h1>
            {post.meta_description && (
              <p className="text-lg text-[#1A1A1A]/60 leading-relaxed">
                {post.meta_description}
              </p>
            )}
          </header>

          {/* Cover Image */}
          <div className="aspect-[21/9] rounded-2xl overflow-hidden mb-10">
            <img
              src={getBlogCover(post.cover_image, post.slug)}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <BlogPostContent content={post.content} />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-[#E8E6E1]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-[#1A1A1A]/50">Tags:</span>
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs bg-[#E8E6E1] text-[#1A1A1A]/70 px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-10 bg-[#1A1A1A] rounded-2xl p-8 text-center">
            <h3 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-white mb-2">
              Ready to Create Your Vision Board?
            </h3>
            <p className="text-gray-400 mb-4 text-sm">
              Browse our curated vision board image packs and start manifesting today.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2.5 bg-[#C8956C] text-white rounded-lg hover:bg-[#C8956C]/90 transition-colors text-sm font-medium"
            >
              Shop Vision Board Packs
            </Link>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <section className="bg-white border-t border-[#E8E6E1] py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1A1A1A] mb-6">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((rp: { id: string; title: string; slug: string; cover_image: string | null; published_at: string }) => (
                  <Link
                    key={rp.id}
                    href={`/blog/${rp.slug}`}
                    className="group rounded-xl overflow-hidden border border-[#E8E6E1] hover:shadow-md transition-all"
                  >
                    <div className="aspect-[16/10] bg-[#E8E6E1] overflow-hidden">
                      <img src={getBlogCover(rp.cover_image, rp.slug)} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-[family-name:var(--font-playfair)] font-semibold text-[#1A1A1A] group-hover:text-[#C8956C] transition-colors line-clamp-2">
                        {rp.title}
                      </h3>
                      <p className="text-xs text-[#1A1A1A]/40 mt-1">
                        {new Date(rp.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
