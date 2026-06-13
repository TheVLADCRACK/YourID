import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="card max-w-md w-full text-center shadow-elevated">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Paiement réussi ! 🎉</h1>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
          Votre achat a bien été confirmé. Un email avec votre lien de téléchargement vous a été envoyé.
        </p>
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-6 text-sm text-brand-700">
          📧 Vérifiez votre boîte mail (et vos spams) pour accéder à votre produit.
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/marketplace" className="btn-primary w-full text-center">Découvrir d'autres produits</Link>
          <Link href="/" className="btn-secondary w-full text-center">Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}
