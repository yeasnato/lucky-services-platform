import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/marketing/Footer';
import { Header } from '@/components/marketing/Header';
import { business } from '@/data/business';
import { serviceCategories } from '@/data/services';

export function generateStaticParams() {
  return business.serviceAreas.map((area) => ({ slug: area.toLowerCase().replace(/\s+/g, '-') }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const area = toTitle(slug);
  return {
    title: `Home Appliance Repair in ${area}`,
    description: `Book AC, refrigerator, washing machine, microwave, geyser and kitchen hood repair in ${area}, Dhaka.`
  };
}

export default async function AreaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const area = toTitle(slug);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <p className="text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">Service Area</p>
          <h1 className="mt-2 text-3xl font-extrabold text-[#0B2A4A]">Home Appliance Repair in {area}</h1>
          <p className="mt-3 max-w-2xl text-gray-500">
            Lucky Services Centre provides doorstep appliance repair in {area}. Choose a service and submit a booking request for admin confirmation and technician assignment.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {serviceCategories.map((service) => (
              <Link key={service.id} href={`/services/${service.slug}`} className="rounded-2xl border border-gray-100 bg-gray-50 p-5 font-bold text-[#0B2A4A] hover:border-[#2EA9D6] hover:bg-[#F0F9FC]">
                {service.title}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function toTitle(slug: string) {
  return slug.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}
