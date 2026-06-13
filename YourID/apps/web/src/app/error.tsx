'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="card max-w-md w-full text-center">
        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={28} className="text-red-500"/>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Une erreur est survenue</h1>
        <p className="text-gray-500 text-sm mb-6">
          {process.env.NODE_ENV === 'development' ? error.message : "Quelque chose s'est mal passé. Veuillez réessayer."}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary flex items-center gap-2">
            <RefreshCw size={16}/> Réessayer
          </button>
          <Link href="/" className="btn-secondary">Accueil</Link>
        </div>
      </div>
    </div>
  );
}
