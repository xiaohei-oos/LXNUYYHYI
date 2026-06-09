import { getSupabaseClient } from '../src/storage/database/supabase-client';

const CATEGORIES = [
  {
    name: 'Wealth & Finance',
    name_cn: '财富与财务',
    slug: 'wealth-finance',
    description: 'Attract prosperity and financial freedom with abundance-focused vision board art. From passive income to debt-free living.',
    description_cn: '用专注丰盛的愿景板艺术吸引繁荣和财务自由。从被动收入到无债生活。',
    cover_image: '/images/categories/wealth-finance.jpg',
    price_cents: 1499,
    sort_order: 1,
  },
  {
    name: 'Travel & Adventure',
    name_cn: '旅行与探索',
    slug: 'travel-adventure',
    description: 'Visualize your dream destinations and adventurous journeys. From tropical escapes to mountain expeditions.',
    description_cn: '想象您的梦想目的地和冒险旅程。从热带度假到山地探险。',
    cover_image: '/images/categories/travel-adventure.jpg',
    price_cents: 1299,
    sort_order: 2,
  },
  {
    name: 'Health & Fitness',
    name_cn: '健康与健身',
    slug: 'health-fitness',
    description: 'Manifest your healthiest self with fitness goals, wellness routines, and body-positive vision board art.',
    description_cn: '用健身目标、健康习惯和积极身体形象的愿景板艺术，显化最健康的自己。',
    cover_image: '/images/categories/health-fitness.jpg',
    price_cents: 1499,
    sort_order: 3,
  },
  {
    name: 'Career & Business',
    name_cn: '职业与事业',
    slug: 'career-business',
    description: 'Visualize career success, business growth, and professional achievements with empowering vision board art.',
    description_cn: '用充满力量的愿景板艺术，想象职业成功、业务增长和专业成就。',
    cover_image: '/images/categories/career-business.jpg',
    price_cents: 1499,
    sort_order: 4,
  },
  {
    name: 'Self-Love & Personal Growth',
    name_cn: '自爱与成长',
    slug: 'self-love-growth',
    description: 'Embrace self-care, confidence, and personal development with inspiring self-love vision board art.',
    description_cn: '用鼓舞人心的自爱愿景板艺术，拥抱自我关怀、自信和个人成长。',
    cover_image: '/images/categories/self-love-growth.jpg',
    price_cents: 1299,
    sort_order: 5,
  },
  {
    name: 'Family & Relationship',
    name_cn: '家庭与关系',
    slug: 'family-relationship',
    description: 'Strengthen family bonds and loving relationships with heartwarming vision board art.',
    description_cn: '用温馨的愿景板艺术，加强家庭纽带和亲密关系。',
    cover_image: '/images/categories/family-relationship.jpg',
    price_cents: 1299,
    sort_order: 6,
  },
  {
    name: 'Home & Living',
    name_cn: '居家生活',
    slug: 'home-living',
    description: 'Create your dream living space with beautiful home and lifestyle vision board art.',
    description_cn: '用美丽的居家生活愿景板艺术，打造您的梦想居住空间。',
    cover_image: '/images/categories/home-living.jpg',
    price_cents: 1299,
    sort_order: 7,
  },
  {
    name: 'Spiritual & Manifestation',
    name_cn: '灵性与显化',
    slug: 'spiritual-manifestation',
    description: 'Harness the power of manifestation and spiritual growth with mystical vision board art.',
    description_cn: '用神秘的愿景板艺术，发挥显化和灵性成长的力量。',
    cover_image: '/images/categories/spiritual-manifestation.jpg',
    price_cents: 1499,
    sort_order: 8,
  },
];

const IMAGES: Record<string, Array<{ title: string; title_cn: string; thumbnail_url: string; hd_image_key: string; sort_order: number }>> = {
  'wealth-finance': [
    { title: 'Abundance Mindset', title_cn: '丰盛心态', thumbnail_url: '/images/vision/wealth-finance/abundance-mindset.jpg', hd_image_key: 'hd/wealth-finance/abundance-mindset.jpg', sort_order: 1 },
    { title: 'Financial Freedom', title_cn: '财务自由', thumbnail_url: '/images/vision/wealth-finance/financial-freedom.jpg', hd_image_key: 'hd/wealth-finance/financial-freedom.jpg', sort_order: 2 },
    { title: 'Passive Income', title_cn: '被动收入', thumbnail_url: '/images/vision/wealth-finance/passive-income.jpg', hd_image_key: 'hd/wealth-finance/passive-income.jpg', sort_order: 3 },
  ],
  'travel-adventure': [
    { title: 'Dream Destinations', title_cn: '梦想目的地', thumbnail_url: '/images/vision/travel-adventure/dream-destinations.jpg', hd_image_key: 'hd/travel-adventure/dream-destinations.jpg', sort_order: 1 },
    { title: 'Adventure Awaits', title_cn: '冒险在等待', thumbnail_url: '/images/vision/travel-adventure/adventure-awaits.jpg', hd_image_key: 'hd/travel-adventure/adventure-awaits.jpg', sort_order: 2 },
    { title: 'Wanderlust Spirit', title_cn: '漫游之魂', thumbnail_url: '/images/vision/travel-adventure/wanderlust-spirit.jpg', hd_image_key: 'hd/travel-adventure/wanderlust-spirit.jpg', sort_order: 3 },
  ],
  'health-fitness': [
    { title: 'Fitness Goals', title_cn: '健身目标', thumbnail_url: '/images/vision/health-fitness/fitness-goals.jpg', hd_image_key: 'hd/health-fitness/fitness-goals.jpg', sort_order: 1 },
    { title: 'Healthy Living', title_cn: '健康生活', thumbnail_url: '/images/vision/health-fitness/healthy-living.jpg', hd_image_key: 'hd/health-fitness/healthy-living.jpg', sort_order: 2 },
    { title: 'Wellness Journey', title_cn: '健康之旅', thumbnail_url: '/images/vision/health-fitness/wellness-journey.jpg', hd_image_key: 'hd/health-fitness/wellness-journey.jpg', sort_order: 3 },
  ],
  'career-business': [
    { title: 'Career Success', title_cn: '职业成功', thumbnail_url: '/images/vision/career-business/career-success.jpg', hd_image_key: 'hd/career-business/career-success.jpg', sort_order: 1 },
    { title: 'Business Growth', title_cn: '业务增长', thumbnail_url: '/images/vision/career-business/business-growth.jpg', hd_image_key: 'hd/career-business/business-growth.jpg', sort_order: 2 },
    { title: 'Dream Job', title_cn: '理想工作', thumbnail_url: '/images/vision/career-business/dream-job.jpg', hd_image_key: 'hd/career-business/dream-job.jpg', sort_order: 3 },
  ],
  'self-love-growth': [
    { title: 'Self-Care Rituals', title_cn: '自我关怀', thumbnail_url: '/images/vision/self-love-growth/self-care-rituals.jpg', hd_image_key: 'hd/self-love-growth/self-care-rituals.jpg', sort_order: 1 },
    { title: 'Inner Strength', title_cn: '内在力量', thumbnail_url: '/images/vision/self-love-growth/inner-strength.jpg', hd_image_key: 'hd/self-love-growth/inner-strength.jpg', sort_order: 2 },
    { title: 'Mindful Growth', title_cn: '正念成长', thumbnail_url: '/images/vision/self-love-growth/mindful-growth.jpg', hd_image_key: 'hd/self-love-growth/mindful-growth.jpg', sort_order: 3 },
  ],
  'family-relationship': [
    { title: 'Love & Harmony', title_cn: '爱与和谐', thumbnail_url: '/images/vision/family-relationship/love-harmony.jpg', hd_image_key: 'hd/family-relationship/love-harmony.jpg', sort_order: 1 },
    { title: 'Family Bonds', title_cn: '家庭纽带', thumbnail_url: '/images/vision/family-relationship/family-bonds.jpg', hd_image_key: 'hd/family-relationship/family-bonds.jpg', sort_order: 2 },
    { title: 'Heart Connection', title_cn: '心灵连接', thumbnail_url: '/images/vision/family-relationship/heart-connection.jpg', hd_image_key: 'hd/family-relationship/heart-connection.jpg', sort_order: 3 },
  ],
  'home-living': [
    { title: 'Dream Home', title_cn: '梦想之家', thumbnail_url: '/images/vision/home-living/dream-home.jpg', hd_image_key: 'hd/home-living/dream-home.jpg', sort_order: 1 },
    { title: 'Cozy Living', title_cn: '温馨生活', thumbnail_url: '/images/vision/home-living/cozy-living.jpg', hd_image_key: 'hd/home-living/cozy-living.jpg', sort_order: 2 },
    { title: 'Minimalist Space', title_cn: '极简空间', thumbnail_url: '/images/vision/home-living/minimalist-space.jpg', hd_image_key: 'hd/home-living/minimalist-space.jpg', sort_order: 3 },
  ],
  'spiritual-manifestation': [
    { title: 'Law of Attraction', title_cn: '吸引力法则', thumbnail_url: '/images/vision/spiritual-manifestation/law-of-attraction.jpg', hd_image_key: 'hd/spiritual-manifestation/law-of-attraction.jpg', sort_order: 1 },
    { title: 'Cosmic Energy', title_cn: '宇宙能量', thumbnail_url: '/images/vision/spiritual-manifestation/cosmic-energy.jpg', hd_image_key: 'hd/spiritual-manifestation/cosmic-energy.jpg', sort_order: 2 },
    { title: 'Sacred Space', title_cn: '神圣空间', thumbnail_url: '/images/vision/spiritual-manifestation/sacred-space.jpg', hd_image_key: 'hd/spiritual-manifestation/sacred-space.jpg', sort_order: 3 },
  ],
};

async function seed() {
  const client = getSupabaseClient();

  // Clear existing data
  await client.from('vision_images').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await client.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await client.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Insert categories
  for (const cat of CATEGORIES) {
    const { error } = await client.from('categories').insert({
      name: cat.name,
      name_cn: cat.name_cn,
      slug: cat.slug,
      description: cat.description,
      description_cn: cat.description_cn,
      cover_image: cat.cover_image,
      price_cents: cat.price_cents,
      image_count: (IMAGES[cat.slug] || []).length,
      sort_order: cat.sort_order,
    });
    if (error) console.error(`Error inserting category ${cat.name}:`, error);
    else console.log(`✅ Category: ${cat.name} (${cat.name_cn})`);
  }

  // Insert images
  for (const [slug, images] of Object.entries(IMAGES)) {
    const { data: category } = await client
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (!category) {
      console.error(`Category not found: ${slug}`);
      continue;
    }

    for (const img of images) {
      const { error } = await client.from('vision_images').insert({
        title: img.title,
        title_cn: img.title_cn,
        category_id: category.id,
        thumbnail_url: img.thumbnail_url,
        hd_image_key: img.hd_image_key,
        sort_order: img.sort_order,
      });
      if (error) console.error(`Error inserting image ${img.title}:`, error);
    }
    console.log(`✅ ${images.length} images for ${slug}`);
  }

  console.log('\n🎉 Seed completed!');
}

seed().catch(console.error);
