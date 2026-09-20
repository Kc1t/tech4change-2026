export type Route =
  | 'moment'
  | 'graph'
  | 'memories'
  | 'progress'
  | 'body'
  | 'clinical'
  | 'patient'
  | 'haptics'

export const HOME: Route = 'moment'

export const CLINIC_ROUTES: Route[] = ['clinical', 'patient', 'haptics']
