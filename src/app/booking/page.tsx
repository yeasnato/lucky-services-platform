import { BookingForm } from '@/components/booking/BookingForm';
import { Footer } from '@/components/marketing/Footer';
import { Header } from '@/components/marketing/Header';

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="bg-[#0B2A4A] px-6 py-5">
            <h1 className="text-xl font-extrabold text-white">Request Service</h1>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#2EA9D6]">Lucky Services Centre</p>
          </div>
          <div className="p-6 md:p-8">
            <BookingForm selectedServiceId={service} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
