export function Logo({ className = 'h-7', tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
  const src = tone === 'dark' ? '/brand/logo-dark.webp' : '/brand/logo.webp'
  return <img src={src} alt="eilo" className={`w-auto ${className}`} />
}

export function LogoIcon({ className = 'size-7' }: { className?: string }) {
  return <img src="/brand/icon.webp" alt="" aria-hidden="true" className={className} />
}
