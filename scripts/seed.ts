import { getSupabaseClient } from '../src/storage/database/supabase-client';

const CATEGORIES = [
  {
    name: 'Wealth & Finance',
    name_cn: '财富与财务',
    slug: 'wealth-finance',
    description: 'Attract prosperity and financial freedom with abundance-focused vision board art. From passive income to debt-free living.',
    description_cn: '用专注丰盛的愿景板艺术吸引繁荣和财务自由。从被动收入到无债生活。',
    cover_image: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_7943ad1b-39e9-4dd4-a984-d93c119645ad.jpeg?sign=1812544280-4545233f42-0-07090f0ea8ba24ef63978f47bcde8b44450e8873d49bcd19347ccb8f3e0f3cab',
    price_cents: 1499,
    sort_order: 1,
  },
  {
    name: 'Travel & Adventure',
    name_cn: '旅行与探索',
    slug: 'travel-adventure',
    description: 'Visualize your dream destinations and adventurous journeys. From tropical escapes to mountain expeditions.',
    description_cn: '想象您的梦想目的地和冒险旅程。从热带度假到山地探险。',
    cover_image: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_b06be7de-656c-42a3-9094-3b2e9fe4e420.jpeg?sign=1812544278-52e4cc7dbb-0-89182b86ae54f05bfb3db17dcb8967d12863d630315158c222f0bcd5638cea23',
    price_cents: 1299,
    sort_order: 2,
  },
  {
    name: 'Health & Fitness',
    name_cn: '健康与健身',
    slug: 'health-fitness',
    description: 'Manifest your healthiest self with fitness goals, wellness routines, and body-positive vision board art.',
    description_cn: '用健身目标、健康习惯和积极身体形象的愿景板艺术，显化最健康的自己。',
    cover_image: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_3e894e45-16a2-47df-9400-b691d83b6dfa.jpeg?sign=1812544279-c80de0683c-0-2f966f08d3ff049dd3791595ecdaf2993906c75908fda2246b7cc0c1542c842c',
    price_cents: 1299,
    sort_order: 3,
  },
  {
    name: 'Career & Business',
    name_cn: '职业与事业',
    slug: 'career-business',
    description: 'Level up your professional life with career goals, business growth, and success-focused vision board art.',
    description_cn: '用职业目标、业务增长和成功导向的愿景板艺术，提升您的职业生涯。',
    cover_image: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_fd10ecc3-117a-495d-bb64-958bb002af22.jpeg?sign=1812544280-759a6c848b-0-9d38f1ab50e426a57ec20d6d73ae121bb50a3ff47e12f957b27d0bd6e65f1b10',
    price_cents: 1499,
    sort_order: 4,
  },
  {
    name: 'Self-Love & Personal Growth',
    name_cn: '自爱与成长',
    slug: 'self-love-growth',
    description: 'Embrace self-love and personal development with inspiring vision board art for confidence, mindfulness, and growth.',
    description_cn: '用充满启发的愿景板艺术拥抱自爱与个人成长，提升自信、正念和成长。',
    cover_image: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_21de2e50-bb62-4d73-b46e-169f3cf4fae6.jpeg?sign=1812544278-9737b30e58-0-be4b0df7778c6af0d6a7a4caaa112a3c5bf64b6985f79d6e2cf3d563baa63818',
    price_cents: 1299,
    sort_order: 5,
  },
  {
    name: 'Family & Relationship',
    name_cn: '家庭与关系',
    slug: 'family-relationship',
    description: 'Strengthen your bonds with vision board art for love, family harmony, and meaningful relationships.',
    description_cn: '用关于爱情、家庭和睦和有意义关系的愿景板艺术，加强您的纽带。',
    cover_image: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_f93b7508-ad2b-4ac6-bd36-4338df248c48.jpeg?sign=1812544277-43e6c1e699-0-0f859674af699f0a113ad766128299662459a157bd173e3371a1f7079a91efaa',
    price_cents: 1299,
    sort_order: 6,
  },
  {
    name: 'Home & Living',
    name_cn: '居家生活',
    slug: 'home-living',
    description: 'Create your dream living space with vision board art for home decor, minimalist living, and cozy interiors.',
    description_cn: '用关于家居装饰、极简生活和舒适室内的愿景板艺术，打造您的梦想居住空间。',
    cover_image: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_fddec436-50df-4d6e-a917-4be1d6347b62.jpeg?sign=1812544277-ee4b7c4659-0-493c38291fd9d604764a38cdf712e635d29536731a426a77da0b5b07b9324648',
    price_cents: 1299,
    sort_order: 7,
  },
  {
    name: 'Spiritual & Manifestation',
    name_cn: '灵性与显化',
    slug: 'spiritual-manifestation',
    description: 'Align with the universe through manifestation art, law of attraction visuals, and spiritual growth imagery.',
    description_cn: '通过显化艺术、吸引力法则视觉和灵性成长图像，与宇宙对齐。',
    cover_image: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_5ce9f406-9efa-4062-a5e4-cd9df1cc4b34.jpeg?sign=1812544278-ce1e39be08-0-3dbbbee2ae9780cb58d0718e6e23b61213c3b443cae0df9547959d48aa4a45e7',
    price_cents: 1299,
    sort_order: 8,
  },
];

const IMAGES: Record<string, Array<{ title: string; title_cn: string; thumbnail_url: string }>> = {
  'wealth-finance': [
    { title: 'Abundance Mindset', title_cn: '丰盛心态', thumbnail_url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_91af3aee-eeff-4a5a-8694-427c9a4c1284.jpeg?sign=1812544310-616f06f74b-0-da0e8b50723637ead804d10c44c72a3894b61762bf3df075fe9932b610038240' },
    { title: 'Financial Freedom', title_cn: '财务自由', thumbnail_url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_61b1dc10-b7d7-46c2-a4f9-91bbfa455e0b.jpeg?sign=1812544312-2e629e8d62-0-dcbd757720a0a5e1ef05a06120bcc6355c7068798bdcd4fefe31be8d40ec205b' },
    { title: 'Passive Income Vision', title_cn: '被动收入愿景', thumbnail_url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_9cd0e04e-b696-4d62-b634-1c4339f30851.jpeg?sign=1812544315-b999e9f5da-0-a2c19de6149e559bf7cb01268a2b1152507495c0de37431ddf132ffd36ba97ce' },
  ],
  'travel-adventure': [
    { title: 'Dream Destinations', title_cn: '梦想目的地', thumbnail_url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_02f6f5fe-2c4f-48ba-a944-e2fe5fa55339.jpeg?sign=1812544312-64129feab6-0-0c8f2ef6922920069bde050a26d3dfec6d65ea3af677b53776027a795db17265' },
    { title: 'Adventure Awaits', title_cn: '冒险在等待', thumbnail_url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_4e584d51-45a4-4365-ac8c-d9813205d593.jpeg?sign=1812544316-2fe44f2dc7-0-b77289f79cd6eaf4ab3515c8215da32c834d79d80ca12302380892775d2f1496' },
    { title: 'Wanderlust Spirit', title_cn: '旅行精神', thumbnail_url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_76263a87-9d2f-494b-b70c-93a1e8c83693.jpeg?sign=1812544318-11f9aef946-0-280c7ed9941fd01c58a7fdd9095da23de8f8f78dd941d074f7c3ca264cedc69f' },
  ],
  'health-fitness': [
    { title: 'Fitness Goals', title_cn: '健身目标', thumbnail_url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_546f907d-611d-4207-b860-155855e31f60.jpeg?sign=1812544315-5ac0b52c26-0-b2480dbcfb3d6be5062dc46f80547c9b703b4de2c3eedfb6d482f221a7b70678' },
    { title: 'Healthy Living', title_cn: '健康生活', thumbnail_url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_7c9b4f94-031b-4c6d-9fb4-77738efca8d1.jpeg?sign=1812544316-ae1a149068-0-a9fdc1ecc0e3d09e707e468defd89722853e01688d32101dc33341dbbc9c8a66' },
    { title: 'Wellness Journey', title_cn: '健康之旅', thumbnail_url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_7ebbd673-f147-4abe-a835-3aae44f773f2.jpeg?sign=1812544317-04b49c4bdc-0-9ba806b8ec36ed5d5e6a03745301619cecda26e8a8d8311656256a6fc14f2824' },
  ],
  'career-business': [
    { title: 'Career Success', title_cn: '职业成功', thumbnail_url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_edb5749d-738a-407f-a378-a920ca0de8f8.jpeg?sign=1812544313-074568eab4-0-1e33e38b19cf812b2a87e13559aea42cb5a27d9f3903f7cda9f10a72dd1c479a' },
    { title: 'Business Growth', title_cn: '业务增长', thumbnail_url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_471da0b6-d290-4f1c-92e8-cf82f8dd5b84.jpeg?sign=1812544315-c889826d94-0-4de4aab8f6982b0ceb426fba57785bbb88464f141f51ecfd83f5736282c6852a' },
    { title: 'Dream Job', title_cn: '梦想工作', thumbnail_url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_cd885d3b-2d71-4582-b5eb-0ceae8fe0ce5.jpeg?sign=1812544321-d5d246b531-0-d651953819efe6bcb33d9d5b53d8e901a62b13394d2ee54663accf2cf510869e' },
  ],
  'self-love-growth': [
    { title: 'Self Care Rituals', title_cn: '自我关怀仪式', thumbnail_url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_ab2108e4-4556-447d-8225-ee5d8c5159ec.jpeg?sign=1812544348-27e0e84479-0-0ea2396f502c26e880a278b70ed10a72bc29b4c8015a091f87523ade69a94b17' },
    { title: 'Inner Strength', title_cn: '内在力量', thumbnail_url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_3454eca9-ea37-40a0-8642-8943abd4997a.jpeg?sign=1812544357-37f6b03c6d-0-ffa184e36351b7aa0f396a857f57f6333bd96749c14312520f3d9b7802665949' },
    { title: 'Mindful Growth', title_cn: '正念成长', thumbnail_url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_1202bb93-3fad-4975-98a0-2da596b58cf5.jpeg?sign=1812544358-6941efe3ae-0-cf31911cc8310785515b3865dee5b83c79248a1b19792b036d5bab7c8e6ccbeb' },
  ],
  'family-relationship': [
    { title: 'Love & Harmony', title_cn: '爱与和谐', thumbnail_url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_a6034a01-758d-4531-a6b4-dd6a56a899b4.jpeg?sign=1812544349-e884e1b1ac-0-7b359803d60b1960483a1f7a333c5881ad5a537c2f973f5bb8522a72771170d0' },
    { title: 'Family Bonds', title_cn: '家庭纽带', thumbnail_url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_8a377f0f-ddbd-4517-9c88-0c469ed4595c.jpeg?sign=1812544353-3e99306758-0-e88b06c8a7d2eee805b74c32ac63837265812a353136946a2f077b3304b3596d' },
    { title: 'Heart Connection', title_cn: '心灵连接', thumbnail_url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_9603d2de-a88b-4c20-8e7f-f8df668df737.jpeg?sign=1812544357-7c5df9607b-0-e78d6f1bf76327912b5bc9639e89c56855bd4843a67922760d6d141310375e52' },
  ],
  'home-living': [
    { title: 'Dream Home', title_cn: '梦想家园', thumbnail_url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_9329b840-5193-405e-a1d1-642e3be4ef13.jpeg?sign=1812544347-6a315b6302-0-cf605d19cadb6bd5e7ce683da6e7a45d22c0136d4bcf5f44c88f0f5e4deec069' },
    { title: 'Cozy Living', title_cn: '舒适生活', thumbnail_url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_b81ef9fb-791f-4a18-92d1-6c209c55df4b.jpeg?sign=1812544353-32b6cf74e8-0-6cca5a95277a2d1dd25738dbc843c09cd389131ecc8b509ec7bb1bafc1e7ea04' },
    { title: 'Minimalist Space', title_cn: '极简空间', thumbnail_url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_ab7290fe-6ae4-4e6d-93c2-fcc5ea3f888c.jpeg?sign=1812544357-a924bd6b2d-0-c000998e9e312099561ed32665aecde786214a6238283f3eaead252d69701b0b' },
  ],
  'spiritual-manifestation': [
    { title: 'Law of Attraction', title_cn: '吸引力法则', thumbnail_url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_5f468031-c432-4e4f-9d40-ad69c97c8780.jpeg?sign=1812544347-035648f7b1-0-23cc02213e87f592ecb86ca7ddfaa6db69fd523ea9b1d6e8179a5c6d0b09d460' },
    { title: 'Cosmic Energy', title_cn: '宇宙能量', thumbnail_url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_6c9d138d-f9ea-43d3-8616-8c0d33c60faf.jpeg?sign=1812544353-5702a6b736-0-401fd1364cd5513f3b630bcfd4033f8523a6f0d975c7e89387920b1f5e57ef37' },
    { title: 'Sacred Space', title_cn: '神圣空间', thumbnail_url: 'https://coze-coding-project.tos.coze.site/coze_storage_7649351400148795444/image/generate_image_63ae447a-3bb5-49c2-a2e4-0be9366b78d4.jpeg?sign=1812544353-1e4c129918-0-ad62bc8208703411237a384040ecf4e44b1cad0fff4bf3665fdde0070b16082a' },
  ],
};

async function seed() {
  const client = getSupabaseClient();

  // Clear existing data
  await client.from('vision_images').delete().neq('id', '');
  await client.from('orders').delete().neq('id', '');
  await client.from('categories').delete().neq('id', '');

  console.log('Seeding categories...');

  // Insert categories
  const categoryIds: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const { data, error } = await client
      .from('categories')
      .insert({
        name: cat.name,
        name_cn: cat.name_cn,
        slug: cat.slug,
        description: cat.description,
        description_cn: cat.description_cn,
        cover_image: cat.cover_image,
        price_cents: cat.price_cents,
        image_count: (IMAGES[cat.slug] || []).length,
        sort_order: cat.sort_order,
      })
      .select('id, slug')
      .single();

    if (error) {
      console.error(`Failed to insert category ${cat.name}:`, error);
    } else if (data) {
      categoryIds[data.slug] = data.id;
      console.log(`  Created: ${cat.name} (${cat.name_cn})`);
    }
  }

  console.log('\nSeeding images...');

  // Insert images
  for (const [slug, images] of Object.entries(IMAGES)) {
    const categoryId = categoryIds[slug];
    if (!categoryId) {
      console.error(`  Category not found for slug: ${slug}`);
      continue;
    }

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const { error } = await client
        .from('vision_images')
        .insert({
          category_id: categoryId,
          title: img.title,
          title_cn: img.title_cn,
          thumbnail_url: img.thumbnail_url,
          hd_image_key: `hd/${slug}/${img.title.toLowerCase().replace(/\s+/g, '-')}.jpg`,
          sort_order: i + 1,
        });

      if (error) {
        console.error(`  Failed to insert image ${img.title}:`, error);
      } else {
        console.log(`  Created: ${img.title} (${img.title_cn}) → ${slug}`);
      }
    }
  }

  console.log('\nSeed completed!');
  console.log(`Categories: ${Object.keys(categoryIds).length}`);
  console.log(`Images: ${Object.values(IMAGES).flat().length}`);
}

seed().catch(console.error);
