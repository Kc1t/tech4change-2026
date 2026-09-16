import { Mic, MoreHorizontal, X } from 'lucide-react'

export function PhoneListening() {
  return (
    <div className="relative mx-auto w-[clamp(176px,17vw,244px)]">
      <div className="v2-device-glow rounded-[2.6rem] border-[6px] border-white/85 bg-white shadow-[0_34px_70px_-28px_rgba(126,104,176,0.5)]">
        <div className="relative aspect-[9/18.5] overflow-hidden rounded-[2.1rem] bg-white">
          <span
            aria-hidden="true"
            className="absolute top-2 left-1/2 z-20 h-[18px] w-[62px] -translate-x-1/2 rounded-full bg-[#1c1b21]"
          />

          <div className="flex h-full flex-col px-4 pt-7 pb-4">
            <div className="flex items-center justify-between text-[0.56rem] font-semibold text-[var(--v2-ink)]">
              <span className="tabular">9:41</span>
              <span className="flex items-center gap-[3px]" aria-hidden="true">
                <i className="block h-[6px] w-[3px] rounded-[1px] bg-current" />
                <i className="block h-[8px] w-[3px] rounded-[1px] bg-current" />
                <i className="block h-[10px] w-[3px] rounded-[1px] bg-current" />
                <i className="ml-1 block h-[8px] w-[13px] rounded-[2px] border border-current" />
              </span>
            </div>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-[0.82rem] font-semibold lowercase">
              <i aria-hidden="true" className="brand-mark translate-y-[-1px]" />
              eilo
            </p>

            <div className="relative flex flex-1 items-center justify-center">
              <div className="relative aspect-square w-[68%]">
                <span className="v2-orb absolute inset-0 rounded-full blur-[6px] [animation:v2-breathe_4.5s_ease-in-out_infinite]" />
                <svg
                  viewBox="0 0 100 40"
                  className="absolute inset-x-0 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                >
                  <path
                    d="M4 20 Q 18 4 32 20 T 60 20 T 88 20"
                    fill="none"
                    stroke="rgba(255,255,255,0.9)"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <p className="text-center text-[0.8rem] text-[var(--v2-dim)]">Estou ouvindo…</p>

            <div className="mt-3 flex items-center justify-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-[#f2f0f6] text-[var(--v2-dim)]">
                <X className="size-3.5" />
              </span>
              <span className="flex size-11 items-center justify-center rounded-full bg-[var(--v2-purple)] text-white shadow-[0_10px_22px_-8px_rgba(155,135,217,0.9)]">
                <Mic className="size-4.5" />
              </span>
              <span className="flex size-8 items-center justify-center rounded-full bg-[#f2f0f6] text-[var(--v2-dim)]">
                <MoreHorizontal className="size-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
