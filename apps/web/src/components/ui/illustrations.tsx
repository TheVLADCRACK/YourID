/**
 * Illustrations SVG animées premium — Your ID
 * Charte graphique : vert royal #00A86B, style minimaliste, animations fluides.
 * Remplace tous les emojis dans les états vides et les sections clés.
 */

// ─── Utilitaire pour les animations ─────────────────────────────────────────
const pulse = 'animate-pulse';
const bounce = 'animate-bounce';

// ─── ÉTAT VIDE — Produits ────────────────────────────────────────────────────
export function EmptyProducts({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="180" height="160" viewBox="0 0 180 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shelf */}
      <rect x="20" y="120" width="140" height="6" rx="3" fill="#E5E7EB" />
      {/* Box 1 */}
      <g>
        <rect x="30" y="80" width="40" height="40" rx="6" fill="#F0FDF9" stroke="#00A86B" strokeWidth="1.5" />
        <line x1="50" y1="80" x2="50" y2="120" stroke="#00A86B" strokeWidth="1.5" strokeDasharray="3 2" />
        <circle cx="50" cy="100" r="8" fill="#00A86B" opacity=".15" />
        <path d="M46 100l3 3 5-5" stroke="#00A86B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* Box 2 (faded) */}
      <rect x="80" y="85" width="35" height="35" rx="5" fill="#F9FAFB" stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="4 3" />
      <rect x="120" y="88" width="28" height="32" rx="5" fill="#F9FAFB" stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* Plus icon (call to action) */}
      <circle cx="97" cy="102" r="10" fill="#00A86B" opacity=".1" />
      <line x1="97" y1="97" x2="97" y2="107" stroke="#00A86B" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="92" y1="102" x2="102" y2="102" stroke="#00A86B" strokeWidth="1.5" strokeLinecap="round" />
      {/* Stars */}
      <circle cx="155" cy="60" r="2" fill="#00A86B" opacity=".4">
        <animate attributeName="opacity" values=".4;1;.4" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="25" cy="55" r="1.5" fill="#00A86B" opacity=".3">
        <animate attributeName="opacity" values=".3;.8;.3" dur="2.5s" repeatCount="indefinite" begin=".5s" />
      </circle>
      <circle cx="140" cy="75" r="1" fill="#00A86B" opacity=".5">
        <animate attributeName="opacity" values=".5;1;.5" dur="1.8s" repeatCount="indefinite" begin="1s" />
      </circle>
    </svg>
  );
}

// ─── ÉTAT VIDE — Commandes ───────────────────────────────────────────────────
export function EmptyOrders({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="160" height="150" viewBox="0 0 160 150" fill="none">
      <rect x="25" y="20" width="110" height="110" rx="12" fill="#F0FDF9" stroke="#00A86B" strokeWidth="1.5" />
      {/* Receipt lines */}
      <line x1="45" y1="50" x2="115" y2="50" stroke="#00A86B" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="45" y1="65" x2="95" y2="65" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="45" y1="78" x2="105" y2="78" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="45" y1="91" x2="85" y2="91" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" />
      {/* Divider */}
      <line x1="35" y1="103" x2="125" y2="103" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 2" />
      {/* Total */}
      <line x1="80" y1="113" x2="115" y2="113" stroke="#00A86B" strokeWidth="2" strokeLinecap="round" />
      {/* Floating coin */}
      <circle cx="130" cy="35" r="14" fill="#00A86B" opacity=".12" stroke="#00A86B" strokeWidth="1.5">
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-5;0,0" dur="3s" repeatCount="indefinite" />
      </circle>
      <text x="130" y="40" textAnchor="middle" fontSize="12" fill="#00A86B" fontWeight="bold">F</text>
    </svg>
  );
}

// ─── ÉTAT VIDE — Clients ─────────────────────────────────────────────────────
export function EmptyCustomers({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="160" height="140" viewBox="0 0 160 140" fill="none">
      {/* Person 1 */}
      <circle cx="60" cy="45" r="18" fill="#F0FDF9" stroke="#00A86B" strokeWidth="1.5" />
      <circle cx="60" cy="40" r="8" fill="#00A86B" opacity=".2" stroke="#00A86B" strokeWidth="1.5" />
      <path d="M42 65c0-10 8-18 18-18s18 8 18 18" stroke="#00A86B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Person 2 (faded) */}
      <circle cx="105" cy="50" r="14" fill="#F9FAFB" stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="4 2" />
      <circle cx="105" cy="46" r="6" fill="#E5E7EB" />
      <path d="M91 68c0-8 6-14 14-14s14 6 14 14" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Connecting dots */}
      <circle cx="80" cy="75" r="3" fill="#00A86B" opacity=".3">
        <animate attributeName="opacity" values=".3;.8;.3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="90" cy="75" r="3" fill="#00A86B" opacity=".2">
        <animate attributeName="opacity" values=".2;.7;.2" dur="2s" repeatCount="indefinite" begin=".3s" />
      </circle>
      {/* Add person icon */}
      <circle cx="80" cy="110" r="18" fill="#00A86B" opacity=".08" stroke="#00A86B" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="80" y1="103" x2="80" y2="117" stroke="#00A86B" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="73" y1="110" x2="87" y2="110" stroke="#00A86B" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── ÉTAT VIDE — Retraits ────────────────────────────────────────────────────
export function EmptyWithdrawals({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="160" height="145" viewBox="0 0 160 145" fill="none">
      {/* Wallet */}
      <rect x="20" y="35" width="120" height="80" rx="12" fill="#F0FDF9" stroke="#00A86B" strokeWidth="1.5" />
      <rect x="20" y="50" width="120" height="18" fill="#00A86B" opacity=".08" />
      {/* Coin slot */}
      <circle cx="125" cy="75" r="12" fill="white" stroke="#00A86B" strokeWidth="1.5" />
      <line x1="120" y1="75" x2="130" y2="75" stroke="#00A86B" strokeWidth="1.5" strokeLinecap="round" />
      {/* Coins falling */}
      <circle cx="70" cy="25" r="8" fill="#00A86B" opacity=".15" stroke="#00A86B" strokeWidth="1.5">
        <animateTransform attributeName="transform" type="translate" values="0,0;0,5;0,0" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values=".15;.4;.15" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <text x="70" y="29" textAnchor="middle" fontSize="9" fill="#00A86B" fontWeight="bold">F</text>
      <circle cx="90" cy="15" r="6" fill="#00A86B" opacity=".1" stroke="#00A86B" strokeWidth="1.5">
        <animateTransform attributeName="transform" type="translate" values="0,0;0,8;0,0" dur="2s" repeatCount="indefinite" begin=".5s" />
      </circle>
    </svg>
  );
}

// ─── ÉTAT VIDE — Notifications ───────────────────────────────────────────────
export function EmptyNotifications({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="140" height="130" viewBox="0 0 140 130" fill="none">
      {/* Bell */}
      <path d="M70 20 C52 20 38 34 38 52 L38 70 L28 85 L112 85 L102 70 L102 52 C102 34 88 20 70 20Z" fill="#F0FDF9" stroke="#00A86B" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M60 85 C60 91 65 96 70 96 C75 96 80 91 80 85" stroke="#00A86B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Zzz */}
      <text x="90" y="45" fontSize="11" fill="#00A86B" opacity=".5" fontWeight="bold">
        z<animate attributeName="opacity" values=".5;1;.5" dur="2s" repeatCount="indefinite" />
      </text>
      <text x="100" y="33" fontSize="9" fill="#00A86B" opacity=".3" fontWeight="bold">
        z<animate attributeName="opacity" values=".3;.7;.3" dur="2s" repeatCount="indefinite" begin=".4s" />
      </text>
      {/* Shine */}
      <line x1="70" y1="8" x2="70" y2="13" stroke="#00A86B" strokeWidth="1.5" strokeLinecap="round" opacity=".4" />
      <line x1="85" y1="12" x2="82" y2="16" stroke="#00A86B" strokeWidth="1.5" strokeLinecap="round" opacity=".3" />
      <line x1="55" y1="12" x2="58" y2="16" stroke="#00A86B" strokeWidth="1.5" strokeLinecap="round" opacity=".3" />
    </svg>
  );
}

// ─── HÉRO — Illustration Dashboard (floating stats) ─────────────────────────
export function DashboardIllustration({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="320" height="240" viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main card */}
      <rect x="20" y="20" width="280" height="200" rx="16" fill="white" stroke="#E5E7EB" strokeWidth="1.5" />
      {/* Header bar */}
      <rect x="20" y="20" width="280" height="44" rx="16" fill="#00A86B" />
      <rect x="20" y="48" width="280" height="16" fill="#00A86B" />
      <circle cx="40" cy="42" r="6" fill="white" opacity=".3" />
      <rect x="52" y="38" width="80" height="8" rx="4" fill="white" opacity=".25" />
      {/* KPI row */}
      {[0,1,2].map(i => (
        <g key={i}>
          <rect x={30 + i * 90} y="76" width="78" height="46" rx="10" fill="#F0FDF9" stroke="#D1FAE5" strokeWidth="1" />
          <rect x={38 + i * 90} y="85" width="30" height="6" rx="3" fill="#00A86B" opacity=".2" />
          <rect x={38 + i * 90} y="96" width="50" height="16" rx="4" fill="#00A86B" opacity=".15" />
        </g>
      ))}
      {/* Chart bars */}
      {[35, 55, 45, 70, 60, 85, 95].map((h, i) => (
        <rect key={i}
          x={30 + i * 35} y={200 - h * 0.6}
          width="24" height={h * 0.6}
          rx="4" fill="#00A86B" opacity={.15 + i * .1}>
          <animate attributeName="height" values={`0;${h * 0.6}`} dur="1s" fill="freeze" begin={`${i * 0.1}s`} />
          <animate attributeName="y" values={`200;${200 - h * 0.6}`} dur="1s" fill="freeze" begin={`${i * 0.1}s`} />
        </rect>
      ))}
      {/* Floating badge — new sale */}
      <g>
        <rect x="190" y="150" width="110" height="36" rx="10" fill="white" stroke="#D1FAE5" strokeWidth="1.5" filter="url(#shadow)" />
        <circle cx="210" cy="168" r="10" fill="#00A86B" opacity=".15" />
        <text x="210" y="172" textAnchor="middle" fontSize="10">🎉</text>
        <rect x="225" y="160" width="65" height="6" rx="3" fill="#00A86B" opacity=".2" />
        <rect x="225" y="170" width="45" height="5" rx="2.5" fill="#D1D5DB" />
        <animateTransform attributeName="transform" type="translate" values="0,0;0,-4;0,0" dur="3s" repeatCount="indefinite" />
      </g>
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity=".08" />
        </filter>
      </defs>
    </svg>
  );
}

// ─── PAIEMENT — Logos méthodes animés ────────────────────────────────────────
export function MtnIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" fill="#FFB800" />
      <text x="16" y="21" textAnchor="middle" fontSize="11" fontWeight="900" fill="white">MTN</text>
    </svg>
  );
}

export function OrangeMoneyIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" fill="#FF6600" />
      <circle cx="16" cy="16" r="8" fill="white" opacity=".25" />
      <text x="16" y="20" textAnchor="middle" fontSize="9" fontWeight="900" fill="white">OM</text>
    </svg>
  );
}

export function WaveIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" fill="#1ba1e2" />
      <path d="M8 16 C10 12 12 20 14 16 C16 12 18 20 20 16 C22 12 24 16 24 16" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function MoovIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" fill="#00A0E3" />
      <text x="16" y="20" textAnchor="middle" fontSize="9" fontWeight="900" fill="white">MOOV</text>
    </svg>
  );
}

export function AirtelIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" fill="#FF0000" />
      <path d="M10 22 L16 10 L22 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="12" y1="18" x2="20" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CardIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" fill="#6366F1" />
      <rect x="7" y="11" width="18" height="12" rx="2" stroke="white" strokeWidth="1.5" fill="none" />
      <line x1="7" y1="16" x2="25" y2="16" stroke="white" strokeWidth="2" />
      <rect x="10" y="19" width="6" height="2" rx="1" fill="white" opacity=".6" />
    </svg>
  );
}

// ─── VIDE générique ───────────────────────────────────────────────────────────
export function EmptyStateIllustration({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="120" height="100" viewBox="0 0 120 100" fill="none">
      <ellipse cx="60" cy="85" rx="40" ry="6" fill="#F3F4F6" />
      <rect x="30" y="20" width="60" height="55" rx="8" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1.5" />
      <line x1="42" y1="38" x2="78" y2="38" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="42" y1="48" x2="68" y2="48" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="42" y1="58" x2="73" y2="58" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="60" cy="18" r="10" fill="white" stroke="#E5E7EB" strokeWidth="1.5">
        <animate attributeName="r" values="10;11;10" dur="2s" repeatCount="indefinite" />
      </circle>
      <line x1="60" y1="14" x2="60" y2="22" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="60" cy="24.5" r="1" fill="#9CA3AF" />
    </svg>
  );
}
