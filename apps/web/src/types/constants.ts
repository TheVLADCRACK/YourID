export const CURRENCIES = [
  { code: 'XOF', name: 'Franc CFA UEMOA', symbol: 'FCFA' },
  { code: 'XAF', name: 'Franc CFA CEMAC', symbol: 'FCFA' },
  { code: 'GHS', name: 'Cedi Ghanéen', symbol: 'GH₵' },
  { code: 'NGN', name: 'Naira Nigérian', symbol: '₦' },
  { code: 'KES', name: 'Shilling Kényan', symbol: 'KSh' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'Dollar US', symbol: '$' },
];

export const COUNTRIES = [
  { code: 'SN', name: 'Sénégal', flag: '🇸🇳' },
  { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮' },
  { code: 'CM', name: 'Cameroun', flag: '🇨🇲' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'MA', name: 'Maroc', flag: '🇲🇦' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'US', name: 'États-Unis', flag: '🇺🇸' },
];

export const PAYMENT_METHODS = [
  { id: 'mtn_momo', name: 'MTN MoMo', emoji: '📱', color: '#FFB800', countries: ['CI', 'GH', 'CM', 'SN'] },
  { id: 'orange_money', name: 'Orange Money', emoji: '🟠', color: '#FF6600', countries: ['SN', 'CI', 'ML'] },
  { id: 'wave', name: 'Wave', emoji: '🌊', color: '#1ba1e2', countries: ['SN', 'CI', 'ML', 'BF'] },
  { id: 'airtel_money', name: 'Airtel Money', emoji: '📡', color: '#FF0000', countries: ['KE', 'NG', 'GH'] },
  { id: 'moov', name: 'Moov Money', emoji: '💳', color: '#00A0E3', countries: ['CI', 'BF', 'ML'] },
  { id: 'card', name: 'Carte Bancaire', emoji: '💳', color: '#6366F1', countries: [] },
];

export const PRODUCT_TYPES = [
  { value: 'EBOOK', label: 'Ebook', icon: '📘' },
  { value: 'COURSE', label: 'Formation', icon: '🎓' },
  { value: 'AUDIO', label: 'Audio', icon: '🎵' },
  { value: 'TEMPLATE', label: 'Template', icon: '🎨' },
  { value: 'SOFTWARE', label: 'Logiciel', icon: '💻' },
  { value: 'SERVICE', label: 'Service', icon: '🤝' },
  { value: 'OTHER', label: 'Autre', icon: '📦' },
];
