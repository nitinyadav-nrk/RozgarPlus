export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="RozgarPlus"
    >
      <defs>
        <linearGradient id="rp-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#rp-grad)" />
      <text
        x="20"
        y="27"
        textAnchor="middle"
        fontFamily="'Poppins', 'Inter', sans-serif"
        fontWeight="800"
        fontSize="18"
        fill="white"
        letterSpacing="-0.5"
      >
        R+
      </text>
    </svg>
  );
}
