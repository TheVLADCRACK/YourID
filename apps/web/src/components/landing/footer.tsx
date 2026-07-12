import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center"><span className="text-white font-black text-sm">YI</span></div>
              <span className="font-black text-xl text-white">Your <span className="text-brand-400">ID</span></span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">La plateforme qui transforme vos connaissances en revenus. Pensée pour l'Afrique et le monde.</p>
            <div className="flex gap-4 mt-6">
              {['𝕏', 'f', 'in', '▶'].map((s, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center text-sm hover:bg-brand-600 hover:text-white transition-colors">{s}</a>
              ))}
            </div>
          </div>

          {[
            { title: 'Produit', links: [['Fonctionnalités', '/#features'], ['Tarifs', '/#pricing'], ['Marketplace', '/marketplace'], ['Changelog', '#']] },
            { title: 'Ressources', links: [['Documentation', '#'], ['Blog', '#'], ['Support', '#'], ['Status', '#']] },
            { title: 'Légal', links: [['CGU', '#'], ['Confidentialité', '#'], ['Cookies', '#'], ['Mentions légales', '#']] },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="font-bold text-white mb-4 text-sm">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(([label, href], j) => (
                  <li key={j}><Link href={href} className="text-sm hover:text-brand-400 transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">© 2025 Your ID. Tous droits réservés.</p>
          <p className="text-sm">Fait avec ❤️ pour les créateurs africains</p>
        </div>
      </div>
    </footer>
  );
}
