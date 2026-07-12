import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { MarketplaceClient } from '@/components/marketplace/marketplace-client';

export const metadata = { title: 'Marketplace – Your ID', description: 'Découvrez des milliers de produits digitaux.' };

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar/>
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">Marketplace</h1>
          <p className="text-gray-500 mt-1">Découvrez des produits digitaux créés par notre communauté</p>
        </div>
        <MarketplaceClient/>
      </main>
      <Footer/>
    </div>
  );
}
