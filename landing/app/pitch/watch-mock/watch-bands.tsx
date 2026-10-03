export function WatchBands() {
  return (
    <>
      <svg className="wm-band wm-band--top" viewBox="0 0 170 190" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="wm-band-x" x1="0" x2="1">
            <stop offset="0" stopColor="#7d72b4" />
            <stop offset=".07" stopColor="#a69bdc" />
            <stop offset=".3" stopColor="#cfc7f4" />
            <stop offset=".42" stopColor="#ddd7fa" />
            <stop offset=".6" stopColor="#c4bbee" />
            <stop offset=".9" stopColor="#a094d3" />
            <stop offset="1" stopColor="#71669f" />
          </linearGradient>
          <linearGradient id="wm-band-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3b3266" stopOpacity=".55" />
            <stop offset=".45" stopColor="#3b3266" stopOpacity=".12" />
            <stop offset="1" stopColor="#3b3266" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wm-band-near" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#3b3266" stopOpacity=".62" />
            <stop offset=".45" stopColor="#3b3266" stopOpacity=".12" />
            <stop offset="1" stopColor="#3b3266" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wm-band-ao" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#241c4a" stopOpacity=".45" />
            <stop offset=".22" stopColor="#241c4a" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wm-band-ao-b" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#241c4a" stopOpacity=".5" />
            <stop offset=".2" stopColor="#241c4a" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M22 0H148C152 70 160 130 170 190H0C10 130 18 70 22 0Z" fill="url(#wm-band-x)" />
        <path d="M22 0H148C152 70 160 130 170 190H0C10 130 18 70 22 0Z" fill="url(#wm-band-far)" />
        <path d="M22 0H148C152 70 160 130 170 190H0C10 130 18 70 22 0Z" fill="url(#wm-band-ao)" />
      </svg>
      <svg className="wm-band wm-band--bottom" viewBox="0 0 170 190" preserveAspectRatio="none" aria-hidden>
        <path d="M0 0H170C160 60 152 120 148 180Q85 194 22 180C18 120 10 60 0 0Z" fill="url(#wm-band-x)" />
        <path d="M0 0H170C160 60 152 120 148 180Q85 194 22 180C18 120 10 60 0 0Z" fill="url(#wm-band-near)" />
        <path d="M0 0H170C160 60 152 120 148 180Q85 194 22 180C18 120 10 60 0 0Z" fill="url(#wm-band-ao-b)" />
        {[86, 116, 144, 170].map((y, n) => (
          <ellipse key={y} cx="85" cy={y} rx={7 - n * 0.6} ry={4.4 - n * 0.4} className="wm-hole" />
        ))}
      </svg>
    </>
  )
}
