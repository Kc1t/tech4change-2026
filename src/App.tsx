import { MomentScreen } from '@/screens/Moment/MomentScreen'

export function App() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <div className="flex h-dvh w-full max-w-[440px] flex-col overflow-hidden bg-ink md:h-[min(880px,calc(100dvh-56px))] md:rounded-[30px] md:border md:border-line md:shadow-soft">
        <header className="flex items-center gap-2 border-b border-line-soft px-5 py-4">
          <span className="text-xs font-bold uppercase tracking-[0.14em]">
            [NOME] <span className="font-medium text-faint">· protótipo</span>
          </span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <MomentScreen />
        </main>
      </div>
    </div>
  )
}
