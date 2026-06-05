import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Globe, Twitter, Instagram } from 'lucide-react';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { formatPrice } from '@/lib/utils';
import { PRODUCT_TYPES } from '@/types/constants';

async function getStore(username: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stores/@${username}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export default async function StorePage({ params }: { params: { username: string } }) {
  const username = params.username.replace('%40', '').replace('@', '');
  const store = await getStore(username);
  if (!store) notFound();

  const socialLinks = [
    { key: 'website', icon: Globe, href: store.website },
    { key: 'twitter', icon: Twitter, href: store.twitter ? `https://twitter.com/${store.twitter}` : null },
    { key: 'instagram', icon: Instagram, href: store.instagram ? `https://instagram.com/${store.instagram}` : null },
  ].filter(s => s.href);

  return (
    <div className="min-h-screen bg-background">
      <Navbar/>
      <main>
        {/* Store hero */}
        <div className="bg-white border-b border-border">
          <div className="max-w-4xl mx-auto px-6 py-12 text-center">
            {store.banner && <div className="h-40 rounded-2xl overflow-hidden mb-6 -mx-6"><img src={store.banner} className="w-full h-full object-cover" alt=""/></div>}
            <div className="w-20 h-20 bg-brand-500 rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-4 shadow-elevated">
              {store.logo ? <img src={store.logo} className="w-full h-full object-cover rounded-2xl" alt=""/> : store.name[0]}
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-gray-900">{store.name}</h1>
              {store.isVerified && <CheckCircle size={20} className="text-brand-500 fill-brand-100"/>}
            </div>
            <p className="text-gray-500 mb-2">@{store.user?.username}</p>
            {store.description && <p className="text-gray-600 max-w-md mx-auto text-sm">{store.description}</p>}
            {store.user?.bio && <p className="text-gray-500 max-w-md mx-auto text-sm mt-2">{store.user.bio}</p>}
            {socialLinks.length > 0 && (
              <div className="flex items-center justify-center gap-3 mt-4">
                {socialLinks.map(({ icon: Icon, href }, i) => (
                  <a key={i} href={href!} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-brand-500 hover:text-white transition-colors">
                    <Icon size={16}/>
                  </a>
                ))}
              </div>
            )}
            <div className="flex items-center justify-center gap-6 mt-5 text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{store.totalSales}</span> ventes
              <span className="font-semibold text-gray-900">{store.products?.length}</span> produits
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="max-w-4xl mx-auto px-6 py-10">
          {store.products?.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg font-medium">Aucun produit disponible</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {store.products?.map((p: any) => (
                <Link key={p.id} href={`/p/${p.slug}`} className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-soft transition-all group">
                  <div className="aspect-video bg-brand-50 relative overflow-hidden">
                    {p.coverImage ? (
                      <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-20">
                        {PRODUCT_TYPES.find(t => t.value === p.type)?.icon || '📦'}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-400 mb-1">{p.category?.name || p.type}</p>
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-3">{p.title}</h3>
                    <p className="text-lg font-black text-brand-600">{formatPrice(Number(p.price), p.currency)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer/>
    </div>
  );
}
