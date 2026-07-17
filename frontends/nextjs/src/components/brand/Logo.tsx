interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 32, className }: LogoProps) {
  const markSize = Math.round(size * 0.6)

  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: Math.round(size / 4),
        background: 'linear-gradient(135deg, #7c3aed 0%, #0ea5e9 100%)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18)',
        flexShrink: 0,
      }}
    >
      <svg
        width={markSize}
        height={markSize}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 18V2l9 8 9-8v16"
          stroke="white"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}
