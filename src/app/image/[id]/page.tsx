import { notFound } from 'next/navigation';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import ImagePreviewClient from './ImagePreviewClient';

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

async function getImage(id: string): Promise<ImageData | null> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('vision_images')
    .select('*, categories:category_id(name, slug)')
    .eq('id', id)
    .eq('status', 'active')
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch image: ${error.message}`);
  if (!data) return null;

  const category = data.categories as unknown as { name: string; slug: string };
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    thumbnail_url: data.thumbnail_url,
    price_cents: data.price_cents,
    is_featured: data.is_featured,
    print_size: data.print_size,
    tags: data.tags,
    aspect_ratio: data.aspect_ratio,
    category: category || { name: 'Unknown', slug: '' },
  };
}

export default async function ImagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const image = await getImage(id);

  if (!image) {
    notFound();
  }

  return <ImagePreviewClient image={image} />;
}
