import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Star, Shield, Download, CheckCircle, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { formatPrice, formatDate } from '@/lib/utils';
import { PRODUCT_TYPES } from '@/types/constants';

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/slug/${slug}`, { next: { revalidate: 30 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await getProduct(params.slug);
  if (!p) return { title: 'Produit introuvable' };
  return { title: `${p.title} – Your ID`, description: p.shortDesc || p.description?.substring(0, 160) };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const typeIcon = PRODUCT_TYPES.find(t => t.value === product.type)?.icon || '📦';

  return (
    <div className="min-h-screen bg-background">
      <Navbar/>
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Left - Product info */}
          <div className="lg:col-span-3 space-y-6">
            {/* Cover */}
            <div className="aspect-video bg-brand-50 rounded-2xl overflow-hidden border border-border">
              {product.coverImage ? (
                <img src={product.coverImage} alt={product.title} className="w-full h-full object-cover"/>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl opacity-20">{typeIcon}</div>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.category && <span className="badge bg-brand-50 text-brand-700">{product.category.name}</span>}
                <span className="badge bg-gray-100 text-gray-600">{typeIcon} {product.type}</span>
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-3">{product.title}</h1>

              <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                <Link href={`/@${product.store?.slug}`} className="flex items-center gap-2 hover:text-brand-600">
                  <div className="w-7 h-7 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-xs">{product.store?.name?.[0]}</div>
                  {product.store?.name}
                  {product.store?.isVerified && <CheckCircle size={14} className="text-brand-500"/>}
                </Link>
                {product.rating > 0 && (
                  <span className="flex items-center gap-1"><Star size={14} className="fill-yellow-400 text-yellow-400"/> {Number(product.rating).toFixed(1)} ({product.reviewCount} avis)</span>
                )}
                <span>{product.totalSales} vente(s)</span>
              </div>

              <div className="prose prose-sm text-gray-600 max-w-none">
                <p className="leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>
            </div>

            {/* Files preview */}
            {product.files?.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Download size={16} className="text-brand-500"/> Contenu inclus</h3>
                <div className="space-y-2">
                  {product.files.map((f: any) => (
                    <div key={f.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-2xl">📎</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{f.name}</p>
                        <p className="text-xs text-gray-400">{f.mimeType} · {(f.fileSize / 1024 / 1024).toFixed(1)} Mo</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {product.reviews?.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-gray-900 mb-4">Avis clients</h3>
                <div className="space-y-4">
                  {product.reviews.map((r: any) => (
                    <div key={r.id} className="border-b border-border pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}/>)}</div>
                        <span className="text-xs text-gray-400">{formatDate(r.createdAt, 'short')}</span>
                      </div>
                      {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right - Purchase card */}
          <div className="lg:col-span-2">
            <div className="sticky top-20">
              <div className="card shadow-elevated">
                <div className="text-center mb-5">
                  {product.comparePrice && Number(product.comparePrice) > Number(product.price) && (
                    <p className="text-gray-400 line-through text-sm">{formatPrice(Number(product.comparePrice), product.currency)}</p>
                  )}
                  <p className="text-4xl font-black text-gray-900">{formatPrice(Number(product.price), product.currency)}</p>
                  {product.comparePrice && <span className="badge bg-red-100 text-red-700 mt-1">
                    -{Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100)}% de réduction
                  </span>}
                </div>

                <Link href={`/checkout/${product.id}`} className="btn-primary w-full text-center text-base py-4 mb-4">
                  Acheter maintenant <ArrowRight size={18}/>
                </Link>

                <div className="space-y-2 text-sm text-gray-500">
                  {[
                    { icon: '🔒', text: 'Paiement 100% sécurisé' },
                    { icon: '⚡', text: 'Téléchargement instantané' },
                    { icon: '♾️', text: 'Accès à vie au produit' },
                    { icon: '🌍', text: 'Mobile Money & Carte acceptés' },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-2"><span>{b.icon}</span><span>{b.text}</span></div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-brand-500"/>
                    <p className="text-xs text-gray-500">Paiement sécurisé · Livraison automatique par email</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer/>
    </div>
  );
}
