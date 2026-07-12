import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-brand-500 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page introuvable</h1>
        <p className="text-gray-500 mb-8">La page que vous cherchez n'existe pas ou a été déplacée.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">Retour à l'accueil</Link>
          <Link href="/marketplace" className="btn-secondary">Explorer la marketplace</Link>
        </div>
      </div>
    </div>
  );
}
