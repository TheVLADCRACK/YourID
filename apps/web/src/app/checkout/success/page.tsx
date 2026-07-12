import Link from 'next/link';
import { IconSuccess } from '@/components/ui/svg-icons';

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="card max-w-md w-full text-center shadow-elevated">
        <div className="flex justify-center mb-5">
          <IconSuccess size={72}/>
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-2">Paiement réussi !</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Votre achat est confirmé. Un email avec votre lien de téléchargement vous a été envoyé.
        </p>

        {/* Info card — email */}
        <div className="flex items-start gap-3 bg-brand-50 border border-brand-100 rounded-xl p-4 mb-6 text-left">
          <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="3" width="14" height="10" rx="2" stroke="#00A86B" strokeWidth="1.3"/>
              <path d="M1 5l7 5 7-5" stroke="#00A86B" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-800">Vérifiez votre boîte mail</p>
            <p className="text-xs text-brand-600 mt-0.5">Le lien de téléchargement est valable 48h et à usage unique. Vérifiez aussi les spams.</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Link href="/marketplace" className="btn-primary w-full text-center">Découvrir d'autres produits</Link>
          <Link href="/" className="btn-secondary w-full text-center">Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}
