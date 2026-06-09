import { getSupabaseClient } from '@/storage/database/supabase-client';

const CATEGORY_COVER_IMAGES = [
  'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_5d8633c1-980d-4d36-a0ba-8beaecf42154.jpeg?sign=1812541081-43d45f5218-0-1561e91bc39c39ffd2fe163a6c8564f40ac1a110282dec14a282d1d9953a60df',
  'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_0a5300e7-cd8a-4977-8213-c03419a8b451.jpeg?sign=1812541083-d57539c0f0-0-75ee59999e702d9a609967101e161b651188fca4980c205f312e143ef73f5ef4',
  'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_a5ee02cf-c2b8-4afc-85a5-581ba910dc31.jpeg?sign=1812541082-ee44fc4594-0-4eff1710ce28ae985153cdbda7f20eb45a47a51221d8efe83947fd9323b20b3b',
  'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_9e3a4047-bc78-458d-902f-1a4ded01c1f1.jpeg?sign=1812541083-4729c25eb8-0-a2dab89617e7a07895a80c932a2e8de1622ca2ac22f2488e68a576684fb4fc5b',
  'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_fe6df30e-9af2-4b6f-9a8b-6715040b396f.jpeg?sign=1812541087-d544d4b963-0-1c10ea8795a65d1da0660930fc7d9178080e6962b13f6a41f18a62fc56a95369',
  'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_219ad3eb-1b5d-4400-84f3-4909b74f0d39.jpeg?sign=1812541082-196a227c57-0-b35949dc90a0c3c0037e2a21e4d9ce3a00fed8068a1599e448c0c5601fc1b07d',
];

const VISION_IMAGES = [
  // Health & Wellness
  {
    title: 'Morning Serenity',
    description: 'Start each day with calm intention. Let this peaceful vision guide your wellness journey.',
    url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_f548fff4-7ee2-4b21-a345-7b76984e44ec.jpeg?sign=1812541112-e6c2deef77-0-7039016908f73676f5ad20ab340907fefd674de383bef77cd0616613d65b599c',
    tags: ['wellness', 'meditation', 'peace', 'morning'],
    is_featured: true,
  },
  {
    title: 'Vitality & Strength',
    description: 'Embrace the energy of a healthy, active life. Your body is your temple.',
    url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_5bf8aba6-49f1-42cc-b4dd-c615ab8a9c2e.jpeg?sign=1812541112-6f3978b6c6-0-afd34d5fa97239036692f3d8afafed978c0ec5997ef8c6d29099b4fd71af466b',
    tags: ['fitness', 'strength', 'health', 'energy'],
    is_featured: false,
  },
  {
    title: 'Inner Balance',
    description: 'Find your center. Balance mind, body, and spirit for complete wellness.',
    url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_0551ac05-5953-4c5d-8fed-c7773b4fb64a.jpeg?sign=1812541115-4c4e805f-0-c0367a3a6b1ee27fbd277eb38c1bb95d9e8d6fbb8c6428d44125e2f0a9969cda',
    tags: ['balance', 'yoga', 'mindfulness', 'harmony'],
    is_featured: true,
  },
  // Wealth & Abundance
  {
    title: 'Golden Abundance',
    description: 'Open your life to unlimited abundance. Wealth flows where attention goes.',
    url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_668b300f-f618-4f86-8d2d-482512692f93.jpeg?sign=1812541111-c05d00135d-0-ab9c071be041433128fa0eca7ccddd6cd7df148221961ca19c314d940a87eb81',
    tags: ['wealth', 'abundance', 'prosperity', 'gold'],
    is_featured: true,
  },
  {
    title: 'Prosperity Mindset',
    description: 'Think rich, live rich. Your mindset shapes your financial reality.',
    url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_05d5628b-e284-4f97-a6c4-a992dd9f34f0.jpeg?sign=1812541112-98f564f678-0-53f779d48bcf6b8e962d357c89fc7263364f7b22ce32af7e9a0e12581f55c223',
    tags: ['prosperity', 'mindset', 'success', 'growth'],
    is_featured: false,
  },
  {
    title: 'Financial Freedom',
    description: 'Visualize the freedom that comes with financial independence.',
    url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_67707f73-4629-426b-a5e6-05d39494721a.jpeg?sign=1812541113-63eef5cea9-0-a8c55c69f8e1af46a6628b9442135ec44023a58755e8663bb018e8906fc6d083',
    tags: ['freedom', 'finance', 'independence', 'wealth'],
    is_featured: true,
  },
  // Love & Relationships
  {
    title: 'Heart Connection',
    description: 'Open your heart to deep, meaningful connections. Love is all around.',
    url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_96862de9-55a8-4b70-aec4-eac7dbf0f632.jpeg?sign=1812541111-8929d6ab97-0-2a10ce680ab168a47a5dae328f8db4836be289e3d639aa85a4b5d30496adec66',
    tags: ['love', 'connection', 'heart', 'romance'],
    is_featured: true,
  },
  {
    title: 'Eternal Bond',
    description: 'Nurture the relationships that matter most. Love grows with intention.',
    url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_fcede5e8-3cbd-414b-a6b5-fc12b85ec05a.jpeg?sign=1812541112-c4adb7006d-0-d04dcf85411cc71a5e481d31d25cebbf81e21330c155278c3364a1548a7e8ebb',
    tags: ['bond', 'partnership', 'eternal', 'commitment'],
    is_featured: false,
  },
  {
    title: 'Self Love First',
    description: 'Before loving others, love yourself completely. You are worthy.',
    url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_fc2ed9f4-d15d-4d96-b95a-fcb9d0b71099.jpeg?sign=1812541112-044e379388-0-0af8d154eb0a3f4d41e67938947ecbd3b5138a979ee7f127f16e75aa2da82932',
    tags: ['self-love', 'worthiness', 'care', 'compassion'],
    is_featured: true,
  },
  // Career & Success
  {
    title: 'Rise & Conquer',
    description: 'Your career is a mountain worth climbing. Every step takes you higher.',
    url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_ae5cb0ae-a7b0-4355-bd12-4f6df6888284.jpeg?sign=1812541111-712b7b11a9-0-3262bd1eb4bd13fd4b90436a36896c3670340d46ca70625a7b2236d265d65003',
    tags: ['career', 'ambition', 'success', 'leadership'],
    is_featured: true,
  },
  {
    title: 'Dream Job Vision',
    description: 'Visualize your ideal career. When you see it, you can achieve it.',
    url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_7f099120-4977-40ce-b018-79c86a230bd0.jpeg?sign=1812541112-49abc18777-0-801b7f4e0ea3b26e6b670e7e486145d7ba22ecf45d21f26167817be6230425f3',
    tags: ['dream-job', 'vision', 'professional', 'growth'],
    is_featured: false,
  },
  {
    title: 'Breakthrough Moment',
    description: 'That moment when everything clicks. Your breakthrough is coming.',
    url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_e3d54d80-746a-438c-8c0f-d7324c821f97.jpeg?sign=1812541120-5650e2694e-0-11cdfcbc1f5cd8520f3ff95ed3e5f827be05bf8301403a89e6c0919afbeb16c1',
    tags: ['breakthrough', 'achievement', 'milestone', 'success'],
    is_featured: true,
  },
  // Travel & Adventure
  {
    title: 'Wanderlust Dreams',
    description: 'The world is your playground. Every destination is a new chapter.',
    url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_bdf6c475-54f7-4a4d-85b1-e3d3a49044be.jpeg?sign=1812541112-fa85f36468-0-e7dc53179707bf60d005d1a1a2b499c7be804e808c8338d9a5e624a418dbefdf',
    tags: ['travel', 'wanderlust', 'adventure', 'explore'],
    is_featured: true,
  },
  {
    title: 'Horizon Chaser',
    description: 'Chase new horizons. Life begins at the edge of your comfort zone.',
    url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_90b09213-e328-4794-b4de-ffc6578669c8.jpeg?sign=1812541113-e066670cde-0-ef96f9e150ec78e560bd6d219b547929fb6ebc35d36b0ca09adaf60ffdfc3cc1',
    tags: ['horizon', 'journey', 'freedom', 'nature'],
    is_featured: false,
  },
  {
    title: 'Adventure Awaits',
    description: 'Pack your dreams and go. Adventure is out there waiting for you.',
    url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_5b482781-8eeb-46c3-90fc-e7aea00e5f44.jpeg?sign=1812541114-16b0a8e74b-0-22d62de0bfe49991e82f8a9edba8e4e49c91e5df2a6d4534e473bd95d1400bef',
    tags: ['adventure', 'explore', 'discover', 'courage'],
    is_featured: true,
  },
  // Personal Growth
  {
    title: 'Bloom & Grow',
    description: 'Like a flower, you are always growing. Embrace each season of change.',
    url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_ea2246dd-a1db-4627-b400-115f3177956c.jpeg?sign=1812541113-f120d08ccf-0-36813296d148f7299bee4c468674ee9d38149272ba77ed4c48de89eb6877ac2d',
    tags: ['growth', 'bloom', 'transformation', 'evolution'],
    is_featured: true,
  },
  {
    title: 'Rise Above',
    description: 'Elevate your perspective. Growth happens when you rise above limitations.',
    url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_c235646e-1906-44e8-a6eb-955cd8f298f3.jpeg?sign=1812541142-23d8c5a75f-0-eb8069aa8251691b562a3d3daa6e4484e60a384be14d979ec093a643fb2918d6',
    tags: ['elevation', 'perspective', 'mindset', 'freedom'],
    is_featured: false,
  },
  {
    title: 'New Dawn',
    description: 'Every sunrise is a fresh start. Today is the day you begin again.',
    url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_5d3171a7-fd9c-46fc-ae50-ed34959bd0d5.jpeg?sign=1812541144-72d325a42f-0-ce3271bf9b4fa7d28cbacef50a50b035f2b0397702ed18ece518e318683c80a0',
    tags: ['dawn', 'beginning', 'fresh-start', 'hope'],
    is_featured: true,
  },
];

const CATEGORIES = [
  { name: 'Health & Wellness', slug: 'health-wellness', description: 'Nurture your body and soul with wellness visions that inspire healthy living and inner peace.', sort_order: 1 },
  { name: 'Wealth & Abundance', slug: 'wealth-abundance', description: 'Attract prosperity and financial freedom with abundance-focused vision board art.', sort_order: 2 },
  { name: 'Love & Relationships', slug: 'love-relationships', description: 'Manifest deep connections and loving relationships with heartfelt vision imagery.', sort_order: 3 },
  { name: 'Career & Success', slug: 'career-success', description: 'Visualize your professional triumphs and climb the ladder of success with purpose.', sort_order: 4 },
  { name: 'Travel & Adventure', slug: 'travel-adventure', description: 'Dream of exotic destinations and thrilling adventures that expand your world.', sort_order: 5 },
  { name: 'Personal Growth', slug: 'personal-growth', description: 'Embrace transformation and continuous growth on your journey to becoming your best self.', sort_order: 6 },
];

async function seed() {
  const client = getSupabaseClient();

  // Insert categories
  const categoryData = CATEGORIES.map((cat, i) => ({
    ...cat,
    cover_image: CATEGORY_COVER_IMAGES[i],
  }));

  const { data: insertedCategories, error: catError } = await client
    .from('categories')
    .upsert(categoryData, { onConflict: 'slug' })
    .select();

  if (catError) {
    throw new Error(`Failed to insert categories: ${catError.message}`);
  }

  console.log(`Inserted ${insertedCategories.length} categories`);

  // Insert vision images
  const imagesPerCategory = 3;
  const imageData = VISION_IMAGES.map((img, i) => {
    const catIndex = Math.floor(i / imagesPerCategory);
    const category = insertedCategories[catIndex];
    return {
      title: img.title,
      description: img.description,
      category_id: category.id,
      thumbnail_url: img.url,
      hd_image_key: `hd/${category.slug}/${img.title.toLowerCase().replace(/\s+/g, '-')}.jpg`,
      price_cents: img.is_featured ? 499 : 299,
      aspect_ratio: '4:3',
      print_size: img.is_featured ? '16x20 in' : '8x10 in',
      tags: img.tags,
      is_featured: img.is_featured,
      status: 'active',
    };
  });

  const { data: insertedImages, error: imgError } = await client
    .from('vision_images')
    .insert(imageData)
    .select();

  if (imgError) {
    throw new Error(`Failed to insert images: ${imgError.message}`);
  }

  console.log(`Inserted ${insertedImages.length} vision images`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
