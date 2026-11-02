import { defineConfig } from 'vitest/config'
import type { Connect, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { createMemoryStore } from './api/_memoryStore.js'
import { handleRoll } from './api/_roll.js'

/**
 * Serves /api/scores from memory during `npm run dev` and `npm run preview`, using the same handler as the
 * deployed function. Scores reset whenever the server restarts. Use `vercel dev` to test against Redis.
 */
function devScores(): Plugin {
  const store = createMemoryStore()
  const middleware = (server: { middlewares: Connect.Server }) => {
    server.middlewares.use('/api/scores', async (req, res) => {
      let raw = ''
      for await (const chunk of req) raw += chunk
      let body: unknown = null
      try {
        body = raw ? JSON.parse(raw) : null
      } catch {
        // A body that is not JSON is treated as missing.
      }
      const { status, body: payload } = await handleRoll(
        store,
        req.method ?? 'GET',
        body,
        req.socket.remoteAddress ?? 'dev',
        Date.now(),
      )
      res.statusCode = status
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(payload))
    })
  }
  return { name: 'dev-scores', configureServer: middleware, configurePreviewServer: middleware }
}

export default defineConfig({
  plugins: [react(), devScores()],
  base: './',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'api/**/*.test.ts'],
  },
})
