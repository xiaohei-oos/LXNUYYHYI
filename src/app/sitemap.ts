import type { MetadataRoute } from 'next';
import { getSupabaseClient } from '@/storage/database/supabase-client';

const BASE_URL = 'https://lxnuyyhyi.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const client = getSupabaseClient();
  const { data: categories } = await client
    .from('categories')
    .select('slug, updated_at')
    .order('sort_order', { ascending: true });

  const categoryEntries: MetadataRoute.Sitemap = (categories || []).map((cat: { slug: string; updated_at: string }) => ({
    url: `${BASE_URL}/category/${cat.slug}`,
    lastModified: new Date(cat.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Blog posts
  const { data: blogPosts } = await client
    .from('blog_posts')
    .select('slug, published_at, updated_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  const blogEntries: MetadataRoute.Sitemap = (blogPosts || []).map((post: { slug: string; published_at: string; updated_at: string }) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || post.published_at),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...categoryEntries,
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...blogEntries,
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/license`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ];
}
