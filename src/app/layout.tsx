import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'LXNUYYHYI - Beautiful Vision Board Printables',
    template: '%s | LXNUYYHYI',
  },
  description:
    'Download beautiful, high-quality vision board image packs to manifest your dreams. Print-ready art for Wealth, Travel, Fitness, Career, Self-Love, Family, Home & Spiritual growth.',
  keywords: [
    'vision board',
    'vision board printables',
    'manifestation',
    'law of attraction',
    'dream board',
    'vision board images',
    'printable art',
    'motivational art',
    'LXNUYYHYI',
  ],
  openGraph: {
    title: 'LXNUYYHYI - Beautiful Vision Board Printables',
    description:
      'Download beautiful, high-quality vision board image packs to manifest your dreams.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
