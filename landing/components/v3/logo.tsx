export function Logo({ className = 'h-7' }: { className?: string }) {
  return <img src="/brand/logo.webp" alt="eilo" className={`w-auto ${className}`} />
}

export function LogoIcon({ className = 'size-7' }: { className?: string }) {
  return <img src="/brand/icon.webp" alt="" aria-hidden="true" className={className} />
}
