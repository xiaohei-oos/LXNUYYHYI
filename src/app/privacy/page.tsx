import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'LXNUYYHYI Privacy Policy. Learn how we collect, use, and protect your personal information when you use our vision board image pack services.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPolicyPage() {
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
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: June 9, 2026</p>

        <div className="prose-custom space-y-8 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground">LXNUYYHYI (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects the following types of information when you use our website and purchase our products:</p>
            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">1.1 Information You Provide</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li><strong>Payment Information:</strong> When you make a purchase, your payment details are processed by PayPal, our third-party payment processor. We do not store your full payment information on our servers.</li>
              <li><strong>Email Address:</strong> We collect your email address when you complete a purchase, as provided by PayPal checkout. We use this to deliver your download link and order confirmation.</li>
              <li><strong>Voluntary Information:</strong> If you contact us via email, we collect the information you provide in your message.</li>
            </ul>
            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">1.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li><strong>Device &amp; Usage Data:</strong> We may collect information about your device, browser type, IP address, pages visited, and referring URL using analytics tools.</li>
              <li><strong>Cookies:</strong> We use essential cookies to operate our website and may use analytics cookies to understand how visitors use our site.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>To process and fulfill your orders, including delivering download links</li>
              <li>To communicate with you about your purchase (order confirmation, download instructions)</li>
              <li>To respond to your inquiries and support requests</li>
              <li>To improve our website and product offerings</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">3. Information Sharing</h2>
            <p className="text-muted-foreground">We do not sell, trade, or rent your personal information to third parties. We share information only in the following circumstances:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li><strong>PayPal:</strong> Payment processing is handled by PayPal, Inc., which has its own Privacy Policy available at paypal.com/privacy.</li>
              <li><strong>Cloud Storage:</strong> Digital files are stored on secure cloud infrastructure (object storage) for delivery purposes.</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">4. Data Security</h2>
            <p className="text-muted-foreground">We implement industry-standard security measures to protect your personal information, including SSL/TLS encryption for data in transit. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">5. Data Retention</h2>
            <p className="text-muted-foreground">We retain order records (including email and purchase details) for as long as necessary to fulfill the purposes outlined in this policy, typically for a period of 3 years for tax and accounting purposes, unless a longer retention period is required by law.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">6. Your Rights Under U.S. Law</h2>
            <p className="text-muted-foreground">Depending on your state of residence, you may have the following rights:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li><strong>Right to Know:</strong> You can request information about the personal data we collect and how we use it.</li>
              <li><strong>Right to Delete:</strong> You can request that we delete your personal information, subject to certain exceptions.</li>
              <li><strong>Right to Opt-Out:</strong> You can opt out of the sale of your personal information. We do not sell personal information.</li>
              <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your privacy rights.</li>
            </ul>
            <p className="text-muted-foreground mt-3">To exercise any of these rights, please contact us at the email address below.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">7. California Privacy Rights (CCPA)</h2>
            <p className="text-muted-foreground">California residents have additional rights under the California Consumer Privacy Act (CCPA). You have the right to request access to or deletion of your personal information. We are required to inform you that, in the preceding 12 months, we have not sold personal information. To submit a verifiable consumer request, please contact us at the email address below.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">8. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground">Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">9. Changes to This Policy</h2>
            <p className="text-muted-foreground">We may update this Privacy Policy from time to time. We will post the updated version on this page with a revised &quot;Last updated&quot; date. Your continued use of our website after changes are posted constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-foreground mt-8 mb-3">10. Contact Us</h2>
            <p className="text-muted-foreground">If you have any questions about this Privacy Policy or wish to exercise your privacy rights, please contact us at:</p>
            <p className="text-muted-foreground mt-2"><strong>Email:</strong> us@xiaoheiduo.com</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <Link href="/" className="text-warm-gold hover:underline">&larr; Back to Home</Link>
        </div>
      </article>
    </div>
  );
}
