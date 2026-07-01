import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/layout/providers';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: { default: 'Your ID – La plateforme qui transforme vos connaissances en revenus', template: '%s | Your ID' },
  description: 'Créez votre boutique digitale, vendez vos produits numériques et encaissez vos revenus avec Your ID.',
  keywords: ['vente digitale', 'produits numériques', 'boutique en ligne', 'afrique', 'ebook', 'formation'],
  authors: [{ name: 'Your ID' }],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://yourid.com',
    siteName: 'Your ID',
    title: 'Your ID – Vendez vos produits digitaux',
    description: 'La plateforme SaaS africaine pour vendre vos produits numériques.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'Your ID', description: 'Vendez vos produits digitaux en Afrique et partout dans le monde.' },
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
