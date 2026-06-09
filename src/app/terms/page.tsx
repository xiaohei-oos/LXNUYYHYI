import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'LXNUYYHYI Terms of Service. Read our terms and conditions for using and purchasing vision board image packs.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
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
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: June 9, 2026</p>

        <div className="prose-custom space-y-8 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">1. Agreement to Terms</h2>
            <p className="text-muted-foreground">By accessing and using the LXNUYYHYI website (the &quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not access or use the Service. These Terms constitute a legally binding agreement between you and LXNUYYHYI.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground">LXNUYYHYI provides digital vision board image packs for purchase and download. Each product is a collection of high-resolution digital images bundled in a ZIP file, organized by thematic category. Upon purchase, you receive a download link to access the digital files.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">3. Purchases and Payments</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>All prices are listed in U.S. dollars (USD) and are subject to change without prior notice.</li>
              <li>Payments are processed securely through Stripe. By submitting payment, you authorize Stripe to charge your selected payment method.</li>
              <li>All purchases are final. Due to the digital nature of our products, we do not offer refunds once the download link has been accessed or the file has been downloaded.</li>
              <li>You are responsible for ensuring your payment information is accurate and that you have sufficient funds to complete the purchase.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">4. Digital Product Delivery</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Upon successful payment, you will receive a unique download link valid for 24 hours with a maximum of 3 download attempts.</li>
              <li>It is your responsibility to download and save the files within this period. We are not responsible for expired download links.</li>
              <li>If you experience technical difficulties with your download, please contact us for assistance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">5. Intellectual Property and Licensing</h2>
            <p className="text-muted-foreground">All digital images and content available through the Service are the intellectual property of LXNUYYHYI and are protected by U.S. and international copyright laws. Your purchase grants you a license as described in our <Link href="/license" className="text-warm-gold hover:underline">Commercial License</Link> page.</p>
            <p className="text-muted-foreground mt-3">You may NOT:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Resell, redistribute, or share the digital image files in their original or modified form</li>
              <li>Offer the images as part of a competing product or service</li>
              <li>Use the images in any way that violates applicable law</li>
              <li>Remove or alter any copyright notices embedded in the files</li>
              <li>Use automated tools to scrape or bulk-download content from our website</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">6. User Conduct</h2>
            <p className="text-muted-foreground">You agree not to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Interfere with or disrupt the Service or servers connected to the Service</li>
              <li>Use the Service to transmit malicious code or harmful content</li>
              <li>Violate any applicable local, state, national, or international law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">7. Limitation of Liability</h2>
            <p className="text-muted-foreground">TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, LXNUYYHYI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR OTHER INTANGIBLE LOSSES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
            <p className="text-muted-foreground mt-3">OUR TOTAL LIABILITY FOR ANY CLAIM ARISING FROM OR RELATED TO THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SPECIFIC PRODUCT GIVING RISE TO THE CLAIM.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">8. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground">THE SERVICE AND ALL PRODUCTS ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">9. Indemnification</h2>
            <p className="text-muted-foreground">You agree to indemnify and hold harmless LXNUYYHYI and its owners, employees, and agents from and against any claims, liabilities, damages, losses, or expenses arising out of or in any way connected with your use of the Service or violation of these Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">10. Governing Law and Dispute Resolution</h2>
            <p className="text-muted-foreground">These Terms shall be governed by and construed in accordance with the laws of the United States and the State of Delaware, without regard to conflict of law principles. Any dispute arising out of these Terms or the Service shall first be attempted to be resolved through good-faith negotiation. If negotiation fails, disputes shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, conducted in Delaware.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">11. Changes to Terms</h2>
            <p className="text-muted-foreground">We reserve the right to modify these Terms at any time. We will post the updated version on this page with a revised &quot;Last updated&quot; date. Your continued use of the Service after changes are posted constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">12. Contact</h2>
            <p className="text-muted-foreground">For questions about these Terms, please contact us at:</p>
            <p className="text-muted-foreground mt-2"><strong>Email:</strong> legal@lxnuyyhyi.com</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <Link href="/" className="text-warm-gold hover:underline">&larr; Back to Home</Link>
        </div>
      </article>
    </div>
  );
}
