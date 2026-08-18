import logoAsset from '../../../Assets/logo.png';

interface ProPaarMarkProps {
  className?: string;
  isDark?: boolean;
}

export function ProPaarMark({ className = '', isDark = false }: ProPaarMarkProps) {
  const logoFileName = isDark ? 'logo-white.png' : 'logo.png';
  const logoUrl =
    typeof chrome !== 'undefined' && chrome.runtime?.getURL
      ? chrome.runtime.getURL(logoFileName)
      : logoAsset || `/${logoFileName}`;

  return (
    <img
      src={logoUrl}
      alt="ProPaar"
      className={`object-contain ${className}`}
      style={{
        display: 'block',
        flexShrink: 0,
      }}
    />
  );
}

