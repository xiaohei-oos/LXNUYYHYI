import Link from 'next/link';
import type { Metadata } from 'next';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { resolveImageUrl } from '@/storage/oss-client';
import CategoryBuyClient from './CategoryBuyClient';
import ImageGrid from './ImageGrid';

const IMAGES_PER_PAGE = 24;

export const dynamic = 'force-dynamic';

const SEO_DATA: Record<string, {
  title: string;
  description: string;
  keywords: string[];
  seoDescription: string;
}> = {
  'wealth-finance': {
    title: 'Wealth & Finance Vision Board Images | Download & Print',
    description:
      'Attract prosperity and financial freedom with curated wealth vision board images. High-resolution, print-ready. Instant download after purchase.',
    keywords: [
      'wealth vision board',
      'finance vision board',
      'money manifestation images',
      'abundance vision board',
      'financial freedom printables',
    ],
    seoDescription:
      'Transform your relationship with money through the power of visual manifestation. Our Wealth & Finance vision board image pack features carefully curated high-resolution images that symbolize prosperity, abundance, and financial freedom. From passive income streams to debt-free living, each image is designed to anchor your financial goals and keep you focused on building wealth. Print them for your vision board, use them as digital wallpapers, or incorporate them into your goal-setting practice. These print-ready 300 DPI images work beautifully at sizes up to 16x20 inches.',
  },
  'travel-adventure': {
    title: 'Travel & Adventure Vision Board Images | Download & Print',
    description:
      'Visualize your dream destinations with curated travel vision board images. High-resolution, print-ready. Instant download after purchase.',
    keywords: [
      'travel vision board',
      'adventure vision board',
      'travel manifestation',
      'dream vacation printables',
      'wanderlust vision board',
    ],
    seoDescription:
      'See the world before you go. Our Travel & Adventure vision board image pack brings your dream destinations to life with stunning high-resolution imagery. From tropical beach escapes to mountain expeditions and European city breaks, each image captures the spirit of wanderlust and exploration. Use these print-ready images to create a travel vision board that keeps your bucket list front and center. Perfect for digital or physical vision boards at 300 DPI, printable up to 16x20 inches.',
  },
  'health-fitness': {
    title: 'Health & Fitness Vision Board Images | Download & Print',
    description:
      'Inspire your wellness journey with curated health & fitness vision board images. High-resolution, print-ready. Instant download after purchase.',
    keywords: [
      'health vision board',
      'fitness vision board',
      'wellness manifestation',
      'healthy lifestyle printables',
      'workout motivation images',
    ],
    seoDescription:
      'Your health is your greatest wealth. Our Health & Fitness vision board image pack is designed to motivate and inspire your wellness journey. Featuring high-resolution images that represent strength, vitality, nutritious eating, and active living, this collection helps you visualize the healthiest version of yourself. Whether your goals include running a marathon, practicing yoga, or simply feeling more energized, these images serve as daily visual reminders. Print-ready at 300 DPI, suitable for displays up to 16x20 inches.',
  },
  'career-business': {
    title: 'Career & Business Vision Board Images | Download & Print',
    description:
      'Manifest professional success with curated career & business vision board images. High-resolution, print-ready. Instant download after purchase.',
    keywords: [
      'career vision board',
      'business vision board',
      'professional success images',
      'entrepreneur manifestation',
      'career goals printables',
    ],
    seoDescription:
      'Accelerate your professional growth with intention and clarity. Our Career & Business vision board image pack features powerful high-resolution visuals that represent leadership, innovation, entrepreneurship, and career advancement. Whether you are climbing the corporate ladder, launching a startup, or pivoting to a new industry, these images help you stay focused on your professional aspirations. Each image is print-ready at 300 DPI and works for both digital vision boards and physical displays up to 16x20 inches.',
  },
  'self-love-growth': {
    title: 'Self-Love & Personal Growth Vision Board Images | Download & Print',
    description:
      'Embrace self-care and personal development with curated self-love vision board images. High-resolution, print-ready. Instant download after purchase.',
    keywords: [
      'self-love vision board',
      'personal growth vision board',
      'self-care manifestation',
      'mindfulness printables',
      'self-improvement images',
    ],
    seoDescription:
      'Self-love is the foundation of everything. Our Self-Love & Personal Growth vision board image pack celebrates the journey of becoming your best self. These high-resolution images capture moments of mindfulness, self-care rituals, journaling, meditation, and inner peace. Use them to create a daily visual practice that reinforces self-compassion and personal development goals. Perfect for vision boards, journaling prompts, and digital wallpapers. Print-ready at 300 DPI for displays up to 16x20 inches.',
  },
  'family-relationship': {
    title: 'Family & Relationship Vision Board Images | Download & Print',
    description:
      'Strengthen your bonds with curated family & relationship vision board images. High-resolution, print-ready. Instant download after purchase.',
    keywords: [
      'family vision board',
      'relationship vision board',
      'love manifestation images',
      'family goals printables',
      'relationship goals board',
    ],
    seoDescription:
      'Nurture the connections that matter most. Our Family & Relationship vision board image pack features heartwarming high-resolution imagery that celebrates love, togetherness, and meaningful relationships. From family gatherings to romantic moments and friendships, these images help you visualize the loving connections you want to cultivate. Ideal for creating a relationship-focused vision board that keeps your heart centered on what truly matters. Print-ready at 300 DPI, suitable for sizes up to 16x20 inches.',
  },
  'home-living': {
    title: 'Home & Living Vision Board Images | Download & Print',
    description:
      'Design your dream space with curated home & living vision board images. High-resolution, print-ready. Instant download after purchase.',
    keywords: [
      'home vision board',
      'living space vision board',
      'home decor manifestation',
      'dream home printables',
      'interior design vision board',
    ],
    seoDescription:
      'Create the home of your dreams, starting with a vision. Our Home & Living vision board image pack showcases beautiful high-resolution imagery of inspiring living spaces, cozy corners, organized interiors, and dream homes. Whether you are manifesting a new house, a kitchen renovation, or simply a more peaceful living environment, these images bring your domestic aspirations to life. Use them to create a home-focused vision board that keeps you inspired. Print-ready at 300 DPI for displays up to 16x20 inches.',
  },
  'spiritual-manifestation': {
    title: 'Spiritual & Manifestation Vision Board Images | Download & Print',
    description:
      'Deepen your spiritual practice with curated manifestation vision board images. High-resolution, print-ready. Instant download after purchase.',
    keywords: [
      'spiritual vision board',
      'manifestation vision board',
      'law of attraction images',
      'spiritual growth printables',
      'meditation vision board',
    ],
    seoDescription:
      'Align with your highest self. Our Spiritual & Manifestation vision board image pack features transcendent high-resolution imagery that speaks to the soul. From sacred geometry and meditation spaces to cosmic imagery and symbols of spiritual growth, these images support your manifestation practice and spiritual journey. Use them alongside affirmations, journaling, and meditation to amplify your intentions. Print-ready at 300 DPI, perfect for vision boards and sacred spaces up to 16x20 inches.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const seo = SEO_DATA[slug];

  if (!seo) {
    return { title: 'Collection Not Found' };
  }

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: `/category/${slug}`,
    },
    openGraph: {
      title: `${seo.title} | LXNUYYHYI`,
      description: seo.description,
      url: `/category/${slug}`,
      type: 'website',
      images: [
        {
          url: `/images/categories/${slug}.jpg`,
          width: 1200,
          height: 630,
          alt: seo.title,
        },
      ],
    },
  };
}

interface Category {
  id: string;
  name: string;
  name_cn: string;
  slug: string;
  description: string;
  image_count: number;
  price_cents: number;
}

// Static banner images stored locally - never change
const CATEGORY_BANNER_IMAGES: Record<string, string> = {
  'wealth-finance': '/images/categories/banner-wealth-finance.jpg',
  'travel-adventure': '/images/categories/banner-travel-adventure.jpg',
  'health-fitness': '/images/categories/banner-health-fitness.jpg',
  'career-business': '/images/categories/banner-career-business.jpg',
  'self-love-growth': '/images/categories/banner-self-love-growth.jpg',
  'family-relationship': '/images/categories/banner-family-relationship.jpg',
  'home-living': '/images/categories/banner-home-living.jpg',
  'spiritual-manifestation': '/images/categories/banner-spiritual-manifestation.jpg',
};

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

  // Only load first page of images for SSR (performance optimization)
  const { data: images } = await client
    .from('vision_images')
    .select('id, title, thumbnail_url, sort_order')
    .eq('category_id', cat.id)
    .order('sort_order', { ascending: true })
    .range(0, IMAGES_PER_PAGE - 1);

  const imgs = (images || []) as VisionImage[];

  const bannerImage = CATEGORY_BANNER_IMAGES[slug] || '/images/categories/banner-wealth-finance.jpg';

  // Resolve thumbnail URLs for first page only
  const imgsWithResolvedUrls = await Promise.all(
    imgs.map(async (img) => ({
      ...img,
      thumbnail_url: await resolveImageUrl(img.thumbnail_url, 86400),
    }))
  );

  const seo = SEO_DATA[slug];

  // Structured Data: Product Schema
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${cat.name} Vision Board Image Pack`,
    description: cat.description,
    image: `/images/categories/${slug}.jpg`,
    brand: {
      '@type': 'Brand',
      name: 'LXNUYYHYI',
    },
    offers: {
      '@type': 'Offer',
      url: `https://lxnuyyhyi.com/category/${slug}`,
      priceCurrency: 'USD',
      price: (cat.price_cents / 100).toFixed(2),
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'LXNUYYHYI',
      },
    },
  };

  // Structured Data: BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://lxnuyyhyi.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: cat.name,
        item: `https://lxnuyyhyi.com/category/${slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

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
            src={bannerImage}
            alt={`${cat.name} vision board images - high-resolution print-ready collection by LXNUYYHYI`}
            className="w-full h-full object-cover"
            width={1200}
            height={514}
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

      {/* Image Preview Grid - Client-side lazy loading */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <ImageGrid
          slug={slug}
          initialImages={imgsWithResolvedUrls}
          totalCount={cat.image_count}
          pageSize={IMAGES_PER_PAGE}
        />
      </div>

      {/* SEO Content Section */}
      {seo?.seoDescription && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-serif font-semibold text-foreground mb-4">
              About the {cat.name} Collection
            </h2>
            <p className="text-muted-foreground leading-relaxed">{seo.seoDescription}</p>
          </div>
        </section>
      )}

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
