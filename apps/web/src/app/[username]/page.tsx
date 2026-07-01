import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { formatPrice } from '@/lib/utils';
import { EmptyStateIllustration } from '@/components/ui/illustrations';

async function getStore(username: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/stores/@${username}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

function VerifiedBadge() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8.5" fill="#00A86B" opacity=".12" stroke="#00A86B" strokeWidth="1"/>
      <path d="M5.5 9l2.5 2.5 4.5-5" stroke="#00A86B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-brand-500 hover:text-white transition-all">
      {icon}
    </a>
  );
}

function ProductTypeIcon({ type }: { type: string }) {
  const colors: Record<string, string> = {
    EBOOK:'#00A86B', COURSE:'#6366F1', AUDIO:'#F59E0B',
    TEMPLATE:'#EC4899', SOFTWARE:'#3B82F6', SERVICE:'#10B981', OTHER:'#8B5CF6',
  };
  const c = colors[type] || '#9CA3AF';
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="8" fill={`${c}15`}/>
      <rect x="7" y="6" width="14" height="16" rx="2" stroke={c} strokeWidth="1.3" fill="none"/>
      <line x1="10" y1="11" x2="18" y2="11" stroke={c} strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="10" y1="14" x2="18" y2="14" stroke={c} strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="10" y1="17" x2="14" y2="17" stroke={c} strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  );
}

export default async function StorePage({ params }: { params: { username: string } }) {
  const username = params.username.replace('%40','').replace('@','');
  const store = await getStore(username);
  if (!store) notFound();

  const hasLinks = store.website || store.twitter || store.instagram || store.tiktok;

  return (
    <div className="min-h-screen bg-background">
      <Navbar/>
      <main>
        {/* Banner */}
        {store.banner && (
          <div className="h-48 w-full overflow-hidden">
            <img src={store.banner} alt="" className="w-full h-full object-cover"/>
          </div>
        )}

        {/* Store hero */}
        <div className="bg-white border-b border-border">
          <div className="max-w-4xl mx-auto px-6 py-10 text-center">
            {/* Avatar */}
            <div className={`mx-auto mb-4 ${store.banner ? '-mt-12' : ''}`}>
              {store.logo ? (
                <img src={store.logo} alt={store.name}
                  className="w-20 h-20 rounded-2xl object-cover mx-auto border-4 border-white shadow-soft"/>
              ) : (
                <div className="w-20 h-20 bg-brand-500 rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto border-4 border-white shadow-soft">
                  {store.name[0]}
                </div>
              )}
            </div>

            {/* Name + verified */}
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-gray-900">{store.name}</h1>
              {store.isVerified && <VerifiedBadge/>}
            </div>

            <p className="text-gray-400 text-sm mb-3">@{store.user?.username}</p>

            {(store.description || store.user?.bio) && (
              <p className="text-gray-600 max-w-md mx-auto text-sm leading-relaxed">
                {store.description || store.user?.bio}
              </p>
            )}

            {/* Social links */}
            {hasLinks && (
              <div className="flex items-center justify-center gap-2 mt-4">
                {store.website && <SocialLink href={store.website} icon={
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M1 7.5h13M7.5 1c-1.5 1.5-2 3.5-2 6.5s.5 5 2 6.5M7.5 1c1.5 1.5 2 3.5 2 6.5s-.5 5-2 6.5" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>}/>}
                {store.twitter && <SocialLink href={`https://twitter.com/${store.twitter.replace('@','')}`} icon={
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1l12 12M1 13L13 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>}/>}
                {store.instagram && <SocialLink href={`https://instagram.com/${store.instagram.replace('@','')}`} icon={
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="1" width="12" height="12" rx="3.5" stroke="currentColor" strokeWidth="1.2"/>
                    <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
                    <circle cx="10.5" cy="3.5" r=".7" fill="currentColor"/>
                  </svg>}/>}
                {store.tiktok && <SocialLink href={`https://tiktok.com/@${store.tiktok.replace('@','')}`} icon={
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M5 6.5c-1.5 0-3 1-3 2.5S3.5 12 5 12s3-1 3-2.5V1c.5 1.5 2 2.5 3.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>}/>}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-5 text-sm">
              <div className="text-center">
                <p className="font-black text-gray-900 text-lg">{store.totalSales}</p>
                <p className="text-gray-400 text-xs">vente{store.totalSales !== 1 ? 's' : ''}</p>
              </div>
              <div className="w-px h-8 bg-border"/>
              <div className="text-center">
                <p className="font-black text-gray-900 text-lg">{store.products?.length || 0}</p>
                <p className="text-gray-400 text-xs">produit{(store.products?.length || 0) !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Products grid */}
        <div className="max-w-4xl mx-auto px-6 py-10">
          {!store.products?.length ? (
            <div className="flex flex-col items-center justify-center py-20 gap-5">
              <EmptyStateIllustration/>
              <p className="text-gray-500 font-medium">Aucun produit disponible</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {store.products?.map((p: any) => (
                <Link key={p.id} href={`/@${username}/products/${p.slug}`}
                  className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-soft transition-all group">
                  <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                    {p.coverImage ? (
                      <img src={p.coverImage} alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ProductTypeIcon type={p.type}/>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    {p.category && <p className="text-xs text-gray-400 mb-1">{p.category.name}</p>}
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-3">{p.title}</h3>
                    <p className="text-base font-black text-brand-600">
                      {formatPrice(Number(p.price), p.currency)}
                    </p>
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
