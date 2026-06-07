import { FeaturedServices } from '@/components/marketing/FeaturedServices';
import { FloatingCall } from '@/components/marketing/FloatingCall';
import { Footer } from '@/components/marketing/Footer';
import { Header } from '@/components/marketing/Header';
import { Hero } from '@/components/marketing/Hero';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Hero />
        <FeaturedServices />
      </main>
      <FloatingCall />
      <Footer />
    </div>
  );
}
