import type { RollStore } from './_roll.js'

/** Keeps the Roll in memory. Used by the tests and by the dev server, so `npm run dev` needs no database. */
export function createMemoryStore(clock: () => number = Date.now): RollStore {
  const values = new Map<string, number>()
  const details = new Map<string, string>()
  const hits = new Map<string, number[]>()

  return {
    async addIfHigher(member, value) {
      const current = values.get(member)
      if (current !== undefined && current >= value) return false
      values.set(member, value)
      return true
    },
    async setDetails(member, json) {
      details.set(member, json)
    },
    async rankedMembers() {
      return [...values.entries()].sort((a, b) => b[1] - a[1]).map(([member]) => member)
    },
    async remove(members) {
      for (const member of members) {
        values.delete(member)
        details.delete(member)
      }
    },
    async details(members) {
      return members.map((member) => details.get(member) ?? null)
    },
    async hit(address) {
      const since = clock() - 60_000
      const recent = (hits.get(address) ?? []).filter((time) => time > since)
      recent.push(clock())
      hits.set(address, recent)
      return recent.length
    },
  }
}
