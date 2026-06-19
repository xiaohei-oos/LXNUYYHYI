'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

const GTM_ID = 'GTM-M4TD4H3S';

export default function GoogleTagManager() {
  const pathname = usePathname();

  // 不在后台管理页面加载 GTM 和 GA
  if (pathname.startsWith('/xiaoheiduo9898')) {
    return null;
  }

  return (
    <>
      {/* Google Tag Manager - Head script */}
      <Script
        id="gtm-head"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
        }}
      />
      {/* Google Tag Manager (noscript) */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  );
}
