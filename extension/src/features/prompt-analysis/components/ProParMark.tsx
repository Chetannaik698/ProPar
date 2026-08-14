import logoAsset from '../../../Assets/logo.png';

interface ProParMarkProps {
  className?: string;
  isDark?: boolean;
  size?: number;
}

export function ProParMark({ className = '', isDark = false, size = 20 }: ProParMarkProps) {
  const logoUrl =
    typeof chrome !== 'undefined' && chrome.runtime?.getURL
      ? chrome.runtime.getURL('logo.png')
      : logoAsset || '/logo.png';

  return (
    <div
      className={`inline-flex items-center justify-center bg-black rounded-lg p-1.5 shadow-sm shrink-0 ${className}`}
      style={{
        width: `${size + 12}px`,
        height: `${size + 12}px`,
      }}
    >
      <img
        src={logoUrl}
        alt="ProPar Logo"
        className="object-contain brightness-0 invert"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: 'block',
        }}
      />
    </div>
  );
}

export default ProParMark;
