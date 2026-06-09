import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://lxnuyyhyi.com'),
  title: {
    default: 'LXNUYYHYI | Premium Vision Board Image Packs | Download & Print',
    template: '%s | LXNUYYHYI',
  },
  description:
    'Download beautiful, high-quality vision board image packs to manifest your dreams. Print-ready art for Wealth, Travel, Fitness, Career, Self-Love, Family, Home & Spiritual growth.',
  keywords: [
    'vision board',
    'vision board printables',
    'vision board images',
    'vision board kit',
    'manifestation art',
    'law of attraction',
    'dream board',
    'printable vision board',
    'vision board download',
    'motivational art',
    'goal setting printables',
    'vision board supplies',
    'LXNUYYHYI',
  ],
  authors: [{ name: 'LXNUYYHYI' }],
  creator: 'LXNUYYHYI',
  publisher: 'LXNUYYHYI',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'LXNUYYHYI | Premium Vision Board Image Packs',
    description:
      'Curated vision board image collections across 8 life categories. High-quality, print-ready downloads. Manifest your dreams with beautiful vision board art.',
    type: 'website',
    locale: 'en_US',
    siteName: 'LXNUYYHYI',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'LXNUYYHYI - Premium Vision Board Image Packs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LXNUYYHYI | Premium Vision Board Image Packs',
    description:
      'Curated vision board image collections across 8 life categories. High-quality, print-ready downloads.',
    images: ['/images/og-default.jpg'],
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LXNUYYHYI',
    url: 'https://lxnuyyhyi.com',
    logo: 'https://lxnuyyhyi.com/images/logo.png',
    description: 'Premium vision board image packs for download and printing.',
    contactEmail: 'support@lxnuyyhyi.com',
    sameAs: [],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'LXNUYYHYI',
    url: 'https://lxnuyyhyi.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://lxnuyyhyi.com/?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        {children}
      </body>
    </html>
  );
}
