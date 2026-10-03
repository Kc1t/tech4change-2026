import { networkInterfaces } from 'node:os'

const LOOPBACK = /^(localhost|127\.0\.0\.1|::1|::ffff:127\.0\.0\.1)$/

export function lanAddress(): string | undefined {
  const all = Object.values(networkInterfaces()).flat()
  const v4 = all.filter(address => address && address.family === 'IPv4' && !address.internal)
  return (v4.find(address => address?.address.startsWith('192.168.')) ?? v4[0])?.address
}

export function isLocalRequest(request: Request): boolean {
  const host = (request.headers.get('host') ?? '').replace(/:\d+$/, '').replace(/^\[|\]$/g, '')
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return LOOPBACK.test(host) && (!forwarded || LOOPBACK.test(forwarded))
}
