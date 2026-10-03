export type RateRule = { limit: number; windowMs: number }
export type RateBucket = { count: number; resetAt: number }

export function takeToken(store: Map<string, RateBucket>, key: string, now: number, rule: RateRule): { ok: boolean; retryAfterMs: number } {
  if (store.size > 5000) {
    for (const [stored, bucket] of store) if (bucket.resetAt <= now) store.delete(stored)
    if (store.size > 5000) store.clear()
  }
  const bucket = store.get(key)
  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + rule.windowMs })
    return { ok: true, retryAfterMs: 0 }
  }
  bucket.count += 1
  return bucket.count <= rule.limit ? { ok: true, retryAfterMs: 0 } : { ok: false, retryAfterMs: bucket.resetAt - now }
}
