import { describe, expect, it } from 'vitest'
import { createPendingQueue } from './rollClient'

function fakeStorage(initial?: string) {
  const data = new Map<string, string>(initial ? [['pagebreak.pending', initial]] : [])
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  }
}

const run = (name: string, score: number) => ({ name, score, worldId: 'oz' as const })

describe('pending score queue', () => {
  it('keeps a saved score', () => {
    const queue = createPendingQueue(fakeStorage())
    queue.add(run('Ada', 200))
    expect(queue.list()).toEqual([run('Ada', 200)])
  })

  it('keeps only the best score for a name', () => {
    const queue = createPendingQueue(fakeStorage())
    queue.add(run('Ada', 200))
    queue.add(run('ada', 250))
    queue.add(run('Ada', 120))
    expect(queue.list()).toEqual([run('ada', 250)])
  })

  it('removes a name once it is sent', () => {
    const queue = createPendingQueue(fakeStorage())
    queue.add(run('Ada', 200))
    queue.add(run('Grace', 220))
    queue.remove('ADA')
    expect(queue.list()).toEqual([run('Grace', 220)])
  })

  it('caps how many it keeps', () => {
    const queue = createPendingQueue(fakeStorage())
    for (let i = 0; i < 9; i++) queue.add(run(`P${i}`, 100))
    expect(queue.list()).toHaveLength(5)
  })

  it('ignores damaged or tampered storage', () => {
    expect(createPendingQueue(fakeStorage('not json')).list()).toEqual([])
    expect(createPendingQueue(fakeStorage('[{"name":"Ada","score":9999,"worldId":"oz"},7]')).list()).toEqual([])
  })
})
