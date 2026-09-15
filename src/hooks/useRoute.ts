import { useEffect, useState } from 'react'

export const ROUTES = ['moment', 'graph', 'body', 'clinical', 'consent', 'review'] as const

export type Route = (typeof ROUTES)[number]

function current(): Route {
  const hash = window.location.hash.replace('#/', '') as Route
  return ROUTES.includes(hash) ? hash : 'moment'
}

export function useRoute(): [Route, (next: Route) => void] {
  const [route, setRoute] = useState<Route>(current)

  useEffect(() => {
    const onHashChange = () => setRoute(current())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return [route, next => { window.location.hash = `/${next}` }]
}
