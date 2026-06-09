import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/xiaoheiduo9898/', '/api/', '/checkout/'],
      },
    ],
    sitemap: 'https://lxnuyyhyi.com/sitemap.xml',
  };
}
