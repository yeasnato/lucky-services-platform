import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { business } from '@/data/business';
import { localBusinessJsonLd } from '@/lib/seo/schema';

export const metadata: Metadata = {
  metadataBase: new URL(business.website),
  title: {
    default: 'Lucky Services Centre | Home Appliance Repair Service in Dhaka',
    template: '%s | Lucky Services Centre'
  },
  description:
    'Lucky Services Centre offers expert AC, refrigerator, washing machine, microwave oven, geyser and kitchen hood repair across Dhaka.',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    url: business.website,
    siteName: business.name,
    title: 'Lucky Services Centre | Home Appliance Repair Service in Dhaka',
    description:
      'Expert home appliance repair and servicing across Dhaka. Book AC, refrigerator, washing machine, microwave, geyser and kitchen hood service.',
    images: [
      {
        url: '/preview-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Lucky Services Centre - Home Appliance Repair Service in Dhaka'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lucky Services Centre | Home Appliance Repair Service in Dhaka',
    description: 'Expert home appliance repair service across Dhaka.',
    images: ['/preview-image.jpg']
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  return (
    <html lang="en">
      <body>
        <Script
          id="local-business-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
        />
        {pixelId ? (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${pixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
        ) : null}
        {children}
      </body>
    </html>
  );
}
