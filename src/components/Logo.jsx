// Brand mark: three rising bars on an emerald square, plus the name
const Logo = ({ size = 32, showName = true, className = "" }) => (
  <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
      <rect width="32" height="32" rx="7" fill="#047857" />
      <rect x="8" y="17" width="4" height="7" rx="1" fill="#fff" />
      <rect x="14" y="12" width="4" height="12" rx="1" fill="#fff" />
      <rect x="20" y="7" width="4" height="17" rx="1" fill="#fff" />
    </svg>
    {showName && <span className="text-[17px] font-semibold tracking-tight text-gray-900 whitespace-nowrap">Money Manager</span>}
  </span>
);

export default Logo;
