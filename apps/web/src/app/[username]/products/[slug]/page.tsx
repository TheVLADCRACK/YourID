
function TrustBadgeIcon({ type }: { type: string }) {
  if (type === 'lock') return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="6" width="10" height="7" rx="1.5" stroke="#00A86B" strokeWidth="1.2"/><path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="#00A86B" strokeWidth="1.2" strokeLinecap="round"/><circle cx="7" cy="9.5" r=".8" fill="#00A86B"/></svg>;
  if (type === 'flash') return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8 2L4 8h4l-2 4 6-6H8z" fill="#F59E0B" opacity=".2" stroke="#F59E0B" strokeWidth="1.1" strokeLinejoin="round"/></svg>;
  if (type === 'inf') return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 7c0 0-.8-2-2.5-2S1 6 1 7s.5 2 2.5 2 3.5-4 3.5-4 1 4 3.5 4S13 8 13 7s-.5-2-2.5-2S7 7 7 7z" stroke="#00A86B" strokeWidth="1.2" strokeLinecap="round"/></svg>;
  if (type === 'phone') return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="3.5" y="1" width="7" height="12" rx="1.5" stroke="#00A86B" strokeWidth="1.2"/><circle cx="7" cy="11" r=".7" fill="#00A86B"/></svg>;
  if (type === 'globe') return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#00A86B" strokeWidth="1.2"/><path d="M1 7h12M7 1c-1.5 1.5-2 3.5-2 6s.5 4.5 2 6M7 1c1.5 1.5 2 3.5 2 6s-.5 4.5-2 6" stroke="#00A86B" strokeWidth="1.2"/></svg>;
  return null;
}

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Star, Shield, Download, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { formatPrice, formatDate } from '@/lib/utils';
import { IconFile } from '@/components/ui/svg-icons';
import { PRODUCT_TYPES } from '@/types/constants';

async function getProduct(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/slug/${slug}`,
      { next: { revalidate: 30 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function generateMetadata({ params }: any) {
  const p = await getProduct(params.slug);
  if (!p) return { title: 'Produit introuvable' };
  return {
    title: `${p.title} – Your ID`,
    description: p.shortDesc || p.description?.substring(0, 160),
    openGraph: {
      title: p.title,
      description: p.shortDesc || p.description?.substring(0, 160),
      images: p.coverImage ? [p.coverImage] : [],
    },
  };
}

export default async function ProductPage({ params }: any) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const typeInfo = PRODUCT_TYPES.find((t) => t.value === product.type);
  const username = params.username.replace('@', '');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/marketplace" className="hover:text-brand-600">Marketplace</Link>
          <span>/</span>
          <Link href={`/@${username}`} className="hover:text-brand-600">
            @{username}
          </Link>
          <span>/</span>
          <span className="text-gray-700 truncate max-w-xs">{product.title}</span>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Left — product info */}
          <div className="lg:col-span-3 space-y-6">
            {/* Cover image */}
            <div className="aspect-video bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl overflow-hidden border border-border">
              {product.coverImage ? (
                <img
                  src={product.coverImage}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ProductIllustration type={product.type} />
                </div>
              )}
            </div>

            {/* Meta */}
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {product.category && (
                  <span className="badge bg-brand-50 text-brand-700 text-xs">
                    {product.category.name}
                  </span>
                )}
                <span className="badge bg-gray-100 text-gray-600 text-xs">
                  {typeInfo?.icon} {typeInfo?.label || product.type}
                </span>
              </div>

              <h1 className="text-3xl font-black text-gray-900 mb-4 leading-tight">
                {product.title}
              </h1>

              <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 flex-wrap">
                <Link
                  href={`/@${username}`}
                  className="flex items-center gap-2 hover:text-brand-600 transition-colors"
                >
                  <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-xs">
                    {product.store?.name?.[0]}
                  </div>
                  {product.store?.name}
                  {product.store?.isVerified && (
                    <CheckCircle size={14} className="text-brand-500" />
                  )}
                </Link>
                {product.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    {Number(product.rating).toFixed(1)}
                    <span className="text-gray-400">({product.reviewCount} avis)</span>
                  </span>
                )}
                <span>{product.totalSales} vente(s)</span>
              </div>

              <div className="prose prose-sm text-gray-600 max-w-none">
                <p className="leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>
            </div>

            {/* Files included */}
            {product.files?.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Download size={16} className="text-brand-500" />
                  Contenu inclus ({product.files.length} fichier{product.files.length > 1 ? 's' : ''})
                </h3>
                <div className="space-y-2">
                  {product.files.map((f: any) => (
                    <div key={f.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <FileIcon mime={f.mimeType} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{f.name}</p>
                        <p className="text-xs text-gray-400">
                          {f.mimeType} · {(f.fileSize / 1024 / 1024).toFixed(1)} Mo
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {product.reviews?.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-gray-900 mb-4">
                  Avis clients ({product.reviewCount})
                </h3>
                <div className="space-y-4">
                  {product.reviews.map((r: any) => (
                    <div key={r.id} className="pb-4 border-b border-border last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={13}
                              className={
                                s <= r.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-200 fill-gray-200'
                              }
                            />
                          ))}
                        </div>
                        {r.isVerified && (
                          <span className="text-xs text-brand-600 font-medium">Achat vérifié</span>
                        )}
                        <span className="text-xs text-gray-400 ml-auto">
                          {formatDate(r.createdAt, 'short')}
                        </span>
                      </div>
                      {r.title && <p className="text-sm font-semibold text-gray-900 mb-1">{r.title}</p>}
                      {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — purchase card */}
          <div className="lg:col-span-2">
            <div className="sticky top-20">
              <div className="card shadow-elevated border-2 border-brand-100">
                {/* Price */}
                <div className="text-center mb-6">
                  {product.comparePrice &&
                    Number(product.comparePrice) > Number(product.price) && (
                      <p className="text-gray-400 line-through text-sm mb-1">
                        {formatPrice(Number(product.comparePrice), product.currency)}
                      </p>
                    )}
                  <p className="text-4xl font-black text-gray-900">
                    {formatPrice(Number(product.price), product.currency)}
                  </p>
                  {product.comparePrice &&
                    Number(product.comparePrice) > Number(product.price) && (
                      <span className="badge bg-red-100 text-red-700 mt-2">
                        -{Math.round(
                          (1 - Number(product.price) / Number(product.comparePrice)) * 100,
                        )}
                        % de réduction
                      </span>
                    )}
                </div>

                <Link
                  href={`/checkout/${product.id}`}
                  className="btn-primary w-full text-center text-base py-4 mb-5 rounded-xl flex items-center justify-center gap-2"
                >
                  Acheter maintenant
                  <ArrowRight size={18} />
                </Link>

                <div className="space-y-2.5 text-sm text-gray-500">
                  {[
                    { icon: 'lock', text: 'Paiement 100% sécurisé' },
                    { icon: 'flash', text: 'Téléchargement instantané' },
                    { icon: 'inf', text: 'Accès à vie au produit' },
                    { icon: 'phone', text: 'Mobile Money & Carte acceptés' },
                    { icon: 'globe', text: 'Livré partout en Afrique' },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <span className="text-base">{b.icon}</span>
                      <span>{b.text}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-border flex items-start gap-2">
                  <Shield size={14} className="text-brand-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-400">
                    Paiement sécurisé · Fichier livré automatiquement par email après confirmation.
                  </p>
                </div>
              </div>

              {/* Seller card */}
              <Link
                href={`/@${username}`}
                className="mt-4 card flex items-center gap-3 hover:shadow-soft transition-shadow group"
              >
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center text-brand-700 font-bold text-lg flex-shrink-0 group-hover:bg-brand-200 transition-colors">
                  {product.store?.name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm flex items-center gap-1">
                    {product.store?.name}
                    {product.store?.isVerified && (
                      <CheckCircle size={13} className="text-brand-500" />
                    )}
                  </p>
                  <p className="text-xs text-gray-400">Voir la boutique →</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ProductIllustration({ type }: { type: string }) {
  const colors: Record<string, string> = {
    EBOOK: '#00A86B', COURSE: '#6366F1', AUDIO: '#F59E0B',
    TEMPLATE: '#EC4899', SOFTWARE: '#3B82F6', SERVICE: '#10B981', OTHER: '#8B5CF6',
  };
  const color = colors[type] || '#00A86B';

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="56" fill={`${color}15`} stroke={`${color}30`} strokeWidth="2" />
      {type === 'EBOOK' && (
        <g>
          <rect x="35" y="30" width="50" height="60" rx="4" fill={color} opacity=".15" />
          <rect x="35" y="30" width="50" height="60" rx="4" stroke={color} strokeWidth="2.5" fill="none" />
          <line x1="45" y1="48" x2="75" y2="48" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <line x1="45" y1="58" x2="75" y2="58" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <line x1="45" y1="68" x2="65" y2="68" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
      {type === 'COURSE' && (
        <g>
          <circle cx="60" cy="60" r="22" fill={color} opacity=".15" stroke={color} strokeWidth="2.5" />
          <polygon points="54,50 54,70 74,60" fill={color} />
        </g>
      )}
      {type === 'AUDIO' && (
        <g>
          <rect x="52" y="30" width="16" height="36" rx="8" fill={color} opacity=".2" stroke={color} strokeWidth="2.5" />
          <path d="M42 58c0 10 8 18 18 18s18-8 18-18" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <line x1="60" y1="76" x2="60" y2="88" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="50" y1="88" x2="70" y2="88" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}
      {(type === 'TEMPLATE' || type === 'SOFTWARE' || type === 'SERVICE' || type === 'OTHER') && (
        <g>
          <rect x="32" y="35" width="56" height="50" rx="6" fill={color} opacity=".15" stroke={color} strokeWidth="2.5" />
          <rect x="32" y="35" width="56" height="14" rx="6" fill={color} opacity=".3" />
          <circle cx="42" cy="42" r="3" fill="white" opacity=".8" />
          <circle cx="54" cy="42" r="3" fill="white" opacity=".8" />
          <line x1="42" y1="60" x2="78" y2="60" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <line x1="42" y1="70" x2="68" y2="70" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

function FileIcon({ mime }: { mime: string }) {
  const color = mime.includes('pdf') ? '#EF4444' : mime.includes('zip') ? '#F59E0B'
    : mime.includes('audio') ? '#8B5CF6' : mime.includes('video') ? '#3B82F6' : '#6B7280';
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="flex-shrink-0">
      <path d="M7 3h10l6 6v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" fill={`${color}15`} stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M17 3v6h6" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  );
}
