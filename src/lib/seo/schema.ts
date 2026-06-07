import { business } from '@/data/business';

export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    url: business.website,
    telephone: business.phoneInternational,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      postalCode: business.address.postalCode,
      addressCountry: 'BD'
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: business.hours.days,
        opens: business.hours.schemaOpen,
        closes: business.hours.schemaClose
      }
    ],
    areaServed: business.serviceAreas,
    priceRange: '৳৳'
  };
}
