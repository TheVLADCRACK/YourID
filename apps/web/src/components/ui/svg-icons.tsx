/**
 * SVG Icons — Your ID Design System
 * Remplace tous les emojis. Style : outline minimaliste, brand color #00A86B.
 * Chaque composant accepte size, color, className.
 */

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

const C = '#00A86B';   // brand primary
const G = '#9CA3AF';   // gray-400
const W = 'white';

// ─── Notifications ────────────────────────────────────────────────────────────
export function IconNewSale({ size = 20, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M3 5h14l-1.5 9H4.5L3 5z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="7.5" cy="16.5" r="1" fill={color}/>
      <circle cx="13.5" cy="16.5" r="1" fill={color}/>
      <path d="M7 9l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconCheck({ size = 20, color = '#22C55E' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke={color} strokeWidth="1.5"/>
      <path d="M6.5 10.5l2.5 2.5 4-5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconReject({ size = 20, color = '#EF4444' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke={color} strokeWidth="1.5"/>
      <path d="M7 7l6 6M13 7l-6 6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconWithdraw({ size = 20, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="2" y="5" width="16" height="12" rx="2" stroke={color} strokeWidth="1.5"/>
      <path d="M2 9h16" stroke={color} strokeWidth="1.5"/>
      <circle cx="6" cy="13" r="1" fill={color}/>
      <path d="M10 7V3M10 3l-2 2M10 3l2 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconBell({ size = 20, color = G }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 3C7.2 3 5 5.2 5 8v4l-1.5 2h13L15 12V8c0-2.8-2.2-5-5-5z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8 17c0 1.1.9 2 2 2s2-.9 2-2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconStar({ size = 16, color = '#F59E0B', filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5l1.8 3.7 4.1.6-3 2.9.7 4-3.6-1.9-3.6 1.9.7-4-3-2.9 4.1-.6L8 1.5z"
        fill={filled ? color : 'none'} stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconReview({ size = 20, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M8 1.5l1.8 3.7 4.1.6-3 2.9.7 4-3.6-1.9-3.6 1.9.7-4-3-2.9 4.1-.6L8 1.5z" stroke={color} strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Security / Trust badges ──────────────────────────────────────────────────
export function IconLock({ size = 16, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="7" width="12" height="8" rx="2" stroke={color} strokeWidth="1.3"/>
      <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="8" cy="11" r="1" fill={color}/>
    </svg>
  );
}

export function IconFlash({ size = 16, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M9 2L4 9h5l-2 5 7-7H9L11 2z" fill={color} opacity=".2" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconInfinity({ size = 16, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M6 8c0 0-1-2-3-2S1 7 1 8s1 2 3 2 4-4 4-4 1 4 4 4 3-1 3-2-1-2-3-2-4 4-4 4z" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

export function IconGlobe({ size = 16, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.3"/>
      <path d="M2 8h12M8 2c-1.5 1.5-2 3.5-2 6s.5 4.5 2 6M8 2c1.5 1.5 2 3.5 2 6s-.5 4.5-2 6" stroke={color} strokeWidth="1.3"/>
    </svg>
  );
}

export function IconPhone({ size = 16, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="4" y="1" width="8" height="14" rx="2" stroke={color} strokeWidth="1.3"/>
      <circle cx="8" cy="13" r=".8" fill={color}/>
    </svg>
  );
}

export function IconEmail({ size = 16, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="3" width="14" height="10" rx="2" stroke={color} strokeWidth="1.3"/>
      <path d="M1 5l7 5 7-5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

export function IconDownload({ size = 16, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 2v8M5 7l3 3 3-3" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12h12" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

export function IconMoney({ size = 20, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke={color} strokeWidth="1.5"/>
      <path d="M10 6v8M7.5 8.5A2.5 2.5 0 0 1 10 7a2.5 2.5 0 0 1 0 5 2.5 2.5 0 0 0 0 5" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

// ─── File type icons ──────────────────────────────────────────────────────────
export function IconFile({ size = 24, mime = '' }: { size?: number; mime?: string }) {
  const isPdf = mime.includes('pdf');
  const isZip = mime.includes('zip');
  const isAudio = mime.includes('audio') || mime.includes('mpeg');
  const isVideo = mime.includes('video');
  const isDoc = mime.includes('word') || mime.includes('doc');
  const isSlide = mime.includes('presentation') || mime.includes('pptx');

  const color = isPdf ? '#EF4444' : isZip ? '#F59E0B' : isAudio ? '#8B5CF6'
    : isVideo ? '#3B82F6' : isDoc ? '#2563EB' : isSlide ? '#F97316' : G;

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill={`${color}15`} stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M14 2v6h6" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      {isPdf && <text x="6" y="18" fontSize="6" fontWeight="900" fill={color}>PDF</text>}
      {isZip && <path d="M11 8v8M9 10h4M9 14h4" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>}
      {isAudio && <path d="M9 12c0-1.7 1.3-3 3-3s3 1.3 3 3" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>}
      {isVideo && <polygon points="10,9 10,15 16,12" fill={color} opacity=".6"/>}
    </svg>
  );
}

// ─── Upload / Drag-and-drop ───────────────────────────────────────────────────
export function IconUploadCloud({ size = 48, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill={`${color}10`} stroke={`${color}30`} strokeWidth="1.5" strokeDasharray="5 3"/>
      <path d="M24 32V18M24 18l-5 5M24 18l5 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="16" y="33" width="16" height="3" rx="1.5" fill={color} opacity=".25"/>
    </svg>
  );
}

// ─── Success / Validation ─────────────────────────────────────────────────────
export function IconSuccess({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="30" fill="#DCFCE7" stroke="#22C55E" strokeWidth="2">
        <animate attributeName="r" values="28;30;29.5" dur="0.5s" fill="freeze"/>
      </circle>
      <path d="M20 32l8 8 16-16" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <animate attributeName="stroke-dashoffset" from="50" to="0" dur="0.4s" fill="freeze"/>
      </path>
    </svg>
  );
}

// ─── Payment method logos ─────────────────────────────────────────────────────
export function PaymentMethodIcon({ id, size = 36 }: { id: string; size?: number }) {
  if (id === 'mtn_momo') return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="8" fill="#FFB800"/>
      <text x="18" y="15" textAnchor="middle" fontSize="8" fontWeight="900" fill="white">MTN</text>
      <text x="18" y="25" textAnchor="middle" fontSize="7" fontWeight="700" fill="white" opacity=".85">MoMo</text>
    </svg>
  );
  if (id === 'orange_money') return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="8" fill="#FF6600"/>
      <circle cx="18" cy="18" r="9" fill="none" stroke="white" strokeWidth="2" opacity=".4"/>
      <circle cx="18" cy="18" r="5" fill="white" opacity=".9"/>
    </svg>
  );
  if (id === 'wave') return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="8" fill="#1BA1E2"/>
      <path d="M7 18c2.5-4 5 4 7.5 0s5-4 7.5 0 5 4 7.5 0" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
    </svg>
  );
  if (id === 'moov') return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="8" fill="#00A0E3"/>
      <path d="M8 22l5-10 5 10 5-10 5 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
  if (id === 'airtel_money') return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="8" fill="#E30613"/>
      <path d="M18 8l8 18H10l8-18z" fill="white" opacity=".9"/>
      <line x1="12" y1="20" x2="24" y2="20" stroke="#E30613" strokeWidth="1.5"/>
    </svg>
  );
  if (id === 'card') return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="8" fill="#4F46E5"/>
      <rect x="5" y="11" width="26" height="16" rx="3" stroke="white" strokeWidth="1.5" fill="none"/>
      <line x1="5" y1="17" x2="31" y2="17" stroke="white" strokeWidth="2.5"/>
      <rect x="8" y="21" width="8" height="3" rx="1" fill="white" opacity=".5"/>
      <rect x="20" y="21" width="4" height="3" rx="1" fill="white" opacity=".3"/>
      <rect x="25" y="21" width="4" height="3" rx="1" fill="white" opacity=".3"/>
    </svg>
  );
  return null;
}

// ─── Trophy tiers (landing page) ─────────────────────────────────────────────
export function TrophyIcon({ tier, size = 32 }: { tier: 'bronze'|'silver'|'gold'|'platinum'|'diamond'; size?: number }) {
  const cfg = {
    bronze:   { c1: '#CD7F32', c2: '#E8975A', label: 'B' },
    silver:   { c1: '#8E8E93', c2: '#C0C0C0', label: 'S' },
    gold:     { c1: '#FFB800', c2: '#FFD700', label: 'G' },
    platinum: { c1: '#6366F1', c2: '#A5B4FC', label: 'P' },
    diamond:  { c1: '#06B6D4', c2: '#67E8F9', label: 'D' },
  }[tier];
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M8 6h16v10a8 8 0 0 1-16 0V6z" fill={cfg.c1} opacity=".2" stroke={cfg.c1} strokeWidth="1.5"/>
      <path d="M4 8H8M28 8h-4" stroke={cfg.c1} strokeWidth="2" strokeLinecap="round"/>
      <rect x="11" y="22" width="10" height="3" rx="1" fill={cfg.c1} opacity=".4"/>
      <rect x="9" y="25" width="14" height="3" rx="1.5" fill={cfg.c1} opacity=".6"/>
      <text x="16" y="17" textAnchor="middle" fontSize="9" fontWeight="900" fill={cfg.c1}>{cfg.label}</text>
    </svg>
  );
}

// ─── Status badges (withdrawal / order states) ────────────────────────────────
export function StatusIcon({ status, size = 20 }: { status: string; size?: number }) {
  if (status === 'PAID' || status === 'COMPLETED') return <IconCheck size={size} color="#22C55E"/>;
  if (status === 'APPROVED') return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="#00A86B" strokeWidth="1.5"/>
      <path d="M6 10l3 3 5-5" stroke="#00A86B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  if (status === 'REJECTED' || status === 'FAILED') return <IconReject size={size}/>;
  // PENDING / default
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="#F59E0B" strokeWidth="1.5"/>
      <path d="M10 6v4l2.5 2.5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
