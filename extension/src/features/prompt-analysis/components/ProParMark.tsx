import logoAsset from '../../../Assets/logo.png';

interface ProParMarkProps {
  className?: string;
  isDark?: boolean;
}

export function ProParMark({ className = '', isDark = false }: ProParMarkProps) {
  const logoFileName = isDark ? 'logo-white.png' : 'logo.png';
  const logoUrl =
    typeof chrome !== 'undefined' && chrome.runtime?.getURL
      ? chrome.runtime.getURL(logoFileName)
      : logoAsset || `/${logoFileName}`;

  return (
    <img
      src={logoUrl}
      alt="ProPar"
      className={`object-contain ${className}`}
      style={{
        display: 'block',
        flexShrink: 0,
      }}
    />
  );
}

