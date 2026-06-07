import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { BookingForm } from '@/components/booking/BookingForm';
import { Footer } from '@/components/marketing/Footer';
import { Header } from '@/components/marketing/Header';
import { formatPrice } from '@/lib/utils';
import { getServicesByCategory, serviceCategories } from '@/data/services';

export function generateStaticParams() {
  return serviceCategories.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = serviceCategories.find((service) => service.slug === slug);
  return {
    title: category ? `${category.title} in Dhaka` : 'Service',
    description: category ? `${category.title} by Lucky Services Centre. Book expert doorstep repair service in Dhaka.` : undefined
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = serviceCategories.find((service) => service.slug === slug) || serviceCategories[0];
  const categoryServices = getServicesByCategory(category.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_420px]">
        <section>
          <Link href="/#services-section" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#2EA9D6]">
            <ArrowLeft size={16} /> Back to services
          </Link>
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-[#0B2A4A] md:text-4xl">{category.title}</h1>
            <p className="mt-2 text-gray-500">Professional repair & maintenance with transparent pricing and technician assignment.</p>
          </div>
          <div className="space-y-4">
            {categoryServices.map((service) => (
              <div key={service.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-[#2EA9D6]/30 hover:shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-[#0B2A4A]">{service.title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-gray-500">{service.description}</p>
                    {service.popular ? <span className="mt-2 inline-block rounded bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-600">Popular</span> : null}
                  </div>
                  <div className="text-right">
                    <span className="block text-lg font-extrabold text-[#0B2A4A]">{formatPrice(service.price)}</span>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Starting from</span>
                  </div>
                </div>
                <Link href={`/booking?service=${service.id}`} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0B2A4A] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#2EA9D6]">
                  Book Now <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </section>

        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="bg-[#0B2A4A] px-6 py-5">
              <h2 className="text-xl font-extrabold text-white">Book {category.title}</h2>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">Saved to admin dashboard</p>
            </div>
            <div className="p-6">
              <BookingForm />
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#F0F9FC] p-3 text-xs font-bold text-[#0B2A4A]">
                <ShieldCheck size={16} className="text-[#25D366]" />
                Admin confirms before technician assignment.
              </div>
            </div>
          </div>
        </aside>
      </main>
      <Footer />
    </div>
  );
}
