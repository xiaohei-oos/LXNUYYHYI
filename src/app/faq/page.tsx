import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions',
  description:
    'Find answers to common questions about LXNUYYHYI vision board image packs: downloads, printing, licensing, refunds, and payment security.',
  keywords: [
    'vision board FAQ',
    'vision board images questions',
    'printable art FAQ',
    'digital download questions',
  ],
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: 'FAQ - Frequently Asked Questions | LXNUYYHYI',
    description:
      'Find answers to common questions about LXNUYYHYI vision board image packs.',
    url: '/faq',
  },
};

export default function FAQPage() {
  const faqs = [
    {
      question: 'What is a vision board image pack?',
      answer: 'A vision board image pack is a curated collection of high-resolution digital images organized around a specific life theme (such as Wealth, Health, Travel, etc.). Each pack contains multiple images designed to inspire and motivate you. You can print them, use them in your digital vision board, or incorporate them into your creative projects.',
    },
    {
      question: 'What do I receive when I purchase?',
      answer: 'After completing your purchase, you will receive a unique download link to download a ZIP file containing all the high-resolution images in that category. The ZIP file includes JPG images at print-quality resolution (300 DPI), suitable for both digital use and physical printing up to 16x20 inches.',
    },
    {
      question: 'How do I download my purchase?',
      answer: 'After successful payment through PayPal, you will be redirected to a confirmation page with a download button. You can also access your download from the order confirmation. The download link is valid for 24 hours and allows up to 3 download attempts. We recommend downloading and saving your files immediately.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept PayPal, all major credit cards (Visa, Mastercard, American Express, Discover), debit cards, Apple Pay, and Google Pay through our secure payment processor, PayPal. All transactions are encrypted and secure.',
    },
    {
      question: 'Can I get a refund?',
      answer: 'Due to the digital nature of our products, we generally do not offer refunds once the download link has been accessed or the file has been downloaded. However, if you experience technical issues with your download or the files are corrupted, please contact us and we will work with you to resolve the issue, which may include providing a replacement download.',
    },
    {
      question: 'Can I use the images commercially?',
      answer: 'Yes! Your purchase includes a Commercial License that allows you to use the images for both personal and commercial purposes. This includes creating physical products (prints, cards, posters), using them in marketing materials, social media content, client work, and more. Please review our Commercial License page for full details on permitted and prohibited uses.',
    },
    {
      question: 'Can I resell the images?',
      answer: 'No. You may not resell, redistribute, or share the original image files in their digital form. You also may not sell the images as a competing product (such as another image pack or stock photography). However, you CAN sell physical products that incorporate the images (such as framed prints, greeting cards, or canvases).',
    },
    {
      question: 'What resolution are the images?',
      answer: 'All images are high-resolution (300 DPI), suitable for professional-quality printing. The images are designed to print beautifully at sizes up to 16x20 inches. For digital use (phone wallpapers, social media), they work at any screen size.',
    },
    {
      question: 'How do I print the images?',
      answer: 'You can print the images at home using a quality photo printer on photo paper, or send them to a professional printing service such as Shutterfly, Snapfish, Costco Photo Center, or your local print shop. For best results, use high-quality photo paper and select the highest print quality setting.',
    },
    {
      question: 'Do I need to credit LXNUYYHYI when using the images?',
      answer: 'Attribution is appreciated but not required. If you do wish to credit us, you may write "Images by LXNUYYHYI" along with a link to our website.',
    },
    {
      question: 'How long is my download link valid?',
      answer: 'Your download link is valid for 24 hours from the time of purchase and allows up to 3 download attempts. We strongly recommend downloading your files immediately after purchase and saving them to a secure location on your computer or cloud storage.',
    },
    {
      question: 'What if my download link expires?',
      answer: 'If your download link expires before you were able to download your files, please contact us with your order confirmation email, and we will provide a new download link.',
    },
    {
      question: 'Do you offer bulk or bundle discounts?',
      answer: 'We occasionally run promotions and bundle deals. Sign up for our newsletter or follow us on social media to stay updated on special offers. If you are interested in licensing all categories, please contact us for volume pricing.',
    },
    {
      question: 'Is my payment information secure?',
      answer: "Absolutely. We use PayPal, one of the world's leading payment processors, to handle all transactions. Your payment information is encrypted and never stored on our servers. PayPal is trusted by millions of businesses worldwide.",
    },
    {
      question: 'How can I contact you?',
      answer: 'You can reach us by email at us@xiaoheiduo.com for any questions about your order, technical issues, or general inquiries. We aim to respond within 24-48 hours.',
    },
  ];

  // FAQ Schema structured data
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

      <nav className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-xl font-serif font-bold tracking-wider text-foreground">
            LXNUYYHYI
          </Link>
        </div>
      </nav>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground mb-10">Everything you need to know about LXNUYYHYI vision board image packs.</p>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group bg-card border border-border rounded-2xl overflow-hidden"
            >
              <summary className="flex items-center justify-between cursor-pointer p-5 sm:p-6 text-foreground font-semibold hover:bg-accent/5 transition-colors">
                <span className="pr-4">{faq.question}</span>
                <svg
                  className="w-5 h-5 text-muted-foreground shrink-0 transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-muted-foreground leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-12 p-6 bg-card border border-border rounded-2xl text-center">
          <h3 className="font-serif text-lg font-semibold text-foreground mb-2">Still have questions?</h3>
          <p className="text-muted-foreground mb-4">We&apos;re here to help.</p>
          <a
            href="mailto:us@xiaoheiduo.com"
            className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-2.5 rounded-full font-medium hover:bg-foreground/90 transition-colors"
          >
            Contact Support
          </a>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <Link href="/" className="text-warm-gold hover:underline">&larr; Back to Home</Link>
        </div>
      </article>

      <footer className="border-t border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
