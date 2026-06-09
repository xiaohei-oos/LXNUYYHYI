import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'VisionDream - Beautiful Vision Board Printables',
    template: '%s | VisionDream',
  },
  description:
    'Download beautiful, high-quality vision board images to manifest your dreams. Print-ready art for Health, Wealth, Love, Career, Travel & Personal Growth.',
  keywords: [
    'vision board',
    'vision board printables',
    'manifestation',
    'law of attraction',
    'dream board',
    'vision board images',
    'printable art',
    'motivational art',
  ],
  openGraph: {
    title: 'VisionDream - Beautiful Vision Board Printables',
    description:
      'Download beautiful, high-quality vision board images to manifest your dreams.',
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
