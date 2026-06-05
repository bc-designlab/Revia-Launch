export default function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <defs>
        <linearGradient id="reviaLogo" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#0078F4" />
          <stop offset="55%" stopColor="#B8B5FF" />
          <stop offset="100%" stopColor="#3A0CA3" />
        </linearGradient>
      </defs>
      <circle
        cx="16"
        cy="16"
        r="13"
        stroke="url(#reviaLogo)"
        strokeWidth="2"
        fill="white"
      />
      <circle cx="16" cy="16" r="5.5" fill="url(#reviaLogo)" />
      <circle cx="16" cy="16" r="2" fill="white" />
    </svg>
  );
}
