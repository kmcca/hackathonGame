import { Redis } from '@upstash/redis'
import { handleRoll } from './_roll.js'
import type { RollStore } from './_roll.js'

const ROLL_KEY = 'pagebreak:roll'
const DETAILS_KEY = 'pagebreak:roll:entries'

/** Upstash from the Vercel Marketplace sets the KV_ names; a standalone Upstash database sets the UPSTASH_ ones. */
function connect(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  // Values stay plain strings, so the entries we stored come back exactly as we wrote them.
  return url && token ? new Redis({ url, token, automaticDeserialization: false }) : null
}

function redisStore(redis: Redis): RollStore {
  return {
    async addIfHigher(member, value) {
      return (await redis.zadd(ROLL_KEY, { gt: true, ch: true }, { score: value, member })) === 1
    },
    async setDetails(member, json) {
      await redis.hset(DETAILS_KEY, { [member]: json })
    },
    rankedMembers: () => redis.zrange<string[]>(ROLL_KEY, 0, -1, { rev: true }),
    async remove(members) {
      await redis.zrem(ROLL_KEY, ...members)
      await redis.hdel(DETAILS_KEY, ...members)
    },
    async details(members) {
      if (!members.length) return []
      // With deserialization off, HMGET hands back the raw array in the order asked, not an object keyed by field.
      const found = (await redis.hmget(DETAILS_KEY, ...members)) as unknown as (string | null)[] | null
      return members.map((_, index) => found?.[index] ?? null)
    },
    async hit(address) {
      const key = `pagebreak:roll:hits:${address}`
      const count = await redis.incr(key)
      if (count === 1) await redis.expire(key, 60)
      return count
    },
  }
}

async function respond(request: Request): Promise<Response> {
  const redis = connect()
  if (!redis) return Response.json({ error: 'unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })

  try {
    const body = request.method === 'POST' ? await request.json().catch(() => null) : null
    const address = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
    const { status, body: payload } = await handleRoll(redisStore(redis), request.method, body, address, Date.now())
    return Response.json(payload, { status, headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ error: 'unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}

export const GET = respond
export const POST = respond
