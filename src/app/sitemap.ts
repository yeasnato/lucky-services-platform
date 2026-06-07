import type { MetadataRoute } from 'next';
import { business } from '@/data/business';
import { serviceCategories } from '@/data/services';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const areaPages = business.serviceAreas.map((area) => ({
    url: `${business.website}/areas/${area.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8
  }));

  const servicePages = serviceCategories.map((service) => ({
    url: `${business.website}/services/${service.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.9
  }));

  return [
    {
      url: business.website,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1
    },
    {
      url: `${business.website}/booking`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7
    },
    {
      url: `${business.website}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7
    },
    ...servicePages,
    ...areaPages
  ];
}
