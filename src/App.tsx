import { useRoute, type Route } from '@/hooks/useRoute'
import { MomentScreen } from '@/screens/Moment/MomentScreen'
import { GraphScreen } from '@/screens/Graph/GraphScreen'
import { BodyScreen } from '@/screens/Body/BodyScreen'
import { ClinicalScreen } from '@/screens/Clinical/ClinicalScreen'
import { ConsentScreen } from '@/screens/Consent/ConsentScreen'
import { ReviewScreen } from '@/screens/Review/ReviewScreen'

const TABS: Array<{ route: Route; label: string; path: string }> = [
  { route: 'moment', label: 'Momento', path: 'M12 3v10M8 7l4-4 4 4M12 21a3 3 0 100-6 3 3 0 000 6' },
  { route: 'graph', label: 'Grafo', path: 'M8.2 8.1l7.5.6M7.4 9.2l2.6 6.6M16.6 11.2l-4 5.2' },
  { route: 'body', label: 'Corpo', path: 'M12 8v7M6 11h12M9 21l3-6 3 6' },
  { route: 'clinical', label: 'Clínico', path: 'M4 19V6M4 19h16M8 16l4-5 3 2 5-7' }
]

const SCREENS: Record<Route, () => JSX.Element> = {
  moment: MomentScreen,
  graph: GraphScreen,
  body: BodyScreen,
  clinical: ClinicalScreen,
  consent: ConsentScreen,
  review: ReviewScreen
}

export function App() {
  const [route, navigate] = useRoute()
  const Screen = SCREENS[route]

  return (
    <div className="grid min-h-dvh place-items-center">
      <div className="flex h-dvh w-full max-w-[440px] flex-col overflow-hidden bg-ink md:h-[min(880px,calc(100dvh-56px))] md:rounded-[30px] md:border md:border-line md:shadow-soft">
        <header className="flex items-center gap-2 border-b border-line-soft px-5 py-4">
          <span className="text-xs font-bold uppercase tracking-[0.14em]">
            [NOME] <span className="font-medium text-faint">· protótipo</span>
          </span>
          <button
            onClick={() => navigate('consent')}
            className="ml-auto rounded-full border border-line px-3 py-2 text-xs text-dim"
          >
            primeiro acesso
          </button>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Screen />
        </main>

        <nav className="grid grid-cols-4 border-t border-line-soft px-1.5 pb-[calc(6px+env(safe-area-inset-bottom,0px))] pt-1.5">
          {TABS.map(tab => (
            <button
              key={tab.route}
              onClick={() => navigate(tab.route)}
              className={[
                'grid justify-items-center gap-1 rounded-card px-1 py-2.5 text-[0.66rem] font-semibold',
                route === tab.route ? 'bg-surface text-fg' : 'text-faint'
              ].join(' ')}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-[21px] w-[21px] fill-none stroke-current"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {tab.route === 'graph' && (
                  <>
                    <circle cx="6" cy="7" r="2.4" />
                    <circle cx="18" cy="9" r="2.4" />
                    <circle cx="11" cy="18" r="2.4" />
                  </>
                )}
                {tab.route === 'body' && <circle cx="12" cy="5" r="2.4" />}
                <path d={tab.path} />
              </svg>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
