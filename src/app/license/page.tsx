import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Commercial License',
  description:
    'LXNUYYHYI Commercial License. Understand your rights and permissions for using our vision board images in personal and commercial projects.',
  alternates: {
    canonical: '/license',
  },
};

export default function CommercialLicensePage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-xl font-serif font-bold tracking-wider text-foreground">
            LXNUYYHYI
          </Link>
        </div>
      </nav>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">Commercial License</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: June 9, 2026</p>

        <div className="prose-custom space-y-8 text-foreground/90 leading-relaxed">
          <section className="bg-warm-gold/10 border border-warm-gold/30 rounded-2xl p-6">
            <p className="text-foreground font-medium">By purchasing a digital image pack from LXNUYYHYI, you are granted a <strong>non-exclusive, worldwide, royalty-free Commercial License</strong> to use the images as described below.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">1. License Grant</h2>
            <p className="text-muted-foreground">Subject to your payment of the applicable license fee and compliance with the terms of this license, LXNUYYHYI grants you a non-exclusive, non-transferable, worldwide, royalty-free license to use the downloaded digital images for both personal and commercial purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">2. Permitted Uses</h2>
            <p className="text-muted-foreground mb-3">You MAY use the images for the following purposes:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li><strong>Personal Vision Boards:</strong> Print and display images for personal vision boards, journals, and personal inspiration</li>
              <li><strong>Printed Products:</strong> Create and sell physical products incorporating the images, such as posters, prints, canvas art, stickers, greeting cards, notebooks, and other tangible goods</li>
              <li><strong>Digital Creations:</strong> Incorporate images into digital designs, social media posts, websites, blogs, presentations, and digital products (where the images are part of a larger design, not the product itself)</li>
              <li><strong>Marketing Materials:</strong> Use in promotional materials, advertisements, and branding for your business</li>
              <li><strong>Client Work:</strong> Use in designs created for your clients as part of your professional services</li>
              <li><strong>Educational Use:</strong> Use in workshops, courses, and educational materials</li>
              <li><strong>Social Media Content:</strong> Post on personal or business social media accounts</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">3. Prohibited Uses</h2>
            <p className="text-muted-foreground mb-3">You MAY NOT:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li><strong>Resell or Redistribute:</strong> Sell, share, distribute, or give away the original image files (as-is or in a collection) in any digital format, including on stock photo websites, file-sharing platforms, or marketplaces</li>
              <li><strong>Competing Products:</strong> Create and sell digital products that compete directly with LXNUYYHYI&apos;s offerings (e.g., selling the images as vision board image packs, digital downloads, or stock photography)</li>
              <li><strong>Sub-licensing:</strong> Grant sublicenses to third parties to use the images independently</li>
              <li><strong>Trademark Claims:</strong> Use the images as part of a trademark, service mark, or logo that you register</li>
              <li><strong>Defamatory Use:</strong> Use images in any manner that is defamatory, obscene, illegal, or harmful</li>
              <li><strong>AI Training:</strong> Use images as training data for artificial intelligence or machine learning models without explicit written permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">4. Ownership and Copyright</h2>
            <p className="text-muted-foreground">All images remain the exclusive property of LXNUYYHYI. This license does not transfer ownership or copyright of the images to you. All rights not expressly granted in this license are reserved by LXNUYYHYI.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">5. License Duration</h2>
            <p className="text-muted-foreground">This license is perpetual — it does not expire. Once purchased, you may continue to use the images in accordance with this license for as long as you wish, provided you do not violate the terms herein.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">6. Termination</h2>
            <p className="text-muted-foreground">LXNUYYHYI reserves the right to terminate this license if you breach any of its terms. Upon termination, you must immediately cease using the images and delete all copies from your devices and storage. Provisions that by their nature should survive termination (including ownership, disclaimers, and liability limitations) shall remain in effect.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">7. Limitation of Liability</h2>
            <p className="text-muted-foreground">LXNUYYHYI PROVIDES THE IMAGES &quot;AS IS&quot; WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. IN NO EVENT SHALL LXNUYYHYI BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM THE USE OF THE IMAGES.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">8. Credit and Attribution</h2>
            <p className="text-muted-foreground">Attribution is appreciated but not required. If you wish to credit LXNUYYHYI, you may use: &quot;Images by LXNUYYHYI&quot; with a link to our website.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">9. Contact</h2>
            <p className="text-muted-foreground">For questions about this Commercial License, please contact us at:</p>
            <p className="text-muted-foreground mt-2"><strong>Email:</strong> us@xiaoheiduo.com</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex gap-6">
          <Link href="/" className="text-warm-gold hover:underline">&larr; Back to Home</Link>
          <Link href="/terms" className="text-warm-gold hover:underline">Terms of Service &rarr;</Link>
        </div>
      </article>
    </div>
  );
}
